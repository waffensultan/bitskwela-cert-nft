import { ethers } from "ethers";
import { CourseCertNFT__factory } from "../../../typechain-types/factories/contracts/CourseCertNFT__factory";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS!;
const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL!;

/**
 * Retrieves the current contract address.
 *
 * @returns The current contract address.
 */
export function getContractAddress() {
    return CONTRACT_ADDRESS;
}

/**
 * Check if the provided wallet address is the owner/admin.
 *
 * @param walletAddress The Etherem address to check for owner/admin privileges.
 * @returns A boolean indicating whether the provided wallet address is the owner/admin.
 */
export async function isContractOwner(walletAddress: string) {
    const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);

    const contract = CourseCertNFT__factory.connect(CONTRACT_ADDRESS, provider);

    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    const isAdmin = await contract.hasRole(ADMIN_ROLE, walletAddress);

    return isAdmin;
}

/**
 * Retrieves tokens with their metadata for the provided wallet address.
 *
 * @param walletAddress The Ethereum address to retrieve certificates with their metadata for.
 * @returns A list of tokens for the provided wallet address..
 */
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

/**
 * Retrieves a single token/certificate's metadata.
 *
 * @param tokenId The token ID of the said token/certificate.
 * @returns Returns the token/certificate's metadata.
 */
export async function getSingleCertificateWithMetadata(tokenId: string) {
    const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);
    const contract = CourseCertNFT__factory.connect(CONTRACT_ADDRESS, provider);

    try {
        const tokenURI = await contract.tokenURI(tokenId);
        const metadataURL = tokenURI.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/");
        const metadata = await fetch(metadataURL).then((res) => res.json());

        return {
            tokenId,
            tokenURI,
            metadata,
        };
    } catch (err) {
        return null;
    }
}

/**
 * Retrieves all minted tokens with their metadata.
 *
 * @returns A list of all tokens with their metadata.
 */
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
