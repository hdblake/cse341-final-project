const ObjectId = require('mongodb').ObjectId;
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
    return result._id.toString();
  } else {
    throw new Error('User not found');
  }
};

// Checks if the given collection contains the given object id.
const checkCollectionForId = async (collection, id) => {
  const result = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection(collection)
    .findOne({ _id: new ObjectId(id) });
  if (result) {
    return true;
  } else {
    throw new Error(`Object with ID ${id} not found on collection ${collection}.`);
  }
};

module.exports = {
  getUserIdByCredentials,
  checkCollectionForId
};
