import { ZingRust } from "@/app/fonts";
import { MiniKit } from "@worldcoin/minikit-js";
import React, { useState } from "react";

const MyModal = ({ texto, numero }: { texto: string; numero: number }) => {
  const [isOpen, setIsOpen] = useState(true);

  const ABI = [
    {
      inputs: [],
      name: "claim",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const raceAddress = process.env.NEXT_PUBLIC_RACE_ADDRESS;
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
      setIsOpen(false);
    } catch (error) {
      console.error("Error executing transaction:", error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-70 backdrop-blur-sm z-50">
        <div
          className="flex flex-col items-center justify-between rounded-lg shadow-lg p-5 border-4 border-[#ffe500]"
          style={{
            backgroundImage: "url('/backgrounds/claim-bg.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center top 23%",
            height: "auto", // Ajusta la altura según sea necesario
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            position: "relative", // Necesario para el posicionamiento absoluto del hijo
          }}
        >
          <div className="w-full flex justify-end">
            <div
              onClick={() => handleClose()}
              className="rounded-full w-9 h-9"
              style={{
                backgroundImage: "url('/x.webp')",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                height: "25px",
                width: "25px",
                position: "absolute", // Hacerlo independiente del flujo
                top: "6px", // Ajustar posición superior
                right: "6px", // Ajustar posición derecha
              }}
            ></div>
          </div>
          <p className={`text-white text-4xl  ${ZingRust.className}`}>
            CONGRATULATIONS!
          </p>
          <p
            className={`text-8xl text-stroke-2 text-white animate__animated animate__pulse animate__slow animate__infinite ${ZingRust.className}`}
          >
            YOU WIN
          </p>
          <div
            className="relative flex items-center mb-3"
            style={{
              backgroundImage: "url('/claim.webp')",
              backgroundSize: "100% 100%", // Mejor que 100% 100% para adaptabilidad
              backgroundPosition: "center",
              height: "50px",
              width: "150px",
            }}
          >
            <span className="text-2xl text-white text-center w-full pr-7">
              +{numero} $WLD
            </span>
          </div>
          <button
            className="h-[100%]  text-2xl text-white px-10 py-3 rounded-full"
            onClick={handleClaim}
            style={{
              backgroundImage: "url('/buttons/claimgreen.webp')",
              backgroundSize: "100% 100%", // Asegura que la imagen cubra todo el botón
              backgroundRepeat: "no-repeat", // Evita la repetición
              height: "auto",

              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p className="leading-[1] tracking-tight text-shadow-3">
              CLAIM <br /> REWARDS
            </p>
          </button>
        </div>
      </div>
    )
  );
};

export default MyModal;
