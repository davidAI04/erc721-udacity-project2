

const StarTokens = artifacts.require("StarTokens");

contract("star notary contract", async (accounts) => {
  const owner = accounts[0];
  let deployedInstance;
  
  beforeEach(async() => {
    deployedInstance = await StarTokens.deployed();
    //console.log(" deployed -->", deployedInstance);
  })
  
  it("create star", async () => {
    await deployedInstance.createStar("our first star", 1, {from: owner});
    //When we need test a mapping value, we should use .call(_key_value), 
    //If we dont pass a value this gonna trow an error
    assert.equal(await deployedInstance.tokenIdToStarInfo.call(1), 'our first star');
  });

  it("put star for sale", async() => {
    const user1 = accounts[1];
    await deployedInstance.createStar("start for sale", 2, {from: user1});
    //We must assign values in WEI, so we can use the the utils module 
    //of the web3 library (integrated here) to cast from ether to wei easily
    const starPrice = web3.utils.toWei("0.01", "ether");

    await deployedInstance.putStarForSale(2, starPrice, {from: user1});
    assert.equal(await deployedInstance.tokenIdToPriceInfo.call(2), starPrice);
  });

  it("check seller balance after sale", async () => {
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starPrice = web3.utils.toWei("0.01", "ether");
    await deployedInstance.createStar("start for sale", 3, {from: user1});
    await deployedInstance.putStarForSale(3, starPrice, {from: user1});
    const balaceBeforeTxn = await web3.eth.getBalance(user1);
    await deployedInstance.buyStar(3, {from: user2, value: starPrice});
    const balaceAfterTxn = await  web3.eth.getBalance(user1);
    assert.equal(Number(balaceBeforeTxn) + Number(starPrice), Number(balaceAfterTxn));
  });

  it("check new owner, after sale", async () => {
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starPrice = web3.utils.toWei("0.01", "ether");
    await deployedInstance.createStar("start for sale", 4, {from: user1});
    await deployedInstance.putStarForSale(4, starPrice, {from: user1});
    await deployedInstance.buyStar(4, {from: user2, value: starPrice});
    assert.equal(await deployedInstance.ownerOf(4), user2);
  });

  it("check that the balance decreased after purchasing a token", async () => {
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starPrice = web3.utils.toWei("0.01", "ether");
    await deployedInstance.createStar("start for sale", 5, {from: user1});
    await deployedInstance.putStarForSale(5, starPrice, {from: user1});
    const balanceBeforeTxn = await web3.eth.getBalance(user2);
    const buy = await deployedInstance.buyStar(5, {from: user2, value: starPrice, gasPrice: 0});
    const balanceAfterTxn = await web3.eth.getBalance(user2);
    const valueRef = Number(balanceBeforeTxn) - Number(balanceAfterTxn);
    assert.equal(valueRef, Number(starPrice));
  });

  /****PROJECT TESTS****/
  
  it("Check token symbol and name", async () => {
    assert.equal(await deployedInstance.name(), "cryptostars");
    assert.equal(await deployedInstance.symbol(), "CRST");
  });

  it("check star name", async () => {
    const starName = await deployedInstance.lookUptokenIdToStarInfo(5);
    assert.equal(starName, "start for sale");
  });

  it("check token exchange", async () => {
    const user1 = accounts[1];
    const user2 = accounts[2];
    await deployedInstance.createStar("start for exchange", 6, {from: user1});
    await deployedInstance.createStar("start for exchange", 7, {from: user2});
    await deployedInstance.exchangeStars(7, 6,  {from: accounts[1]});
    assert.equal(await deployedInstance.ownerOf(6), user2);
    assert.equal(await deployedInstance.ownerOf(7), user1);
  });

  
  it("check token transfer", async () => {
    const user1 = accounts[1];
    const user2 = accounts[2];
    await deployedInstance.createStar("start for exchange", 8, {from: user1});
    await deployedInstance.transferStar(user2, 8, {from: user1});
    assert.equal(await deployedInstance.ownerOf(8), user2);
  });

})