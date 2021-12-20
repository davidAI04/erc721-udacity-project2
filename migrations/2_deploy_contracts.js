const StarTokens = artifacts.require("StarTokens");

module.exports = function(deployer) {
  deployer.deploy(StarTokens, "cryptostars", "CRST");
};
