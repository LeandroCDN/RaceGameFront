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
  const [points, setPoints] = useState<number | null>(0);
  const [playerStat, setPlayerStat] = useState<{
    points: number;
    pendingReward: boolean;
    raceIdReward: number;
    racesIds: number[];
    unclaimedPoints: number;
    numbers: number[];
  } | null>(null);
  const RPC = process.env.NEXT_PUBLIC_RPC_URL;
  const provider = new ethers.JsonRpcProvider(RPC);
  const raceAddress = process.env.NEXT_PUBLIC_RACE_ADDRESS;

  const getPoints = async () => {
    if (!raceAddress) {
      throw new Error(
        "NEXT_PUBLIC_MINE_ADDRESS environment variable is not set"
      );
    }

    try {
      const contract = new ethers.Contract(raceAddress, ABI, provider);
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
      setPoints(playerStatData.points);

      const currentRace = await contract.currentRace();
      const vRaceInfo = await contract.vRace(currentRace);
      console.log(playerStatData);
      // console.log("RACE", vRaceInfo);
    } catch (error) {
      console.error("Error fetching base price:", error);
      alert("Failed to fetch base price. Check console for details.");
    }
  };

  useEffect(() => {
    getPoints();
  }, []);

  if (screen !== "main") return null;

  return (
    <Card className="w-full h-screen flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="text-sm">Username</div>
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4" />
          <span>{points}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 h-full flex flex-col justify-around">
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-bold tracking-tighter">World Racing</h1>
          <div className="text-muted-foreground">
            The ultimate racing experience
          </div>
        </div>
        <div className="space-y-4">
          <Button
            onClick={() => setScreen("team")}
            className="w-full h-auto py-4 text-lg"
            variant="outline"
          >
            Quick Race
            <div className="text-xs text-muted-foreground">Cost: 1 credit</div>
          </Button>
          <div className="space-y-2">
            <div
              onClick={() => setScreen("result")}
              className={`p-4 border rounded-lg ${
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
          </div>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-4">
        <button
          onClick={getPoints}
          className="btn w-full h-auto py-4 text-lg bg-slate-500"
        >
          Get Points
        </button>
      </CardFooter>
    </Card>
  );
}
