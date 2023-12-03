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

const createNewComment = async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty" });
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

  const existingComment = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('comments').findOne({ recipe_id: newComment.recipe_id, user_id: newComment.user_id});
    
  if (existingComment) {
      return res.status(400).json({ error: `The user already created a comment for this recipe.`});
  }
  const recipeId = new ObjectId(newComment.recipe_id);

  const doesRecipeExist = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('recipes').findOne({ _id: recipeId });
  if(!doesRecipeExist){
    return res.status(400).json({ error: `The recipe does not exists.`});
  }

  const result = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('comments').insertOne(newComment);
  return res.status(201).json({ id: result.insertedId });
};

module.exports = { getAllComments, getCommentsById, createNewComment };
