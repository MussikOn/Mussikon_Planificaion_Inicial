# 🎵 MUSSIKON - Plataforma de Conexión Musical Cristiana

## Descripción General

Mussikon es una plataforma móvil que conecta músicos cristianos con líderes de iglesias y ministerios, permitiendo que los líderes publiquen solicitudes de servicios musicales y los músicos hagan ofertas competitivas para obtener trabajos.

## Índice de Documentación

### 📋 Documentación Principal
- [**Visión General**](./docs/01-overview.md) - Concepto, objetivos y propuesta de valor
- [**Arquitectura del Sistema**](./docs/02-architecture.md) - Stack tecnológico y estructura técnica

### 💼 Lógica de Negocio
- [**Reglas de Negocio**](./docs/business/01-business-rules.md) - Reglas fundamentales del sistema
- [**Modelo de Datos**](./docs/business/02-data-model.md) - Estructura de datos y entidades
- [**Flujos de Trabajo**](./docs/business/03-workflows.md) - Procesos principales del negocio

### 💰 Sistema de Pagos
- [**Lógica de Cobro**](./docs/payments/01-payment-logic.md) - Comisiones, precios mínimos y cobros
- [**Integración de Pagos**](./docs/payments/02-payment-integration.md) - Pasarelas de pago y procesamiento
- [**Gestión de Transacciones**](./docs/payments/03-transaction-management.md) - Manejo de pagos y reembolsos

### 👤 Sistema de Registro
- [**Registro de Usuarios**](./docs/registration/01-user-registration.md) - Proceso de registro para líderes y músicos
- [**Validación de Músicos**](./docs/registration/02-musician-validation.md) - Sistema de aprobación de músicos
- [**Panel de Administración**](./docs/registration/03-admin-panel.md) - Herramientas de administración

### 📱 Uso de la Aplicación
- [**Guía de Usuario - Líderes**](./docs/usage/01-leader-guide.md) - Cómo usar la app como líder de iglesia
- [**Guía de Usuario - Músicos**](./docs/usage/02-musician-guide.md) - Cómo usar la app como músico
- [**Flujos de Usuario**](./docs/usage/03-user-flows.md) - Diagramas de flujo de usuario

### ⚙️ Funcionalidades
- [**Sistema de Solicitudes**](./docs/features/01-request-system.md) - Creación y gestión de solicitudes
- [**Sistema de Ofertas**](./docs/features/02-offer-system.md) - Ofertas competitivas de músicos
- [**Sistema de Calificaciones**](./docs/features/03-rating-system.md) - Reviews y reputación
- [**Sistema de Notificaciones**](./docs/features/04-notification-system.md) - Alertas y comunicaciones
- [**Sistema de Geolocalización**](./docs/features/05-geolocation-system.md) - Ubicación y mapas
- [**Sistema de Calendario**](./docs/features/06-calendar-system.md) - Gestión de fechas y eventos

### 🔧 Configuración Técnica
- [**Configuración de Moneda**](./docs/technical/01-currency-config.md) - Configuración de DOP y precios
- [**Configuración de Instrumentos**](./docs/technical/02-instruments-config.md) - Gestión de instrumentos musicales
- [**Configuración de Roles**](./docs/technical/03-roles-config.md) - Sistema de roles y permisos

## Características Principales

### Para Líderes de Iglesias
- Publicar solicitudes de servicios musicales
- Establecer presupuesto mínimo (600 DOP)
- Recibir y evaluar ofertas de músicos
- Seleccionar la mejor oferta
- Gestionar eventos y pagos

### Para Músicos
- Ver solicitudes disponibles
- Hacer ofertas competitivas
- Gestionar múltiples instrumentos
- Validación por administrador
- Recibir pagos automáticos

### Para Administradores
- Validar nuevos músicos
- Gestionar usuarios y contenido
- Monitorear transacciones
- Configurar parámetros del sistema

## Moneda y Precios

- **Moneda Principal:** Peso Dominicano (DOP)
- **Precio Mínimo por Solicitud:** 600 DOP
- **Comisión de la Plataforma:** 15-20% por transacción

## Tecnologías

- **Frontend:** React Native
- **Backend:** Node.js + Express
- **Base de Datos:** PostgreSQL
- **Pagos:** Stripe
- **Notificaciones:** Firebase
- **Maps:** Google Maps API

## Estado del Proyecto

🚧 **En Desarrollo** - Documentación y planificación completada, listo para implementación.

---

*Última actualización: Diciembre 2024*
