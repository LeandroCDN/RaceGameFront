"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useGame } from "./game-provider";
import ABI from "@/public/ABIS/RACEABI.json";
import WLDABI from "@/public/ABIS/WLD.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { MiniKit } from "@worldcoin/minikit-js";
import { ZingRust } from "@/app/fonts";

export function MainScreen() {
  const { screen, setScreen, credits } = useGame();
  const [points, setPoints] = useState<number | null>(0);
  const [balance, setBalance] = useState<string | null>("0");
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
  const wldAddress = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";

  const getPoints = async () => {
    if (!raceAddress) {
      throw new Error(
        "NEXT_PUBLIC_MINE_ADDRESS environment variable is not set"
      );
    }
    console.log(MiniKit.user);
    console.log(MiniKit.appId);
    try {
      const contract = new ethers.Contract(raceAddress, ABI, provider);
      const userAddress = MiniKit.walletAddress;
      const contractWLD = new ethers.Contract(wldAddress!, WLDABI, provider);

      const wldBalance = await contractWLD.balanceOf(userAddress);

      // 1 decimal in ether
      const wldBalanceInEther = ethers.formatEther(wldBalance);
      const wldBalanceFormatted = parseFloat(wldBalanceInEther).toFixed(1);

      setBalance(wldBalanceFormatted.toString());

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
    } catch (error) {
      console.error("Error fetching base price:", error);
      // alert("Failed to fetch base price. Check console for details.");
    }
  };

  useEffect(() => {
    getPoints();
  }, []);

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
      <CardHeader className="flex flex-row text-white w-full justify-end p-2">
        <div
          className="rounded-full flex justify-end items-center align-middle w-full pr-2"
          style={{
            backgroundImage: "url('/balance.png')",
            backgroundSize: "100% 100%", // Asegura que la imagen cubra todo el botón
            backgroundPosition: "center", // Centra la imagen de fondo
            height: "42px", // Ajusta la altura según sea necesario
            width: "125px",
            display: "flex",
            justifyContent: "flex-end", // Alinea horizontalmente al final
            alignItems: "flex-end", // Alinea verticalmente al final
          }}
        >
          <span className="text-2xl text-center h-full pt-1 pr-2">
            {balance}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 h-full flex flex-col justify-between items-center text-white">
        <div
          className={`flex flex-col justify-end align-end text-right space-y-1 w-full ${ZingRust.className}`}
        >
          <div>
            <p className="text-2xl text-right">Race against other memes</p>
          </div>
          <div className="flex flex-row justify-end align-end text-right w-full">
            <p className="text-5xl mr-2">AND </p>
            <p className="text-5xl text-[#ffE500]">WIN 800%</p>
          </div>
        </div>
        <div className={`text-center ${ZingRust.className}`}>
          <h1 className="text-8xl text-stroke-2 text-white">Meme Racing</h1>
        </div>
        <div className="space-y-4 ">
          <button
            onClick={() => setScreen("team")}
            className="h-auto  mb-2 py-4 px-6 text-4xl rounded-full w-[100%]"
            style={{
              backgroundImage: "url('/buttons/yellow.png')",
              backgroundSize: "100% 100%", // Asegura que la imagen cubra todo el botón
              backgroundRepeat: "no-repeat", // Evita la repetición
              height: "auto",
              width: "full",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            Quick Race
          </button>
          <div
            // onClick={() => setScreen("team")}
            className="rounded-full w-9 h-9 p-0  opacity-60 cursor-not-allowed"
            style={{
              backgroundImage: "url('/buttons/blue-full.png')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              height: "84px",
              width: "auto",
              display: "flex",
              flexDirection: "column", // Cambia la dirección a columna
              justifyContent: "center",
              alignItems: "center",
            }}
          ></div>
        </div>
        <div></div>
      </CardContent>
      <CardFooter className="">
        <button
          onClick={() => setScreen("result")}
          className={`h-auto rounded-full w-[100%] border border-black px-4 py-1${
            playerStat && playerStat.unclaimedPoints > 0
              ? "bg-green-100 border-green-500"
              : ""
          }`}
          style={{
            backgroundImage: "url('/buttons/gray.png')",
            backgroundSize: "auto 100%", // Asegura que la imagen cubra todo el botón
            backgroundRepeat: "no-repeat", // Evita la repetición
            height: "auto",
            width: "full",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="font-medium">Last Race</div>
          <div className="text-sm text-muted-foreground">
            {playerStat && playerStat.unclaimedPoints > 0 && (
              <span className="ml-2 text-xl text-green-600">
                Unclaimed Rewards: {playerStat.unclaimedPoints}
              </span>
            )}
          </div>
        </button>
      </CardFooter>
    </div>
  );
}
