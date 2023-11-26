const router = require('express').Router();
const controller = require('../controllers');

router.get('/', controller.ratings.getAllRatings);
router.get('/:id', controller.ratings.getRatingsById);
router.post('/', controller.ratings.createNewRating);

module.exports = router;
