import { NextRequest, NextResponse } from 'next/server';
import { ethers } from "ethers";
import ABIRace from "@/public/ABIS/RACEABI.json";

type Race = {
    race: string[]; // Array of 20 Ethereum addresses
    winnerPositions: number[]; // Array of 20 uint8 numbers
    sponsors: number; // A single uint8 value
    claimed: boolean[]; // Array of 3 boolean values
};

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

    try {
        const currentRace = await contract.currentRace();
        //console.log("currentRace", currentRace.toString()); // Convert BigInt to string for logging

        const vRaceInfo = await contract.vRace(currentRace) as Race;
        //console.log("vRaceInfo[2]", vRaceInfo[2].toString()); // Convert BigInt to string

        if (vRaceInfo.sponsors === 10) {
            console.log("Race is over");
            await contract.startRace(randomNumber);
        } else {
            // Race is not over, return error
            console.log("Race is not over");
            return NextResponse.json({ error: "Race is not over" });
        }

        // Return response, converting BigInt values to strings
        return NextResponse.json({
            randomNumber,
            vRaceInfo: {
                race: vRaceInfo.race.map((address) => address), // No conversion needed for addresses
                winnerPositions: vRaceInfo.winnerPositions, // Already numbers
                sponsors: vRaceInfo.sponsors, // Already a number
                claimed: vRaceInfo.claimed, // Already booleans
            },
        });
    } catch (e) {
        console.error("Error in executing race:", e);
        return NextResponse.json({ error: "Failed to execute race", e });
    }
}
