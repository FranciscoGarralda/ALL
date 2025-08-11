const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alliance F&R API',
      version: '1.0.0',
      description: 'API REST para el sistema de gestión financiera Alliance F&R',
      contact: {
        name: 'Francisco Garralda',
        email: 'francisco.garralda@alliancefr.com'
      },
      license: {
        name: 'Privado',
        url: 'https://alliancefr.com/license'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://all-production-31a3.up.railway.app'
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Servidor de producción' : 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'operator', 'viewer'] },
            permissions: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Client: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre: { type: 'string' },
            apellido: { type: 'string' },
            dni: { type: 'string' },
            telefono: { type: 'string' },
            email: { type: 'string', format: 'email' },
            direccion: { type: 'string' },
            tipoCliente: { type: 'string' },
            notas: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Movement: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            tipo_operacion: { type: 'string' },
            sub_operacion: { type: 'string' },
            monto: { type: 'number' },
            moneda: { type: 'string' },
            fecha: { type: 'string', format: 'date' },
            cliente_id: { type: 'integer' },
            descripcion: { type: 'string' },
            estado: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', default: false },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./server-minimal.js', './routes/*.js'], // Archivos con anotaciones JSDoc
};

module.exports = swaggerJsdoc(options);