const router = require('express').Router();
const controller = require('../controllers');
const { requiresAuth } = require('express-openid-connect');
const dataChecks = require('../utils/dataChecks');
const bodyParser = require('body-parser');

router.get('/', controller.recipes.getAllRecipes);
router.get('/:id', controller.recipes.getRecipeById);
router.get('/:id/comments', controller.recipes.getRecipeComments);
router.get('/:id/ratings', controller.recipes.getRecipeRatings);
// The requiresAuth() function checks if there is a user logged in.
router.put(
  '/:id',
  requiresAuth(),
  bodyParser.json(),
  dataChecks.validateRecipeUpdate,
  dataChecks.validate,
  controller.recipes.updateRecipe
);
router.delete('/:id', requiresAuth(), controller.recipes.deleteRecipe);
router.post(
  '/',
  requiresAuth(),
  bodyParser.json(),
  dataChecks.validateRecipeCreation,
  dataChecks.validate,
  controller.recipes.createNewRecipe
);

module.exports = router;
