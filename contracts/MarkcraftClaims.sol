// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Markcraft Claims
/// @notice Records who registered an exact logo file (by SHA-256 of the SVG) first, and when.
/// A claim is a timestamped proof of authorship for one exact file. It is NOT a trademark registration.
/// No tokens, no payments, no admin.
contract MarkcraftClaims {
    struct Claim {
        address creator;
        bytes32 svgHash;
        string brand;
        uint8 style;
        string cid; // IPFS CID of the SVG; empty = not in the public gallery
        uint64 at;
    }

    uint256 public constant MAX_BRAND_BYTES = 48;
    uint256 public constant MAX_CID_BYTES = 100;
    uint8 public constant MAX_STYLE = 15;

    /// @dev Index 0 is a placeholder so that id 0 means "no claim".
    Claim[] public claims;
    mapping(bytes32 => uint256) public idOfHash;
    mapping(address => uint256[]) private byCreator;
    uint256[] private galleryIds;

    event Claimed(uint256 indexed id, address indexed creator, bytes32 svgHash, string brand);

    error EmptyHash();
    error AlreadyClaimed(uint256 id);
    error BadBrand();
    error BadCid();
    error BadStyle();
    error NotFound();

    constructor() {
        claims.push(Claim(address(0), bytes32(0), "", 0, "", 0));
    }

    function claim(bytes32 svgHash, string calldata brand, uint8 style, string calldata cid)
        external
        returns (uint256 id)
    {
        if (svgHash == bytes32(0)) revert EmptyHash();
        uint256 existing = idOfHash[svgHash];
        if (existing != 0) revert AlreadyClaimed(existing);
        uint256 bl = bytes(brand).length;
        if (bl == 0 || bl > MAX_BRAND_BYTES) revert BadBrand();
        if (bytes(cid).length > MAX_CID_BYTES) revert BadCid();
        if (style > MAX_STYLE) revert BadStyle();

        id = claims.length;
        claims.push(Claim(msg.sender, svgHash, brand, style, cid, uint64(block.timestamp)));
        idOfHash[svgHash] = id;
        byCreator[msg.sender].push(id);
        if (bytes(cid).length != 0) galleryIds.push(id);

        emit Claimed(id, msg.sender, svgHash, brand);
    }

    function getClaim(uint256 id) public view returns (Claim memory) {
        if (id == 0 || id >= claims.length) revert NotFound();
        return claims[id];
    }

    /// @return id 0 if this hash was never claimed
    function claimOfHash(bytes32 svgHash) external view returns (uint256 id, Claim memory c) {
        id = idOfHash[svgHash];
        if (id != 0) c = claims[id];
    }

    function claimsOf(address creator) external view returns (uint256[] memory) {
        return byCreator[creator];
    }

    /// @notice Newest-first page of claims that chose the public gallery.
    /// @param from offset from the newest gallery entry (0 = newest)
    function getGallery(uint256 from, uint256 count)
        external
        view
        returns (uint256[] memory ids, Claim[] memory items)
    {
        uint256 n = galleryIds.length;
        if (from >= n || count == 0) return (new uint256[](0), new Claim[](0));
        uint256 len = n - from < count ? n - from : count;
        ids = new uint256[](len);
        items = new Claim[](len);
        for (uint256 i = 0; i < len; i++) {
            uint256 id = galleryIds[n - 1 - from - i];
            ids[i] = id;
            items[i] = claims[id];
        }
    }

    function galleryCount() external view returns (uint256) {
        return galleryIds.length;
    }

    /// @notice Number of real claims (excludes the id-0 placeholder).
    function total() external view returns (uint256) {
        return claims.length - 1;
    }
}
