const router = require('express').Router();
const auth0 = require('./auth0');
const comments = require('./comments');
const ratings = require('./ratings');
const recipes = require('./recipes');
const users = require('./users');

router.use('/', auth0);
router.use('/comments', comments);
router.use('/ratings', ratings);
router.use('/recipes', recipes);
router.use('/users', users);
router.use('/', require('./swagger'));

module.exports = router;
