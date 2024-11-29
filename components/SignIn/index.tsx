"use client";
import { MiniKit } from "@worldcoin/minikit-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function SignIn() {
  const router = useRouter();

  const signInWithWallet = async () => {
    if (!MiniKit.isInstalled()) {
      return;
    }
    const res = await fetch(`/api/nonce`);
    const { nonce } = await res.json();
    const { commandPayload: generateMessageResult, finalPayload } =
      await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: "0", // Optional
        expirationTime: new Date(new Date().getTime() + 300 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement:
          "This is my statement and here is a link https://worldcoin.com/apps",
      }); // throws: not an object

    console.log(MiniKit.walletAddress); // return user wallet :3

    if (finalPayload.status === "error") {
      return;
    } else {
      const response = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      });
    }
    if (MiniKit.walletAddress != null) {
      router.push("/race");
    }
  };

  useEffect(() => {
    signInWithWallet(); // Si no tiene wallet, hacer login
  }, []);

  const getWallet = async () => {
    console.log("MiniKit.walletAddress", MiniKit.walletAddress);
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl text-center">World Racing</h1>
      <button onClick={signInWithWallet} className="bg-green-500 mb-2 p-2">
        Sign In with Wallet
      </button>
      <button onClick={getWallet} className="bg-green-500 mb-2 p-2">
        GetWallet
      </button>
    </div>
  );
}
