# Reglas de Negocio - Mussikon

## Reglas Fundamentales

### 1. Moneda y Precios

#### Moneda Principal
- **Moneda:** Peso Dominicano (DOP)
- **Símbolo:** $DOP o RD$
- **Formato de Visualización:** $1,500 DOP

#### Precios Mínimos
- **Precio Mínimo por Solicitud:** 600 DOP
- **No se permiten solicitudes** por debajo de este monto
- **Validación automática** en el frontend y backend

#### Rangos de Precio Sugeridos
```
Servicios por Hora:
- Guitarrista: 600-1,200 DOP/hora
- Pianista: 800-1,500 DOP/hora
- Baterista: 1,000-1,800 DOP/hora
- Bajista: 600-1,200 DOP/hora
- Cantante: 800-1,500 DOP/hora
- Violinista: 1,000-1,800 DOP/hora

Servicios por Evento:
- Servicio Dominical: 1,500-3,000 DOP
- Boda Cristiana: 3,000-8,000 DOP
- Conferencia: 2,000-5,000 DOP
- Retiro Juvenil: 1,500-4,000 DOP
```

### 2. Sistema de Comisiones

#### Comisión de la Plataforma
- **Porcentaje:** 15-20% del valor total del servicio
- **Cálculo:** Comisión = (Precio del Servicio × 0.15) o (Precio del Servicio × 0.20)
- **Mínimo:** 100 DOP por transacción
- **Máximo:** 2,000 DOP por transacción

#### Distribución de Pagos
```
Ejemplo: Servicio de 2,000 DOP
- Comisión (20%): 400 DOP
- Músico recibe: 1,600 DOP
- Plataforma recibe: 400 DOP
```

### 3. Validación de Usuarios

#### Líderes de Iglesias
- **Registro inmediato** sin validación
- **Verificación opcional** de identidad
- **Límite de solicitudes:** 5 activas simultáneamente (gratuito)
- **Límite premium:** Ilimitado con suscripción

#### Músicos
- **Registro pendiente** de validación
- **Aprobación manual** por administrador
- **Documentos requeridos:** Cédula, referencias musicales
- **Tiempo de validación:** 24-48 horas hábiles

### 4. Sistema de Ofertas

#### Reglas de Ofertas
- **Tiempo límite:** 24-48 horas para hacer ofertas
- **Múltiples ofertas:** Músicos pueden hacer varias ofertas por solicitud
- **Modificación:** Ofertas pueden modificarse antes del cierre
- **Cancelación:** Ofertas pueden cancelarse antes de ser seleccionadas

#### Selección de Ofertas
- **Criterios de selección:**
  1. Precio (40% de peso)
  2. Calificación del músico (30% de peso)
  3. Distancia (20% de peso)
  4. Disponibilidad (10% de peso)

### 5. Sistema de Calificaciones

#### Escala de Calificación
- **Rango:** 1 a 5 estrellas
- **Incremento:** 0.1 estrellas
- **Calificación mínima:** 1.0
- **Calificación máxima:** 5.0

#### Reglas de Calificación
- **Obligatoria:** Ambas partes deben calificar
- **Tiempo límite:** 48 horas después del evento
- **Modificación:** No se permite modificar calificaciones
- **Promedio:** Se calcula automáticamente

### 6. Sistema de Pagos

#### Métodos de Pago Aceptados
- **Tarjeta de crédito/débito** (Visa, Mastercard)
- **Transferencia bancaria**
- **Pago móvil** (OPP, ATH Móvil)
- **Efectivo** (opcional, con validación)

#### Reglas de Pago
- **Pago anticipado:** 50% al confirmar, 50% al completar
- **Reembolsos:** Solo por cancelación del líder
- **Disputas:** Resolución en 48 horas
- **Retención:** 5% por 7 días para disputas

### 7. Sistema de Cancelaciones

#### Cancelaciones por Líder
- **Antes de 24 horas:** Reembolso completo
- **Entre 24-2 horas:** Reembolso del 50%
- **Menos de 2 horas:** Sin reembolso
- **No show:** Sin reembolso

#### Cancelaciones por Músico
- **Antes de 24 horas:** Sin penalización
- **Entre 24-2 horas:** Penalización del 10%
- **Menos de 2 horas:** Penalización del 25%
- **No show:** Penalización del 50%

### 8. Sistema de Sanciones

#### Sanciones por Músicos
- **Calificación < 3.0:** Suspensión temporal (7 días)
- **Calificación < 2.0:** Suspensión temporal (30 días)
- **Calificación < 1.5:** Suspensión permanente
- **No show:** Suspensión temporal (14 días)

#### Sanciones por Líderes
- **Cancelaciones frecuentes:** Límite de solicitudes
- **Calificación < 3.0:** Advertencia
- **Calificación < 2.0:** Suspensión temporal (7 días)
- **Calificación < 1.5:** Suspensión temporal (30 días)

### 9. Sistema de Notificaciones

#### Notificaciones Obligatorias
- **Nueva solicitud** (para músicos)
- **Nueva oferta** (para líderes)
- **Oferta seleccionada** (para músicos)
- **Recordatorio de evento** (24 horas antes)
- **Solicitud de calificación** (después del evento)

#### Notificaciones Opcionales
- **Ofertas similares** (para músicos)
- **Solicitudes similares** (para líderes)
- **Promociones y ofertas**
- **Actualizaciones de la app**

### 10. Sistema de Geolocalización

#### Radio de Búsqueda
- **Mínimo:** 1 km
- **Máximo:** 50 km
- **Predeterminado:** 10 km
- **Filtros:** Por ciudad, provincia, región

#### Reglas de Ubicación
- **Verificación:** Ubicación debe ser verificada
- **Actualización:** Ubicación puede actualizarse
- **Privacidad:** Ubicación exacta no se comparte
- **Distancia:** Se muestra distancia aproximada

## Referencias

- [Modelo de Datos](../business/02-data-model.md)
- [Flujos de Trabajo](../business/03-workflows.md)
- [Lógica de Cobro](../payments/01-payment-logic.md)
- [Sistema de Registro](../registration/01-user-registration.md)
- [Configuración de Moneda](../technical/01-currency-config.md)
