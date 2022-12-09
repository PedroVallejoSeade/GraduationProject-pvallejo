const XNToken = artifacts.require("XNToken");

module.exports = function (deployer) {
  deployer.deploy(XNToken);
};