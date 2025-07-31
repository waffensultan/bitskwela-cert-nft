import { ethers } from "ethers";
import { CourseCertNFT__factory } from "../../../typechain-types/factories/contracts/CourseCertNFT__factory";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL!;

export async function isContractOwner(walletAddress: string) {
    const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);

    const contract = CourseCertNFT__factory.connect(CONTRACT_ADDRESS, provider);

    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    const isAdmin = await contract.hasRole(ADMIN_ROLE, walletAddress);

    return isAdmin;
}

export async function getCertificatesWithMetadata(walletAddress: string) {
    const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);
    const contract = CourseCertNFT__factory.connect(CONTRACT_ADDRESS, provider);

    const tokenIds: bigint[] = await contract.getCertificatesOf(walletAddress);

    const metadataList = await Promise.all(
        tokenIds.map(async (tokenId) => {
            const tokenURI = await contract.tokenURI(tokenId);

            const metadataURL = tokenURI.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/");

            const metadata = await fetch(metadataURL)
                .then((res) => res.json())
                .catch(() => null);

            return {
                tokenId: tokenId.toString(),
                tokenURI,
                metadata,
            };
        }),
    );

    return metadataList.filter((entry) => entry.metadata);
}

export async function getAllCertificatesWithMetadata() {
    const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);
    const contract = CourseCertNFT__factory.connect(CONTRACT_ADDRESS, provider);

    const tokenIds: bigint[] = await contract.getAllMintedTokens();

    const metadataList = await Promise.all(
        tokenIds.map(async (tokenId) => {
            const tokenURI = await contract.tokenURI(tokenId);
            const metadataURL = tokenURI.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/");
            const metadata = await fetch(metadataURL).then((res) => res.json());

            return {
                tokenId: tokenId.toString(),
                tokenURI,
                metadata,
            };
        }),
    );

    return metadataList.filter((entry) => entry?.metadata);
}
