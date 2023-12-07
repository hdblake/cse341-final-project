const routes = require('express').Router();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const swaggerTestDocument = require('../swagger-test.json');

routes.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
routes.use('/api-docs-test', swaggerUi.serve, swaggerUi.setup(swaggerTestDocument));

module.exports = routes;
