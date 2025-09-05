# Especificaciones MVP - Mussikon

## Resumen del MVP

La versión MVP (Minimum Viable Product) de Mussikon está diseñada para ser lo más simple posible, permitiendo un desarrollo rápido y un lanzamiento temprano para validar el concepto.

## Funcionalidades Incluidas en MVP

### ✅ Funcionalidades Core
- **Registro de usuarios** (líderes y músicos)
- **Sistema de solicitudes** (líderes publican necesidades)
- **Sistema de ofertas** (músicos hacen ofertas)
- **Validación de músicos** (administrador aprueba/rechaza)
- **Selección de músicos** (líderes eligen ofertas)
- **Gestión básica de eventos**

### ❌ Funcionalidades Excluidas del MVP
- **Sistema de pagos integrado** (Stripe)
- **Notificaciones push** (Firebase)
- **Google Maps API** (solo texto de ubicación)
- **Sistema de calificaciones** (reviews)
- **Portafolio musical** (videos/audio)
- **Sistema de comunicación** (chat interno)
- **Validación de teléfono** (SMS)
- **Sistema de referencias** (validación externa)

## Configuración Técnica MVP

### Stack Tecnológico Simplificado
- **Frontend:** React Native
- **Backend:** Node.js + Express
- **Base de Datos:** SQLite (local)
- **Pagos:** Manual (fuera de la app)
- **Notificaciones:** Push nativas básicas
- **Maps:** Sin integración (solo texto)

### Configuración de Moneda
- **Moneda:** Peso Dominicano (DOP)
- **Precio mínimo:** 600 DOP por solicitud
- **Duración mínima:** 2 horas para servicios por hora

### Rangos de Precio MVP
```
Servicios por Hora (duración mínima 2 horas):
- Guitarrista: 300-1,000 DOP/hora
- Pianista: 400-1,100 DOP/hora
- Baterista: 500-1,200 DOP/hora
- Bajista: 300-1,100 DOP/hora
- Cantante: 400-1,500 DOP/hora
- Violinista: 1,000-1,800 DOP/hora

Servicios por Evento:
- Servicio Dominical: 850-3,000 DOP
- Boda Cristiana: 1,000-8,000 DOP
- Conferencia: 900-5,000 DOP
- Retiro Juvenil: 1,500-4,000 DOP
```

## Proceso de Registro MVP

### Líderes de Iglesias
- **Registro inmediato** sin validación
- **Verificación de email** obligatoria
- **Teléfono:** Campo obligatorio sin validación
- **Límite:** 5 solicitudes activas simultáneamente

### Músicos
- **Registro pendiente** de validación
- **Verificación de email** obligatoria
- **Teléfono:** Campo obligatorio sin validación
- **Instrumentos:** Múltiples con años de experiencia
- **Portafolio:** No requerido
- **Referencias:** Opcionales
- **Validación:** Manual por administrador

## Panel de Administración MVP

### Funcionalidades Incluidas
- **Ver solicitudes pendientes** de músicos
- **Ver músicos aprobados** y rechazados
- **Aprobar músicos** (cambiar estado a "Aprobado")
- **Rechazar músicos** (cambiar estado a "Rechazado" con motivo)
- **Dejar pendiente** (mantener en estado "Pendiente")
- **Filtros básicos** (por estado, instrumento, nombre)
- **Búsqueda simple** (por nombre, email)

### Funcionalidades Excluidas
- **Gestión de transacciones**
- **Analytics avanzados**
- **Comunicación directa**
- **Moderación de contenido**
- **Configuración de parámetros**

## Flujo de Usuario MVP

### Para Líderes
1. **Registro** → Verificación de email
2. **Crear solicitud** → Detalles del evento
3. **Recibir ofertas** → Ver propuestas de músicos
4. **Seleccionar músico** → Elegir mejor oferta
5. **Coordinar evento** → Fuera de la app
6. **Pagar músico** → Fuera de la app

