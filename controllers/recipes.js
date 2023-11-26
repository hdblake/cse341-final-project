const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
const dataChecks = require('../utils/dataChecks');
const dotenv = require('dotenv');
dotenv.config();

const getAllRecipes = async (req, res, next) => {
  const result = await await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('recipes')
    .find()
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
      .send("You must be the recipe's author in order to edit it");
  }
  return res.status(204).send();
};

module.exports = {
  getAllRecipes,
  getRecipeById,
  getRecipeComments,
  getRecipeRatings,
  updateRecipe
};
