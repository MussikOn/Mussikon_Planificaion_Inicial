# Sistema de Validación de Músicos - Mussikon

## Proceso de Validación

### Flujo de Validación

#### 1. Registro Inicial
- **Músico se registra** con datos completos
- **Sistema valida** datos automáticamente
- **Músico queda** en estado "Pendiente de Validación"
- **Notificación** enviada al administrador

#### 2. Revisión por Administrador
- **Administrador recibe** notificación de nuevo músico
- **Revisa perfil** completo del músico
- **Verifica referencias** contactando a las personas
- **Evalúa portafolio** musical del candidato

#### 3. Decisión de Validación
- **Aprobado:** Músico recibe acceso completo
- **Rechazado:** Músico recibe notificación con motivo
- **Pendiente:** Se solicita información adicional
- **Sospechoso:** Se requiere investigación adicional

### Criterios de Validación

#### Requisitos Obligatorios (MVP)
- **Datos Personales:**
  - Nombre completo válido
  - Email verificado
  - Teléfono (formato válido, sin verificación)
  - Cédula de identidad (formato válido)

- **Información Musical:**
  - Al menos 1 instrumento seleccionado
  - Años de experiencia por cada instrumento
  - Al menos 1 género musical
  - Disponibilidad real

- **Referencias:** No requeridas en MVP

- **Portafolio:** No requerido en MVP

#### Criterios de Calidad (MVP)

##### Experiencia Musical
- **Años de Experiencia por Instrumento:**
  - Mínimo: 1 año en al menos un instrumento
  - Preferido: 3+ años en instrumento principal
  - Verificación: Solo formato de datos

- **Tipos de Experiencia:**
  - Servicios dominicales
  - Eventos especiales
  - Bodas cristianas
  - Conferencias
  - Retiros

##### Validación Simplificada (MVP)
- **Datos básicos:** Formato correcto
- **Experiencia:** Años declarados por instrumento
- **Disponibilidad:** Horarios realistas
- **Sin verificación externa:** Solo validación de formato

### Proceso de Revisión

#### Revisión Automática
- **Validación de datos:** Formato y completitud
- **Verificación de email:** Código de verificación
- **Verificación de teléfono:** SMS de verificación
- **Validación de cédula:** Formato y existencia

#### Revisión Manual
- **Portafolio musical:** Calidad y contenido
- **Referencias:** Verificación de contactos
- **Experiencia:** Credibilidad de la información
- **Identidad:** Verificación de documentos

### Tiempos de Validación

#### Tiempos Estándar
- **Revisión automática:** Inmediata
- **Revisión manual:** 24-48 horas hábiles
- **Verificación de referencias:** 1-3 días hábiles
- **Notificación de decisión:** Inmediata

#### Tiempos de Urgencia
- **Validación express:** 4-8 horas
- **Costo adicional:** 500 DOP
- **Disponibilidad:** Solo en horario laboral
- **Criterios:** Perfil excepcional

### Estados de Validación

#### Estados del Músico
- **Pendiente:** Esperando validación
- **En Revisión:** Siendo evaluado
- **Aprobado:** Validado y activo
- **Rechazado:** No cumple criterios
- **Suspenso:** Requiere más información
- **Sospechoso:** Requiere investigación

#### Estados del Administrador
- **Nuevo:** Músico recién registrado
- **En Proceso:** Siendo revisado
- **Completado:** Decisión tomada
- **Archivado:** Proceso finalizado

### Notificaciones

#### Para el Músico
- **Registro exitoso:** "Tu registro fue exitoso, espera validación"
- **En revisión:** "Tu perfil está siendo revisado"
- **Aprobado:** "¡Felicidades! Tu perfil fue aprobado"
- **Rechazado:** "Tu perfil no cumple los criterios"
- **Suspenso:** "Se requiere información adicional"

#### Para el Administrador
- **Nuevo músico:** "Nuevo músico registrado"
- **Referencia verificada:** "Referencia confirmada"
- **Portafolio revisado:** "Portafolio evaluado"
- **Decisión tomada:** "Validación completada"

### Criterios de Rechazo

#### Rechazo Automático
- **Datos incompletos:** Información faltante
- **Email inválido:** No se puede verificar
- **Teléfono inválido:** No se puede verificar
- **Cédula inválida:** Formato incorrecto

#### Rechazo Manual
- **Portafolio de baja calidad:** Videos/audio pobres
- **Referencias negativas:** Evaluaciones negativas
- **Experiencia insuficiente:** Menos de 1 año
- **Información falsa:** Datos incorrectos

#### Rechazo por Sospecha
- **Información contradictoria:** Datos inconsistentes
- **Referencias falsas:** Contactos inexistentes
- **Portafolio robado:** Contenido no original
- **Comportamiento sospechoso:** Actividad anómala

### Proceso de Apelación

#### Solicitud de Apelación
- **Tiempo límite:** 7 días después del rechazo
- **Motivo:** Explicación detallada
- **Evidencia adicional:** Documentos de respaldo
- **Revisión:** Por administrador senior

#### Revisión de Apelación
- **Evaluación adicional:** Revisión más detallada
- **Verificación extra:** Validación adicional
- **Decisión final:** Aprobación o rechazo definitivo
- **Notificación:** Resultado de la apelación

### Métricas de Validación

#### Métricas de Calidad
- **Tasa de aprobación:** % de músicos aprobados
- **Tiempo promedio:** Tiempo de validación
- **Calidad del portafolio:** Evaluación promedio
- **Satisfacción:** Feedback de músicos

#### Métricas de Eficiencia
- **Músicos por día:** Cantidad procesada
- **Tiempo por músico:** Eficiencia del proceso
- **Tasa de apelación:** % de apelaciones
- **Resolución de apelaciones:** Tiempo de resolución

### Herramientas de Validación

#### Panel de Administración
- **Lista de músicos:** Todos los registrados
- **Filtros:** Por estado, fecha, instrumento
- **Búsqueda:** Por nombre, email, teléfono
- **Acciones:** Aprobar, rechazar, suspender

#### Herramientas de Revisión
- **Reproductor de video:** Para portafolio
- **Reproductor de audio:** Para muestras
- **Verificador de referencias:** Contactos
- **Validador de documentos:** Cédula, etc.

#### Sistema de Notas
- **Notas del administrador:** Comentarios
- **Historial de cambios:** Registro de acciones
- **Comunicación:** Mensajes con músicos
- **Archivos adjuntos:** Documentos adicionales

## Referencias

- [Registro de Usuarios](./01-user-registration.md)
- [Panel de Administración](./03-admin-panel.md)
- [Reglas de Negocio](../business/01-business-rules.md)
- [Configuración de Roles](../technical/03-roles-config.md)
