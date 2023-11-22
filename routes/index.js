const router = require("express").Router();
const recipes = require('../controller/recipes');
const users = require('../controller/users');
const comments = require('../controller/comments');
const ratings = require('../controller/ratings');

router.use("/", require("./swagger"));

//recipes
router.get("/recipes", recipes.getAllRecipes);
router.get("/recipes/:id", recipes.getRecipeById);
router.get("/recipes/:id/comments", recipes.getRecipeComments);
router.get("/recipes/:id/ratings", recipes.getRecipeRatings);

//users
router.get("/users", users.getAllUsers);
router.get("/users/:id", users.getUsersById);

//comments
router.get("/comments", comments.getAllComments);
router.get("/comments/:id", comments.getCommentsById);

//ratings
router.get("/ratings", ratings.getAllRatings);
router.get("/ratings/:id", ratings.getRatinsById);

module.exports = router;
