/* eslint-disable no-prototype-builtins */
const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
const checkInfo = require('./checkInfo');
const dataChecks = require('../utils/dataChecks');
const dotenv = require('dotenv');
const Api500Error = require('../error_handling/api500Error');

dotenv.config();

const getAllRatings = async (req, res, next) => {
  try {
    const result = await await mongodb
      .getDb()
      .db(process.env.DATABASE_NAME)
      .collection('ratings')
      .find()
      .toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } catch (error) {
    return next(
      new Api500Error(
        'Get Ratings Error',
        'An internal server error occurred while getting the ratings.'
      )
    );
  }
};

const getRatingsById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const objectId = new ObjectId(id);
    const result = await mongodb
      .getDb()
      .db(process.env.DATABASE_NAME)
      .collection('ratings')
      .findOne({ _id: objectId });
    if (result) {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(result);
    } else {
      res.status(404).send('Rating not found');
    }
  } catch (error) {
    return next(
      new Api500Error(
        'Get Rating Error',
        'An internal server error occurred while getting the rating.'
      )
    );
  }
};

const calculateNewAverage = (allRatings) => {
  const totalRatings = allRatings.length;
  let sum = 0;
  for (const rating of allRatings) {
    sum += rating.rating_value;
  }
  return sum / totalRatings;
};

const updateRating = async (req, res, next) => {
  try {
    const ratingData = req.body;
    const id = req.params.id;

    // Let only the allowed keys to be updated.
    const permittedKeys = ['rating_value'];
    let checkExtraInfo = checkInfo.hasExtraInfo(ratingData, permittedKeys);
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

    // Checks if the given rating id is valid.
    try {
      await dataChecks.checkCollectionForId('ratings', id);
    } catch (error) {
      return res.status(404).send(error.message);
    }

    // Query for a rating with the given rating id and user id.
    const query = {
      _id: new ObjectId(id),
      user_id: userId.toString()
    };
    const ratings = await mongodb
      .getDb()
      .db(process.env.DATABASE_NAME)
      .collection('ratings');
    const result = await ratings.updateOne(query, { $set: ratingData });

    const updatedRating = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('ratings')
    .findOne({ _id: new ObjectId(id) });

    let recipeId = null;
    if(updatedRating){
      recipeId = new ObjectId(updatedRating.recipe_id);
      let newAvarageRating = 0;
      const allRatings = await mongodb
        .getDb()
        .db(process.env.DATABASE_NAME)
        .collection('ratings')
        .find({ recipe_id: updatedRating.recipe_id })
        .toArray();

      if (allRatings.length > 0) {
        newAvarageRating = calculateNewAverage(allRatings);
      }

      mongodb
        .getDb()
        .db(process.env.DATABASE_NAME)
        .collection('recipes')
        .updateOne({ _id: recipeId }, { $set: { rating: newAvarageRating } });
    }

    if (result.matchedCount === 0) {
      return res
        .status(403)
        .send("You must be the rating's author in order to edit it");
    }
    return res.status(204).send();
  } catch (error) {
    return next(
      new Api500Error(
        'Update Rating Error',
        'An internal server error occurred while updating the rating.'
      )
    );
  }
};

const createNewRating = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body is empty' });
    }
    const newRating = req.body;

    const permittedKeys = ['recipe_id', 'rating_value'];
    let checkExtraInfo = checkInfo.hasExtraInfo(newRating, permittedKeys);
    if (checkExtraInfo.result) {
      return res.status(400).json({ error: checkExtraInfo.message });
    }
    const requiredKeys = ['recipe_id', 'rating_value'];
    let checkRequiredKeys = checkInfo.hasRequiredKeys(newRating, requiredKeys);
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
    newRating.user_id = userId.toString();

    newRating.rating_value = parseInt(newRating.rating_value);

    // Check if the conversion resulted in a valid integer
    if (Number.isNaN(newRating.rating_value)) {
      return res
        .status(400)
        .json({ error: 'rating_value is not a valid number' });
    }

    const recipeId = new ObjectId(newRating.recipe_id);

    const doesRecipeExist = await mongodb
      .getDb()
      .db(process.env.DATABASE_NAME)
      .collection('recipes')
      .findOne({ _id: recipeId });
    if (!doesRecipeExist) {
      return res.status(400).json({ error: `The recipe does not exist.` });
    }

    const existingRating = await mongodb
      .getDb()
      .db(process.env.DATABASE_NAME)
      .collection('ratings')
      .findOne({ recipe_id: newRating.recipe_id, user_id: newRating.user_id });

    if (existingRating) {
      return res
        .status(400)
        .json({ error: `The user already put his rating on this recipe.` });
    }

    const result = await mongodb
      .getDb()
      .db(process.env.DATABASE_NAME)
      .collection('ratings')
      .insertOne(newRating);

    let newAverageRating = newRating.rating_value;
    const allRatings = await mongodb
      .getDb()
      .db(process.env.DATABASE_NAME)
      .collection('ratings')
      .find({ recipe_id: newRating.recipe_id })
      .toArray();

    if (allRatings.length > 0) {
      newAverageRating = calculateNewAverage(allRatings);
    }

    await mongodb
      .getDb()
      .db(process.env.DATABASE_NAME)
      .collection('recipes')
      .updateOne({ _id: recipeId }, { $set: { rating: newAverageRating } });

    return res.status(201).json({ id: result.insertedId });
  } catch (error) {
    return next(
      new Api500Error(
        'Create Rating Error',
        'An internal server error occurred while creating a new rating.'
      )
    );
  }
};

const deleteRating = async (req, res, next) => {
  try {
    const id = req.params.id;
    const objectId = new ObjectId(id);
    const deletedRating = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('ratings')
    .findOne({ _id: objectId });
    let recipeId = null;
    if(deletedRating){
      recipeId = new ObjectId(deletedRating.recipe_id);
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

    // Checks if the given rating id is valid.
    try {
      await dataChecks.checkCollectionForId('ratings', id);
    } catch (error) {
      return res.status(404).send(error.message);
    }

    // Query for a rating with the given rating id and user id.
    const query = {
      _id: new ObjectId(id),
      author: userId
    };
    const ratings = await mongodb
      .getDb()
      .db(process.env.DATABASE_NAME)
      .collection('ratings');
    const result = await ratings.findOne(query);

    if (!result) {
      return res
        .status(403)
        .send("You must be the rating's author in order to delete it");
    }

    ratings.deleteOne({ _id: objectId });
    if(recipeId != null){
      let newAvarageRating = 0;
      const allRatings = await mongodb
        .getDb()
        .db(process.env.DATABASE_NAME)
        .collection('ratings')
        .find({ recipe_id: deletedRating.recipe_id })
        .toArray();

      if (allRatings.length > 0) {
        newAvarageRating = calculateNewAverage(allRatings);
      }

      mongodb
        .getDb()
        .db(process.env.DATABASE_NAME)
        .collection('recipes')
        .updateOne({ _id: recipeId }, { $set: { rating: newAvarageRating } });
    }

    res.status(200).send();
  } catch (error) {
    return next(
      new Api500Error(
        'Delete Rating Error',
        'An internal server error occurred while deleting the rating.'
      )
    );
  }
};

module.exports = {
  getAllRatings,
  getRatingsById,
  updateRating,
  createNewRating,
  deleteRating
};
