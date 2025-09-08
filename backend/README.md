# Mussikon Backend

Backend API para la plataforma Mussikon - Conectando músicos cristianos con iglesias.

## 🚀 Configuración Rápida

### 1. Instalar Dependencias
```bash
cd backend
npm install
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del backend con las siguientes variables:

```env
# Supabase Configuration
SUPABASE_URL=https://izccknspzjnujemmtpdp.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database Connection
DATABASE_URL=postgresql://postgres.izccknspzjnujemmtpdp:[P0pok@tepel01]@aws-1-us-east-1.pooler.supabase.com:5432/postgres

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:19006

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Configurar Base de Datos
Ejecuta el script SQL en Supabase:
```bash
# Copia y ejecuta el contenido de database/schema.sql en el SQL Editor de Supabase
```

### 4. Compilar TypeScript
```bash
npm run build
```

### 5. Ejecutar el Servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🧪 Probar el Backend

### Ejecutar Tests Automáticos
```bash
# Instalar axios si no está instalado
npm install axios

# Ejecutar tests
node test-server.js
```

### Probar Manualmente
1. El servidor estará disponible en `http://localhost:3000`
2. Health check: `GET http://localhost:3000/health`
3. Documentación de la API disponible en las rutas `/api/*`

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/verify-email` - Verificar email
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users/profile` - Obtener perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil
- `GET /api/users/:id` - Obtener usuario por ID

### Solicitudes
- `GET /api/requests` - Obtener solicitudes
- `POST /api/requests` - Crear solicitud
- `GET /api/requests/:id` - Obtener solicitud por ID
- `PUT /api/requests/:id` - Actualizar solicitud
- `DELETE /api/requests/:id` - Eliminar solicitud

### Ofertas
- `GET /api/offers` - Obtener ofertas
- `POST /api/offers` - Crear oferta
- `GET /api/offers/:id` - Obtener oferta por ID
- `PUT /api/offers/:id/select` - Seleccionar oferta
- `PUT /api/offers/:id/reject` - Rechazar oferta

### Administración
- `GET /api/admin/musicians` - Obtener músicos para validación
- `PUT /api/admin/musicians/:id/approve` - Aprobar músico
- `PUT /api/admin/musicians/:id/reject` - Rechazar músico
- `GET /api/admin/stats` - Obtener estadísticas

## 🔧 Scripts Disponibles

```bash
npm run build      # Compilar TypeScript
npm run start      # Ejecutar en producción
npm run dev        # Ejecutar en desarrollo
npm run test       # Ejecutar tests
npm run lint       # Verificar código
npm run lint:fix   # Corregir código automáticamente
```

## 🏗️ Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración
│   ├── controllers/     # Controladores
│   ├── middleware/      # Middlewares
│   ├── routes/          # Rutas
│   ├── services/        # Servicios
│   ├── types/           # Tipos TypeScript
│   └── utils/           # Utilidades
├── database/
│   └── schema.sql       # Esquema de base de datos
├── dist/                # Código compilado
└── test-server.js       # Script de pruebas
```

## 🐛 Solución de Problemas

### Error de Conexión a Supabase
- Verifica que las variables de entorno estén correctas
- Asegúrate de que la URL de Supabase sea correcta
- Verifica que las claves de API sean válidas

### Error de Base de Datos
- Ejecuta el script SQL en Supabase
- Verifica que las tablas se hayan creado correctamente
- Revisa los permisos de RLS (Row Level Security)

### Error de Compilación TypeScript
- Ejecuta `npm run build` para ver errores específicos
- Verifica que todos los tipos estén importados correctamente
- Revisa la configuración de `tsconfig.json`

## 📝 Notas de Desarrollo

- El backend está configurado para desarrollo local
- Usa SQLite para desarrollo y PostgreSQL (Supabase) para producción
- Implementa autenticación JWT
- Incluye validación de datos con Joi
- Maneja errores de forma consistente
- Incluye rate limiting para seguridad

## 🔐 Seguridad

- Autenticación JWT con expiración
- Rate limiting para prevenir abuso
- Validación de datos de entrada
- Row Level Security en Supabase
- CORS configurado para el frontend
- Headers de seguridad con Helmet

