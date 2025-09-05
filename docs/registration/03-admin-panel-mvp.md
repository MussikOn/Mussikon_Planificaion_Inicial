# Panel de Administración MVP - Mussikon

## Funcionalidades del Panel (MVP)

### Gestión de Validación de Músicos

#### Lista de Músicos Pendientes
- **Vista de tabla** con músicos en estado "Pendiente"
- **Información mostrada:**
  - Nombre completo
  - Email
  - Teléfono
  - Instrumentos seleccionados
  - Años de experiencia por instrumento
  - Fecha de registro
  - Estado actual

#### Acciones Disponibles
- **Aprobar:** Cambiar estado a "Aprobado"
- **Rechazar:** Cambiar estado a "Rechazado" con motivo
- **Pendiente:** Mantener en estado "Pendiente" para más revisión
- **Ver Detalles:** Expandir información completa del músico

#### Filtros y Búsqueda
- **Filtro por estado:** Pendiente, Aprobado, Rechazado
- **Filtro por instrumento:** Ver solo músicos de un instrumento específico
- **Búsqueda por nombre:** Buscar músico por nombre
- **Búsqueda por email:** Buscar músico por email
- **Ordenamiento:** Por fecha de registro, nombre, estado

### Vista de Detalles del Músico

#### Información Personal
- **Datos básicos:**
  - Nombre completo
  - Email
  - Teléfono
  - Cédula
  - Fecha de registro

#### Información Musical
- **Instrumentos seleccionados:**
  - Lista de instrumentos
  - Años de experiencia por cada uno
  - Nivel de experiencia declarado

- **Géneros musicales:**
  - Alabanza y adoración
  - Gospel
  - Música contemporánea
  - Música tradicional
  - Música clásica

- **Disponibilidad:**
  - Días de la semana
  - Horarios disponibles
  - Tipos de eventos

#### Referencias (Opcional)
- **Iglesia anterior:** Si fue proporcionada
- **Pastor de referencia:** Si fue proporcionado
- **Contacto de referencia:** Si fue proporcionado

### Proceso de Validación

#### Criterios de Aprobación (MVP)
- **Datos completos:** Toda la información requerida
- **Formato válido:** Email, teléfono, cédula en formato correcto
- **Al menos un instrumento:** Con años de experiencia
- **Disponibilidad realista:** Horarios coherentes

#### Criterios de Rechazo (MVP)
- **Datos incompletos:** Información faltante
- **Formato inválido:** Email, teléfono, cédula mal formateados
- **Sin instrumentos:** No seleccionó ningún instrumento
- **Experiencia insuficiente:** Menos de 1 año en todos los instrumentos

#### Estados de Validación
- **Pendiente:** Esperando revisión
- **Aprobado:** Validado y activo
- **Rechazado:** No cumple criterios
- **Sospechoso:** Requiere investigación adicional

### Interfaz del Panel

#### Dashboard Principal
- **Resumen de validaciones:**
  - Total de músicos registrados
  - Pendientes de validación
  - Aprobados este mes
  - Rechazados este mes

- **Gráficos básicos:**
  - Músicos por instrumento
  - Validaciones por día
  - Estado de validaciones

#### Lista de Músicos
- **Tabla principal:**
  - Checkbox para selección múltiple
  - Acciones en lote
  - Paginación
  - Ordenamiento por columnas

- **Acciones rápidas:**
  - Aprobar seleccionados
  - Rechazar seleccionados
  - Exportar lista
  - Enviar notificación

#### Formulario de Validación
- **Información del músico:** Solo lectura
- **Notas del administrador:** Campo de texto libre
- **Motivo de rechazo:** Si aplica
- **Acciones:** Aprobar, Rechazar, Pendiente

### Notificaciones del Sistema

#### Para Músicos
- **Aprobado:** "Tu perfil fue aprobado, ya puedes usar la app"
- **Rechazado:** "Tu perfil no cumple los criterios, revisa la información"
- **Pendiente:** "Tu perfil está siendo revisado, te notificaremos pronto"

#### Para Administradores
- **Nuevo músico:** "Nuevo músico registrado: [Nombre]"
- **Validación completada:** "Validación completada para [Nombre]"
- **Error en validación:** "Error al procesar validación de [Nombre]"

### Métricas del Panel

#### Métricas de Validación
- **Tiempo promedio:** Tiempo de validación por músico
- **Tasa de aprobación:** % de músicos aprobados
- **Tasa de rechazo:** % de músicos rechazados
- **Músicos por día:** Cantidad procesada diariamente

#### Métricas de Calidad
- **Músicos activos:** Que han hecho ofertas
- **Músicos exitosos:** Que han sido contratados
- **Satisfacción:** Feedback de líderes (futuro)
- **Retención:** Músicos que siguen activos

### Configuración del Panel

#### Parámetros de Validación
- **Tiempo límite:** Máximo tiempo para validar
- **Criterios mínimos:** Años de experiencia requeridos
- **Instrumentos requeridos:** Mínimo de instrumentos
- **Notificaciones:** Configurar alertas

#### Permisos de Usuario
- **Administrador principal:** Acceso completo
- **Moderador:** Solo validación de músicos
- **Soporte:** Solo vista de información
- **Auditor:** Solo reportes y métricas

### Reportes Básicos

#### Reporte de Validaciones
- **Período:** Fecha de inicio y fin
- **Estado:** Pendientes, aprobados, rechazados
- **Instrumento:** Por tipo de instrumento
- **Formato:** PDF, Excel, CSV

#### Reporte de Músicos Activos
- **Músicos aprobados:** Lista completa
- **Por instrumento:** Agrupados por instrumento
- **Por experiencia:** Agrupados por años
- **Por disponibilidad:** Por horarios

### Funcionalidades Futuras (Post-MVP)

#### Gestión Avanzada
- **Validación automática:** Con IA
- **Verificación de referencias:** Llamadas automáticas
- **Análisis de portafolio:** Evaluación automática
- **Sistema de calificaciones:** Reviews de líderes

#### Herramientas Adicionales
- **Comunicación directa:** Chat con músicos
- **Gestión de contenido:** Moderación de perfiles
- **Analytics avanzados:** Métricas detalladas
- **Integración con pagos:** Gestión de transacciones

## Referencias

- [Registro de Usuarios](./01-user-registration.md)
- [Validación de Músicos](./02-musician-validation.md)
- [Reglas de Negocio](../business/01-business-rules.md)
- [Configuración de Roles](../technical/03-roles-config.md)
