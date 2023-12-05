const httpStatusCodes = require('./httpStatusCodes');
const BaseError = require('./baseError');

class Api401Error extends BaseError {
  constructor(
    name,
    description = 'Unauthorized.',
    statusCode = httpStatusCodes.UNAUTHORIZED,
    isOperational = true,
  ) {
    super(name, statusCode, isOperational, description);
  }
}

module.exports = Api401Error;
