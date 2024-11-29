"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useGame } from "./game-provider";
import { MiniKit } from "@worldcoin/minikit-js";
import { ethers } from "ethers";
import ABIRace from "@/public/ABIS/RACEABI.json";
import { useState, useEffect, use } from "react";
import MyModal from "./modal";

export function ResultScreen() {
  const { screen, setScreen, selectedTeam } = useGame();
  const [playerStat, setPlayerStat] = useState<{
    points: number;
    pendingReward: boolean;
    raceIdReward: number;
    racesIds: number[];
    unclaimedPoints: number;
    numbers: number[];
  } | null>(null);

  const [raceData, setRaceData] = useState<{
    race: string[];
    winnerPositions: number[];
    sponsors: number;
    claimed: boolean[];
  } | null>(null);
  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
  const raceAddress = process.env.NEXT_PUBLIC_RACE_ADDRESS;
  const TEAMS = [
    "BPack Racing",
    "BPack Racing 2",
    "Scuderia Maranello",
    "Scuderia Maranello 2",
    "Zenith Motors",
    "Zenith Motors 2",
    "Rising Sun",
    "Rising Sun 2",
    "Azure",
    "Azure 2",
    "Ironhelm Racing",
    "Ironhelm Racing 2",
    "Oneplus Motors",
    "Oneplus Motors 2",
    "Phoenix",
    "Phoenix 2",
    "Gazelle Racing",
    "Gazelle Racing 2",
    "Hawk Racing",
    "Hawk Racing 2",
  ];

  const getData = async () => {
    if (!raceAddress) {
      throw new Error(
        "NEXT_PUBLIC_MINE_ADDRESS environment variable is not set"
      );
    }

    try {
      const contract = new ethers.Contract(raceAddress, ABIRace, provider);
      const userAddress = MiniKit.walletAddress;
      const playerInfo = await contract.vPlayerInfo(userAddress);

      // Estructurar la información del jugador
      const playerStatData = {
        points: Number(playerInfo[0]),
        pendingReward: playerInfo[1],
        raceIdReward: Number(playerInfo[2]),
        racesIds: playerInfo[3].map(Number),
        unclaimedPoints: Number(playerInfo[4]),
        numbers: playerInfo[5].map(Number),
      };

      setPlayerStat(playerStatData);
      console.log("Player:", playerStatData);
      const vRaceInfo = await contract.vRace(0);

      const raceInfoData = {
        race: vRaceInfo[0],
        winnerPositions: vRaceInfo[1],
        sponsors: vRaceInfo[2],
        claimed: vRaceInfo[3],
      };
      console.log("vRaceInfo:", vRaceInfo);
      setRaceData(raceInfoData);

      const sortedTeams = getSortedTeams();
    } catch (error) {
      console.error("Error fetching base price:", error);
      alert("Failed to fetch base price. Check console for details.");
    }
  };

  const getSortedTeams = () => {
    if (!raceData) return TEAMS;

    // Crear un nuevo arreglo de equipos ordenados
    const sortedTeams = raceData.winnerPositions.map(
      (winnerNumber) => TEAMS[winnerNumber]
    );

    return sortedTeams;
  };
  const isUserTeam = (teamIndex: number) => {
    const userAddress = MiniKit.walletAddress;
    if (!raceData || !userAddress) return false;

    // Compara la dirección del usuario con la dirección en race
    return (
      raceData.race[teamIndex]?.toLowerCase() === userAddress.toLowerCase()
    );
  };

  useEffect(() => {
    getData();
  }, []);

  if (screen !== "result") return null;

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4 text-center">
          {/* Mostrar equipos ordenados */}
          <h2 className="text-xl font-bold mb-4">Race Results</h2>
          {raceData && (
            <div className="overflow-y-auto h-[70vh] scrollbar-hide no-scrollbar">
              {getSortedTeams().map((team, index) => (
                <div
                  key={team}
                  className={`p-2  mb-2 rounded ${
                    isUserTeam(getSortedTeams().indexOf(team))
                      ? "bg-green-100 border-2 border-green-500"
                      : "bg-gray-100"
                  }`}
                >
                  Position {index + 1}: {team}
                  {isUserTeam(getSortedTeams().indexOf(team)) && (
                    <span className="ml-2 text-green-600 font-bold">
                      (Your Team)
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-4">
        {playerStat?.pendingReward && (
          <MyModal
            texto="You have unclaimed points!"
            numero={playerStat.unclaimedPoints}
          />
        )}
        <Button variant="outline" onClick={() => setScreen("main")}>
          Return
        </Button>
        <Button onClick={() => console.log(raceData)}>Show Data</Button>
      </CardFooter>
    </Card>
  );
}
