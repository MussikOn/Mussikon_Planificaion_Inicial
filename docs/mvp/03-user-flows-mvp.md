# Flujos de Usuario MVP - Mussikon

## Flujo Principal: Líder → Músico → Evento

### 1. 🔐 **Registro de Usuario**

#### Líder de Iglesia
```
1. Abrir app
2. Seleccionar "Soy Líder de Iglesia"
3. Llenar formulario:
   - Nombre completo
   - Email
   - Teléfono
   - Nombre de la iglesia
   - Ubicación
4. Verificar email
5. ¡Acceso inmediato a la app!
```

#### Músico
```
1. Abrir app
2. Seleccionar "Soy Músico"
3. Llenar formulario:
   - Nombre completo
   - Email
   - Teléfono
   - Instrumentos (múltiples)
   - Años de experiencia por instrumento
4. Verificar email
5. Esperar validación del administrador
6. Recibir notificación de aprobación/rechazo
7. ¡Acceso a la app!
```

---

### 2. 📝 **Crear Solicitud (Líder)**

```
1. Ir a "Crear Solicitud"
2. Llenar datos del evento:
   - Tipo de evento (servicio, boda, conferencia, etc.)
   - Fecha y hora
   - Ubicación (texto)
   - Presupuesto (mínimo 600 DOP)
   - Descripción
   - Instrumento requerido
3. Publicar solicitud
4. ¡Solicitud visible para músicos!
```

---

### 3. 💰 **Hacer Oferta (Músico)**

```
1. Ver lista de solicitudes disponibles
2. Filtrar por instrumento, ubicación, fecha
3. Seleccionar solicitud de interés
4. Ver detalles completos
5. Hacer oferta:
   - Precio propuesto
   - Confirmar disponibilidad
   - Mensaje personal
6. Enviar oferta
7. ¡Oferta enviada al líder!
```

---

### 4. ✅ **Seleccionar Músico (Líder)**

```
1. Ver ofertas recibidas en su solicitud
2. Revisar perfil de cada músico:
   - Información personal
   - Instrumentos y experiencia
   - Disponibilidad
3. Comparar ofertas:
   - Precio
   - Experiencia
   - Disponibilidad
4. Seleccionar mejor oferta
5. ¡Músico seleccionado!
```

---

### 5. 🔔 **Notificaciones**

#### Para Músicos
```
- Nueva solicitud disponible
- Tu oferta fue seleccionada
- Tu perfil fue aprobado/rechazado
```

#### Para Líderes
```
- Nueva oferta recibida
- Oferta seleccionada exitosamente
```

---

## Flujo de Administración

### 6. ✅ **Validar Músicos (Administrador)**

```
1. Acceder al panel de administración
2. Ver lista de músicos pendientes
3. Revisar información del músico:
   - Datos personales
   - Instrumentos y experiencia
   - Disponibilidad
4. Tomar decisión:
   - Aprobar → Músico puede usar la app
   - Rechazar → Músico no puede usar la app
   - Pendiente → Requiere más información
5. Notificar resultado al músico
```

---

## Flujos de Error y Casos Especiales

### 7. ❌ **Manejo de Errores**

#### Registro Fallido
```
1. Usuario llena formulario incorrectamente
2. App muestra error específico
3. Usuario corrige el error
4. Intenta registro nuevamente
```

#### Validación Rechazada
```
1. Músico recibe notificación de rechazo
2. Puede ver motivo del rechazo
3. Puede corregir información
4. Puede solicitar nueva validación
```

#### Oferta No Seleccionada
```
1. Músico hace oferta
2. Líder selecciona otra oferta
3. Músico recibe notificación
4. Puede hacer ofertas a otras solicitudes
```

---

## Flujos de Navegación

### 8. 🧭 **Navegación Principal**

#### Líderes
```
Home → Crear Solicitud → Ver Ofertas → Seleccionar Músico
  ↓
Perfil ← Historial de Solicitudes ← Configuración
```

#### Músicos
```
Home → Ver Solicitudes → Hacer Oferta → Ver Mis Ofertas
  ↓
Perfil ← Historial de Ofertas ← Configuración
```

#### Administradores
```
Panel Admin → Validar Músicos → Aprobar/Rechazar → Notificar
  ↓
Ver Músicos Aprobados ← Ver Músicos Rechazados ← Configuración
```

---

## Estados de la Aplicación

### 9. 📊 **Estados de Solicitudes**

```
Nueva → Activa → Con Ofertas → Seleccionada → Completada
  ↓
Cancelada (en cualquier momento)
```

### 10. 💰 **Estados de Ofertas**

```
Pendiente → Seleccionada → Confirmada
  ↓
Rechazada (por líder)
```

### 11. 👤 **Estados de Músicos**

```
Registrado → Pendiente → Aprobado → Activo
  ↓
Rechazado (por administrador)
```

---

## Flujos de Datos

### 12. 🔄 **Sincronización de Datos**

```
Usuario hace acción → App envía datos → Servidor procesa → Base de datos actualiza → Usuario recibe confirmación
```

### 13. 📧 **Flujo de Notificaciones**

```
Evento ocurre → Sistema detecta → Genera notificación → Envía email → Usuario recibe notificación
```

---

## Casos de Uso Principales

### 14. 🎯 **Caso de Uso 1: Líder necesita guitarrista**

```
1. Líder se registra
2. Crea solicitud: "Necesito guitarrista para domingo"
3. Músicos ven la solicitud
4. Guitarristas hacen ofertas
5. Líder selecciona mejor oferta
6. ¡Conexión exitosa!
```

### 15. 🎯 **Caso de Uso 2: Músico busca trabajo**

```
1. Músico se registra
2. Espera validación del administrador
3. Ve solicitudes disponibles
4. Hace ofertas a solicitudes relevantes
5. Líder selecciona su oferta
6. ¡Trabajo conseguido!
```

### 16. 🎯 **Caso de Uso 3: Administrador valida músicos**

```
1. Músico se registra
2. Administrador ve solicitud pendiente
3. Revisa información del músico
4. Aprueba o rechaza
5. Músico recibe notificación
6. ¡Validación completada!
```

---

## Métricas de Flujo

### 17. 📈 **Métricas de Éxito**

#### Tiempo de Completar Flujos
- **Registro de líder:** < 2 minutos
- **Registro de músico:** < 3 minutos
- **Crear solicitud:** < 2 minutos
- **Hacer oferta:** < 1 minuto
- **Seleccionar músico:** < 1 minuto
- **Validar músico:** < 30 segundos

#### Tasa de Completación
- **Registro exitoso:** > 90%
- **Solicitudes completadas:** > 70%
- **Ofertas seleccionadas:** > 30%
- **Validaciones aprobadas:** > 80%

---

## Conclusión

Los flujos de usuario del MVP están diseñados para ser:

1. **Simples:** Mínimos pasos posibles
2. **Claros:** Cada paso es obvio
3. **Rápidos:** Completar en pocos minutos
4. **Efectivos:** Logran el objetivo principal

Con estos flujos, los usuarios pueden:
- Conectarse fácilmente
- Publicar necesidades musicales
- Hacer ofertas de servicios
- Validar músicos confiables
- Coordinar eventos musicales

**Todo en menos de 5 minutos por flujo principal.**

## Referencias

- [Especificaciones MVP](./01-mvp-specifications.md)
- [Funcionalidades Core](./02-core-features.md)
- [Arquitectura MVP](./04-architecture-mvp.md)
