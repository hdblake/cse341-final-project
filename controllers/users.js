/* eslint-disable no-prototype-builtins */
const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
const dotenv = require('dotenv');
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
    return res.status(400).json({ error: 'Request body is empty' });
  }
  const newUser = req.body;
  if (
    !newUser.hasOwnProperty('user_name') ||
    !newUser.user_name ||
    !newUser.hasOwnProperty('user_credentials') ||
    !newUser.user_credentials ||
    !newUser.hasOwnProperty('email') ||
    !newUser.email
  ) {
    return res.status(400).json({
      error: 'It is required to have the user_name, user_credentials and email.'
    });
  }

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
    .deleteOne({ _id: objectId }, objectId);

  if (result.deletedCount > 0) {
    res.status(200).send();
  } else {
    res.status(500).json(result.error || 'An error occured, please try again.');
  }
};

module.exports = { getAllUsers, getUsersById, createNewUser, deleteUser };
