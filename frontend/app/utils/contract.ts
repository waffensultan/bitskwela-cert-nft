import dotenv from "dotenv";
import { ethers } from "ethers";
import { CourseCertNFT__factory } from "../../../typechain-types/factories/contracts/CourseCertNFT__factory";

dotenv.config({ path: "../.env" });

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL!;

export async function isContractOwner(walletAddress: string) {
    const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);

    // Create contract instance
    const contract = CourseCertNFT__factory.connect(CONTRACT_ADDRESS, provider);

    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    const isAdmin = await contract.hasRole(ADMIN_ROLE, walletAddress);

    return isAdmin;
}
