const router = require('express').Router();
const controller = require('../controllers');
const { requiresAuth } = require('express-openid-connect');
const dataChecks = require('../utils/dataChecks');
const bodyParser = require('body-parser');

router.get('/', controller.comments.getAllComments);
router.get('/:id', controller.comments.getCommentsById);
// The requiresAuth() function checks if there is a user logged in.
router.put(
  '/:id',
  requiresAuth(),
  bodyParser.json(),
  dataChecks.validateCommentUpdate,
  dataChecks.validate,
  controller.comments.updateComment
);
router.post(
  '/',
  requiresAuth(),
  bodyParser.json(),
  dataChecks.validateCommentCreation,
  dataChecks.validate,
  controller.comments.createNewComment
);
router.delete('/:id', controller.comments.deleteComment);

module.exports = router;
