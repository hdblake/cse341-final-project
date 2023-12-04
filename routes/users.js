const router = require('express').Router();
const controller = require('../controllers');
const { requiresAuth } = require('express-openid-connect');

router.get('/', controller.users.getAllUsers);
router.get('/:id', controller.users.getUsersById);

// The requiresAuth() function checks if there is a user logged in.
router.put('/:id', requiresAuth(), controller.users.updateUser);
router.post('/', requiresAuth(), controller.users.createNewUser);
router.delete('/:id', controller.users.deleteUser);


module.exports = router;