const { request, response } = require( 'express' );
const { exec } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );

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
    const body = req.body;

    const contractTemplate =
    `// SPDX-License-Identifier: MIT\n` +
    `pragma solidity ^0.8.9;\n` +
    `\n` +
    `import "@openzeppelin/contracts/token/ERC20/ERC20.sol";\n` +
    `\n` +
    `contract MyToken is ERC20 {\n` +
    `    constructor() ERC20("MyToken", "MTK") {}\n` +
    `}`

    fs.writeFile(path.join(__dirname, '..', 'contracts', 'MyToken.sol'), contractTemplate, (err) => {
        if (err) throw err;

        console.log('Write complete')
    })
    
    res.json({
        msg : 'post API - controller',
        body : body
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