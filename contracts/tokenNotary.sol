// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarTokens is ERC721 {
  
  
  constructor(string memory name_, string memory symbol_ ) 
  ERC721(name_, symbol_) {}

  struct Star {
    string name;
  }

  //Assign a token id to star
  mapping(uint256 => Star) public tokenIdToStarInfo;
  //Assign price to a token Id
  mapping(uint256 => uint256) public tokenIdToPriceInfo;



  function createStar(string memory _name, uint256 tokenId) public {
    Star memory newStar = Star(_name);
    tokenIdToStarInfo[tokenId] = newStar;
    super._safeMint(msg.sender, tokenId);
  }

  function putStarForSale(uint256 _tokenId, uint256 _price) public {
    require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
    tokenIdToPriceInfo[_tokenId] = _price;
  }

  function make_address_payable(address rawAddress) internal pure returns(address payable) {
    return payable(rawAddress);
  }

  function buyStar(uint256 tokenId) public payable {
    uint256 tokenPrice = tokenIdToPriceInfo[tokenId];
    //check if the token is for sale
    require(tokenPrice > 0, "The token is not for sale");
    //check if the buyer has enough founds
    require(msg.value >= tokenPrice, "You dont sent enough Ether to buy the token");
    address  ownerAddress = super.ownerOf(tokenId);
    // Transfer a token by the open xeppeling handler
    super._transfer(ownerAddress, msg.sender, tokenId);
    
    //Cast the owner addres from a  raw address to a 
    //payable address (with the transfer and send methods)
    address payable ownerPayableAddress = make_address_payable(ownerAddress);
    //Send the token price (in ETH) to the owner
    ownerPayableAddress.transfer(tokenPrice);
    if (msg.value > tokenPrice) {
      address payable  buyerAddress = make_address_payable(msg.sender);
      buyerAddress.transfer(msg.value - tokenPrice);
    }
  }

  /**
  * FUNCTIONS FOR DECENTRALIZED STAR PROJECT 
  */
  
  ///You are not authorized to exchange functions
  error Unauthorized();

  function lookUptokenIdToStarInfo(uint256 tokenId) public view returns(string memory) {
    return tokenIdToStarInfo[tokenId].name;
  }

  function _exchangeStars(
    address msgSenderAddress, 
    uint256 msgSenderTokenId, 
    uint256 counterpartTokenId,
    address counterpartAddress
    ) internal {
      if (counterpartAddress == address(0)) {
       counterpartAddress = super.ownerOf(counterpartTokenId);
      }
      super._transfer(msgSenderAddress, counterpartAddress, msgSenderTokenId);
      super._transfer(counterpartAddress, msgSenderAddress, counterpartTokenId);
  }

  function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
    address ownerToken1 = super.ownerOf(_tokenId1);
    if (ownerToken1 == msg.sender) {
      _exchangeStars(msg.sender, _tokenId1, _tokenId2, address(0));
    } else {
      address ownerToken2 = super.ownerOf(_tokenId2);
      if (ownerToken2 == msg.sender) {
        _exchangeStars(msg.sender, _tokenId2, _tokenId1, ownerToken1);
      } else { //If the caller is not owner for any token id
        revert Unauthorized();
      }
    }
  }
  
  function transferStar(address _to1, uint256 _tokenId) public {
    super._transfer(msg.sender, _to1, _tokenId);
  }
}