/* eslint-disable no-prototype-builtins */
const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
const checkInfo = require('./checkInfo');
const dataChecks = require('../utils/dataChecks');
const dotenv = require('dotenv');
dotenv.config();

const getAllRecipes = async (req, res, next) => {
  let query = {};
  query.public = true;
  const result = await await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('recipes')
    .find(query)
    .toArray();
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(result);
};

const getRecipeById = async (req, res, next) => {
  const id = req.params.id;
  const objectId = new ObjectId(id);
  const userCredentials = req.oidc.user.sub;
  let userId;
  userId = await dataChecks.getUserIdByCredentials(userCredentials);
  const result = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('recipes')
    .findOne({ _id: objectId });
  if (result) {
    if(result.public || result.author == userId){
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(result);
    } else{
      res.status(404).send("You don't have the permission to see this recipe");
    }
  } else {
    res.status(404).send('Recipe not found');
  }
};

const getRecipeComments = async (req, res, next) => {
  const id = req.params.id;
  let query = {};
  query.recipe_id = id;
  const result = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('comments')
    .find(query)
    .toArray();
  if (result) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } else {
    res.status(404).send('Recipe comments not found');
  }
};

const getRecipeRatings = async (req, res, next) => {
  const id = req.params.id;
  let query = {};
  query.recipe_id = id;
  const result = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('ratings')
    .find(query)
    .toArray();
  if (result) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } else {
    res.status(404).send('Recipe ratings not found');
  }
};

const updateRecipe = async (req, res, next) => {
  const recipeData = req.body;
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

  // Checks if the given recipe id is valid.
  try {
    await dataChecks.checkCollectionForId('recipes', id);
  } catch (error) {
    return res.status(422).send(error.message);
  }

  // Query for a recipe with the given recipe id and user id.
  const query = {
    _id: new ObjectId(id),
    author: userId
  };
  const recipes = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('recipes');
  const result = await recipes.updateOne(query, { $set: recipeData });

  if (result.matchedCount === 0) {
    return res
      .status(403)
      .send('You must be the recipes author in order to edit it');
  }
  return res.status(204).send();
};

const createNewRecipe = async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body is empty' });
  }
  const newRecipe = req.body;
  const permittedKeys = [  "public", "serves", "prep_time", "ingredients", "recipe_name", "recipe_instructions", "rating"];
  let checkExtraInfo = checkInfo.hasExtraInfo(newRecipe, permittedKeys)
  if(checkExtraInfo.result){
    return res.status(400).json({ error: checkExtraInfo.message});
  }
  const requiredKeys = ["recipe_name", "recipe_instructions", "public", "serves", "prep_time", "ingredients"];
  let checkRequiredKeys = checkInfo.hasRequiredKeys(newRecipe, requiredKeys);
  if (checkRequiredKeys.result) {
    return res.status(400).json({ error: checkRequiredKeys.message });
  }

  if (!newRecipe.hasOwnProperty('rating')) {
    newRecipe.rating = null;
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
  
  newRecipe.author = userId.toString();

  const result = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('recipes')
    .insertOne(newRecipe);
  return res.status(201).json({ id: result.insertedId });
};

const deleteRecipe = async (req, res, next) => {
  const id = req.params.id;
  const objectId = new ObjectId(id);

  const result = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('recipes')
    .deleteOne({ _id: objectId });

  if (result.deletedCount > 0) {
    res.status(200).send();
  } else {
    res.status(500).json(result.error || 'An error occured, please try again.');
  }
};

module.exports = {
  getAllRecipes,
  getRecipeById,
  getRecipeComments,
  getRecipeRatings,
  updateRecipe,
  createNewRecipe,
  deleteRecipe
};
