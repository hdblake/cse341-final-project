const httpStatusCodes = require('./httpStatusCodes');
const BaseError = require('./baseError');

class Api400Error extends BaseError {
  constructor(
    name,
    description = 'Bad request.',
    statusCode = httpStatusCodes.BAD_REQUEST,
    isOperational = true,
  ) {
    super(name, statusCode, isOperational, description);
  }
}

module.exports = Api400Error;
