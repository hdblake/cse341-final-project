const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
const dotenv = require('dotenv');
dotenv.config();

const getAllRatings = async (req, res, next) => {
    const result = await await mongodb.getDb().db(process.env.DATABASE_NAME).collection('ratings').find().toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
};

const getRatinsById = async (req, res, next) => {
    const id = req.params.id;
    const objectId = new ObjectId(id);
    const result = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('ratings').findOne({ _id: objectId });
    if (result) {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } else {
        res.status(404).send('Rating not found');
    }
};

module.exports = {getAllRatings, getRatinsById};