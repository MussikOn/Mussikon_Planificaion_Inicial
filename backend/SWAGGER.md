# 📚 Documentación Swagger de Mussikon API

## 🚀 **Acceso a la Documentación**

La documentación interactiva de la API está disponible en:
**http://localhost:3000/api-docs**

## 📋 **Características de la Documentación**

### ✅ **Documentación Completa**
- **Todos los endpoints** documentados con ejemplos
- **Esquemas de datos** definidos para cada modelo
- **Códigos de respuesta** con descripciones detalladas
- **Parámetros de consulta** y body explicados
- **Autenticación JWT** configurada

### 🏷️ **Endpoints Organizados por Tags**

#### 🔐 **Autenticación**
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/verify-email` - Verificar email
- `POST /api/auth/logout` - Cerrar sesión

#### 👤 **Usuarios**
- `GET /api/users/profile` - Obtener perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil
- `GET /api/users/{id}` - Obtener usuario por ID

#### 📝 **Solicitudes**
- `GET /api/requests` - Obtener solicitudes musicales
- `POST /api/requests` - Crear nueva solicitud
- `GET /api/requests/{id}` - Obtener solicitud por ID
- `PUT /api/requests/{id}` - Actualizar solicitud
- `DELETE /api/requests/{id}` - Eliminar solicitud

#### 💰 **Ofertas**
- `GET /api/offers` - Obtener ofertas musicales
- `POST /api/offers` - Crear nueva oferta
- `GET /api/offers/{id}` - Obtener oferta por ID
- `PUT /api/offers/{id}/select` - Seleccionar oferta
- `PUT /api/offers/{id}/reject` - Rechazar oferta

#### ⚙️ **Administración**
- `GET /api/admin/musicians` - Obtener músicos para validación
- `PUT /api/admin/musicians/{id}/approve` - Aprobar músico
- `PUT /api/admin/musicians/{id}/reject` - Rechazar músico
- `GET /api/admin/stats` - Obtener estadísticas

### 📊 **Esquemas de Datos Definidos**

#### **User**
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "leader|musician|admin",
  "status": "active|pending|rejected",
  "church_name": "string",
  "location": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### **UserInstrument**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "instrument": "string",
  "years_experience": "integer",
  "created_at": "datetime"
}
```

#### **Request**
```json
{
  "id": "uuid",
  "leader_id": "uuid",
  "event_type": "string",
  "event_date": "datetime",
  "location": "string",
  "budget": "number",
  "description": "string",
  "required_instrument": "string",
  "status": "active|closed|cancelled",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### **Offer**
```json
{
  "id": "uuid",
  "request_id": "uuid",
  "musician_id": "uuid",
  "proposed_price": "number",
  "availability_confirmed": "boolean",
  "message": "string",
  "status": "pending|selected|rejected",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## 🧪 **Probar la API desde Swagger**

### 1. **Acceder a la Documentación**
- Ve a http://localhost:3000/api-docs
- Explora los endpoints organizados por tags

### 2. **Autenticación**
- Usa el botón "Authorize" en la parte superior
- Ingresa tu token JWT en el formato: `Bearer tu_token_aqui`

### 3. **Probar Endpoints**
- Haz clic en cualquier endpoint para expandirlo
- Usa "Try it out" para probar el endpoint
- Completa los parámetros requeridos
- Ejecuta la petición y ve la respuesta

### 4. **Ejemplos de Uso**

#### **Registrar un Líder**
```json
{
  "name": "Pastor Juan Pérez",
  "email": "pastor@iglesia.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "leader",
  "church_name": "Iglesia Central",
  "location": "Santo Domingo, RD"
}
```

#### **Registrar un Músico**
```json
{
  "name": "Carlos Músico",
  "email": "carlos@musico.com",
  "phone": "+1234567891",
  "password": "password123",
  "role": "musician",
  "location": "Santo Domingo, RD",
  "instruments": [
    {
      "instrument": "Guitarrista",
      "years_experience": 5
    }
  ]
}
```

#### **Crear una Solicitud**
```json
{
  "event_type": "Servicio Dominical",
  "event_date": "2024-01-15T10:00:00Z",
  "location": "Iglesia Central, Santo Domingo",
  "budget": 1500,
  "description": "Necesitamos guitarrista para el servicio dominical",
  "required_instrument": "Guitarrista"
}
```

## 🔧 **Scripts Disponibles**

```bash
# Probar documentación Swagger
npm run test:swagger

# Ejecutar servidor con documentación
npm run dev

# Compilar proyecto
npm run build
```

## 📱 **URLs Importantes**

- **Documentación Swagger:** http://localhost:3000/api-docs
- **Health Check:** http://localhost:3000/health
- **API Base:** http://localhost:3000/api

## 🎯 **Beneficios de la Documentación Swagger**

1. **Interfaz Interactiva** - Prueba endpoints directamente
2. **Documentación Actualizada** - Se actualiza automáticamente
3. **Ejemplos de Uso** - Código de ejemplo para cada endpoint
4. **Validación de Datos** - Esquemas de validación integrados
5. **Autenticación Integrada** - Prueba con tokens JWT
6. **Códigos de Respuesta** - Documentación completa de errores

---

**¡Tu API de Mussikon está completamente documentada y lista para usar! 🎉**

