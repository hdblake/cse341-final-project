/* eslint-disable no-prototype-builtins */
const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
const dataChecks = require('../utils/dataChecks');
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

const updateUser = async (req, res, next) => {
  const userData = req.body;
  // The id of the user that will be updated.
  const idToUpdate = req.params.id;
  // Get user's Auth0 ID from JWT.
  const currentUserCredentials = req.oidc.user.sub;

  // Let only the allowed keys to be updated.
  const permittedKeys = ['user_name', 'email'];
  let checkExtraInfo = checkInfo.hasExtraInfo(userData, permittedKeys);
  if (checkExtraInfo.result) {
    return res.status(400).json({ error: checkExtraInfo.message });
  }

  // Checks if the user to be updated exists and get their mongoDB id.
  let currentUserId;
  try {
    currentUserId = await dataChecks.getUserIdByCredentials(
      currentUserCredentials
    );
  } catch (error) {
    return res.status(404).send(error.message);
  }

  // Checks if the given user id is valid.
  try {
    await dataChecks.checkCollectionForId('users', idToUpdate);
  } catch (error) {
    return res.status(422).send(error.message);
  }

  // Ensures the current user is the same as the user to be updated.
  if (currentUserId !== idToUpdate) {
    return res.status(403).send('You are not the owner of this user profile.');
  }

  // Update the user's data.
  try {
    const query = {
      _id: new ObjectId(idToUpdate)
    };
    const users = await mongodb
      .getDb()
      .db(process.env.DATABASE_NAME)
      .collection('users');
    await users.updateOne(query, { $set: userData });
  } catch (error) {
    return res.status(500).send('An error occurred while updating the user.');
  }

  return res.status(204).send();
};

const createNewUser = async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body is empty' });
  }

  const newUser = req.body;

  const permittedKeys = ['user_name', 'email'];
  let checkExtraInfo = checkInfo.hasExtraInfo(newUser, permittedKeys);
  if (checkExtraInfo.result) {
    return res.status(400).json({ error: checkExtraInfo.message });
  }
  const requiredKeys = ['user_name', 'email'];
  let checkRequiredKeys = checkInfo.hasRequiredKeys(newUser, requiredKeys);
  if (checkRequiredKeys.result) {
    return res.status(400).json({ error: checkRequiredKeys.message });
  }

  // Get user's Auth0 ID from JWT.
  const userCredentials = req.oidc.user.sub;
  newUser.user_credentials = userCredentials;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newUser.email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  const existingUser = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('users')
    .findOne({ user_credentials: newUser.user_credentials });

  if (existingUser) {
    return res
      .status(400)
      .json({ error: `The user ${newUser.user_name} already exists.` });
  }
  const result = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('users')
    .insertOne(newUser);
  return res.status(201).json({ id: result.insertedId });
};

const deleteUser = async (req, res, next) => {
  const id = req.params.id;
  const objectId = new ObjectId(id);

  const result = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('users')
    .deleteOne({ _id: objectId });

  if (result.deletedCount > 0) {
    res.status(200).send();
  } else {
    res.status(500).json(result.error || 'An error occured, please try again.');
  }
};

module.exports = {
  getAllUsers,
  getUsersById,
  updateUser,
  createNewUser,
  deleteUser
};
