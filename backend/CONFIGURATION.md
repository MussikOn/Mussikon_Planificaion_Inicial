# 🔧 Configuración de Mussikon Backend

## 📋 **Estructura de Variables de Entorno**

### ✅ **Configuración Actual**

```env
# Supabase Configuration
SUPABASE_URL=https://izccknspzjnujemmtpdp.supabase.co
SUPABASE_ANON_KEY=REPLACE_WITH_YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=REPLACE_WITH_YOUR_SERVICE_ROLE_KEY

# Database Configuration (Supabase)
DB_HOST=aws-1-us-east-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.izccknspzjnujemmtpdp
DB_PASSWORD=0ch1n@gu@01
DB_SSL=true

# JWT Configuration
JWT_SECRET=mussikon_jwt_secret_key_2024_very_secure_1757105126040
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
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔑 **Variables de Base de Datos Configuradas**

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DB_HOST` | `aws-1-us-east-1.pooler.supabase.com` | Host de la base de datos |
| `DB_PORT` | `5432` | Puerto de la base de datos |
| `DB_NAME` | `postgres` | Nombre de la base de datos |
| `DB_USER` | `postgres.izccknspzjnujemmtpdp` | Usuario de la base de datos |
| `DB_PASSWORD` | `0ch1n@gu@01` | Contraseña de la base de datos |
| `DB_SSL` | `true` | Habilitar SSL para la conexión |

## 🚀 **Próximos Pasos**

### 1. **Configurar Claves de API de Supabase**

```bash
npm run configure-credentials
```

**Necesitas obtener:**
- **Anon Public Key** (empieza con `eyJ...`)
- **Service Role Key** (empieza con `eyJ...`)

**Ubicación:** Supabase Dashboard → Settings → API → Project API keys

### 2. **Verificar Configuración**

```bash
npm run verify-supabase
```

### 3. **Ejecutar Esquema SQL en Supabase**

```bash
npm run setup-db
```

**Luego ejecuta el SQL en:** Supabase Dashboard → SQL Editor

### 4. **Probar API Completa**

```bash
npm run test:api
```

## 🧪 **Scripts Disponibles**

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor en desarrollo |
| `npm run build` | Compilar TypeScript |
| `npm run test:basic` | Prueba básica |
| `npm run test:api` | Prueba completa |
| `npm run configure-credentials` | Configurar claves de API |
| `npm run verify-supabase` | Verificar configuración |
| `npm run setup-db` | Mostrar esquema SQL |

## ✅ **Estado Actual**

- [x] Variables de base de datos configuradas
- [x] JWT secret generado
- [x] Configuración de CORS actualizada
- [x] Proyecto compilado sin errores
- [ ] Claves de API de Supabase configuradas
- [ ] Esquema SQL ejecutado en Supabase
- [ ] API probada completamente

## 🔍 **Verificación de Configuración**

### ✅ **Variables de Base de Datos**
- Host: `aws-1-us-east-1.pooler.supabase.com`
- Puerto: `5432`
- Usuario: `postgres.izccknspzjnujemmtpdp`
- Contraseña: `0ch1n@gu@01`
- SSL: Habilitado

### ⏳ **Pendiente**
- Claves de API de Supabase
- Ejecución del esquema SQL
- Pruebas de la API

---

**¡La configuración de base de datos está lista! Solo necesitas configurar las claves de API de Supabase.**
