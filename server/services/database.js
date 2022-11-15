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
 * Function for setting a new database
 * @param {*} newDatabase New values for the database
 */
const setDatabase = (newDatabase) => {
    database = newDatabase;
}

/**
 * Seraches if an element exists already on a database
 * @param {*} elemetSearched The element that wants to be searched for an instance in the database
 * @returns The instance of the element searched in the database if found or undefined if not found
 */
const searchElementOnDatabase = (elemetSearched) => {
    return database.find(element => element == elemetSearched);
}

/**
 * Inserts a new element into the database
 * @param {*} newElement The new element that wants to be stored in the database
 * @returns True when the new element was succesfully stored or false otherwise
 */
const pushElementInDatabase = (newElement) => {
    if(searchElementOnDatabase(newElement)) return false;
    else {
        database.push(newElement);
        return true
    }
}

module.exports = {
    getDatabase,
    setDatabase,
    pushElementInDatabase
}