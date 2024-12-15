// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISignatureTransfer} from "./interfaces/ISignatureTransfer.sol";

contract RaceGame is Ownable {
    uint256 constant MAX_PLAYERS = 10;
    uint256 constant NUMBERS_RANGE = 20;
    uint256 public TICKET_COST; // Price & function change price only owner
    //address public owner;
    uint256 public currentRace;
    uint256 public ownerPoints;
    IERC20 public currency;
    ISignatureTransfer public permit2 = ISignatureTransfer(0x000000000022D473030F116dDEE9F6B43aC78BA3);

    // Estructura para representar a un jugador
    struct Player {
        uint points;
        bool pendingReward;
        uint lastRaceId;
        uint unclaimedPoints;
        uint unclaimedPrizes;
        uint256[] numbers;
        uint totalBuys; // New variable for total buys
    }

    struct Race {
        address[20] race;
        uint8[20] winnerPositions;
        uint8 sponsors;
        bool[3] claimed;
    }

    mapping(uint raceId => Race) private races;
    mapping(address userAddress => Player) private playerInfo;

    event TicketPurchased(address indexed player, uint indexed raceId, uint number);
    event RaceStarted(uint indexed raceId, uint8[20] winnerPositions, uint256 totalPrize);
    event PrizeClaimed(address indexed player, uint pointsClaimed, uint prizesClaimed);

    constructor(IERC20 _currency, uint256 _ticketCost) Ownable(msg.sender) {
        currency = _currency;
        TICKET_COST = _ticketCost;
    }

    function setCurrency(IERC20 _currency) public onlyOwner {
        currency = _currency;
    }

    function setTicketCost(uint256 _ticketCost) public onlyOwner {
        TICKET_COST = _ticketCost;
    }

    function buyTicket(
        uint number, 
        ISignatureTransfer.PermitTransferFrom memory permit,
        ISignatureTransfer.SignatureTransferDetails calldata transferDetails,
        bytes calldata signature
    ) public {
        // Require ticket cost transfer
        uint balanceBefore = currency.balanceOf(address(this));
        permit2.permitTransferFrom(permit, transferDetails, msg.sender , signature);
        require(currency.balanceOf(address(this)) >= balanceBefore + TICKET_COST, "balanceError");
        uint realNumber = number*2;
        if (number > NUMBERS_RANGE/2) revert("Number overflow");
        if (races[currentRace].race[realNumber] != address(0)) revert("Number already taken");
        if (playerInfo[msg.sender].pendingReward) revert("Pending reward");

        races[currentRace].race[realNumber] = msg.sender;
        races[currentRace].race[realNumber + 1] = msg.sender;

        playerInfo[msg.sender].numbers.push(realNumber);
        playerInfo[msg.sender].numbers.push(realNumber + 1);
        playerInfo[msg.sender].totalBuys++; // Increment total buys
        playerInfo[msg.sender].lastRaceId = currentRace;

        races[currentRace].sponsors++;
        emit TicketPurchased(msg.sender, currentRace, realNumber);
    }

    function startRace(uint seed) public onlyOwner {
        uint8[20] memory winnerPositions = generateWinners(seed);
        if (winnerPositions.length > NUMBERS_RANGE) revert("Winner positions overflow");

        races[currentRace].winnerPositions = winnerPositions;

        uint256 totalPrize = races[currentRace].sponsors * TICKET_COST;

        // Transferir premio al owner
        currency.transfer(owner(), (totalPrize * 10) / 100);

        address user;
        for (uint i = 0; i < 3; i++) {
            user = races[currentRace].race[winnerPositions[i]];
            if (user != address(0)) {
                playerInfo[user].pendingReward = true;

                if (i == 0) {
                    playerInfo[user].unclaimedPoints += 500; 
                    playerInfo[user].unclaimedPrizes += (totalPrize * 50) / 100; 
                } 
                if (i == 1) {
                    playerInfo[user].unclaimedPoints += 300;
                    playerInfo[user].unclaimedPrizes += (totalPrize * 30) / 100;
                } 
                if (i == 2) {
                    playerInfo[user].unclaimedPoints += 100;
                    playerInfo[user].unclaimedPrizes += (totalPrize * 10) / 100;
                }
            }
        }

        // Limpiar datos de los jugadores para la próxima carrera
        for (uint i; i < NUMBERS_RANGE; i++) {
            delete playerInfo[races[currentRace].race[i]].numbers;
        }

        ownerPoints = 100;
        currentRace++;
        emit RaceStarted(currentRace, winnerPositions, totalPrize);
    }

    function claim() public {
        uint prizes = playerInfo[msg.sender].unclaimedPrizes;
        uint points = playerInfo[msg.sender].unclaimedPoints;

        playerInfo[msg.sender].points += points;
        playerInfo[msg.sender].unclaimedPoints = 0;
        playerInfo[msg.sender].unclaimedPrizes = 0;
        playerInfo[msg.sender].pendingReward = false;
        currency.transfer(msg.sender, prizes);

        emit PrizeClaimed(msg.sender, points, prizes);
    }

    function vRace(uint id) public view returns (Race memory) {
        return races[id];
    }

    function vPlayerInfo(address user) public view returns (Player memory) {
        return playerInfo[user];
    }

    function generateWinners(uint seed) public view returns (uint8[20] memory) {
        uint8[20] memory numbers;

        // Initialize the array with numbers from 0 to 19
        for (uint8 i = 0; i < 20; i++) {
            numbers[i] = i;
        }
        uint j;
        // Fisher-Yates Shuffle
        for (uint i = 19; i > 0; i--) {
            seed = uint(keccak256(abi.encode(
                seed,
                block.timestamp,
                block.prevrandao,
                blockhash(block.number - 1),
                j
            )));
            j = seed % (i + 1); // Use modulo to generate a random index

            // Swap elements
            uint8 temp = numbers[i];
            numbers[i] = numbers[j];
            numbers[j] = temp;

            // Update seed to create a new pseudo-random value
        }

        return numbers;
    }

    function depositERC20(
        ISignatureTransfer.PermitTransferFrom memory permit,
        ISignatureTransfer.SignatureTransferDetails calldata transferDetails,
        bytes calldata signature
    ) public {
        permit2.permitTransferFrom(permit, transferDetails, msg.sender , signature);
    }

    function depositERC20WithNumber(
        uint number,
        ISignatureTransfer.PermitTransferFrom memory permit,
        ISignatureTransfer.SignatureTransferDetails calldata transferDetails,
        bytes calldata signature
    ) public {
        permit2.permitTransferFrom(permit, transferDetails, msg.sender , signature);
    }
}