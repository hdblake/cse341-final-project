const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
const dotenv = require('dotenv');
const checkInfo = require('./checkInfo');

dotenv.config();

const getAllUsers = async (req, res, next) => {
  const result = await await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('users')
    .find()
    .toArray();
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(result);
};

const getUsersById = async (req, res, next) => {
  const id = req.params.id;
  const objectId = new ObjectId(id);
  const result = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('users')
    .findOne({ _id: objectId });
  if (result) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } else {
    res.status(404).send('User not found');
  }
};

const createNewUser = async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty" });
  }

  const newUser = req.body;
  const permittedKeys = ["user_name", "email"];
  let checkExtraInfo = checkInfo.hasExtraInfo(newUser, permittedKeys)
  if(checkExtraInfo.result){
    return res.status(400).json({ error: checkExtraInfo.message});
  }
  const requiredKeys = ["user_name", "email"];
  let checkRequiredKeys = checkInfo.hasRequiredKeys(newUser, requiredKeys);
  if (checkRequiredKeys.result) {
    return res.status(400).json({ error: checkRequiredKeys.message });
  }

  // Get user's Auth0 ID from JWT.
  const userCredentials = req.oidc.user.sub;
  newUser.user_credentials = userCredentials;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newUser.email)) {
    return res.status(400).json({ error: "Invalid email format." });
  } 

  const existingUser = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('users').findOne({ user_credentials: newUser.user_credentials });
    
  if (existingUser) {
      return res.status(400).json({ error: `The user ${newUser.user_name} already exists.`});
  }
  const result = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('users').insertOne(newUser);
  return res.status(201).json({ id: result.insertedId });
};

module.exports = { getAllUsers, getUsersById, createNewUser };
