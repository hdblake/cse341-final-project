const router = require('express').Router();
const controller = require('../controllers');
const { requiresAuth } = require('express-openid-connect');

router.get('/', controller.ratings.getAllRatings);
router.get('/:id', controller.ratings.getRatingsById);
router.post('/', requiresAuth(), controller.ratings.createNewRating);

module.exports = router;
