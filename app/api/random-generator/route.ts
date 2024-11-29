import { NextRequest, NextResponse } from 'next/server';
import { ethers } from "ethers";

// Initialize RandomService with private key from environment variable
const contractAddress = process.env.NEXT_PUBLIC_MINE_ADDRESS;
const signerPrivateKey = process.env.SIGNER_WALLET;
const RPC = process.env.NEXT_PUBLIC_RPC_URL;
const provider = new ethers.JsonRpcProvider(RPC);
if (!signerPrivateKey) {
    throw new Error('SIGNER_WALLET_PRIVATE_KEY environment variable is not set');
}
const signer = new ethers.Wallet(signerPrivateKey, provider);

// UserAddres: la recivis desde llamada a este mismo endpoint
export async function POST(request: NextRequest) {
    const { userAddress } = await request.json();
    const randomNumber = Math.floor(Math.random() * 100);
    const nonce = crypto.randomUUID().replace(/-/g, "");
    const nonceUpdate = ethers.keccak256(ethers.toUtf8Bytes(nonce));
    const expiryUpdate = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    const messageUpdate = ethers.solidityPackedKeccak256(
        ["address", "address", "bytes32", "uint256", "uint256"],
        [userAddress, contractAddress, nonceUpdate, expiryUpdate, randomNumber],
    );

    const signatureUpdate = await signer.signMessage(ethers.getBytes(messageUpdate));
    // Return the response with the generated data
    return NextResponse.json({
        userAddress,
        nonceUpdate,
        expiryUpdate,
        signatureUpdate,
        randomNumber
    });
}
