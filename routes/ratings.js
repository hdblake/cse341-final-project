const router = require('express').Router();
const controller = require('../controllers');
const { requiresAuth } = require('express-openid-connect');
const dataChecks = require('../utils/dataChecks');
const bodyParser = require('body-parser');

router.get('/', controller.ratings.getAllRatings);
router.get('/:id', controller.ratings.getRatingsById);
// The requiresAuth() function checks if there is a user logged in.
router.put(
  '/:id',
  requiresAuth(),
  bodyParser.json(),
  dataChecks.validateRatingUpdate,
  dataChecks.validate,
  controller.ratings.updateRating
);
router.post(
  '/',
  requiresAuth(),
  bodyParser.json(),
  dataChecks.validateRatingCreation,
  dataChecks.validate,
  controller.ratings.createNewRating
);
router.delete('/:id', controller.ratings.deleteRating);

module.exports = router;
