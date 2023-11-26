const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'CSE341 - Final Project',
    description: 'Documentation of API'
  },
  host: 'cse341-final-project-kz8y.onrender.com',
  schemes: 'https'
};

const outputFile = './swagger.json';
const endpointFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointFiles, doc);
