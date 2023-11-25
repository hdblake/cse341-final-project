const router = require('express').Router();
const controller = require('../controllers');

router.get('/', controller.recipes.getAllRecipes);
router.get('/:id', controller.recipes.getRecipeById);
router.get('/:id/comments', controller.recipes.getRecipeComments);
router.get('/:id/ratings', controller.recipes.getRecipeRatings);
router.delete('/:id', controller.deleteRecipe);

module.exports = router;
