const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
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
  if (!newComment.hasOwnProperty('recipe_id') || !newComment.recipe_id ||
      !newComment.hasOwnProperty('user_id') || !newComment.user_id ||
      !newComment.hasOwnProperty('comment_text') || !newComment.comment_text) {
    return res.status(400).json({ error: "It is required to have the recipe_id, user_id and comment_text." });
  }  

  if (typeof newComment.user_id !== 'string' || newComment.user_id.length !== 24) {
    return res.status(400).json({ error: "user_id has the wrong format" });
  }

  const existingComment = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('comments').findOne({ recipe_id: newComment.recipe_id, user_id: newComment.user_id});
    
  if (existingComment) {
      return res.status(400).json({ error: `The user already created a comment for this recipe.`});
  }
  const recipeId = new ObjectId(newComment.recipe_id);

  const doesRecipeExist = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('recipes').findOne({ _id: recipeId });
  if(!doesRecipeExist){
    return res.status(400).json({ error: `The recipe does not exists.`});
  }

  const userId = new ObjectId(newComment.user_id);
  const doesUserExists = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('users').findOne({ _id: userId });
  if(!doesUserExists){
    return res.status(400).json({ error: `The user does not exists.`});
  }
  const result = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('comments').insertOne(newComment);
  return res.status(201).json({ id: result.insertedId });
};

module.exports = { getAllComments, getCommentsById, createNewComment };
