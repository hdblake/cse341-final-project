const router = require("express").Router();

// router.use("/recipes", require("./recipes"));
router.use("/", require("./swagger"));

module.exports = router;
