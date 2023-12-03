/* eslint-disable no-prototype-builtins */
const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
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
  const result = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('recipes')
    .findOne({ _id: objectId });
  if (result) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
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

  // Query for a recipe with the given recipe id and user id.
  const query = {
    _id: new ObjectId(id),
    author: userId.toString()
  };
  const recipes = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('recipes');
  const result = await recipes.updateOne(query, { $set: recipeData });

  // TODO: improve validation for the case of a invalid recipe id as the code
  // bellow assumes the recipe id is correct.
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
  if (
    !newRecipe.hasOwnProperty('author') ||
    !newRecipe.author ||
    !newRecipe.hasOwnProperty('recipe_name') ||
    !newRecipe.recipe_name ||
    !newRecipe.hasOwnProperty('recipe_instructions') ||
    !newRecipe.recipe_instructions
  ) {
    return res.status(400).json({
      error:
        'It is required to have the recipe_name, recipe_instructions and author id.'
    });
  }

  if (typeof newRecipe.author !== 'string' || newRecipe.author.length !== 24) {
    return res.status(400).json({ error: 'Author has the wrong format' });
  }

  if (!newRecipe.hasOwnProperty('serves')) {
    newRecipe.serves = null;
  }
  if (!newRecipe.hasOwnProperty('prep_time')) {
    newRecipe.prep_time = null;
  }
  if (!newRecipe.hasOwnProperty('ingredients')) {
    newRecipe.ingredients = [];
  }
  if (!newRecipe.hasOwnProperty('public')) {
    newRecipe.public = false;
  }
  if (!newRecipe.hasOwnProperty('rating')) {
    newRecipe.rating = null;
  }

  const userId = new ObjectId(newRecipe.author);
  const doesUserExists = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('users')
    .findOne({ _id: userId });

  if (!doesUserExists) {
    return res.status(400).json({ error: `The author does not exists.` });
  }

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
    .deleteOne({ _id: objectId }, objectId);

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
