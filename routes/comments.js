const router = require('express').Router();
const controller = require('../controllers');

router.get('/', controller.comments.getAllComments);
router.get('/:id', controller.comments.getCommentsById);
router.post('/', controller.comments.createNewComment);
router.delete('/:id', controller.comments.deleteComment);

module.exports = router;
