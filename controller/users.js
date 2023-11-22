const { ObjectId } = require('mongodb');
const mongodb = require('../db/connect');
const dotenv = require('dotenv');
dotenv.config();

const getAllUsers = async (req, res, next) => {
    const result = await await mongodb.getDb().db(process.env.DATABASE_NAME).collection('users').find().toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
};

const getUsersById = async (req, res, next) => {
    const id = req.params.id;
    const objectId = new ObjectId(id);
    const result = await mongodb.getDb().db(process.env.DATABASE_NAME).collection('users').findOne({ _id: objectId });
    if (result) {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } else {
        res.status(404).send('User not found');
    }
};



module.exports = {getAllUsers, getUsersById};