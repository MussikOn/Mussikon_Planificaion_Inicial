# 🚀 Configuración de Mussikon Backend

Guía paso a paso para configurar el backend de Mussikon con Supabase.

## 📋 **Prerrequisitos**

- Node.js 18+ instalado
- Cuenta de Supabase activa
- Proyecto de Supabase creado

## 🔧 **Configuración Rápida**

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Supabase
```bash
npm run setup-supabase
```

### 3. Obtener Credenciales de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings > API**
4. Copia las siguientes credenciales:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key

### 4. Configurar Variables de Entorno

Edita el archivo `.env` y reemplaza:
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### 5. Configurar Base de Datos

```bash
npm run setup-db
```

Copia el esquema SQL que se muestra y ejecútalo en el **SQL Editor** de Supabase.

### 6. Verificar Configuración

```bash
npm run verify-supabase
```

### 7. Ejecutar el Servidor

```bash
npm run dev
```

### 8. Probar la API

```bash
# Prueba básica (sin base de datos)
npm run test:basic

# Prueba completa (con base de datos)
npm run test:api
```

## 🧪 **Scripts Disponibles**

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Ejecutar servidor en desarrollo |
| `npm run build` | Compilar TypeScript |
| `npm run start` | Ejecutar servidor en producción |
| `npm run test:basic` | Prueba básica del servidor |
| `npm run test:api` | Prueba completa de la API |
| `npm run setup-supabase` | Configurar archivo .env |
| `npm run setup-db` | Mostrar esquema SQL |
| `npm run verify-supabase` | Verificar configuración |

## 🔍 **Verificación de Configuración**

### ✅ **Verificaciones Básicas**
- [ ] Servidor responde en `http://localhost:3000/health`
- [ ] Variables de entorno configuradas
- [ ] Conexión a Supabase exitosa

### ✅ **Verificaciones de Base de Datos**
- [ ] Tabla `users` creada
- [ ] Tabla `user_passwords` creada
- [ ] Tabla `user_instruments` creada
- [ ] Tabla `requests` creada
- [ ] Tabla `offers` creada
- [ ] Tabla `admin_actions` creada
- [ ] Usuario administrador creado

### ✅ **Verificaciones de API**
- [ ] Registro de usuarios funciona
- [ ] Login funciona
- [ ] Creación de solicitudes funciona
- [ ] Creación de ofertas funciona

## 🐛 **Solución de Problemas**

### Error: "Variables de entorno no configuradas"
- Verifica que el archivo `.env` existe
- Asegúrate de que las variables estén correctamente escritas

### Error: "Conexión a Supabase fallida"
- Verifica que las credenciales sean correctas
- Asegúrate de que el proyecto de Supabase esté activo

### Error: "Tabla no encontrada"
- Ejecuta el esquema SQL en Supabase
- Verifica que todas las tablas se hayan creado

### Error: "Usuario no encontrado"
- Verifica que el esquema SQL se ejecutó completamente
- Revisa que el usuario administrador se haya creado

## 📚 **Documentación Adicional**

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Express.js](https://expressjs.com/)
- [Documentación de TypeScript](https://www.typescriptlang.org/)

## 🆘 **Soporte**

Si tienes problemas con la configuración:

1. Ejecuta `npm run verify-supabase` para diagnóstico
2. Revisa los logs del servidor
3. Verifica la configuración de Supabase
4. Consulta la documentación de Supabase

---

**¡Tu backend de Mussikon está listo para funcionar! 🎉**

