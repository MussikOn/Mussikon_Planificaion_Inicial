# Sistema de Registro de Usuarios - Mussikon

## Tipos de Usuario

### 1. Líderes de Iglesias
- **Registro:** Inmediato sin validación
- **Verificación:** Opcional
- **Límites:** 5 solicitudes activas (gratuito)
- **Premium:** Ilimitado con suscripción

### 2. Músicos
- **Registro:** Pendiente de validación
- **Aprobación:** Manual por administrador
- **Tiempo:** 24-48 horas hábiles
- **Documentos:** Cédula, referencias musicales

### 3. Administradores
- **Registro:** Solo por invitación
- **Acceso:** Panel de administración completo
- **Permisos:** Validación, moderación, configuración

## Proceso de Registro

### Registro de Líderes

#### Información Requerida
- **Datos Personales:**
  - Nombre completo
  - Email
  - Teléfono
  - Contraseña
  - Confirmación de contraseña

- **Datos de la Iglesia:**
  - Nombre de la iglesia
  - Denominación
  - Dirección
  - Ciudad
  - Provincia
  - Tamaño de la congregación

- **Información de Contacto:**
  - Nombre del pastor/líder
  - Cargo en la iglesia
  - Teléfono de contacto
  - Email de contacto

#### Validación
- **Email:** Verificación por código
- **Teléfono:** Verificación por SMS
- **Dirección:** Validación automática
- **Identidad:** Opcional

#### Flujo de Registro
```
1. Ingresar datos personales
2. Ingresar datos de la iglesia
3. Verificar email
4. Verificar teléfono
5. Confirmar registro
6. Acceso inmediato a la app
```

### Registro de Músicos

#### Información Requerida
- **Datos Personales:**
  - Nombre completo
  - Email
  - Teléfono
  - Contraseña
  - Confirmación de contraseña
  - Cédula de identidad

- **Información Musical:**
  - Instrumentos que toca (múltiples)
  - Años de experiencia
  - Géneros musicales
  - Estilo de música cristiana
  - Disponibilidad

- **Referencias:**
  - Iglesia anterior (opcional)
  - Pastor de referencia
  - Teléfono de referencia
  - Email de referencia

- **Portafolio:**
  - Fotos musicales
  - Videos de presentación
  - Audio de muestra
  - Certificaciones (opcional)

#### Validación
- **Email:** Verificación por código
- **Teléfono:** Verificación por SMS
- **Cédula:** Validación automática
- **Referencias:** Verificación manual
- **Portafolio:** Revisión manual

#### Flujo de Registro
```
1. Ingresar datos personales
2. Seleccionar instrumentos
3. Ingresar experiencia musical
4. Agregar referencias
5. Subir portafolio
6. Verificar email y teléfono
7. Enviar para validación
8. Esperar aprobación (24-48 horas)
9. Acceso a la app
```

## Sistema de Validación de Músicos

### Proceso de Validación

#### Validación Automática
- **Email:** Verificación de formato y existencia
- **Teléfono:** Verificación de formato y existencia
- **Cédula:** Validación de formato y existencia
- **Datos requeridos:** Verificación de completitud

#### Validación Manual
- **Referencias:** Llamada a referencias
- **Portafolio:** Revisión de calidad
- **Experiencia:** Verificación de credibilidad
- **Identidad:** Verificación de documentos

### Criterios de Aprobación

#### Requisitos Mínimos
- **Experiencia:** Mínimo 1 año
- **Referencias:** Al menos 1 referencia válida
- **Portafolio:** Al menos 1 video de calidad
- **Documentos:** Cédula válida

#### Criterios de Calidad
- **Portafolio:** Calidad profesional
- **Referencias:** Referencias positivas
- **Experiencia:** Experiencia relevante
- **Disponibilidad:** Disponibilidad real

### Proceso de Aprobación

