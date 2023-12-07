const httpStatusCodes = require('./httpStatusCodes');
const BaseError = require('./baseError');

class Api500Error extends BaseError {
  constructor(
    name,
    description = 'Internal server error.',
    statusCode = httpStatusCodes.INTERNAL_SERVER,
    isOperational = false,
  ) {
    super(name, statusCode, isOperational, description);
  }
}

module.exports = Api500Error;
