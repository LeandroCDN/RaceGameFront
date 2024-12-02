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
    <div
      style={{
        backgroundImage: "url('/backgrounds/result.webp')",
        backgroundSize: "cover",
        height: "100vh", // Ajusta la altura según sea necesario
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="w-full h-screen flex flex-col justify-between items-center p-0 m-0">
        <h1 className="text-6xl text-white"> Race Result</h1>
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
                            <p className="mr-2 text-4xl">{index + 1}</p>
                            <p className="mr-2 text-4xl">🤑</p>
                            <div>
                              <p className="text-2xl"> {team} </p>
                              <p className="text-sm"> {TEAMS[index]} </p>
                            </div>
                          </div>
                          <p>500</p>
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
                              ? " font-semibold"
                              : "bg-gray-100"
                          }`}
                        >
                          <div className="flex justify-between items-center flex-row">
                            <p className="mr-2 text-sm">{index + 4}</p>
                            <div className="flex flex-row">
                              <p className="text-sm ml-1"> {team} - </p>
                              <p className="text-sm">
                                {" "}
                                {TEAMS[index]
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
                            isUserTeam(index + 12)
                              ? " font-semibold"
                              : "bg-gray-100"
                          }`}
                        >
                          <div className="flex justify-between items-center flex-row">
                            <p className="mr-2 text-sm">{index + 13}</p>
                            <div className="flex flex-row">
                              <p className="text-sm ml-1"> {team} - </p>
                              <p className="text-sm">
                                {" "}
                                {TEAMS[index]
                                  .split(" ")[0]
                                  .substring(0, 3)
                                  .toUpperCase()}{" "}
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
        <CardFooter className="flex flex-row justify-evenly p-0 m-0 pb-2 w-full">
          {playerStat?.pendingReward && (
            <MyModal
              texto="You have unclaimed points!"
              numero={playerStat.unclaimedPoints}
            />
          )}

          <div className="flex flex-col justify-evenly">
            <Button variant="outline" onClick={() => setScreen("main")}>
              Return
            </Button>
            <Button onClick={() => console.log(raceData)}>HELP</Button>
          </div>
          <Button
            className="h-full w-[45%] bg-yellow-400"
            onClick={() => console.log(raceData)}
          >
            Race Again!
          </Button>
        </CardFooter>
      </div>
    </div>
  );
}
