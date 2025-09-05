# Especificaciones MVP - Mussikon

## ¿Qué es lo MÁS BÁSICO que necesita la app para ser funcional?

### Funcionalidades ESENCIALES (Sin estas, la app no funciona)

#### 1. **Registro de Usuarios** ⭐ CRÍTICO
- **Líderes:** Registro inmediato con email y teléfono
- **Músicos:** Registro con validación básica por administrador
- **Administradores:** Acceso al panel de validación

#### 2. **Sistema de Solicitudes** ⭐ CRÍTICO
- **Crear solicitud:** Líderes publican necesidades musicales
- **Ver solicitudes:** Músicos ven oportunidades disponibles
- **Información básica:** Tipo de evento, fecha, ubicación, presupuesto

#### 3. **Sistema de Ofertas** ⭐ CRÍTICO
- **Hacer oferta:** Músicos proponen sus servicios
- **Ver ofertas:** Líderes ven propuestas recibidas
- **Seleccionar:** Líderes eligen la mejor oferta

#### 4. **Validación de Músicos** ⭐ CRÍTICO
- **Panel de administración:** Ver músicos pendientes
- **Aprobar/Rechazar:** Decisión del administrador
- **Notificación:** Email al músico con resultado

### Funcionalidades DESEABLES (Mejoran la experiencia pero no son críticas)

#### 5. **Gestión de Perfiles** ⭐ IMPORTANTE
- **Editar perfil:** Actualizar información personal
- **Instrumentos:** Seleccionar múltiples instrumentos
- **Experiencia:** Años de experiencia por instrumento

#### 6. **Búsqueda y Filtros** ⭐ IMPORTANTE
- **Filtrar solicitudes:** Por instrumento, ubicación, fecha
- **Buscar músicos:** Por nombre, instrumento
- **Ordenar resultados:** Por precio, fecha, relevancia

#### 7. **Notificaciones Básicas** ⭐ IMPORTANTE
- **Email:** Notificaciones importantes
- **In-app:** Alertas básicas en la app
- **Estados:** Cambios de estado de solicitudes

### Funcionalidades OPCIONALES (Pueden agregarse después)

#### 8. **Historial de Actividad**
- **Solicitudes anteriores:** Historial de líderes
- **Ofertas anteriores:** Historial de músicos
- **Eventos completados:** Registro de trabajos

#### 9. **Configuración de Usuario**
- **Preferencias:** Configuración personal
- **Notificaciones:** Preferencias de alertas
- **Privacidad:** Configuración de visibilidad

## Arquitectura MÍNIMA para MVP

### Frontend (React Native)
```
Pantallas ESENCIALES:
├── Login/Registro
├── Dashboard (Home)
├── Crear Solicitud (Líderes)
├── Ver Solicitudes (Músicos)
├── Hacer Oferta (Músicos)
├── Ver Ofertas (Líderes)
├── Perfil de Usuario
└── Panel Admin (Administradores)
```

### Backend (Node.js + Express)
```
Endpoints ESENCIALES:
├── POST /auth/register
├── POST /auth/login
├── GET /requests (listar solicitudes)
├── POST /requests (crear solicitud)
├── GET /offers (listar ofertas)
├── POST /offers (crear oferta)
├── PUT /offers/:id/select (seleccionar oferta)
├── GET /admin/musicians (listar músicos)
├── PUT /admin/musicians/:id/approve
└── PUT /admin/musicians/:id/reject
```

### Base de Datos (SQLite)
```
Tablas ESENCIALES:
├── users (usuarios)
├── requests (solicitudes)
├── offers (ofertas)
├── user_instruments (instrumentos de músicos)
└── admin_actions (acciones de administrador)
```

## Flujo de Usuario MÍNIMO

### Para Líderes (3 pasos)
1. **Registrarse** → Verificar email
2. **Crear solicitud** → Detalles del evento
3. **Seleccionar músico** → Elegir mejor oferta

### Para Músicos (4 pasos)
1. **Registrarse** → Esperar validación
2. **Ver solicitudes** → Buscar oportunidades
3. **Hacer oferta** → Proponer servicio
4. **Ser seleccionado** → Confirmar disponibilidad

### Para Administradores (2 pasos)
1. **Ver músicos pendientes** → Lista de validación
2. **Aprobar/Rechazar** → Decisión y notificación

## Datos MÍNIMOS Requeridos

### Líderes
- Nombre completo
- Email (verificado)
- Teléfono
- Nombre de la iglesia
- Ubicación

### Músicos
- Nombre completo
- Email (verificado)
- Teléfono
- Instrumentos (múltiples)
- Años de experiencia por instrumento

### Solicitudes
- Tipo de evento
- Fecha y hora
- Ubicación (texto)
- Presupuesto
- Descripción

### Ofertas
- Precio propuesto
- Disponibilidad
- Mensaje personal
- Estado (pendiente/seleccionada)

## Criterios de ÉXITO del MVP

### Métricas de Funcionalidad
- **Usuarios pueden registrarse** ✅
- **Líderes pueden crear solicitudes** ✅
- **Músicos pueden hacer ofertas** ✅
- **Administradores pueden validar** ✅
- **Selección de músicos funciona** ✅

### Métricas de Usuario
- **10+ usuarios registrados** en la primera semana
- **5+ solicitudes creadas** en la primera semana
- **10+ ofertas realizadas** en la primera semana
- **Tiempo de validación < 24 horas**

### Métricas de Calidad
- **App no se cierra** durante uso normal
- **Datos se guardan** correctamente
- **Navegación fluida** entre pantallas
- **Notificaciones llegan** a los usuarios

## Plan de Desarrollo MÍNIMO

### Semana 1: Base
- Configuración del proyecto
- Autenticación básica
- Base de datos SQLite
- Pantallas de login/registro

### Semana 2: Core
- Sistema de solicitudes
- Sistema de ofertas
- Pantallas principales
- Navegación básica

### Semana 3: Admin
- Panel de administración
- Validación de músicos
- Notificaciones por email
- Testing básico

### Semana 4: Refinamiento
- Testing con usuarios
- Corrección de bugs
- Mejoras de UI/UX
- Preparación para lanzamiento

## Lo que NO necesita el MVP

### ❌ Funcionalidades Excluidas
- Sistema de pagos integrado
- Notificaciones push
- Google Maps
- Sistema de calificaciones
- Portafolio musical
- Chat interno
- Validación de teléfono por SMS
- Sistema de referencias
- Analytics avanzados
- Funcionalidades premium
- Integraciones externas

### ❌ Pantallas Excluidas
- Pantalla de configuración avanzada
- Pantalla de historial detallado
- Pantalla de analytics
- Pantalla de chat
- Pantalla de portafolio
- Pantalla de mapas

## Conclusión

El MVP de Mussikon necesita **SOLO 4 funcionalidades core** para ser funcional:

1. **Registro de usuarios** (líderes, músicos, admin)
2. **Sistema de solicitudes** (crear y ver)
3. **Sistema de ofertas** (hacer y seleccionar)
4. **Validación de músicos** (aprobar/rechazar)

Con estas 4 funcionalidades, los usuarios pueden:
- Conectarse entre sí
- Publicar necesidades musicales
- Hacer ofertas de servicios
- Validar músicos confiables
- Coordinar eventos musicales

**Todo lo demás es opcional y puede agregarse después.**

## Referencias

- [Funcionalidades Core](./02-core-features.md)
- [Flujos de Usuario MVP](./03-user-flows-mvp.md)
- [Arquitectura MVP](./04-architecture-mvp.md)
