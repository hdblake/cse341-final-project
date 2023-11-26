const router = require('express').Router();
const controller = require('../controllers');

router.get('/', controller.comments.getAllComments);
router.get('/:id', controller.comments.getCommentsById);

module.exports = router;
