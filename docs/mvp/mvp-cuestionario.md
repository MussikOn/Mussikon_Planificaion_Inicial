## Cuestionario de Verificación del MVP (Mussikon)

Instrucciones:
- Marca cada ítem con: [Sí] / [No] / [Parcial]
- Añade evidencia: endpoint, archivo, pantalla, captura o comentario breve
- Si está en “No/Parcial”, anota la acción pendiente

### 1) Autenticación y Registro
- [ ] ¿Registro de líderes operativo? Evidencia (endpoint UI/BE):
- [ ] ¿Registro de músicos operativo (queda “pending” hasta validación)? Evidencia:
- [ ] ¿Login con JWT funcional (token se guarda en app)? Evidencia:
- [ ] ¿Verificación de email funcionando (envío + validación de código)? Evidencia:
- [ ] ¿Recuperación de contraseña (solicitar, validar código, resetear)? Evidencia:

Acciones pendientes:

### 2) Solicitudes (Líder)
- [ ] ¿Crear solicitud con validación de presupuesto mínimo (≥ 600 DOP)? Evidencia:
- [ ] ¿Listar solicitudes propias con filtros básicos? Evidencia:
- [ ] ¿Ver detalle de solicitud? Evidencia:
- [ ] ¿Límite de 5 solicitudes activas por líder aplicado? Evidencia:
- [ ] ¿Estados de solicitud visibles (active/closed/cancelled)? Evidencia:

Acciones pendientes:

### 3) Ofertas (Músico)
- [ ] ¿Listar solicitudes disponibles para músicos aprobados? Evidencia:
- [ ] ¿Crear oferta (con precio propuesto) funcional? Evidencia:
- [ ] ¿Líder puede ver ofertas recibidas por solicitud? Evidencia:
- [ ] ¿Líder puede seleccionar o rechazar oferta? Evidencia:
- [ ] ¿Músico “pending” NO puede ofertar? Evidencia:

Acciones pendientes:

### 4) Validación de Músicos (Admin)
- [ ] ¿Listar músicos por estado (pending/active/rejected)? Evidencia:
- [ ] ¿Aprobar músico cambia estado a “active”? Evidencia:
- [ ] ¿Rechazar músico registra motivo? Evidencia:
- [ ] ¿Búsqueda/filtros básicos (instrumento, ubicación)? Evidencia:

Acciones pendientes:

### 5) Reglas de Precios (MVP)
- [ ] ¿Presupuesto mínimo de solicitud (≥ 600 DOP) aplicado a nivel backend? Evidencia:
- [ ] (Opcional MVP) ¿Duración mínima 2h para servicios por hora, si aplica al flujo? Evidencia:
- [ ] ¿La app muestra ayuda/guías de rango de precios (orientativo)? Evidencia:

Acciones pendientes:

### 6) Experiencia de Usuario (UX/UI mínimas)
- [ ] ¿Mensajes claros cuando músico está “pending” y no puede ofertar? Evidencia:
- [ ] ¿Confirmaciones/errores consistentes (creación, selección, rechazo)? Evidencia:
- [ ] ¿Navegación coherente (auth → tabs/admin) sin pantallas huérfanas? Evidencia:

Acciones pendientes:

### 7) Seguridad y Configuración
- [ ] ¿Variables sensibles sólo en `.env` (sin credenciales en repo)? Evidencia:
- [ ] ¿CORS y `URL_SERVER` parametrizados por entorno? Evidencia:
- [ ] ¿JWT secret no-hardcodeado y con expiración adecuada? Evidencia:

Acciones pendientes:

### 8) Base de Datos y Entorno
- [ ] ¿Esquema aplicado correctamente (users, user_passwords, user_instruments, requests, offers)? Evidencia:
- [ ] ¿Documentado el procedimiento para levantar el entorno (Supabase/alternativa)? Evidencia:
- [ ] ¿Datos semilla o cuentas de prueba disponibles (admin/leader/musician)? Evidencia:

Acciones pendientes:

### 9) Notificaciones (Post-MVP vs MVP)
- [ ] ¿Se limitan a email (si se usa) o están desactivadas si no son core? Evidencia:
- [ ] ¿Push no bloquea flujos si aún no está configurado? Evidencia:

Acciones pendientes:

### 10) Módulos fuera de alcance MVP (deben estar desactivados o no bloquear)
- [ ] Pagos/balances/transacciones no impiden flujos core (se ocultan o quedan inactivos). Evidencia:
- [ ] Pricing avanzado/gestión de eventos no bloquea creación/selección básica. Evidencia:

Acciones pendientes:

### 11) Documentación y QA
- [ ] ¿Swagger accesible con endpoints mínimos funcionando? Evidencia:
- [ ] ¿Guías de arranque rápido actualizadas (con Supabase, no SQLite)? Evidencia:
- [ ] ¿Scripts de prueba básicos corren (register/login/requests/offers)? Evidencia:

Acciones pendientes:

---

Resumen de brechas principales (anota aquí los “No/Parcial” priorizados):

- 
- 
- 

Siguientes pasos propuestos (acciones para cerrar el MVP):

- 
- 
- 


