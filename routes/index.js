const router = require("express").Router();
const recipes = require('../controller/recipes');

router.get("/", require("./swagger"));
router.get("/recipes", recipes.getAllRecipes);

module.exports = router;
