# [Bitskwela Cert NFT](https://github.com/waffensultan/bitskwela-cert-nft)

Our Web3 Development internship project at Bitskwela. It features a fully-functional smart contract that can be verified on block explorers, and a frontend built on Remix that allows users to generate ERC-721 compliant metadata, pin metadata on IPFS, issue NFT certificates and view it.

## 👨‍💻 Team

- [Waffen Sultan](https://github.com/waffensultan)
- [Ostline Casao](https://github.com/owostline)

## 📌 Table of Contents

- [Smart Contract](#-smart-contract)
- [Frontend](#-frontend)

## 🌐 Smart Contract

CourseCertNFT is a smart contract that issues **non-transferable ERC-721 NFT certificates** (aka _soulbound tokens_) to students who complete a Bitskwela course. These certificates are securely stored on the blockchain and cannot be transferred, ensuring authenticity and ownership.

### How It Works

1. Upon deployment, the **deployer gets assigned the admin role** automatically by the smart contract.
2. The deployer, now the admin, can mint a certificate to a recipient's wallet with custom metadata (e.g., recipient, issuer, course, date issued)
3. For best results, it is **recommmended to use the metadata generator** feature provided in the frontend
4. **Transferring capabilities are completely disabled**, making each NFT certificate a _soulbound token_
5. Anyone can verify the authenticity by viewing the token's metadata on-chain with block explorers

### Contract Functions

| Function                                                | Description                                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `mintCert(address _recipient, string memory _tokenURI)` | Mints a new certificate NFT to the specified address. Only callable by admins. |
| `getCertificatesOf(address user)`                       | Returns all certificate IDs owned by a given address.                          |
| `getAllMintedTokens()`                                  | Returns an array of all minted certificate IDs.                                |
| `tokenURI(uint256 tokenId)`                             | Returns the metadata URI of a specific certificate.                            |
| `supportsInterface(bytes4 interfaceId)`                 | Returns supported interfaces (for compatibility checks).                       |

### Tech Stack

- [Solidity](https://soliditylang.org/) ^0.8.20
- [OpenZeppelin](https://www.openzeppelin.com/) Contracts
- [ERC721](https://docs.openzeppelin.com/contracts/3.x/erc721) (NFT Standard)
- [Hardhat](https://hardhat.org/) (for development)

## 🪟 Frontend

The frontend is built in Remix and provides three features (upon user authentication, whereas the user's wallet address is stored in a cookie):

### Features

- **Issue Certificates (Admin-only)**  
  Authenticated admins can mint soulbound certificates to students. This function interacts directly with the smart contract using the connected wallet.

- **Generate ERC-721 Metadata**  
  Users can create compliant JSON metadata for certificates (e.g., course name, image, description). This metadata can be uploaded to IPFS and linked to the NFT.

- **View Certificates**  
  Any user can enter a wallet address to view all certificates associated with it, including their metadata. Ideal for verifying credentials or showing proof of completion.

### Authentication

Users authenticate by connecting their wallet (e.g., MetaMask). Once authenticated, the user's wallet address is stored in a cookie to persist login state across sessions. Admin access is determined by checking whether the connected wallet has the `ADMIN_ROLE`.

### Tech Stack

- [TypeScript](https://www.typescriptlang.org/)
- [Remix](https://remix.run)
- [ethers.js](https://www.typescriptlang.org/)
- [Tailwind CSS](https://www.tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [MetaMask](https://metamask.io/)

## 🧪 Development

Follow these steps to set up and run the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/waffensultan/bitskwela-cert-nft.git
cd bitskwela-cert-nft
```

### 2. Install dependencies

```bash
# Install dependencies for the smart contract (Hardhat) project
npm install

# Navigate to the frontend directory and install frontend dependencies
cd frontend
npm install
```

### 3. Set up environment variables

Copy the example `.env` files and fill in your credentials:

```bash
# For the smart contract project
cp .env.example .env

# For the frontend
cd frontend
cp .env.example .env
```

### 4. Compile the smart contract

Go back to the root directory and compile the contract:

```bash
cd ..
npm run contract:compile
```

### 5. Run the frontend

Start the frontend development server:

```bash
npm run frontend:dev
```
