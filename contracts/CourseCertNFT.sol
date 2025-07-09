// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

contract CourseCertNFT is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    uint256 private _tokenIds;

    event CertificateMinted(address indexed recipient, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("CourseCertNFT", "CERT") {
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin!");
        _;
    }

    function mintCert(
        address _recipient,
        string memory _tokenURI
    ) public onlyAdmin returns (uint256) {
        _tokenIds++;
        uint256 newCertId = _tokenIds;

        _safeMint(_recipient, newCertId);
        _setTokenURI(newCertId, _tokenURI);

        emit CertificateMinted(_recipient, newCertId, _tokenURI);
        return newCertId;
    }

    /// @dev The following makes minted NFTs completely non-transferrable (soulbound)
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer failed");
        }

        return super._update(to, tokenId, auth);
    }

    /// @dev The following are overrides required to avoid errors
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}

