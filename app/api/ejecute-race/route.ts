import { NextRequest, NextResponse } from 'next/server';
import { ethers } from "ethers";
import ABIRace from "@/public/ABIS/RACEABI.json";



export async function POST(request: NextRequest) {
    console.log("STARTING RACE");
    const signerPrivateKey = process.env.SIGNER_WALLET;
    const RPC = process.env.NEXT_PUBLIC_RPC_URL;
    const provider = new ethers.JsonRpcProvider(RPC);
    if (!signerPrivateKey) {
        throw new Error('SIGNER_WALLET_PRIVATE_KEY environment variable is not set');
    }
    const signer = new ethers.Wallet(signerPrivateKey, provider);
    const raceAddress = process.env.NEXT_PUBLIC_RACE_ADDRESS;
    console.log("raceAddress", raceAddress);
    if (!raceAddress) {
        throw new Error(
            "NEXT_PUBLIC_MINE_ADDRESS environment variable is not set"
        );
    }
    const randomNumber = Math.floor(Math.random() * 100);

    const contract = new ethers.Contract(raceAddress, ABIRace, signer);
    const currentRace = await contract.currentRace();
    console.log("currentRace", currentRace);

    const vRaceInfo = await contract.vRace(currentRace);
    console.log("vRaceInfo[2]", vRaceInfo[2]);

    if (vRaceInfo[2] == 10) {
        console.log("Race is over");
        const race = await contract.startRace(randomNumber);
    } else {
        //return error
        console.log("Race is not over");
        return NextResponse.json({ error: "Race is not over" });
    }

    // Return the response with the generated data
    return NextResponse.json({
        randomNumber,
        vRaceInfo
    });
}
