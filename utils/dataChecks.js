const ObjectId = require('mongodb').ObjectId;
const mongodb = require('../db/connect');
const dotenv = require('dotenv');
const { check, validationResult } = require('express-validator');
const Api422Error = require('../error_handling/api422Error');
const Api404Error = require('../error_handling/api404Error');
dotenv.config();

const emailPattern = /.+@.+\..+/;

// Gets the user _id field based on the user_credentials value.
const getUserIdByCredentials = async (credentials) => {
  const result = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection('users')
    .findOne({ user_credentials: credentials });
  if (result) {
    return result._id.toString();
  } else {
    throw new Api404Error('Not Found', 'User not found');
  }
};

// Checks if the given collection contains the given object id.
const checkCollectionForId = async (collection, id) => {
  const result = await mongodb
    .getDb()
    .db(process.env.DATABASE_NAME)
    .collection(collection)
    .findOne({ _id: new ObjectId(id) });
  if (result) {
    return true;
  } else {
    throw new Api404Error(
      'Not Found',
      `Object with ID ${id} not found on collection ${collection}.`
    );
  }
};

const checkRecipesForId = async (id) => {
  return checkCollectionForId('recipes', id);
};

// Validate all fields on POST /recipe.
const validateRecipeCreation = [
  check('public')
    .optional()
    .isBoolean()
    .withMessage('Public must be a boolean value.'),
  check('serves')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Serves must be an integer greater than 0.'),
  check('prep_time')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Preparation time must be an integer greater than 0.'),
  check('ingredients')
    .optional()
    .isArray()
    .withMessage('Ingredients must be an array.')
    .custom((value) => value.length >= 1)
    .withMessage('You must have at least one ingredient.')
    .custom((value) => value.every((v) => typeof v === 'string'))
    .withMessage('Each ingredient must be a string.'),
  check('recipe_name')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Recipe name is too short.'),
  check('recipe_instructions')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Recipe instructions are too short.')
];

// Validate all fields on PUT /recipe.
const validateRecipeUpdate = [
  check('public')
    .optional()
    .isBoolean()
    .withMessage('Public must be a boolean value.'),
  check('serves')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Serves must be an integer greater than 0.'),
  check('prep_time')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Preparation time must be an integer greater than 0.'),
  check('ingredients')
    .optional()
    .isArray()
    .withMessage('Ingredients must be an array.')
    .custom((value) => value.length >= 1)
    .withMessage('You must have at least one ingredient.')
    .custom((value) => value.every((v) => typeof v === 'string'))
    .withMessage('Each ingredient must be a string.'),
  check('recipe_name')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Recipe name is too short.'),
  check('recipe_instructions')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Recipe instructions are too short.')
];

// Validate all fields on POST /user.
const validateUserCreation = [
  check('user_name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('User name is too short.'),
  check('email').matches(emailPattern).withMessage('Invalid email format.')
];

// Validate all fields on PUT /user.
const validateUserUpdate = [
  check('last_name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('User name is too short.'),
  check('email')
    .optional()
    .matches(emailPattern)
    .withMessage('Invalid email format.')
];

// Validate all fields on POST /comment.
const validateCommentCreation = [
  check('recipe_id')
    .notEmpty()
    .withMessage('Recipe id is required.')
    .custom(checkRecipesForId),
  check('comment_text')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Comment is too short.')
];

// Validate all fields on PUT /comment.
const validateCommentUpdate = [
  check('comment_text')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Comment is too short.')
];

// Validate all fields on POST /rating.
const validateRatingCreation = [
  check('recipe_id')
    .notEmpty()
    .withMessage('Recipe id is required.')
    .custom(checkRecipesForId),
  check('rating_value')
    .notEmpty()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an Integer between 1 and 5.')
];

// Validate all fields on PUT /rating.
const validateRatingUpdate = [
  check('rating_value')
    .optional()
    .notEmpty()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an Integer between 1 and 5.')
];

/**
 * Middleware function for validating request data.
 * If there are validation errors, it extracts these errors into a new array,
 * logs the errors, and passes an Api422Error to the next middleware function.
 */
const validate = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (validationErrors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  validationErrors
    .array()
    .map((err) => extractedErrors.push({ [err.path]: err.msg }));
  console.log(validationErrors);

  return next(
    new Api422Error(
      'Validation Error',
      JSON.stringify({ errors: extractedErrors })
    )
  );
};

module.exports = {
  getUserIdByCredentials,
  checkCollectionForId,
  validateRecipeCreation,
  validateRecipeUpdate,
  validateUserCreation,
  validateUserUpdate,
  validateCommentCreation,
  validateCommentUpdate,
  validateRatingCreation,
  validateRatingUpdate,
  validate
};