### Para Músicos
1. **Registro** → Verificación de email
2. **Esperar validación** → Aprobación del administrador
3. **Ver solicitudes** → Buscar oportunidades
4. **Hacer ofertas** → Proponer servicios
5. **Ser seleccionado** → Confirmar disponibilidad
6. **Realizar evento** → Fuera de la app
7. **Recibir pago** → Fuera de la app

### Para Administradores
1. **Acceder al panel** → Vista de administración
2. **Ver solicitudes** → Músicos pendientes
3. **Revisar perfil** → Datos del músico
4. **Tomar decisión** → Aprobar/Rechazar/Pendiente
5. **Notificar resultado** → Email al músico

## Criterios de Validación MVP

### Aprobación de Músicos
- **Datos completos:** Información requerida
- **Formato válido:** Email, teléfono, cédula
- **Al menos un instrumento:** Con años de experiencia
- **Disponibilidad realista:** Horarios coherentes

### Rechazo de Músicos
- **Datos incompletos:** Información faltante
- **Formato inválido:** Datos mal formateados
- **Sin instrumentos:** No seleccionó ningún instrumento
- **Experiencia insuficiente:** Menos de 1 año en todos los instrumentos

## Limitaciones del MVP

### Técnicas
- **Sin pagos automáticos:** Proceso manual
- **Sin notificaciones push:** Solo email
- **Sin geolocalización:** Solo texto de ubicación
- **Sin chat interno:** Comunicación externa
- **Base de datos local:** Sin sincronización en la nube

### Funcionales
- **Sin sistema de calificaciones:** No hay reviews
- **Sin portafolio musical:** Solo texto descriptivo
- **Sin validación de referencias:** Solo formato
- **Sin comunicación interna:** Solo datos de contacto
- **Sin analytics avanzados:** Solo métricas básicas

## Plan de Desarrollo MVP

### Fase 1: Desarrollo Core (4-6 semanas)
- **Semana 1-2:** Registro y autenticación
- **Semana 3-4:** Sistema de solicitudes y ofertas
- **Semana 5-6:** Panel de administración

### Fase 2: Testing y Refinamiento (2-3 semanas)
- **Semana 7:** Testing interno
- **Semana 8:** Testing con usuarios beta
- **Semana 9:** Refinamiento y correcciones

### Fase 3: Lanzamiento (1-2 semanas)
- **Semana 10:** Preparación para lanzamiento
- **Semana 11:** Lanzamiento oficial

## Métricas de Éxito MVP

### Métricas de Usuario
- **Usuarios registrados:** 100+ en el primer mes
- **Músicos validados:** 50+ en el primer mes
- **Solicitudes creadas:** 20+ en el primer mes
- **Ofertas realizadas:** 50+ en el primer mes

### Métricas de Negocio
- **Tasa de validación:** 80%+ de músicos aprobados
- **Tasa de finalización:** 70%+ de solicitudes completadas
- **Tiempo de validación:** <48 horas promedio
- **Satisfacción del usuario:** 4+ estrellas promedio

## Roadmap Post-MVP

### Versión 1.1 (2-3 meses después)
- **Sistema de pagos** integrado
- **Notificaciones push** básicas
- **Sistema de calificaciones** simple
- **Mejoras en UI/UX**

### Versión 1.2 (4-6 meses después)
- **Google Maps** integración
- **Sistema de comunicación** interno
- **Portafolio musical** básico
- **Analytics avanzados**

### Versión 2.0 (6-12 meses después)
- **Sistema de referencias** completo
- **Validación automática** con IA
- **Funcionalidades premium**
- **Expansión internacional**

## Referencias

- [Reglas de Negocio](../business/01-business-rules.md)
- [Lógica de Cobro](../payments/01-payment-logic.md)
- [Sistema de Registro](../registration/01-user-registration.md)
- [Panel de Administración MVP](../registration/03-admin-panel-mvp.md)
- [Configuración de Moneda](../technical/01-currency-config.md)
