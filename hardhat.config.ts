import dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
    solidity: "0.8.28",
    networks: {
        sepolia: {
            url: API_URL,
            accounts: [`0x${PRIVATE_KEY}`],
        },
    },
};

export default config;
