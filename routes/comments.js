const router = require('express').Router();
const controller = require('../controllers');
const { requiresAuth } = require('express-openid-connect');

router.get('/', controller.comments.getAllComments);
router.get('/:id', controller.comments.getCommentsById);
// The requiresAuth() function checks if there is a user logged in.
router.put('/:id', requiresAuth(), controller.comments.updateComment);
router.post('/', requiresAuth(), controller.comments.createNewComment);
router.delete('/:id', controller.comments.deleteComment);

module.exports = router;
