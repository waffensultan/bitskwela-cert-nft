import dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL;
const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY;

const config: HardhatUserConfig = {
    solidity: "0.8.28",
    networks: {
        sepolia: {
            url: ALCHEMY_API_URL,
            accounts: [`0x${METAMASK_PRIVATE_KEY}`],
        },
    },
    typechain: {
        outDir: "frontend/typechain-types",
    },
};

export default config;
