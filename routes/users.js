const router = require('express').Router();
const controller = require('../controllers');

router.get('/', controller.users.getAllUsers);
router.get('/:id', controller.users.getUsersById);
router.delete('/:id', controller.deleteUser);

module.exports = router;
