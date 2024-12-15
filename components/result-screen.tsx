"use client";

import { CardContent, CardFooter } from "@/components/ui/card";
import { MiniKit } from "@worldcoin/minikit-js";
import { ethers } from "ethers";
import ABIRace from "@/public/ABIS/RACEABI.json";
import { useState, useEffect, use } from "react";
import Image from "next/image";
import MyModal from "./modal";
import { ZingRust } from "@/app/fonts";
import { useRouter } from "next/navigation";

export function ResultScreen() {
  const router = useRouter();
  // const { screen, setScreen, selectedTeam } = useGame();
  const [playerStat, setPlayerStat] = useState<{
    points: number;
    pendingReward: boolean;
    lastRaceId: number;
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
  const raceAddress = "0xc29268994b42b67D0E71b76f8742ACa7922f184D";
  const TEAMS = [
    "Ribbit Racing",
    "Ribbit Racing",
    "Good Bois",
    "Good Bois",
    "New Hound",
    "New Hound",
    "Valhalla",
    "Valhalla",
    "Meow Motors",
    "Meow Motors",
    "Crypto Cats",
    "Crypto Cats",
    "Moodett",
    "Moodett",
    "UnderDogs",
    "UnderDogs",
    "Boys Club",
    "Boys Club",
    "OutCasts",
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

  const ABI = [
    {
      inputs: [],
      name: "claim",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const handleClaim = async () => {
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
            functionName: "claim",
            args: [],
          },
        ],
      });
      console.log("Transaction sent:", response);
    } catch (error) {
      console.error("Error executing transaction:", error);
    }
  };

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
        lastRaceId: Number(playerInfo[2]),
        unclaimedPoints: Number(playerInfo[3]),
        unclaimedPrizes: Number(playerInfo[4]),
        numbers: playerInfo[5].map(Number),
        totalBuys: Number(playerInfo[6]),
      };

      await setPlayerStat(playerStatData);
      console.log("Player:", playerStatData);

      const vRaceInfo = await contract.vRace(playerStatData.lastRaceId);

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
      //alert("Failed to fetch base price. Check console for details.");
    }
  };

  const getSortedTeams = () => {
    if (!raceData) return TEAMSRunners;

    // Crear un nuevo arreglo de equipos ordenados
    const sortedTeams = raceData.winnerPositions.map(
      (winnerNumber) => TEAMSRunners[winnerNumber]
    );

    return sortedTeams;
  };
  const isUserTeam = (teamIndex: number) => {
    const userAddress = MiniKit.walletAddress;
    if (!raceData || !userAddress) return false;
    const winnerPositions = raceData.winnerPositions[teamIndex];

    // Compara la dirección del usuario con la dirección en race
    return (
      raceData.race[winnerPositions]?.toLowerCase() ===
      userAddress.toLowerCase()
    );
  };

  useEffect(() => {
    getData();
  }, []);

  const getPositionText = (index: number) => {
    const positions = ["1ST", "2ND", "3RD"];
    return positions[index];
  };

  const getRewardText = (index: number) => {
    const rewards = ["+5 $WLD", "+3 $WLD", "+1 $WLD"];
    return rewards[index];
  };

  const getPositionColor = (index: number) => {
    const colors = ["text-[#FFE500]", "text-[#B2AFAF]", "text-[#E28202]"];
    return colors[index];
  };

  return (
    <div
      className="w-full h-screen flex flex-col justify-between"
      style={{
        backgroundImage: "url('/backgrounds/Result.webp')",
        backgroundSize: "cover",
        height: "100vh", // Ajusta la altura según sea necesario
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="w-full h-screen flex flex-col justify-between items-center p-0 m-0">
        <div className={` ${ZingRust.className}`}>
          <h1 className="text-6xl text-white">Race Result</h1>
        </div>
        <CardContent className="p-0 m-0">
          <div className=" text-center mt-4 w-screen">
            {raceData && (
              <div className="border  border-white p-2 mx-1 rounded">
                <div className="border border-white mb-2 rounded">
                  {getSortedTeams()
                    .slice(0, 3)
                    .map((team, index) => (
                      <div
                        key={team}
                        className={`p-2 mb-2 rounded text-white ${
                          isUserTeam(index) ? "text-green-500" : ""
                        }`}
                      >
                        <div className="flex justify-between items-center flex-row">
                          <div className="flex flex-row">
                            <div className="mr-1 text-4xl w-12 h-12 relative">
                              <Image
                                src={`/medals/${index}.png`}
                                alt={`Team ${index + 1} coin`}
                                layout="fill"
                                objectFit="contain"
                              />
                            </div>
                            <div className="mr-4 w-12 h-12 relative">
                              <Image
                                src={`/coins/${TEAMSRunners.indexOf(team)}.png`}
                                alt={`Team ${index + 1} coin`}
                                layout="fill"
                                objectFit="contain"
                              />
                            </div>
                            <div className="flex flex-col items-start">
                              <p
                                className={`text-2xl ${
                                  isUserTeam(index) ? "text-green-500" : ""
                                }`}
                              >
                                {team}
                              </p>
                              <p
                                className={`text-sm ${
                                  isUserTeam(index) ? "text-green-500" : ""
                                }`}
                              >
                                {TEAMS[TEAMSRunners.indexOf(team)]}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <p
                              className={`text-2xl font-bold text-stroke-3 ${getPositionColor(
                                index
                              )}`}
                            >
                              {getPositionText(index)}
                            </p>
                            <p
                              className={`text-2xl text-stroke-3 ${getPositionColor(
                                index
                              )}`}
                            >
                              {getRewardText(index)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-white p-2 rounded text-white">
                    {getSortedTeams()
                      .slice(3, 12)
                      .map((team, index) => (
                        <div
                          key={team}
                          className={` ${
                            isUserTeam(index + 3)
                              ? " font-semibold text-2xl"
                              : ""
                          }`}
                        >
                          <div className="flex justify-between items-center flex-row">
                            <p className="mr-2 text-sm">{index + 4}</p>
                            <div className="flex flex-row">
                              <p
                                className={`text-sm ml-1 ${
                                  isUserTeam(index + 3) ? "text-green-500" : ""
                                }`}
                              >
                                {" "}
                                {team} -{" "}
                              </p>
                              <p
                                className={`text-sm ${
                                  isUserTeam(index + 3) ? "text-green-500" : ""
                                }`}
                              >
                                {" "}
                                {TEAMS[TEAMSRunners.indexOf(team)]
                                  .split(" ")[0]
                                  .substring(0, 3)
                                  .toUpperCase()}{" "}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="border border-white p-2 rounded text-white">
                    {getSortedTeams()
                      .slice(12, 20)
                      .map((team, index) => (
                        <div
                          key={team}
                          className={` ${
                            isUserTeam(index + 12) ? " font-semibold" : ""
                          }`}
                        >
                          <div className="flex justify-between items-center flex-row">
                            <p className="mr-2 text-sm">{index + 13}</p>
                            <div className="flex flex-row">
                              <p
                                className={`text-sm ml-1 ${
                                  isUserTeam(index + 12) ? "text-green-500" : ""
                                }`}
                              >
                                {team} -
                              </p>
                              <p
                                className={`text-sm ${
                                  isUserTeam(index + 12) ? "text-green-500" : ""
                                }`}
                              >
                                {TEAMS[TEAMSRunners.indexOf(team)]
                                  .split(" ")[0]
                                  .substring(0, 3)
                                  .toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-row justify-evenly p-0 m-0 pb-2 w-full mb-4">
          {playerStat?.pendingReward && (
            <MyModal
              texto="You have unclaimed points!"
              numero={playerStat?.unclaimedPrizes / 100}
            />
          )}

          <div className="flex flex-col justify-evenly ">
            <button
              className="h-auto text-white text-shadow-3 mb-2 py-1  bg-gray-400 px-6 rounded-full w-[100%]"
              style={{
                backgroundImage: "url('/buttons/yellow.png')",
                backgroundSize: "100% 100%", // Asegura que la imagen cubra todo el botón
                backgroundRepeat: "no-repeat", // Evita la repetición
                height: "auto",
                width: "full",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                filter: "grayscale(100%)",
              }}
              onClick={() => router.push("/race")}
            >
              RETURN
            </button>
            <button
              className="h-auto py-1  text-white px-6 rounded-full text-shadow-3 opacity-60 w-[100%]"
              style={{
                backgroundImage: "url('/buttons/blue.png')",
                backgroundSize: "100% 100%", // Asegura que la imagen cubra todo el botón
                backgroundRepeat: "no-repeat", // Evita la repetición
                height: "auto",
                width: "full",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => router.push("/race")}
            >
              SURVIVOR
            </button>
          </div>
          <div className="w-[50%]">
            {playerStat?.pendingReward ? (
              <button
                className="h-[100%] w-auto text-3xl text-white px-4 py-2"
                onClick={handleClaim}
                style={{
                  backgroundImage: "url('/buttons/claimgreen.webp')",
                  backgroundSize: "100% 100%", // Asegura que la imagen cubra todo el botón
                  backgroundRepeat: "no-repeat", // Evita la repetición
                  height: "auto",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <p className="leading-[1] tracking-tight text-shadow-3">
                  CLAIM <br /> REWARDS!
                </p>
              </button>
            ) : (
              <button
                className="h-[100%] w-auto text-3xl text-white px-4 py-2"
                onClick={() => router.push("/team")}
                style={{
                  backgroundImage: "url('/buttons/yellow.png')",
                  backgroundSize: "100% 100%", // Asegura que la imagen cubra todo el botón
                  backgroundRepeat: "no-repeat", // Evita la repetición
                  height: "84px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <p className="leading-[0.9] tracking-tight text-shadow-3">
                  RACE <br /> AGAIN!
                </p>
              </button>
            )}
          </div>
        </CardFooter>
      </div>
    </div>
  );
}
