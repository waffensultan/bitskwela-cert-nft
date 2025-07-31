import { type ActionFunctionArgs, json } from "@remix-run/node";
import { ethers } from "ethers";

import { CourseCertNFT__factory } from "typechain-types/factories/contracts/CourseCertNFT__factory";
import { getWalletAddress } from "~/utils/auth";
import { isContractOwner } from "~/utils/contract";

import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL!;
const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY!;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;

export async function loader() {
    return json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function action(request: ActionFunctionArgs) {
    const walletRes = await getWalletAddress(request);
    const { walletAddress } = await walletRes.json();

    if (!walletAddress) {
        return json(
            { success: false, error: "Forbidden: You are not authenticated" },
            { status: 403 },
        );
    }

    const isAdmin = await isContractOwner(walletAddress);
    if (!isAdmin) {
        return json(
            { success: false, error: "Forbidden: You are not the contract owner" },
            { status: 403 },
        );
    }

    try {
        const { recipientWalletAddress, nftMetadataUrl } = await request.request.json();

        if (
            typeof recipientWalletAddress !== "string" ||
            typeof nftMetadataUrl !== "string" ||
            !ethers.isAddress(recipientWalletAddress)
        ) {
            return json({ success: false, error: "Invalid input" }, { status: 400 });
        }

        const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);
        const signer = new ethers.Wallet(METAMASK_PRIVATE_KEY, provider);
        const contract = CourseCertNFT__factory.connect(CONTRACT_ADDRESS, signer);

        const tx = await contract.mintCert(recipientWalletAddress, nftMetadataUrl);
        const receipt = await tx.wait();

        return json({ success: true, hash: receipt?.hash });
    } catch (err: any) {
        console.error("Mint error:", err);
        return json({ success: false, error: err.message || "Minting failed" }, { status: 500 });
    }
}
