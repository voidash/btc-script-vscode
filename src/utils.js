/**
 * @typedef {Object} Result
 * @property {boolean} ok - Indicates if the result is successful (`true`) or an error (`false`).
 * @property {any} [value] 
 */

class ResultException extends Error {
    constructor(message) {
        super(message);
        this.name = "ResultException";
    }
}

/**
 * Creates a successful Result.
 * @param {any} value - The success value.
 * @returns {Result}
 */
function Ok(value) {
    return { ok: true, value };
}

/**
 * Creates an error Result.
 * @param {string} error - The error message.
 * @throws {ResultException}
 */
function Err(error) {
    throw new ResultException(error);
}

function to_number(value) {
    const num = Number(value);
    if (isNaN(num)) {
        throw new ResultException("Invalid number");
    }
    return num;
}

/**
 * @param {Result} result  
 */
function handleResult(result) {
}

module.exports = {
    ResultException,
    to_number,
    Ok,
    Err
}