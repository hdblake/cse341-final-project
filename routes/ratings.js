const router = require('express').Router();
const controller = require('../controllers');
const { requiresAuth } = require('express-openid-connect');

router.get('/', controller.ratings.getAllRatings);
router.get('/:id', controller.ratings.getRatingsById);
// The requiresAuth() function checks if there is a user logged in.
router.put('/:id', requiresAuth(), controller.ratings.updateRating);
router.post('/', controller.ratings.createNewRating);
router.delete('/:id', controller.ratings.deleteRating);

module.exports = router;
