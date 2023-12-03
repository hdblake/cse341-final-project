const router = require('express').Router();
const controller = require('../controllers');
const { requiresAuth } = require('express-openid-connect');

router.get('/', controller.users.getAllUsers);
router.get('/:id', controller.users.getUsersById);
router.post('/', requiresAuth(), controller.users.createNewUser);

module.exports = router;