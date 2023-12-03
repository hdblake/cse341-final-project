const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
const dotenv = require('dotenv');
dotenv.config();

const getAllRatings = async (req, res, next) => {
  const result = await await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('ratings')
    .find()
    .toArray();
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(result);
};

const getRatingsById = async (req, res, next) => {
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
};

const calculateNewAverage = (allRatings) => {
  const totalRatings = allRatings.length;
  let sum = 0;
  for (const rating of allRatings) {
    sum += rating.rating_value;
  }
  return sum / totalRatings;
};

const createNewRating = async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty" });
  }
  const newRating = req.body;
  const permittedKeys = ["recipe_id", "rating_value"];
  let checkExtraInfo = checkInfo.hasExtraInfo(newComment, permittedKeys)
  if(checkExtraInfo.result){
    return res.status(400).json({ error: checkExtraInfo.message});
  }
  const requiredKeys = ["recipe_id", "rating_value"];
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
  newRating.user_id = userId.toString();
  newRating.rating_value = parseInt(newRating.rating_value);

  // Check if the conversion resulted in a valid integer
  if (Number.isNaN(newRating.rating_value)) {
    return res.status(400).json({ error: "rating_value is not a valid number" });
  }

  const recipeId = new ObjectId(newRating.recipe_id);
  
  const doesRecipeExist = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('recipes').findOne({ _id: recipeId });
  if(!doesRecipeExist){
    return res.status(400).json({ error: `The recipe does not exists.`});
  }
  
  const existingRating = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('ratings').findOne({ recipe_id: newRating.recipe_id, user_id: newRating.user_id});

  if (existingRating) {
    return res.status(400).json({ error: `The user already put his rating on this recipe.`});
  }

  const result = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('ratings').insertOne(newRating);
  
  let newAvarageRating = newRating.rating_value;
  const allRatings = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('ratings').find({ recipe_id: newRating.recipe_id}).toArray();

  if (allRatings.length > 0) {
    newAvarageRating = calculateNewAverage(allRatings)
  }

  mongodb.getDb().db(process.env.DATABASE_NAME).collection('recipes').updateOne({ _id: recipeId }, { $set: { rating: newAvarageRating } });

  return res.status(201).json({ id: result.insertedId });
};

module.exports = { getAllRatings, getRatingsById, createNewRating };
