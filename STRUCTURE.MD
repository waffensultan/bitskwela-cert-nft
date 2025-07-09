```text
bitskwela-cert-nft/
├── contracts/ # ✅ Solidity smart contracts
│ └── CourseCertNFT.sol # Main ERC721 smart contract
│
├── test/ # ✅ Hardhat unit tests
│ └── CourseCertNFT.ts
│
├── metadata/ # ✅ NFT metadata & JSON files
│ └── sample-cert.json
│ └── generateMetadata.js # Metadata generator script
│
├── ipfs/ # ✅ Pinata/NFT.Storage upload helpers
│ └── pinToIPFS.js
│
├── frontend/ # ✅ React-Remix DApp
│ ├── app/
│ │ ├── components/ # Reusable React components
│ │ │ └── CertCard.tsx
│ │ ├── routes/ # Remix routes
│ │ │ └── index.tsx # Issue & View Certificate UI
│ │ ├── hooks/
│ │ ├── utils/ # Wallet connection, IPFS fetch, etc.
│ │ └── styles/
│ └── public/
│
├── backend/ # ✅ Django backend integration
│ ├── cert_api/
│ │ ├── views.py # POST /mint-cert endpoint
│ │ ├── serializers.py
│ │ └── urls.py
│ └── ...
│
└── ...
```