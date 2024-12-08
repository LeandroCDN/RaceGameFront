"use client";
import { MiniKit } from "@worldcoin/minikit-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ZingRust } from "@/app/fonts";
import "animate.css";
import MyModal from "../modal";

export function SignIn() {
  const router = useRouter();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const signInWithWallet = async () => {
    console.log("sig in");
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
    const timeoutIdSigIn = setTimeout(() => {
      signInWithWallet();
    }, 0);

    // Habilita el botón después de 5 segundos
    const timeoutId = setTimeout(() => {
      signInWithWallet();
      setIsButtonDisabled(false);
    }, 5000);

    // Limpia el timeout si el componente se desmonta
    return () => clearTimeout(timeoutId);
  }, []);

  const getWallet = async () => {
    console.log("MiniKit.walletAddress", MiniKit.walletAddress);
  };

  return (
    <div
      className="flex flex-col w-screen h-screen"
      style={{
        backgroundImage: "url('/backgrounds/login-bg.webp')",
        backgroundSize: "cover",
        height: "100vh", // Ajusta la altura según sea necesario
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="flex flex-col w-screen h-screen items-center justify-between">
        <div></div>

        <div className={ZingRust.className}>
          <h1 className=" text-center text-white text-8xl mb-4 animate__animated animate__pulse animate__slow animate__infinite">
            MEME RACING
          </h1>
        </div>
        <button
          onClick={signInWithWallet}
          className={`mb-8 ${
            isButtonDisabled ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={isButtonDisabled}
          style={{
            backgroundImage: "url('/buttons/green.png')",
            backgroundSize: "100% 100%", // Asegura que la imagen cubra todo el botón
            backgroundRepeat: "no-repeat", // Evita la repetición
            height: "auto",
            width: "full",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p className="text-4xl px-8 py-2 text-white">LOGIN</p>
        </button>
      </div>
    </div>
  );
}
