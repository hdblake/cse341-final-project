const router = require("express").Router();
const recipes = require('../controller/recipes');

router.use("/", require("./swagger"));
router.get("/recipes", recipes.getAllRecipes);

module.exports = router;
