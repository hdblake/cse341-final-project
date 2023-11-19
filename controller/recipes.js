const { ObjectId } = require('mongodb');
const path = require('path');
const mongodb = require('../db/connect');

const getAllRecipes = async (req, res, next) => {
    const result = await await mongodb.getDb().db().collection('recipes').find().toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
};

module.exports = {getAllRecipes};