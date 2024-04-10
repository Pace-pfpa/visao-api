export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'VISÃO. API to perform screening in SAPIENS',
    version: '1.0.0',
    description:
      'This is a REST API application made with Express. It retrieves data from SAPIENS.',
    license: {
      name: 'Licensed Under MIT',
      url: 'https://spdx.org/licenses/MIT.html',
    },
    contact: {
      name: 'GITHUB PROJECT',
      url: 'https://github.com/moisesPompilio/visao-api.git',
    },
  },
};

export const Options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./src/routes/*.ts', './src/entities/*.ts', './src/modules/*/*.ts', './src/type/*.ts', './src/DTO/*.ts'],
};