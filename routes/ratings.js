const router = require('express').Router();
const controller = require('../controllers');

router.get('/', controller.ratings.getAllRatings);
router.get('/:id', controller.ratings.getRatingsById);

module.exports = router;
