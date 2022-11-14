const { request, response } = require( 'express' );
const { exec } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );
const uniqid = require('uniqid'); 

const erc20Get = (req = request, res = response) => {
    
    // exec("truffle migrate", (error, stdout, stderr) => {
    //     if (error) {
    //         console.log(`error: ${error.message}`);
    //         return;
    //     }
    //     if (stderr) {
    //         console.log(`stderr: ${stderr}`);
    //         return;
    //     }
    //     console.log(`stdout: ${stdout}`);
    // });
    
    res.json({
        msg : 'get API - controller'
    });
}

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
    const fileName = `ERC-20:${uniqid()}`;

    // Templates needed for deployement and contract creation
    const deployementFile = deployementFileTemplate(name, fileName);
    const contractTemplate = erc20ContractTemplate(name, symbol, tokenAmount);

    // Creation of the needed files
    fs.writeFile(path.join(__dirname, '..', 'migrations', '1_deploy_contracts.js'), deployementFile, (err) => {
        if (err) throw err;

        console.log(`${new Date().toISOString}:`,`The deployement file in order to deploy the token ${name} was succesfully updated`);
        fs.writeFile(path.join(__dirname, '..', 'contracts', `${fileName}.sol`), contractTemplate, (err) => {
            if (err) throw err;
    
            console.log(`${new Date().toISOString}:`,`The solidity file for the token ${name} was succesfully written`);
        });
    });
    
    // Response of the server
    res.json({
        msg : `The token ${name} with the symbol ${symbol} has been created with a total amount of ${tokenAmount} tokens`
    });
}

const erc20Delete = (req = request, res = response) => {
    res.json({
        msg : 'delete API'
    });
}

/**
 * Creates a string for a deployement file from a template and the parameters specified
 * @param {*} tokenName The name of the token
 * @param {*} fileName  The name of the file where the solidity contract is stored
 * @returns A string with the content of the deployement file
 */
function deployementFileTemplate(tokenName, fileName){
    const deploymentFile =
    `const ${tokenName} = artifacts.require("${fileName}");\n` +
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
function erc20ContractTemplate(name, symbol, tokenAmount){
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

module.exports = {
    erc20Get,
    erc20Put,
    erc20Post,
    erc20Delete
}