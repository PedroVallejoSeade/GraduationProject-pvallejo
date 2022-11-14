const { request, response } = require('express');
const { exec } = require( 'child_process' );

const erc20Get = (req = request, res = response) => {
    
    exec("truffle migrate", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    
    
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