let database = [];

const getDatabase = () => {
    return database
}

const setDatabase = (newDatabase) => {
    database = newDatabase;
}

const searchElementOnDatabase = (elemetSearched) => {
    return database.find(element => element == elemetSearched);
}

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