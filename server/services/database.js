/**
 * Simulation of database
 */
let database = [];

/**
 * Function for accessing the information inside the database
 * @returns The database
 */
const getDatabase = () => {
    return database
}

/**
 * Removes token from the DB based on the id of the token
 * @param {*} id ID of the token that wants to be deleted from the DB
 * @returns True if an object was deleted and false otherwise
 */
const deleteTokenById = (id) => {    
    for( var i = 0; i < database.length; i++){ 
        if ( database[i].id === id) {
            database.splice(i, 1);
            
            return true;
        }
    }

    return false;
}


/**
 * Registeres that a token's contract has been deployed by updating the contract's address
 * @param {*} id ID of the token whose contract has been deployed
 * @param {*} tokenName The name of the token
 * @returns True if the database objec was updated succesfully, and false otherwise
 */
const deployContractOfAnElementById = (id, tokenName) => {
    const tokenJson = require(`../build/contracts/${tokenName}.json`);
    const tokenAddress = tokenJson.networks[5].address;
    
    for( var i = 0; i < database.length; i++){ 
        if ( database[i].id === id) {
            database[i].contractAdress = tokenAddress;
            
            return true;
        }
    }

    return false;
}

/**
 * Function for setting a new database
 * @param {*} newDatabase New values for the database
 */
const setDatabase = (newDatabase) => {
    database = newDatabase;
}

/**
 * Seraches if there is an token already in the DB with the same name or symbol
 * @param {*} elemetSearched The element that wants to be searched for an instance in the database
 * @returns The instance of the element searched in the database if found or undefined if not found
 */
const searchInstanceOfTokenWithSameNameOrSymbol = (elemetSearched) => {
    return database.find(element => (element.name == elemetSearched.name || element.symbol == elemetSearched.symbol));
}

/**
 * Inserts a new element into the database
 * @param {*} newElement The new element that wants to be stored in the database
 * @returns True when the new element was succesfully stored or false otherwise
 */
const pushElementInDatabase = (newElement) => {
    if(searchInstanceOfTokenWithSameNameOrSymbol(newElement)) return false;
    else {
        database.push(newElement);
        return true
    }
}

module.exports = {
    getDatabase,
    setDatabase,
    pushElementInDatabase,
    deleteTokenById,
    deployContractOfAnElementById
}