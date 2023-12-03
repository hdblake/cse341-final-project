const router = require('express').Router();
const controller = require('../controllers');
const { requiresAuth } = require('express-openid-connect');


router.get('/', controller.comments.getAllComments);
router.get('/:id', controller.comments.getCommentsById);
router.post('/', requiresAuth(), controller.comments.createNewComment);

module.exports = router;
