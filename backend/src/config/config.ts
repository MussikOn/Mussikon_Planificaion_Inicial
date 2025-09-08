import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env['PORT'] || '3000'),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  
  // Database Configuration
  database: {
    host: process.env['DB_HOST'] || 'aws-1-us-east-1.pooler.supabase.com',
    port: parseInt(process.env['DB_PORT'] || '5432'),
    name: process.env['DB_NAME'] || 'postgres',
    user: process.env['DB_USER'] || 'postgres.izccknspzjnujemmtpdp',
    password: process.env['DB_PASSWORD'] || '0ch1n@gu@01',
    ssl: process.env['DB_SSL'] === 'true',
    supabaseUrl: process.env['SUPABASE_URL'] || 'https://izccknspzjnujemmtpdp.supabase.co',
    supabaseAnonKey: process.env['SUPABASE_ANON_KEY'] || '',
    supabaseServiceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] || ''
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env['JWT_SECRET'] || 'your_jwt_secret_here',
    expiresIn: process.env['JWT_EXPIRES_IN'] || '24h'
  },
  
  // Email Configuration
  email: {
    host: process.env['EMAIL_HOST'] || 'smtp.gmail.com',
    port: parseInt(process.env['EMAIL_PORT'] || '587'),
    user: process.env['EMAIL_USER'] || '',
    pass: process.env['EMAIL_PASS'] || ''
  },
  
  // CORS Configuration
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:8081',
      'http://localhost:19006',
      'http://localhost:19000',
      'http://172.20.10.4:3000', //172.20.10.4
      'http://172.20.10.4:8081',
      'http://172.20.10.4:19006',
      'http://172.20.10.4:19000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100')
  },
  
  // App Configuration
  app: {
    name: 'Mussikon',
    version: '1.0.0',
    description: 'Plataforma para conectar músicos cristianos con iglesias'
  }
};
