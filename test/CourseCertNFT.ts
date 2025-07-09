import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("CourseCertNFT", function () {
    async function deployFixture() {
        const contract = await hre.ethers.deployContract("CourseCertNFT");

        const [deployer, recipient] = await hre.ethers.getSigners();

        return { contract, deployer, recipient };
    }

    it("Constructor sets name correctly", async function () {
        const { contract } = await loadFixture(deployFixture);

        expect(await contract.name()).to.equal("CourseCertNFT");
    });

    it("Constructor sets symbol correctly", async function () {
        const { contract } = await loadFixture(deployFixture);

        expect(await contract.symbol()).to.equal("CERT");
    });

    it("Constructor assigns ADMIN_ROLE to deployer", async function () {
        const { contract } = await loadFixture(deployFixture);

        const adminRole = await contract.ADMIN_ROLE();
        const [owner] = await hre.ethers.getSigners();

        expect(await contract.hasRole(adminRole, owner)).to.be.true;
    });

    it("Admin can successfully call mintCert()", async function () {
        const { contract, deployer, recipient } = await loadFixture(deployFixture);

        const tx = await contract
            .connect(deployer)
            .mintCert(recipient.address, "ipfs://fake-ipfs-link");
        await tx.wait();

        expect(await contract.ownerOf(1)).to.equal(recipient.address);
    });

    it("Non-admin cannot call mintCert()", async function () {
        const { contract, recipient } = await loadFixture(deployFixture);

        await expect(
            contract.connect(recipient).mintCert(recipient.address, "ipfs://fake-ipfs-link"),
        ).to.be.revertedWith("Caller is not an admin!");
    });

    it("Function mintCert() mints to correct recipient", async function () {
        const { contract, deployer, recipient } = await loadFixture(deployFixture);

        const tx = await contract
            .connect(deployer)
            .mintCert(recipient.address, "ipfs://fake-ipfs-link");
        await tx.wait();

        expect(await contract.ownerOf(1)).to.equal(recipient.address);
    });

    it("Function mintCert() emits CertificateMinted event with the right values", async function () {
        const { contract, deployer, recipient } = await loadFixture(deployFixture);
        const recipientAddress = recipient.address;
        const tokenURI = "ips://fake-ipfs";

        await expect(contract.connect(deployer).mintCert(recipientAddress, tokenURI))
            .to.emit(contract, "CertificateMinted")
            .withArgs(recipientAddress, 1, tokenURI);
    });

    it("Function supportsInterface() returns true for AccessControl, ERC721, and ERC721URIStorage", async function () {
        const { contract } = await loadFixture(deployFixture);

        const ERC721_INTERFACE_ID = "0x80ac58cd";
        const ERC721_METADATA_INTERFACE_ID = "0x5b5e139f";
        const ACCESS_CONTROL_INTERFACE_ID = "0x7965db0b";

        expect(await contract.supportsInterface(ERC721_INTERFACE_ID)).to.be.true;
        expect(await contract.supportsInterface(ERC721_METADATA_INTERFACE_ID)).to.be.true;
        expect(await contract.supportsInterface(ACCESS_CONTROL_INTERFACE_ID)).to.be.true;
    });

    it("Token cannot be transferred (is soulbound)", async function () {
        const { contract, deployer, recipient } = await loadFixture(deployFixture);

        const tx = await contract
            .connect(deployer)
            .mintCert(recipient.address, "ipfs://fake-ipfs-link");
        const receipt = await tx.wait();

        const iface = new hre.ethers.Interface([
            "event CertificateMinted(address indexed recipient, uint256 indexed tokenId, string tokenURI)",
        ]);

        let tokenId;

        for (const log of receipt?.logs!) {
            const parsed = iface.parseLog(log);
            if (!parsed || parsed?.name !== "CertificateMinted") continue;

            tokenId = parsed.args.tokenId;
            break;
        }

        if (!tokenId) throw new Error("Failed to retrieve tokenId");

        await expect(
            contract.connect(recipient).transferFrom(recipient.address, deployer.address, tokenId),
        ).to.be.revertedWith("Soulbound: Transfer failed");
    });
});
