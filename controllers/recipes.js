const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
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

const createNewRecipe = async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Request body is empty" });
  }
  const newRecipe = req.body;
  if (!newRecipe.hasOwnProperty('author') || !newRecipe.author ||
      !newRecipe.hasOwnProperty('recipe_name') || !newRecipe.recipe_name ||
      !newRecipe.hasOwnProperty('recipe_instructions') || !newRecipe.recipe_instructions) {
    return res.status(400).json({ error: "It is required to have the recipe_name, recipe_instructions and author id." });
  }

  if (typeof newRecipe.author !== 'string' || newRecipe.author.length !== 24) {
    return res.status(400).json({ error: "Author has the wrong format" });
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
  const doesUserExists = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('users').findOne({ _id: userId });

  if(!doesUserExists){
    return res.status(400).json({ error: `The author does not exists.`});
  }

  const result = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('recipes').insertOne(newRecipe);
  return res.status(201).json({ id: result.insertedId });
};

module.exports = {
  getAllRecipes,
  getRecipeById,
  getRecipeComments,
  getRecipeRatings,
  createNewRecipe
};
