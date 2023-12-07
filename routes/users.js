const router = require('express').Router();
const controller = require('../controllers');
const { requiresAuth } = require('express-openid-connect');
const dataChecks = require('../utils/dataChecks');
const bodyParser = require('body-parser');

router.get('/', controller.users.getAllUsers);
router.get('/:id', controller.users.getUsersById);

// The requiresAuth() function checks if there is a user logged in.
router.put(
  '/:id',
  requiresAuth(),
  bodyParser.json(),
  dataChecks.validateUserUpdate,
  dataChecks.validate,
  controller.users.updateUser
);
router.post(
  '/',
  requiresAuth(),
  bodyParser.json(),
  dataChecks.validateUserCreation,
  dataChecks.validate,
  controller.users.createNewUser
);
router.delete('/:id', controller.users.deleteUser);

module.exports = router;
