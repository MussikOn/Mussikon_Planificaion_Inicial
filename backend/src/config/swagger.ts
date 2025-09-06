import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mussikon API',
      version: '1.0.0',
      description: 'API para la plataforma Mussikon - Conectando músicos cristianos con iglesias',
      contact: {
        name: 'Mussikon Team',
        email: 'admin@mussikon.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://api.mussikon.com',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del usuario',
            },
            name: {
              type: 'string',
              description: 'Nombre completo del usuario',
              example: 'Juan Pérez',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario',
              example: 'juan@example.com',
            },
            phone: {
              type: 'string',
              description: 'Número de teléfono',
              example: '+1234567890',
            },
            role: {
              type: 'string',
              enum: ['leader', 'musician', 'admin'],
              description: 'Rol del usuario',
            },
            status: {
              type: 'string',
              enum: ['active', 'pending', 'rejected'],
              description: 'Estado del usuario',
            },
            church_name: {
              type: 'string',
              description: 'Nombre de la iglesia (solo para líderes)',
              example: 'Iglesia Central',
            },
            location: {
              type: 'string',
              description: 'Ubicación del usuario',
              example: 'Santo Domingo, RD',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización',
            },
          },
        },
        UserInstrument: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
            },
            instrument: {
              type: 'string',
              description: 'Nombre del instrumento',
              example: 'Guitarrista',
            },
            years_experience: {
              type: 'integer',
              minimum: 0,
              maximum: 50,
              description: 'Años de experiencia',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Request: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            leader_id: {
              type: 'string',
              format: 'uuid',
            },
            event_type: {
              type: 'string',
              description: 'Tipo de evento',
              example: 'Servicio Dominical',
            },
            event_date: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha del evento',
            },
            location: {
              type: 'string',
              description: 'Ubicación del evento',
              example: 'Iglesia Central, Santo Domingo',
            },
            budget: {
              type: 'number',
              minimum: 600,
              description: 'Presupuesto en DOP',
              example: 1500,
            },
            description: {
              type: 'string',
              description: 'Descripción del evento',
            },
            required_instrument: {
              type: 'string',
              description: 'Instrumento requerido',
              example: 'Guitarrista',
            },
            status: {
              type: 'string',
              enum: ['active', 'closed', 'cancelled'],
              description: 'Estado de la solicitud',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Offer: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            request_id: {
              type: 'string',
              format: 'uuid',
            },
            musician_id: {
              type: 'string',
              format: 'uuid',
            },
            proposed_price: {
              type: 'number',
              minimum: 600,
              description: 'Precio propuesto en DOP',
              example: 1200,
            },
            availability_confirmed: {
              type: 'boolean',
              description: 'Disponibilidad confirmada',
            },
            message: {
              type: 'string',
              description: 'Mensaje del músico',
            },
            status: {
              type: 'string',
              enum: ['pending', 'selected', 'rejected'],
              description: 'Estado de la oferta',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Mensaje de error',
            },
            error: {
              type: 'string',
              description: 'Detalles del error',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              description: 'Mensaje de éxito',
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
