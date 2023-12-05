/* eslint-disable no-prototype-builtins */
const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
const checkInfo = require('./checkInfo');
const dataChecks = require('../utils/dataChecks');
const dotenv = require('dotenv');
dotenv.config();

const getAllComments = async (req, res, next) => {
  const result = await await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('comments')
    .find()
    .toArray();
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(result);
};

const getCommentsById = async (req, res, next) => {
  const id = req.params.id;
  const objectId = new ObjectId(id);
  const result = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('comments')
    .findOne({ _id: objectId });
  if (result) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } else {
    res.status(404).send('Comment not found');
  }
};

const updateComment = async (req, res, next) => {
  const commentData = req.body;
  const id = req.params.id;
  // Get user's Auth0 ID from JWT.
  const userCredentials = req.oidc.user.sub;

  // Checks if the user exists and get their mongoDB id.
  let userId;
  try {
    userId = await dataChecks.getUserIdByCredentials(userCredentials);
  } catch (error) {
    return res.status(404).send(error.message);
  }

  // Checks if the given comment id is valid.
  try {
    await dataChecks.checkCollectionForId('comments', id);
  } catch (error) {
    return res.status(422).send(error.message);
  }

  // Query for a comment with the given comment id and user id.
  const query = {
    _id: new ObjectId(id),
    user_id: userId.toString(),
  };
  const comments = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('comments');
  const result = await comments.updateOne(query, { $set: commentData });

  if (result.matchedCount === 0) {
    return res
      .status(403)
      .send("You must be the comment's author in order to edit it");
  }
  return res.status(204).send();
};

const createNewComment = async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body is empty' });
  }
  const newComment = req.body;
  const permittedKeys = ["recipe_id", "comment_text"];
  let checkExtraInfo = checkInfo.hasExtraInfo(newComment, permittedKeys)
  if(checkExtraInfo.result){
    return res.status(400).json({ error: checkExtraInfo.message});
  }
  const requiredKeys = ["recipe_id", "comment_text"];
  let checkRequiredKeys = checkInfo.hasRequiredKeys(newComment, requiredKeys);
  if (checkRequiredKeys.result) {
    return res.status(400).json({ error: checkRequiredKeys.message });
  }

  // Get user's Auth0 ID from JWT.
  const userCredentials = req.oidc.user.sub;

  // Checks if the user exists and get their mongoDB id.
  let userId;
  try {
    userId = await dataChecks.getUserIdByCredentials(userCredentials);
  } catch (error) {
    return res.status(404).send(error.message);
  }
  newComment.user_id = userId.toString();

  if (
    typeof newComment.user_id !== 'string' ||
    newComment.user_id.length !== 24
  ) {
    return res.status(400).json({ error: 'user_id has the wrong format' });
  }

  const existingComment = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('comments')
    .findOne({ recipe_id: newComment.recipe_id, user_id: newComment.user_id });

  if (existingComment) {
    return res
      .status(400)
      .json({ error: `The user already created a comment for this recipe.` });
  }
  const recipeId = new ObjectId(newComment.recipe_id);

  const doesRecipeExist = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('recipes')
    .findOne({ _id: recipeId });
  if (!doesRecipeExist) {
    return res.status(400).json({ error: `The comment does not exist.` });
  }

  const result = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('comments').insertOne(newComment);

  return res.status(201).json({ id: result.insertedId });
};

const deleteComment = async (req, res, next) => {
  const id = req.params.id;
  const objectId = new ObjectId(id);

  const result = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('comments')
    .deleteOne({ _id: objectId });

  if (result.deletedCount > 0) {
    res.status(200).send();
  } else {
    res.status(500).json(result.error || 'An error occurred, please try again.');
  }
};

module.exports = {
  getAllComments,
  getCommentsById,
  updateComment,
  createNewComment,
  deleteComment
};
