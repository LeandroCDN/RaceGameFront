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

const TEAMS = [
  "BPack Racing / BPack Tr",
  "Scuderia Maranello / Rino",
  "Zenith Motors / Carreritas 2000 ",
  "Rising Sun / SurHub",
  "Azure / RaceHub",
  "Ironhelm Racing / DogeRace",
  "Oneplus Motors / BTCRace",
  "Phoenix / ETH Racing",
  "Gazelle Racing / Chill Guy",
  "Hawk Racing / PEPE",
];

export function TeamSelection() {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const [index, setIndex] = useState(0);
  const [raceData, setRaceData] = useState<{
    race: string[]; // Array of 20 addresses
    winnerPositions: number[];
    sponsors: number;
    claimed: boolean[];
  } | null>(null);
  const ABI = [
    {
      inputs: [{ internalType: "uint256", name: "number", type: "uint256" }],
      name: "buyTicket",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];
  const raceAddress = process.env.NEXT_PUBLIC_RACE_ADDRESS;

  const handleBuyTicket = async () => {
    if (!raceAddress) {
      throw new Error(
        "NEXT_PUBLIC_RACE_ADDRESS environment variable is not set"
      );
    }
    try {
      const response = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            address: raceAddress,
            abi: ABI,
            functionName: "buyTicket",
            args: [index * 2],
          },
        ],
      });
      console.log("Transaction sent:", response);

      if (raceData?.sponsors == 9) {
        try {
          const res = await fetch("/api/ejecute-race", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            throw new Error("Error en la solicitud");
          }

          const data = await res.json();
          console.log("Respuesta del servidor:", data);
        } catch (error) {
          console.error("Error al ejecutar carrera:", error);
        }
      }
    } catch (error) {
      console.error("Error executing transaction:", error);
    } finally {
      // Close the modal regardless of success or failure
      setIsConfirmationModalOpen(false);
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
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="text-sm">Username</div>
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4" />
          <span>{credits.toFixed(2)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-medium mb-4">Choose your Team</div>
        <div className="space-y-2">
          {TEAMS.map((team, teamIndex) => (
            <Button
              key={team}
              variant={selectedTeam === team ? "default" : "outline"}
              className={`w-full justify-start ${
                !isAvailable(teamIndex) && "bg-gray-200 cursor-not-allowed"
              }`}
              disabled={!isAvailable(teamIndex)} // Disable unavailable buttons
              onClick={() => {
                if (isAvailable(teamIndex)) {
                  setSelectedTeam(team);
                  setIndex(teamIndex);
                }
              }}
            >
              <div className="w-4 h-4 rounded-full border mr-2" />
              {team}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-4">
        {isConfirmationModalOpen && (
          <ConfirmationModal
            onConfirm={handleBuyTicket}
            onClose={() => setIsConfirmationModalOpen(false)}
          />
        )}
        <Button
          onClick={() => {
            console.log(isConfirmationModalOpen);
            setIsConfirmationModalOpen(true);
            console.log(isConfirmationModalOpen);
          }}
        >
          BuyTicket
        </Button>
        <Button variant="outline" onClick={() => setScreen("main")}>
          Quit
        </Button>
      </CardFooter>
    </Card>
  );
}
