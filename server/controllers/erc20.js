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

const erc20Post = (req = request, res = response) => {
    const { name, symbol, tokenAmount } = req.body;

    const contractTemplate =
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

    const fileName = `${uniqid()}`

    fs.writeFile(path.join(__dirname, '..', 'contracts', `ERC-20:${fileName}.sol`), contractTemplate, (err) => {
        if (err) throw err;

        console.log('Write complete')
    })
    
    res.json({
        msg : `The token ${name} with the symbol ${symbol} has been created with a total amount of ${tokenAmount} tokens`
    });
}

const erc20Delete = (req = request, res = response) => {
    res.json({
        msg : 'delete API'
    });
}

module.exports = {
    erc20Get,
    erc20Put,
    erc20Post,
    erc20Delete

}