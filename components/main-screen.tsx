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
import ABI from "@/public/ABIS/RACEABI.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { MiniKit } from "@worldcoin/minikit-js";

export function MainScreen() {
  const { screen, setScreen, credits } = useGame();
  // const [points, setPoints] = useState<number | null>(0);
  const [playerStat, setPlayerStat] = useState<{
    points: number;
    pendingReward: boolean;
    raceIdReward: number;
    racesIds: number[];
    unclaimedPoints: number;
    numbers: number[];
  } | null>(null);
  // const RPC = process.env.NEXT_PUBLIC_RPC_URL;
  // const provider = new ethers.JsonRpcProvider(RPC);
  // const raceAddress = process.env.NEXT_PUBLIC_RACE_ADDRESS;

  // const getPoints = async () => {
  //   if (!raceAddress) {
  //     throw new Error(
  //       "NEXT_PUBLIC_MINE_ADDRESS environment variable is not set"
  //     );
  //   }

  //   try {
  //     const contract = new ethers.Contract(raceAddress, ABI, provider);
  //     const userAddress = MiniKit.walletAddress;

  //     const playerInfo = await contract.vPlayerInfo(userAddress);

  //     // Estructurar la información del jugador
  //     const playerStatData = {
  //       points: Number(playerInfo[0]),
  //       pendingReward: playerInfo[1],
  //       raceIdReward: Number(playerInfo[2]),
  //       racesIds: playerInfo[3].map(Number),
  //       unclaimedPoints: Number(playerInfo[4]),
  //       numbers: playerInfo[5].map(Number),
  //     };

  //     setPlayerStat(playerStatData);
  //     setPoints(playerStatData.points);

  //     const currentRace = await contract.currentRace();
  //     const vRaceInfo = await contract.vRace(currentRace);
  //     console.log(playerStatData);
  //     // console.log("RACE", vRaceInfo);
  //   } catch (error) {
  //     console.error("Error fetching base price:", error);
  //     alert("Failed to fetch base price. Check console for details.");
  //   }
  // };

  // useEffect(() => {
  //   getPoints();
  // }, []);

  if (screen !== "main") return null;

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
      <CardHeader className="flex flex-row items-center justify-between text-white">
        <div className="text-sm">Username</div>
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4" />
          <span>99999</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 h-full flex flex-col justify-center items-center text-white">
        <div className="text-center space-y-1">
          <h1 className="text-8xl font-bold tracking-tighter ">Meme Racing</h1>
        </div>
        <div className="space-y-4 ">
          <Button
            onClick={() => setScreen("team")}
            className="h-auto bg-yellow-400 mb-2 py-4 px-6 text-4xl rounded-full"
            variant="outline"
          >
            RACE!
          </Button>
        </div>
      </CardContent>
      <CardFooter className="">
        <div
          onClick={() => setScreen("result")}
          className={`p-4 border rounded-lg bg-yellow-300 mb-2 py-4 px-6 text-xl ${
            playerStat && playerStat.unclaimedPoints > 0
              ? "bg-green-100 border-green-500"
              : ""
          }`}
        >
          <div className="font-medium">Last Race</div>
          <div className="text-sm text-muted-foreground">
            {playerStat && playerStat.unclaimedPoints > 0 && (
              <span className="ml-2 text-xl text-green-600">
                Unclaimed Rewards: {playerStat.unclaimedPoints}
              </span>
            )}
          </div>
        </div>
      </CardFooter>
    </div>
  );
}