#### Revisión Inicial
1. **Verificación automática** de datos
2. **Revisión de portafolio** por administrador
3. **Verificación de referencias** por administrador
4. **Evaluación general** del perfil

#### Decisión de Aprobación
- **Aprobado:** Acceso inmediato a la app
- **Rechazado:** Notificación con motivo
- **Pendiente:** Solicitud de información adicional
- **Sospechoso:** Investigación adicional

#### Notificación
- **Email:** Notificación de decisión
- **SMS:** Notificación de decisión
- **Push:** Notificación en la app
- **Motivo:** Explicación detallada

## Panel de Administración

### Funcionalidades del Panel

#### Gestión de Usuarios
- **Lista de usuarios:** Todos los usuarios registrados
- **Filtros:** Por tipo, estado, fecha
- **Búsqueda:** Por nombre, email, teléfono
- **Acciones:** Aprobar, rechazar, suspender

#### Validación de Músicos
- **Cola de validación:** Músicos pendientes
- **Detalles del perfil:** Información completa
- **Portafolio:** Revisión de videos y audio
- **Referencias:** Verificación de contactos
- **Decisión:** Aprobar o rechazar

#### Moderación de Contenido
- **Reportes de usuarios:** Quejas y denuncias
- **Moderación de perfiles:** Revisión de contenido
- **Suspensiones:** Suspender usuarios
- **Advertencias:** Enviar advertencias

#### Analytics y Reportes
- **Estadísticas de usuarios:** Registros, activos
- **Métricas de validación:** Tiempos, tasas
- **Reportes financieros:** Ingresos, transacciones
- **Métricas de calidad:** Calificaciones, disputas

### Interfaz del Panel

#### Dashboard Principal
- **Resumen general:** Usuarios, transacciones, ingresos
- **Gráficos:** Tendencias y métricas
- **Alertas:** Notificaciones importantes
- **Accesos rápidos:** Funciones principales

#### Gestión de Músicos
- **Lista de músicos:** Todos los músicos registrados
- **Filtros:** Por estado, instrumento, calificación
- **Acciones:** Ver perfil, aprobar, rechazar
- **Detalles:** Información completa del músico

#### Validación de Solicitudes
- **Cola de validación:** Músicos pendientes
- **Prioridad:** Por fecha de registro
- **Información:** Datos del músico
- **Acciones:** Aprobar, rechazar, solicitar más info

## Sistema de Roles y Permisos

### Roles de Usuario

#### Líder de Iglesia
- **Permisos:** Crear solicitudes, contratar músicos
- **Límites:** 5 solicitudes activas
- **Restricciones:** No puede validar músicos

#### Músico
- **Permisos:** Ver solicitudes, hacer ofertas
- **Límites:** Solo músicos validados
- **Restricciones:** No puede crear solicitudes

#### Administrador
- **Permisos:** Validar músicos, moderar contenido
- **Límites:** Acceso completo
- **Restricciones:** No puede usar la app como usuario

### Permisos por Funcionalidad

#### Gestión de Perfil
- **Líderes:** Editar perfil, cambiar datos
- **Músicos:** Editar perfil, actualizar portafolio
- **Administradores:** Ver todos los perfiles

#### Creación de Solicitudes
- **Líderes:** Crear, editar, cancelar
- **Músicos:** No permitido
- **Administradores:** Crear, editar, cancelar

#### Sistema de Ofertas
- **Líderes:** Ver ofertas, seleccionar
- **Músicos:** Hacer ofertas, modificar
- **Administradores:** Ver todas las ofertas

#### Validación de Músicos
- **Líderes:** No permitido
- **Músicos:** No permitido
- **Administradores:** Aprobar, rechazar, suspender

## Referencias

- [Validación de Músicos](./02-musician-validation.md)
- [Panel de Administración](./03-admin-panel.md)
- [Reglas de Negocio](../business/01-business-rules.md)
- [Configuración de Roles](../technical/03-roles-config.md)
