const express = require('express');
const cors = require( 'cors');

class Server {
    
    constructor() {
        this.app = express();
        this.port = process.env.PORT;

        // Middlewares
        this.middlewares();

        // Application routes
        this.routes();
    }

    middlewares() {

        //CORS
        this.app.use( cors() );

        // Body parcer and reader
        this.app.use( express.json() );
        
        // Public Directory
        this.app.use( express.static('public') );
    }

    routes() {
        this.app.use('/api/erc20', require('../routes/erc20'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Server running on port', this.port);
        });
    }
}

module.exports = Server;