const router = require("express").Router();

router.use("/recipes", require("./recipes"));

module.exports = router;
