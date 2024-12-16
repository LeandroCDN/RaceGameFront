"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Coins } from "lucide-react";

import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ABIRace from "@/public/ABIS/RACEABI.json";
import { ZingRust } from "@/app/fonts";
import { useRouter } from "next/navigation";
import { useGame } from "./game-provider";

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
  const router = useRouter();
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
  const raceAddress = "0xc29268994b42b67D0E71b76f8742ACa7922f184D";
  const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const permitTransfer = {
    permitted: {
      token: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
      amount: "100",
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
    to: "0xc29268994b42b67D0E71b76f8742ACa7922f184D",
    requestedAmount: "100",
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
            address: "0xc29268994b42b67D0E71b76f8742ACa7922f184D", // Contract address
            abi: ABI, // ABI of the function
            functionName: "buyTicket", // Name of the function
            args: [
              index,
              permitTransferArgsForm,
              transferDetailsArgsForm,
              "PERMIT2_SIGNATURE_PLACEHOLDER_0",
            ],
          },
        ],
        permit2: [
          {
            ...permitTransfer,
            spender: "0xc29268994b42b67D0E71b76f8742ACa7922f184D",
          },
        ],
      });
      console.log("Transaction sent:", response);

      if (response?.finalPayload?.status === "success") {
        console.log("Transaction successfully submitted. Checking sponsors...");

        // Aquí verificarías si `raceData.sponsors == 9`
        // Actualizamos para iniciar la carrera inmediatamente
        if (raceData?.sponsors === 9) {
          try {
            console.log("Sponsors count is 9, triggering race execution...");

            // Llamar al endpoint `/api/ejecute-race`
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
        } else {
          console.log("Sponsors count is not 9. Race will not start yet.");
        }
      } else {
        console.error("Transaction not successfully submitted:", response);
      }
    } catch (error) {
      console.error("Error executing transaction:", error);
    }
  };

  const { selectedTeam, setSelectedTeam } = useGame();

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
      if (vRaceInfo[2] == 10) {
        await launchGame();
      }
    };

    const launchGame = async () => {
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
    };

    getRaceData();
  }, []);

  const launchGame = async () => {
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
  };

  // if (screen !== "team") return null;

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
        backgroundImage: "url('/backgrounds/Result.webp')",
        backgroundSize: "cover",
        height: "100vh", // Ajusta la altura según sea necesario
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="w-full  h-full">
        <CardHeader className="flex flex-col items-center p-0 pt-2 mb-6">
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
                      backgroundImage: `url('/runners/${teamIndex}.webp')`,
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
        <CardFooter className="flex flex-row justify-evenly p-0 m-0 pb-2 w-full mb-4">
          <div className="flex flex-col justify-between h-full ">
            <button
              className="h-auto  mb-2 py-1 text-shadow-3 text-white bg-gray-400 px-6 rounded-full w-[100%]"
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
              onClick={() => launchGame()}
            >
              SURVIVOR
            </button>
          </div>
          <div className="w-[50%]">
            <Button
              onClick={() => {
                handleBuyWorker();
              }}
              disabled={false}
              className="h-auto  py-4 px-6 text-3xl rounded-full w-[100%] "
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
              <p className="text-white text-shadow-3">BUY TICKET</p>
            </Button>
          </div>
        </CardFooter>
      </div>
      {raceData?.sponsors == 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-transparent p-8 rounded-lg text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-5xl text-white text-center">
              LA CARRERA ESTA CORRIENDO, <br /> VUELVA PRONTO
            </h2>
          </div>
        </div>
      )}
    </div>
  );
}
