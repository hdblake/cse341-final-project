const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app
  .use(express.json())
  .use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  })
  .use(require("./routes"));

app.listen(port, () => {
  console.log(`Connected to db. Listening on port ${port}!`);
});
