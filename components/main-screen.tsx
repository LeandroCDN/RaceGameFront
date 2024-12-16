"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import ABI from "@/public/ABIS/RACEABI.json";
import WLDABI from "@/public/ABIS/WLD.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { MiniKit } from "@worldcoin/minikit-js";
import { ZingRust } from "@/app/fonts";
import { useRouter } from "next/navigation";

export function MainScreen() {
  const router = useRouter();

  const [points, setPoints] = useState<number | null>(0);
  const [balance, setBalance] = useState<string | null>("0");
  const [playerStat, setPlayerStat] = useState<{
    points: number;
    pendingReward: boolean;
    lastRaceId: number;
    userCurrentRace: number;
    unclaimedPoints: number;
    unclaimedPrizes: number;
    numbers: number[];
    totalBuys: number;
  } | null>(null);

  const [raceData, setRaceData] = useState<{
    race: string[];
    winnerPositions: number[];
    sponsors: number;
    claimed: boolean[];
  } | null>(null);

  const provider = new ethers.JsonRpcProvider(
    "https://worldchain-mainnet.g.alchemy.com/public"
  );
  const raceAddress = "0xaAC1FE8B6391E74f0DEd8336aD27DB903375C4FE";
  const wldAddress = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";

  const getPoints = async () => {
    if (!raceAddress) {
      throw new Error(
        "NEXT_PUBLIC_MINE_ADDRESS environment variable is not set"
      );
    }
    console.log("walletAddress minikit", MiniKit.walletAddress);
    try {
      const contract = new ethers.Contract(raceAddress, ABI, provider);
      const userAddress = MiniKit.walletAddress;
      const contractWLD = new ethers.Contract(wldAddress!, WLDABI, provider);

      const wldBalance = await contractWLD.balanceOf(userAddress);

      // 1 decimal in ether
      const wldBalanceInEther = ethers.formatEther(wldBalance);
      const wldBalanceFormatted = parseFloat(wldBalanceInEther).toFixed(1);
      setBalance(wldBalanceFormatted.toString());
      console.log("wldBalanceFormatted", wldBalanceFormatted);

      const playerInfo = await contract.vPlayerInfo(userAddress);
      console.log("playerInfo", playerInfo);
      // Estructurar la información del jugador
      const playerStatData = {
        points: Number(playerInfo[0]),
        pendingReward: playerInfo[1],
        lastRaceId: Number(playerInfo[2]),
        userCurrentRace: Number(playerInfo[3]),
        unclaimedPoints: Number(playerInfo[4]),
        unclaimedPrizes: Number(playerInfo[5]),
        numbers: playerInfo[6].map(Number),
        totalBuys: Number(playerInfo[7]),
      };
      await setPlayerStat(playerStatData);
      setPoints(playerStatData.points);
      console.log("Player:", playerStat);

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

      console.log(playerStatData);
    } catch (error) {
      console.error("Error fetching base price:", error);
      // alert("Failed to fetch base price. Check console for details.");
    }
  };

  useEffect(() => {
    getPoints();
  }, []);

  const handleButtonClick = () => {
    // Case 1: Won the race (unclaimed points)
    // if (playerStat && playerStat.unclaimedPoints > 0) {
    //   router.push(`/result?raceId=${playerStat.lastRaceId}`);
    //   return;
    // } else {
    //   router.push(`/result?raceId=${playerStat.lastRaceId}`);
    //   return;
    // }
    // Case 2: Lost the race (played before but no unclaimed points)
    // if (
    //   playerStat &&
    //   playerStat.unclaimedPoints <= 0 &&
    //   playerStat.lastRaceId !== 0
    // ) {
    //   router.push(`/result?raceId=${playerStat.lastRaceId}`);
    //   return;
    // }
    // Case 3: Never played a race - button will be disabled
  };

  // Determine button text and state
  const getButtonContent = () => {
    if (playerStat && playerStat.unclaimedPoints > 0) {
      return "CLAIM <br /> REWARDS";
    }

    if (playerStat && playerStat?.totalBuys !== 0) {
      return "VIEW <br /> RESULT";
    }

    return "CLAIM <br /> REWARDS";
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
            <p className="text-2xl text-right">Race against other memeees</p>
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
            onClick={() => router.push("/team")}
            disabled={!(playerStat && playerStat.unclaimedPoints <= 0)}
            className={`h-auto  mb-2 py-4 px-6 text-4xl rounded-full w-[100%] ${
              playerStat && playerStat.unclaimedPoints > 0
                ? "opacity-40 cursor-not-allowed"
                : ""
            }`}
            style={{
              backgroundImage: "url('/buttons/yellow.png')",
              backgroundSize: "100% 100%", // Asegura que la imagen cubra todo el botón
              backgroundRepeat: "no-repeat", // Evita la repetición
              height: "84px",
              width: "full",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p className="text-shadow-3">QUICK RACE</p>
          </button>
          <div
            // onClick={() => setScreen("team")}
            className="rounded-full w-9 h-9 p-0  opacity-60 text-white cursor-not-allowed"
            style={{
              backgroundImage: "url('/buttons/blue.png')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              height: "84px",
              width: "auto",
              display: "flex",
              flexDirection: "column", // Cambia la dirección a columna
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p className="leading-[0.9] tracking-tight text-4xl text-shadow-3">
              SURVIVOR <br />
              <p className="text-xl text-center text-shadow-3">(COMING SOON)</p>
            </p>
          </div>
          <button
            onClick={() => router.push("/result")}
            disabled={playerStat?.totalBuys === 0}
            className={`w-[100%] h-auto text-3xl ${
              playerStat && playerStat?.totalBuys !== 0
                ? "border-green-500 text-2xl text-green-300 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                : "opacity-40 cursor-not-allowed"
            }`}
            style={{
              backgroundImage: "url('/buttons/claimgreen.webp')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              height: "84px",
              width: "full",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              className="text-white leading-[0.9] tracking-tight text-shadow-3"
              dangerouslySetInnerHTML={{ __html: getButtonContent() }}
            />
          </button>
        </div>
        <div></div>
      </CardContent>
      <CardFooter className="w-full flex justify-center"></CardFooter>
    </div>
  );
}
