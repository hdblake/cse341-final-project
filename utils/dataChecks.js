const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
const dotenv = require('dotenv');
dotenv.config();

// Gets the user _id field based on the user_credentials value.
const getUserIdByCredentials = async (credentials) => {
  const result = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('users')
    .findOne({ user_credentials: credentials });
  if (result) {
    return result._id;
  } else {
    throw new Error('User not found');
  }
};

module.exports = {
  getUserIdByCredentials
};
