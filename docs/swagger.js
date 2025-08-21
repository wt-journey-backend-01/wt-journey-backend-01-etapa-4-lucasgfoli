// Gera automaticamente a documentação da API
const swaggerJSDoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API do Departamento de Polícia',
      version: '1.0.0',
      description: 'Documentação da API para gerenciamento de agentes e casos policiais'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local'
      }
    ]
  },
  apis: ['./routes/*.js'], // Caminho para os arquivos com comentários Swagger
}

const swaggerSpec = swaggerJSDoc(options)

module.exports = swaggerSpec