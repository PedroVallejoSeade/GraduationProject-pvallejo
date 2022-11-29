const { request, response } = require( 'express' );
const { exec } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );
const uniqid = require('uniqid'); 

const { FILE_CREATION, FILE_UPDATE, TRUFFLE_MIGRATION, ELEMENT_ADDED_TO_DB, ELEMENT_DELETED_FROM_DB, ELEMENT_UPDATED_FROM_DB, SUCCESS, ERROR, oneLineConsoleMessage, multiLineConsoleMessage } = require('../services/console-events');
const { getDatabase, pushElementInDatabase, deleteTokenById, deployContractOfAnElementById } = require('../services/database.js');

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
    res.json(getDatabase());
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
    const { name, symbol, tokenAmount, ownerAddress } = req.body;

    const tokenObj = {
        id: `${uniqid()}`,
        standard : 'ERC-20',
        name : name,
        symbol : symbol,
        amount : tokenAmount,
        contractAdress : '0' // The contract address is 0 when the contract has not been deployed
    }

    if(pushElementInDatabase(tokenObj)){
        oneLineConsoleMessage(ELEMENT_ADDED_TO_DB, SUCCESS, `The token ${name} has been succesfully added to the DB`);

        // Templates needed for deployement and contract creation
        const deployementFile = deployementFileTemplate(name);
        const contractFile = erc20ContractTemplate(name, symbol, tokenAmount, ownerAddress);

        // Creation of the needed files and deployement of contract
        createERC20FilesAndDeployContract(tokenObj, deployementFile, contractFile);

        res.status(201).json({
            msg : `The token ${name} was succesfully created in the database`,
            key : 'SUCCESS'
        });
    } else {
        oneLineConsoleMessage(ELEMENT_ADDED_TO_DB, ERROR, `The token ${name} could not be added to the DB because there is `+ 
        `already a token with the name ${name} or the symbol ${symbol}`);

        res.status(406).json({
            msg : `There is already a token with the name ${name}`,
            key : 'DUPLICATE_TOKEN'
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
 * @param {*} ownerAddress The address of the token owner's wallet
 * @returns A string with the content of the contract file based on the parameters
 */
function erc20ContractTemplate(name, symbol, tokenAmount, ownerAddress) {
    const contract =
    `// SPDX-License-Identifier: MIT\n` +
    `pragma solidity ^0.8.9;\n` +
    `\n` +
    `import "@openzeppelin/contracts/token/ERC20/ERC20.sol";\n` +
    `\n` +
    `contract ${name} is ERC20 {\n` +
    `    constructor() ERC20("${name}", "${symbol}") {\n` +
    `        _mint(${ownerAddress}, ${tokenAmount} * 10 ** decimals());\n` +
    `    }\n` +
    `}`;

    return contract;
}

/**
 * Creates the deployement and contract files for an ERC-20 token and also deploys the contract created
 * @param {*} tokenObj The object of the token being created on the format stored in the DB
 * @param {*} deployementFile The content of the deployement file
 * @param {*} contractFile The content of the contract file
 */
function createERC20FilesAndDeployContract(tokenObj, deployementFile, contractFile) {
    fs.writeFile(path.join(__dirname, '..', 'migrations', '1_deploy_contracts.js'), deployementFile, (err) => {
        if (err) {
            multiLineConsoleMessage(FILE_UPDATE,
                ERROR,
                `The solidity file for the token ${tokenObj} could not be written due to the error shown below`,
                `${err.message}`);

            if(deleteTokenById(tokenObj.id)){
                oneLineConsoleMessage(ELEMENT_DELETED_FROM_DB, SUCCESS, `The token ${tokenObj.name} ` +
                `has succesfully been deleted from the database due to an error writing the deployment file for the token`);
            } else {
                oneLineConsoleMessage(ELEMENT_DELETED_FROM_DB, ERROR, `The token ${tokenObj.name} could not be deleted from the DB ` +
                `when an error writting the deployment file for the token occurred`);
            }

            return ;
        }
        oneLineConsoleMessage(FILE_UPDATE, SUCCESS, `The deployement file in order to deploy the token ${tokenObj.name} ` + 
        `was succesfully updated`);
        
        createContractFile(tokenObj, contractFile);
    });
}

/**
 * Creates the contract file for the Token
 * @param {*} tokenObj The object of the token being created on the format stored in the DB
 * @param {*} contractFile Content of the contract file
 * @return True if the operation was completed succesfully, false otherwise
 */
function createContractFile(tokenObj, contractFile){
    fs.writeFile(path.join(__dirname, '..', 'contracts', `${tokenObj.name}.sol`), contractFile, (err) => {
        if (err) {
            multiLineConsoleMessage(FILE_CREATION,
                ERROR,
                `The solidity file for the token ${tokenObj.name} could not be created due to the error shown below`,
                `${err.message}`);

            if(deleteTokenById(tokenObj.id)){
                oneLineConsoleMessage(ELEMENT_DELETED_FROM_DB, SUCCESS, `The token ${tokenObj.name} ` +
                `has succesfully been deleted from the database due to an error writing the contract file for the token`);
            } else {
                oneLineConsoleMessage(ELEMENT_DELETED_FROM_DB, ERROR, `The token ${tokenObj.name} could not be deleted from the DB ` +
                `when an error writting the contract file for the token occurred`);
            }

            return;
        }

        oneLineConsoleMessage(FILE_CREATION, SUCCESS, `The solidity file for the token ${tokenObj.name} was succesfully written`);

        deployContract(tokenObj);
    });
}

/**
 * Runs the script in order to deploy contracts
 * @param {*} tokenObj The object of the token being created on the format stored in the DB
 * @return True if the contract was deployed correctly on the network, false otherwise
 */
function deployContract(tokenObj) {
    exec("truffle migrate --network goerli_infura", (error, stdout, stderr) => {
        if (error) {
            multiLineConsoleMessage(TRUFFLE_MIGRATION,
                ERROR,
                `The error shown below ocurred while trying to run 'trufle migrate' command for deploying ` +
                `the token with the name: ${tokenObj.name}`,
                `${error}`);

            if(deleteTokenById(tokenObj.id)){
                oneLineConsoleMessage(ELEMENT_DELETED_FROM_DB, SUCCESS, `The token ${tokenObj.name} ` +
                `has succesfully been deleted from the database due to an error running 'truffle migrate' command`);
            } else {
                oneLineConsoleMessage(ELEMENT_DELETED_FROM_DB, ERROR, `The token ${tokenObj.name} could not be deleted from the DB ` +
                `when an error running 'truffle migrate' command occurred`);
            }

            return;
        }
        if (stderr) {
            multiLineConsoleMessage(TRUFFLE_MIGRATION,
                SUCCESS,
                `The command 'truffle migrations was succesfully runned for deploying the token with the name: ` +
                `${tokenObj.name} and obtained the shell stream shown below'`,
                `${stderr}`);
            
            if(deployContractOfAnElementById(tokenObj.id, tokenObj.name)){
                oneLineConsoleMessage(ELEMENT_UPDATED_FROM_DB, SUCCESS, `The token ${tokenObj.name} ` +
                `has succesfully updated its contractAdress property due to a succesfull deployement of the contract`);
            } else {
                oneLineConsoleMessage(ELEMENT_UPDATED_FROM_DB, ERROR, `The token ${tokenObj.name} ` +
                `could not update its contractAdress property due to a succesfull deployement of the contract`);
            }

            return;
        }
        multiLineConsoleMessage(TRUFFLE_MIGRATION,
            SUCCESS,
            `The command 'truffle migrations was succesfully runned for deploying the token with the name: ` +
            `${tokenObj.name} and obtained the shell output shown below'`,
            `${stdout}`);

        if(deployContractOfAnElementById(tokenObj.id, tokenObj.name)){
            oneLineConsoleMessage(ELEMENT_UPDATED_FROM_DB, SUCCESS, `The token ${tokenObj.name} ` +
            `has succesfully updated its contractAdress property due to a succesfull deployement of the contract`);
        } else {
            oneLineConsoleMessage(ELEMENT_UPDATED_FROM_DB, ERROR, `The token ${tokenObj.name} ` +
            `could not update its contractAdress property due to a succesfull deployement of the contract`);
        }
    });
}

module.exports = {
    erc20Get,
    erc20Put,
    erc20Post,
    erc20Delete
}