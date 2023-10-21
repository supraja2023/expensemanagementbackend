const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger configuration options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API',
      version: '1.0.0',
    },
  },
  components: {
    schemas: {
     Product: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'number' },
          quantity:{type:'number'}
        },
        required: ['name'],
      },
    },
  },
  // Path to the API routes
  apis: ['./server.js'], // Modify this to match your project's routes
};

// Initialize Swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

module.exports = (app) => {
  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
