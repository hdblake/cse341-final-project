const router = require('express').Router();
const controller = require('../controllers');
const { requiresAuth } = require('express-openid-connect');

router.get('/', controller.recipes.getAllRecipes);
router.get('/:id', controller.recipes.getRecipeById);
router.get('/:id/comments', controller.recipes.getRecipeComments);
router.get('/:id/ratings', controller.recipes.getRecipeRatings);

// The requiresAuth() function checks if there is a user logged in.
router.put('/:id', requiresAuth(), controller.recipes.updateRecipe);
router.post('/', requiresAuth(), controller.recipes.createNewRecipe);
module.exports = router;