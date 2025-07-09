import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CourseCertNFT", (m) => {
    const courseCertNFT = m.contract("CourseCertNFT");

    return { courseCertNFT };
});
