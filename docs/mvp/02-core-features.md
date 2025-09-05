# Funcionalidades Core MVP - Mussikon

## Las 4 Funcionalidades ESENCIALES

### 1. 🔐 **Registro de Usuarios**

#### ¿Por qué es esencial?
Sin registro, no hay usuarios. Sin usuarios, no hay app.

#### Funcionalidades mínimas:
- **Formulario de registro** para líderes y músicos
- **Verificación de email** básica
- **Validación de datos** (formato correcto)
- **Diferenciación de roles** (líder vs músico)

#### Datos requeridos:
```
Líderes:
- Nombre completo
- Email
- Teléfono
- Nombre de la iglesia
- Ubicación

Músicos:
- Nombre completo
- Email
- Teléfono
- Instrumentos (múltiples)
- Años de experiencia por instrumento
```

#### Pantallas necesarias:
- Pantalla de registro
- Pantalla de login
- Pantalla de verificación de email

---

### 2. 📝 **Sistema de Solicitudes**

#### ¿Por qué es esencial?
Es la funcionalidad principal: líderes publican sus necesidades musicales.

#### Funcionalidades mínimas:
- **Crear solicitud** con datos básicos
- **Ver lista de solicitudes** disponibles
- **Filtros básicos** (por instrumento, ubicación)
- **Estados de solicitud** (activa, cerrada, cancelada)

#### Datos de solicitud:
```
- Tipo de evento (servicio, boda, conferencia, etc.)
- Fecha y hora
- Ubicación (texto)
- Presupuesto (mínimo 600 DOP)
- Descripción
- Instrumento requerido
```

#### Pantallas necesarias:
- Pantalla de crear solicitud
- Pantalla de lista de solicitudes
- Pantalla de detalles de solicitud

---

### 3. 💰 **Sistema de Ofertas**

#### ¿Por qué es esencial?
Es la conexión entre músicos y líderes: músicos proponen sus servicios.

#### Funcionalidades mínimas:
- **Hacer oferta** a una solicitud
- **Ver ofertas recibidas** (para líderes)
- **Seleccionar oferta** (para líderes)
- **Estados de oferta** (pendiente, seleccionada, rechazada)

#### Datos de oferta:
```
- Precio propuesto
- Disponibilidad confirmada
- Mensaje personal
- Fecha de la oferta
```

#### Pantallas necesarias:
- Pantalla de hacer oferta
- Pantalla de ofertas recibidas
- Pantalla de ofertas enviadas

---

### 4. ✅ **Validación de Músicos**

#### ¿Por qué es esencial?
Garantiza la calidad y confiabilidad de los músicos en la plataforma.

#### Funcionalidades mínimas:
- **Panel de administración** para validar músicos
- **Lista de músicos pendientes** de validación
- **Aprobar/Rechazar** músicos
- **Notificación por email** del resultado

#### Estados de validación:
```
- Pendiente: Esperando validación
- Aprobado: Puede usar la app
- Rechazado: No puede usar la app
```

#### Pantallas necesarias:
- Panel de administración
- Lista de músicos pendientes
- Formulario de validación

---

## Funcionalidades de SOPORTE (Importantes pero no críticas)

### 5. 👤 **Gestión de Perfiles**

#### ¿Por qué es importante?
Los usuarios necesitan actualizar su información.

#### Funcionalidades:
- **Editar perfil** personal
- **Actualizar instrumentos** (músicos)
- **Cambiar información** de contacto
- **Ver perfil** de otros usuarios

### 6. 🔍 **Búsqueda y Filtros**

#### ¿Por qué es importante?
Facilita encontrar lo que buscan los usuarios.

#### Funcionalidades:
- **Filtrar solicitudes** por instrumento, ubicación, fecha
- **Buscar músicos** por nombre, instrumento
- **Ordenar resultados** por relevancia, precio, fecha

### 7. 📧 **Notificaciones Básicas**

#### ¿Por qué es importante?
Mantiene a los usuarios informados de cambios importantes.

#### Funcionalidades:
- **Email** para eventos importantes
- **Notificaciones in-app** básicas
- **Estados de solicitudes** y ofertas

---

## Funcionalidades OPCIONALES (Pueden agregarse después)

### 8. 📊 **Historial de Actividad**
- Historial de solicitudes (líderes)
- Historial de ofertas (músicos)
- Eventos completados

### 9. ⚙️ **Configuración de Usuario**
- Preferencias personales
- Configuración de notificaciones
- Privacidad

### 10. 📱 **Mejoras de UI/UX**
- Animaciones
- Mejores diseños
- Navegación mejorada

---

## Priorización de Desarrollo

### Fase 1: CRÍTICO (Semana 1-2)
1. **Registro de usuarios** ✅
2. **Sistema de solicitudes** ✅
3. **Sistema de ofertas** ✅
4. **Validación de músicos** ✅

### Fase 2: IMPORTANTE (Semana 3)
5. **Gestión de perfiles** ✅
6. **Búsqueda y filtros** ✅
7. **Notificaciones básicas** ✅

### Fase 3: OPCIONAL (Semana 4+)
8. **Historial de actividad** ⏳
9. **Configuración de usuario** ⏳
10. **Mejoras de UI/UX** ⏳

---

## Criterios de Éxito por Funcionalidad

### Registro de Usuarios
- ✅ Usuarios pueden registrarse en < 2 minutos
- ✅ Verificación de email funciona
- ✅ Diferentes roles se crean correctamente

### Sistema de Solicitudes
- ✅ Líderes pueden crear solicitudes en < 3 minutos
- ✅ Músicos pueden ver solicitudes relevantes
- ✅ Filtros básicos funcionan

### Sistema de Ofertas
- ✅ Músicos pueden hacer ofertas en < 2 minutos
- ✅ Líderes pueden ver todas las ofertas
- ✅ Selección de ofertas funciona

### Validación de Músicos
- ✅ Administradores pueden ver músicos pendientes
- ✅ Aprobación/rechazo funciona
- ✅ Notificaciones llegan a los músicos

---

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

---

## Conclusión

El MVP de Mussikon necesita **SOLO 4 funcionalidades core** para ser funcional:

1. **Registro de usuarios** - Para tener usuarios
2. **Sistema de solicitudes** - Para que líderes publiquen necesidades
3. **Sistema de ofertas** - Para que músicos propongan servicios
4. **Validación de músicos** - Para garantizar calidad

Con estas 4 funcionalidades, la app puede:
- Conectar líderes con músicos
- Facilitar la publicación de necesidades musicales
- Permitir ofertas de servicios
- Mantener calidad en la plataforma

**Todo lo demás es opcional y puede agregarse después del lanzamiento.**

## Referencias

- [Especificaciones MVP](./01-mvp-specifications.md)
- [Flujos de Usuario MVP](./03-user-flows-mvp.md)
- [Arquitectura MVP](./04-architecture-mvp.md)
