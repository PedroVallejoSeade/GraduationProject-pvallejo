const MyToken = artifacts.require("MyToken");

var chai = require("chai");
const BN = web3.utils.BN;
const chaiBN = require("chai-bn")(BN);
chai.use(chaiBN);

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const expect = chai.expect;

contract("Token Test", async (accounts) => {
    const [deployerAccount, recepient, anotherAccount] = accounts;

    it("is not possible to send more tokens than available in total", async() =>{
        let instance = await MyToken.deployed();
        let balanceOfDeployer = await instance.balanceOf(deployerAccount);

        expect(instance.transfer(recepient, new BN(balanceOfDeployer+1))).to.eventually.be.rejected;
        expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(balanceOfDeployer);
    })

    it("is possible to send tokens between accounts", async() => {
        const sendTokens = 1;
        let instance = await MyToken.deployed();
        let totalSupply = await instance.totalSupply();

        expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);
        expect(instance.transfer(recepient, sendTokens)).to.eventually.be.fulfilled;
        expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply.sub(new BN(sendTokens)));
        expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(new BN(sendTokens));
    })
})