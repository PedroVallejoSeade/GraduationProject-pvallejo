const { request, response } = require( 'express' );
const { exec } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );

const { FILE_CREATION, FILE_UPDATE, TRUFFLE_MIGRATION, SUCCESS, ERROR, oneLineConsoleMessage, multiLineConsoleMessage } = require('../services/console-events');
const { pushElementInDatabase, getDatabase } = require('../services/database.js');

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

    const tokenObj = {
        standard : 'ERC-20',
        name : name,
        symbol : symbol,
        amount : tokenAmount,
        contractDeployed : false
    }

    if(pushElementInDatabase(tokenObj)){
        // Templates needed for deployement and contract creation
        const deployementFile = deployementFileTemplate(name);
        const contractFile = erc20ContractTemplate(name, symbol, tokenAmount);

        // Creation of the needed files and deployement of contract
        const succesfulOperation = createERC20FilesAndDeployContract(name, deployementFile, contractFile);

        if(succesfulOperation){
            res.status(201).json({
                msg : 'Success',
                key : 'SUCCESS'
            });
        } else {
            res.status(500).json({
                msg : 'The server could was not able to correctly create the token',
                key : 'UNKNOWN_PROBLEM'
            });
        }
    } else {
        res.status(406).json({
            msg : `There is already a token with the name ${name}`,
            key : 'DUPLICATE_TOKEN_NAME'
        });
    }

    console.log(getDatabase());
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
 * @returns A string with the content of the contract file based on the parameters
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
 * @param {*} deployementFile The content of the deployement file
 * @param {*} contractFile The content of the contract file
 * @return True if the operation was completed succesfully, false otherwise
 */
function createERC20FilesAndDeployContract(tokenName, deployementFile, contractFile) {
    fs.writeFile(path.join(__dirname, '..', 'migrations', '1_deploy_contracts.js'), deployementFile, (err) => {
        if (err) {
            multiLineConsoleMessage(FILE_UPDATE,
                ERROR,
                `The solidity file for the token ${tokenName} could not be written due to the error shown below`,
                `${err.message}`)

            return false;
        }
        oneLineConsoleMessage(FILE_UPDATE, SUCCESS, `The deployement file in order to deploy the token ${tokenName} was succesfully updated`);
        
        return createContractFile(tokenName, contractFile)
    });
}

/**
 * Creates the contract file for the Token
 * @param {*} tokenName Name of the token being created
 * @param {*} contractFile Content of the contract file
 * @return True if the operation was completed succesfully, false otherwise
 */
function createContractFile(tokenName, contractFile){
    fs.writeFile(path.join(__dirname, '..', 'contracts', `${tokenName}.sol`), contractFile, (err) => {
        if (err) {
            multiLineConsoleMessage(FILE_CREATION,
                ERROR,
                `The solidity file for the token ${tokenName} could not be created due to the error shown below`,
                `${err.message}`)

            return false;
        }

        oneLineConsoleMessage(FILE_CREATION, SUCCESS, `The solidity file for the token ${tokenName} was succesfully written`);

        return deployContract(tokenName);
    });
}

/**
 * Runs the script in order to deploy contracts
 * @param {*} tokenName Name of the token being created
 * @return True if the contract was deployed correctly on the network, false otherwise
 */
function deployContract(tokenName) {
    exec("truffle migrate", (error, stdout, stderr) => {
        if (error) {
            multiLineConsoleMessage(TRUFFLE_MIGRATION,
                ERROR,
                `The error shown below ocurred while trying to run 'trufle migrate' command for deploying ` +
                `the token with the name: ${tokenName}`,
                `${error}`)

            return false;
        }
        if (stderr) {
            multiLineConsoleMessage(TRUFFLE_MIGRATION,
                SUCCESS,
                `The command 'truffle migrations was succesfully runned for deploying the token with the name: ` +
                `${tokenName} and obtained the shell stream shown below'`,
                `${stderr}`)

            return true;
        }
        multiLineConsoleMessage(TRUFFLE_MIGRATION,
            SUCCESS,
            `The command 'truffle migrations was succesfully runned for deploying the token with the name: ` +
            `${tokenName} and obtained the shell output shown below'`,
            `${stdout}`)

        return true;
    });
}

module.exports = {
    erc20Get,
    erc20Put,
    erc20Post,
    erc20Delete
}