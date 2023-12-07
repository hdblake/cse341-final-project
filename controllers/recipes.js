/* eslint-disable no-prototype-builtins */
const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
const checkInfo = require('./checkInfo');
const dataChecks = require('../utils/dataChecks');
const dotenv = require('dotenv');
const Api500Error = require('../error_handling/api500Error');

dotenv.config();

const getAllRecipes = async (req, res, next) => {
  try {
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
  } catch (error) {
    return next(
      new Api500Error(
        'Get Recipes Error',
        'An internal server error occurred while getting the recipes.'
      )
    );
  }
};

const getRecipeById = async (req, res, next) => {
  try {
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
      if (result.public || result.author == userId) {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
      } else {
        res
          .status(404)
          .send("You don't have the permission to see this recipe");
      }
    } else {
      res.status(404).send('Recipe not found');
    }
  } catch (error) {
    return next(
      new Api500Error(
        'Get Recipe Error',
        'An internal server error occurred while getting the recipe.'
      )
    );
  }
};

const getRecipeComments = async (req, res, next) => {
  try {
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
  } catch (error) {
    return next(
      new Api500Error(
        'Get Recipe Comments Error',
        'An internal server error occurred while getting the comments from the recipe.'
      )
    );
  }
};

const getRecipeRatings = async (req, res, next) => {
  try {
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
  } catch (error) {
    return next(
      new Api500Error(
        'Get Recipe Ratings Error',
        'An internal server error occurred while getting the ratings of the recipe.'
      )
    );
  }
};

const updateRecipe = async (req, res, next) => {
  try {
    const recipeData = req.body;
    const id = req.params.id;

    // Let only the allowed keys to be updated.
    const permittedKeys = [
      'public',
      'serves',
      'prep_time',
      'ingredients',
      'recipe_name',
      'recipe_instructions',
      'rating'
    ];
    let checkExtraInfo = checkInfo.hasExtraInfo(recipeData, permittedKeys);
    if (checkExtraInfo.result) {
      return res.status(400).json({ error: checkExtraInfo.message });
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

    // Checks if the given recipe id is valid.
    try {
      await dataChecks.checkCollectionForId('recipes', id);
    } catch (error) {
      return res.status(404).send(error.message);
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
        .send("You must be the recipe's author in order to edit it");
    }

    return res.status(204).send();
  } catch (error) {
    return next(
      new Api500Error(
        'Update Recipe Error',
        'An internal server error occurred while updating the recipe.'
      )
    );
  }
};

const createNewRecipe = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body is empty' });
    }
    const newRecipe = req.body;
    const permittedKeys = [
      'public',
      'serves',
      'prep_time',
      'ingredients',
      'recipe_name',
      'recipe_instructions',
      'rating'
    ];
    let checkExtraInfo = checkInfo.hasExtraInfo(newRecipe, permittedKeys);
    if (checkExtraInfo.result) {
      return res.status(400).json({ error: checkExtraInfo.message });
    }
    const requiredKeys = ['recipe_name', 'recipe_instructions'];
    let checkRequiredKeys = checkInfo.hasRequiredKeys(newRecipe, requiredKeys);
    if (checkRequiredKeys.result) {
      return res.status(400).json({ error: checkRequiredKeys.message });
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
  } catch (error) {
    return next(
      new Api500Error(
        'Create Recipe Error',
        'An internal server error occurred while creating a new recipe.'
      )
    );
  }
};

const deleteRecipe = async (req, res, next) => {
  try {
    const id = req.params.id;
    const objectId = new ObjectId(id);

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
      return res.status(404).send(error.message);
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
    const result = await recipes.findOne(query);

    if (!result) {
      return res
        .status(403)
        .send("You must be the recipe's author in order to delete it");
    }

    recipes.deleteOne({ _id: objectId });

    res.status(200).send();
  } catch (error) {
    return next(
      new Api500Error(
        'Delete Recipe Error',
        'An internal server error occurred while deleting the recipe.'
      )
    );
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
