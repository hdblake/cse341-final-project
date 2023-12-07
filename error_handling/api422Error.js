const httpStatusCodes = require('./httpStatusCodes');
const BaseError = require('./baseError');

class Api422Error extends BaseError {
  constructor(
    name,
    description = 'Invalid data.',
    statusCode = httpStatusCodes.INVALID_DATA,
    isOperational = true,
  ) {
    super(name, statusCode, isOperational, description);
  }
}

module.exports = Api422Error;
