const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
const dotenv = require('dotenv');
dotenv.config();

const getAllRecipes = async (req, res, next) => {
    const result = await await mongodb.getDb().db(process.env.DATABASE_NAME).collection('recipes').find().toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
};

const getRecipeById = async (req, res, next) => {
    const id = req.params.id;
    const objectId = new ObjectId(id);
    const result = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('recipes').findOne({ _id: objectId });
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
    const result = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('comments').find(query).toArray();
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
    const result = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('ratings').find(query).toArray();
    if (result) {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } else {
        res.status(404).send('Recipe ratings not found');
    }
};

module.exports = {getAllRecipes, getRecipeById, getRecipeComments, getRecipeRatings};