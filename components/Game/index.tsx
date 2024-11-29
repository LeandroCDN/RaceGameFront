"use client";
import { MiniKit } from "@worldcoin/minikit-js";
import ABI from "@/public/ABIS/ABIMINE.json";
import { useState } from "react";
import { ethers } from "ethers";
import { Minerbox } from "./minerbox";

export const Game = () => {
  const [basePrice, setBasePrice] = useState(null);
  const [userAddress, setUserAddress] = useState(MiniKit.walletAddress);
  const mineAddress = "0x11823726Cc88F98E2E92911D0206AF8d0c6b3565";
  const RPC = process.env.NEXT_PUBLIC_RPC_URL;
  const provider = new ethers.JsonRpcProvider(RPC);

  const getBasePrice = async () => {
    if (!mineAddress) {
      throw new Error(
        "NEXT_PUBLIC_MINE_ADDRESS environment variable is not set"
      );
    }

    try {
      // Configurar el proveedor y contrato
      const contract = new ethers.Contract(mineAddress, ABI, provider);

      const price = await contract.baseCost();
      console.log(price);
      setBasePrice(price.toString()); // Formatear el valor si es en wei
    } catch (error) {
      console.error("Error fetching base price:", error);
      alert("Failed to fetch base price. Check console for details.");
    }
  };

  const getWallet = async () => {
    console.log("MiniKit.walletAddress", MiniKit.walletAddress);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-y-3">
      <button onClick={getWallet} className="bg-blue-500 mb-2 p-2">
        GetWallet
      </button>
      <button onClick={getBasePrice} className="bg-blue-500 mb-2 p-2">
        Get Base Price
      </button>

      <Minerbox />
    </main>
  );
};
