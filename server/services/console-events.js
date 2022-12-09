/**
 * --------------------------------------------------------------------------------
 * CONSTANTS FOR EVENT CLASSES
 * --------------------------------------------------------------------------------
 */

const FILE_CREATION = 'FILE-CREATION';
const FILE_UPDATE = 'FILE-UPDATE';
const TRUFFLE_MIGRATION = 'TRUFFLE-MIGRATION';
const ELEMENT_ADDED_TO_DB = 'ELEMENT-ADDED-TO-DB';
const ELEMENT_UPDATED_FROM_DB = 'ELEMENT-UPDATED-FROM-DB';
const ELEMENT_DELETED_FROM_DB = 'ELEMENT-DELETED-FROM-DB';

/**
 * --------------------------------------------------------------------------------
 * CONSTANTS FOR EVENT TYPES
 * --------------------------------------------------------------------------------
 */

const SUCCESS = 'SUCCESS';
const ERROR = 'ERROR';

/**
 * --------------------------------------------------------------------------------
 * FUNCTIONS
 * --------------------------------------------------------------------------------
 */

/**
 * Service function for sending an event message in with the right structure
 * @param {*} eventClass What was the attempted effect on the system
 * @param {*} eventType What was the 
 * @param {*} message 
 */
const oneLineConsoleMessage = (eventClass, eventType, message) => {
    console.log(`${eventClass}/${eventType}[${new Date().toISOString()}]:`,message);
}

const multiLineConsoleMessage = (eventClass, eventType, shortMessage, longMessage) => {
    console.log(`\n`,
        `${eventClass}/${eventType}:[${new Date().toISOString()}]:`,
        shortMessage,
        `\n--------------------- beginning\n`,
        `\n${longMessage}`,
        `\n--------------------- ending`);
}

module.exports = {
    // Event classes constants
    FILE_CREATION,
    FILE_UPDATE,
    TRUFFLE_MIGRATION,
    ELEMENT_ADDED_TO_DB,
    ELEMENT_UPDATED_FROM_DB,
    ELEMENT_DELETED_FROM_DB,

    // Event types constants
    SUCCESS,
    ERROR,
    
    // Functions
    oneLineConsoleMessage,
    multiLineConsoleMessage
}