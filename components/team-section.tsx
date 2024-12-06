"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Coins } from "lucide-react";
import { useGame } from "./game-provider";
import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ABIRace from "@/public/ABIS/RACEABI.json";
import { ConfirmationScreen } from "./confirmation-screen";
import MyModal from "./modal";
import ConfirmationModal from "./confirmation-modal";
import { ZingRust } from "@/app/fonts";

const TEAMS = [
  "Ribbit Racing",
  "Good Bois",
  "New Hound",
  "Valhalla",
  "Meow Motors",
  "Crypto Cats",
  "Moodett",
  "UnderDogs",
  "Boys Club",
  "OutCasts",
];
const TEAMSRunners = [
  "PEPE",
  "TURBO",
  "DOGE",
  "SHIB",
  "WIF",
  "BONK",
  "FLOKI",
  "HELGA",
  "POPCAT",
  "MIGGLES",
  "PURR",
  "WEN",
  "MOODENG",
  "BRETT",
  "NEIRO",
  "SUNDOG",
  "CHILLGUY",
  "GIGA",
  "PUFF",
  "PNUT",
];

export function TeamSelection() {
  const provider = new ethers.JsonRpcProvider(
    "https://worldchain-mainnet.g.alchemy.com/public"
  );
  const [index, setIndex] = useState(0);
  const [raceData, setRaceData] = useState<{
    race: string[]; // Array of 20 addresses
    winnerPositions: number[];
    sponsors: number;
    claimed: boolean[];
  } | null>(null);
  const ABI = [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "number",
          type: "uint256",
        },
        {
          components: [
            {
              components: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
              ],
              internalType: "struct ISignatureTransfer.TokenPermissions",
              name: "permitted",
              type: "tuple",
            },
            {
              internalType: "uint256",
              name: "nonce",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "deadline",
              type: "uint256",
            },
          ],
          internalType: "struct ISignatureTransfer.PermitTransferFrom",
          name: "permit",
          type: "tuple",
        },
        {
          components: [
            {
              internalType: "address",
              name: "to",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "requestedAmount",
              type: "uint256",
            },
          ],
          internalType: "struct ISignatureTransfer.SignatureTransferDetails",
          name: "transferDetails",
          type: "tuple",
        },
        {
          internalType: "bytes",
          name: "signature",
          type: "bytes",
        },
      ],
      name: "buyTicket",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];
  const raceAddress = "0x4a2D17694DD8E5d87341426BA62eE66f67C4cf8e";

  // const handleBuyTicket = async () => {
  //   if (!raceAddress) {
  //     throw new Error(
  //       "NEXT_PUBLIC_RACE_ADDRESS environment variable is not set"
  //     );
  //   }
  //   try {
  //     const response = await MiniKit.commandsAsync.sendTransaction({
  //       transaction: [
  //         {
  //           address: raceAddress,
  //           abi: ABI,
  //           functionName: "buyTicket",
  //           args: [index * 2],
  //         },
  //       ],
  //     });
  //     console.log("Transaction sent:", response);

  //     if (raceData?.sponsors == 9) {
  //       try {
  //         const res = await fetch("/api/ejecute-race", {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         });

  //         if (!res.ok) {
  //           throw new Error("Error en la solicitud");
  //         }

  //         const data = await res.json();
  //         console.log("Respuesta del servidor:", data);
  //       } catch (error) {
  //         console.error("Error al ejecutar carrera:", error);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error executing transaction:", error);
  //   } finally {
  //     // Close the modal regardless of success or failure
  //     setIsConfirmationModalOpen(false);
  //   }
  // };

  const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString();

  const permitTransfer = {
    permitted: {
      token: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
      amount: "1",
    },
    nonce: Date.now().toString(),
    deadline,
  };

  const permitTransferArgsForm = [
    [permitTransfer.permitted.token, permitTransfer.permitted.amount],
    permitTransfer.nonce,
    permitTransfer.deadline,
  ];

  const transferDetails = {
    to: "0x0EB70f753CecedEaeEf519EB76882c0757FF209D",
    requestedAmount: "1",
  };

  const transferDetailsArgsForm = [
    transferDetails.to,
    transferDetails.requestedAmount,
  ];

  const handleBuyWorker = async () => {
    try {
      const response = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: "0x0EB70f753CecedEaeEf519EB76882c0757FF209D", // Contract address
            abi: ABI, // ABI of the function
            functionName: "buyTicket", // Name of the function
            args: [
              1,
              permitTransferArgsForm,
              transferDetailsArgsForm,
              "PERMIT2_SIGNATURE_PLACEHOLDER_0",
            ],
          },
        ],
        permit2: [
          {
            ...permitTransfer,
            spender: "0x0EB70f753CecedEaeEf519EB76882c0757FF209D",
          },
        ],
      });
      console.log("Transaction sent:", response);
    } catch (error) {
      console.error("Error executing transaction:", error);
    }
  };

  const { screen, setScreen, credits, selectedTeam, setSelectedTeam } =
    useGame();

  useEffect(() => {
    if (!raceAddress) {
      throw new Error(
        "NEXT_PUBLIC_MINE_ADDRESS environment variable is not set"
      );
    }

    const getRaceData = async () => {
      const contract = new ethers.Contract(raceAddress, ABIRace, provider);
      const currentRace = await contract.currentRace();
      const vRaceInfo = await contract.vRace(currentRace);
      const raceInfoData = {
        race: vRaceInfo[0],
        winnerPositions: vRaceInfo[1],
        sponsors: vRaceInfo[2],
        claimed: vRaceInfo[3],
      };
      console.log("vRaceInfo:", vRaceInfo);
      setRaceData(raceInfoData);
    };

    getRaceData();
  }, []);

  if (screen !== "team") return null;

  const isAvailable = (teamIndex: number) => {
    // Check if the corresponding address in raceData.race is empty (0x000...)
    return (
      raceData?.race[teamIndex * 2] ===
      "0x0000000000000000000000000000000000000000"
    );
  };

  return (
    <div
      className="w-full h-screen flex flex-col justify-between"
      style={{
        backgroundImage: "url('/backgrounds/game-bg.webp')",
        backgroundSize: "cover",
        height: "100vh", // Ajusta la altura según sea necesario
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="w-full  h-full">
        <CardHeader className="flex flex-col items-center p-0 pt-2 mb-6">
          <div className="flex flex-row items-center justify-between">
            <div className="text-sm">Username</div>
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4" />
              <span>{credits.toFixed(2)}</span>
            </div>
          </div>
          <div className={` ${ZingRust.className}`}>
            <p className="text-5xl text-white">SELECT YOUR TEAM</p>
          </div>
        </CardHeader>
        <CardContent className=" mb-4">
          <div className="space-y-2 flex flex-col justify-center items-center">
            <div className="overflow-y-auto max-h-[75vh] scrollbar-hide no-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                {TEAMS.map((team, teamIndex) => (
                  <Button
                    key={team}
                    variant={selectedTeam === team ? "default" : "outline"}
                    className={`justify-start h-24 w-40 rounded-xl border-2 p-1 ${
                      selectedTeam === team
                        ? "border-green-600"
                        : "border-white"
                    } ${
                      !isAvailable(teamIndex) &&
                      "bg-gray-200 cursor-not-allowed"
                    } `}
                    disabled={!isAvailable(teamIndex)} // Disable unavailable buttons
                    onClick={() => {
                      if (isAvailable(teamIndex)) {
                        setSelectedTeam(team);
                        setIndex(teamIndex);
                      }
                    }}
                    style={{
                      backgroundImage: `url('/runners/${teamIndex}.png')`,
                      backgroundSize: "125% auto",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      overflow: "hidden",
                    }}
                  >
                    <div className="h-full w-full flex flex-col justify-between">
                      <p className="text-white text-xl text-stroke-3">{team}</p>
                      <div className="flex flex-row justify-between px-1">
                        <span className="text-white text-sm">
                          {TEAMSRunners[teamIndex * 2]}
                        </span>
                        <span className="text-white text-sm">
                          {TEAMSRunners[teamIndex * 2 + 1]}
                        </span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-4 mb-4">
          <Button
            onClick={() => {
              handleBuyWorker();
            }}
            disabled={!selectedTeam}
            className="text-xl py-2 px-2"
          >
            Buy Race ticket
          </Button>
          <Button variant="outline" onClick={() => setScreen("main")}>
            Quit
          </Button>
        </CardFooter>
      </div>
    </div>
  );
}
