// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Market is ReentrancyGuard {
    // CHANGE HOW DATA IS ADDED TO IPFS AND THIS CONTRACT
    using Counters for Counters.Counter;
    Counters.Counter private listedHouses;
    address payable private _marketOwner;

    struct house {
        uint256 houseId;
        address houseContract;
        address payable seller;
        address payable owner;
        uint256 price;
        details _details;
        bool listed;
    }

    struct details {
        uint256 lotSqFt;
        uint256 houseSqFt;
        uint256 bedrooms;
        uint256 bathrooms;
        string houseType;
        uint256 yearBuilt;
        string[] location;
        string image;
        string condition;
    }

    mapping(uint256 => house) private idToHouse;

    event houseListed(
        uint256 houseId,
        address houseContract,
        address seller,
        address owner,
        uint256 price
    );

    event houseSold(
        uint256 houseId,
        address houseContract,
        address seller,
        address owner,
        uint256 price
    );

    constructor() {
        _marketOwner = payable(msg.sender);
    }

    function getListingFee(uint256 _price) private pure returns (uint256) {
        return (_price * 300) / 10_000;
    }

    // List the house on the market
    function listHouse(
        address _houseContract,
        uint256 _houseId,
        uint256 _price
    ) public payable nonReentrant {
        require(_price > 0, "Price must be at least 1 wei");
        require(
            msg.value == getListingFee(_price),
            "Not enough ether for listing fee"
        );

        IERC721(_houseContract).transferFrom(
            msg.sender,
            address(this),
            _houseId
        );
        listedHouses.increment();

        idToHouse[_houseId] = house(
            _houseId,
            _houseContract,
            payable(msg.sender),
            payable(address(this)),
            _price,
            true
        );

        emit houseListed(
            _houseId,
            _houseContract,
            msg.sender,
            address(this),
            _price
        );
    }

    // Buy a house: transfers ownership and funds between parties
    function buyHouse(address _houseContract, uint256 _houseId)
        public
        payable
        nonReentrant
    {
        house storage _house = idToHouse[_houseId];
        require(
            msg.value >= _house.price,
            "Not enough ether to afford asking price"
        );

        payable(_house.seller).transfer(msg.value);
        IERC721(_houseContract).transferFrom(
            address(this),
            msg.sender,
            _houseId
        );
        _house.owner = payable(msg.sender);
        _house.listed = false;
        _marketOwner.transfer(getListingFee(_house.price));
        listedHouses.decrement();

        emit houseSold(
            _houseId,
            _houseContract,
            _house.seller,
            msg.sender,
            msg.value
        );
    }

    function getListedHouses() public view returns (house[] memory) {
        uint256 houseCount = listedHouses.current();
        house[] memory houses = new house[](houseCount);

        for (uint256 i = 0; i < houseCount; i++) {
            if (idToHouse[i + 1].listed) {
                houses[i] = idToHouse[i + 1];
            }
        }

        return houses;
    }

    function getMyHouses() public view returns (house[] memory) {
        uint256 houseCount = listedHouses.current();
        uint256 myHouseCount = 0;

        for (uint256 i = 0; i < houseCount; i++) {
            if (idToHouse[i + 1].owner == msg.sender) {
                myHouseCount++;
            }
        }

        house[] memory myHouses = new house[](myHouseCount);

        for (uint256 i = 0; i < houseCount; i++) {
            if (idToHouse[i + 1].owner == msg.sender) {
                myHouses[i] = idToHouse[i + 1];
            }
        }

        return myHouses;
    }

    function getMyListedHouses() public view returns (house[] memory) {
        uint256 houseCount = listedHouses.current();
        uint256 myListedHouseCount = 0;

        for (uint256 i = 0; i < houseCount; i++) {
            if (idToHouse[i + 1].seller == msg.sender) {
                myListedHouseCount++;
            }
        }

        house[] memory myListedHouses = new house[](myListedHouseCount);

        for (uint256 i = 0; i < houseCount; i++) {
            if (idToHouse[i + 1].seller == msg.sender) {
                myListedHouses[i] = idToHouse[i + 1];
            }
        }

        return myListedHouses;
    }
}
