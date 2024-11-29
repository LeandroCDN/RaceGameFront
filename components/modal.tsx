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
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="modal bg-white rounded-lg shadow-lg p-5">
          <p>Texto: {texto}</p>
          <p>Número: {numero}</p>
          <button
            onClick={handleClose}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    )
  );
};

export default MyModal;
