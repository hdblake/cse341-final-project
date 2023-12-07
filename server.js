const express = require('express');
const app = express();
const MongoClient = require('mongodb');
const mongodb = require('./db/connect');
const cors = require('cors');
const port = process.env.PORT || 3000;
const { logError, returnError } = require('./error_handling/errorHandler');

app
  .use(express.json())
  .use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  })
  .use(require('./routes'))
  .use(logError)
  .use(returnError);

mongodb.initDb((err, mongodb) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(port);
    console.log(`Connected to DB and listening on port ${port}`);
  }
});
