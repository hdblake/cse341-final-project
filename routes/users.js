const router = require('express').Router();
const controller = require('../controllers');

router.get('/', controller.users.getAllUsers);
router.get('/:id', controller.users.getUsersById);

module.exports = router;
