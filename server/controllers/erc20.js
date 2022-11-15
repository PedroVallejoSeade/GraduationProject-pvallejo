const { request, response } = require( 'express' );
const { exec } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );
const uniqid = require('uniqid'); 

const { FILE_CREATION, FILE_UPDATE, SUCCESS, ERROR, oneLineConsoleMessage, multiLineConsoleMessage } = require('../services/console-events');

/**
 * --------------------------------------------------------------------------------
 * ERC-20 ENDPOINT CONTROLLERS
 * --------------------------------------------------------------------------------
 */

/**
 * Controller function for a get request [CURRENTLY HAS NO USE]
 * @param {*} req Request object
 * @param {*} res Response object
 */
const erc20Get = (req = request, res = response) => {
    deployContract();

    res.json({
        msg : 'get API - controller'
    });
}

/**
 * Controller function for a put request [CURRENTLY HAS NO USE]
 * @param {*} req Request object
 * @param {*} res Response object
 */
const erc20Put = (req = request, res = response) => {
    res.json({
        msg : 'put API - controller'
    });
}

/**
 * Controller for the post request of an ERC-20 token
 * @param {*} req Request to the server
 * @param {*} res The response from the server
 */
const erc20Post = (req = request, res = response) => {
    // Request body
    const { name, symbol, tokenAmount } = req.body;

    // Filename for the solidity contract
    const contractFileName = `ERC-20:${uniqid()}`;

    // Templates needed for deployement and contract creation
    const deployementFile = deployementFileTemplate(name);
    const contractFile = erc20ContractTemplate(name, symbol, tokenAmount);

    // Creation of the needed files and deployement of contract
    createERC20FilesAndDeployContract(name, contractFileName, deployementFile, contractFile);
    
    
    // Response of the server
    res.json({
        msg : `The token ${name} with the symbol ${symbol} has been created with a total amount of ${tokenAmount} tokens`
    });
}

/**
 * Controller function for a delete request [CURRENTLY HAS NO USE]
 * @param {*} req Request object
 * @param {*} res Response object
 */
const erc20Delete = (req = request, res = response) => {
    res.json({
        msg : 'delete API'
    });
}

/**
 * --------------------------------------------------------------------------------
 * HELPER FUNCTIONS
 * --------------------------------------------------------------------------------
 */

/**
 * Creates a string for a deployement file from a template and the parameters specified
 * @param {*} tokenName The name of the token
 * @returns A string with the content of the deployement file
 */
function deployementFileTemplate(tokenName){
    const deploymentFile =
    `const ${tokenName} = artifacts.require("${tokenName}");\n` +
    `\n` +
    `module.exports = function (deployer) {\n` +
    `  deployer.deploy(${tokenName});\n` +
    `};`;

    return deploymentFile;
}

/**
 * Creates a string for the contract file from a template and the parameters specified
 * @param {*} name Name of the token
 * @param {*} symbol Symbol of the token
 * @param {*} tokenAmount The ammount of tokens
 * @returns 
 */
function erc20ContractTemplate(name, symbol, tokenAmount) {
    const contract =
    `// SPDX-License-Identifier: MIT\n` +
    `pragma solidity ^0.8.9;\n` +
    `\n` +
    `import "@openzeppelin/contracts/token/ERC20/ERC20.sol";\n` +
    `\n` +
    `contract ${name} is ERC20 {\n` +
    `    constructor() ERC20("${name}", "${symbol}") {\n` +
    `        _mint(msg.sender, ${tokenAmount} * 10 ** decimals());\n` +
    `    }\n` +
    `}`;

    return contract;
}

/**
 * Creates the deployement and contract files for an ERC-20 token and also deploys the contract created
 * @param {*} tokenName The name of the token being created
 * @param {*} contractFileName The name of the file for the contract
 * @param {*} deployementFile The content of the deployement file
 * @param {*} contractFile The content of the contract file
 */
function createERC20FilesAndDeployContract(tokenName, contractFileName, deployementFile, contractFile) {
    fs.writeFile(path.join(__dirname, '..', 'migrations', '1_deploy_contracts.js'), deployementFile, (err) => {
        if (err) {
            multiLineConsoleMessage(FILE_UPDATE,
                ERROR,
                `The solidity file for the token ${tokenName} could not be written due to the error shown below`,
                `${err.message}`)

            return;
        }
        oneLineConsoleMessage(FILE_UPDATE, SUCCESS, `The deployement file in order to deploy the token ${tokenName} was succesfully updated`);
        
        createContractFile(tokenName, contractFileName, contractFile)
    });
}

/**
 * Creates the contract file for the Token
 * @param {*} tokenName Name of the token being created
 * @param {*} contractFileName Name of the file for the contract being created
 * @param {*} contractFile Content of the contract file
 */
function createContractFile(tokenName, contractFileName, contractFile){
    fs.writeFile(path.join(__dirname, '..', 'contracts', `${contractFileName}.sol`), contractFile, (err) => {
        if (err) {
            multiLineConsoleMessage(FILE_CREATION,
                ERROR,
                `The solidity file for the token ${tokenName} could not be created due to the error shown below`,
                `${err.message}`)

            return;
        }

        // deployContract();

        oneLineConsoleMessage(FILE_CREATION, SUCCESS, `The solidity file for the token ${tokenName} was succesfully written`);
    });
}

/**
 * Runs the script in order to deploy contracts
 */
function deployContract() {
    console.log('DEBUG:', '1');
    exec("truffle migrate", (error, stdout, stderr) => {
        if (error) {
            console.log('DEBUG:', '2');
            console.log(`error: ${error.message}`);
            console.log('DEBUG:', '3');
            return;
        }
        if (stderr) {
            console.log('DEBUG:', '4');
            console.log(`stderr: ${stderr}`);
            console.log('DEBUG:', '5');
            return;
        }
        console.log('DEBUG:', '6');
        console.log(`stdout: ${stdout}`);
        console.log('DEBUG:', '7');
    });
}

module.exports = {
    erc20Get,
    erc20Put,
    erc20Post,
    erc20Delete
}