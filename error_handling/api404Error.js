const httpStatusCodes = require('./httpStatusCodes');
const BaseError = require('./baseError');

class Api404Error extends BaseError {
  constructor(
    name,
    description = 'Not found.',
    statusCode = httpStatusCodes.NOT_FOUND,
    isOperational = true,
  ) {
    super(name, statusCode, isOperational, description);
  }
}

module.exports = Api404Error;
