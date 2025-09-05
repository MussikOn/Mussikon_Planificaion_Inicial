# Lógica de Cobro - Mussikon

## Configuración de Moneda

### Moneda Principal
- **Código:** DOP (Peso Dominicano)
- **Símbolo:** $DOP o RD$
- **Formato de Visualización:** $1,500 DOP
- **Decimales:** 2 (1,500.00 DOP)

### Conversión de Monedas
- **Solo DOP** en la versión inicial
- **Expansión futura:** USD, EUR, MXN
- **Tipo de cambio:** Fijo para DOP (1:1)

## Estructura de Precios

### Precio Mínimo por Solicitud
- **Monto:** 600 DOP
- **Aplicación:** Todas las solicitudes
- **Validación:** Frontend y backend
- **Mensaje de error:** "El precio mínimo es de 600 DOP"

### Rangos de Precio por Servicio

#### Servicios por Hora
```
Guitarrista:     600 - 1,200 DOP/hora
Pianista:        800 - 1,500 DOP/hora
Baterista:       1,000 - 1,800 DOP/hora
Bajista:         600 - 1,200 DOP/hora
Cantante:        800 - 1,500 DOP/hora
Violinista:      1,000 - 1,800 DOP/hora
Trompetista:     800 - 1,500 DOP/hora
Saxofonista:     800 - 1,500 DOP/hora
```

#### Servicios por Evento
```
Servicio Dominical:    1,500 - 3,000 DOP
Boda Cristiana:        3,000 - 8,000 DOP
Conferencia:           2,000 - 5,000 DOP
Retiro Juvenil:        1,500 - 4,000 DOP
Evento Especial:       2,000 - 6,000 DOP
Funeral Cristiano:     1,500 - 3,500 DOP
Bautizo:              1,000 - 2,500 DOP
```

#### Servicios por Duración
```
Por Hora:              600 - 1,800 DOP
Por Evento:            1,000 - 8,000 DOP
Por Día:               2,000 - 10,000 DOP
Por Semana:            8,000 - 30,000 DOP
Por Mes:               25,000 - 80,000 DOP
```

## Sistema de Comisiones

### Comisión de la Plataforma
- **Porcentaje:** 15-20% del valor total del servicio
- **Cálculo dinámico:** Basado en el tipo de usuario
- **Mínimo:** 100 DOP por transacción
- **Máximo:** 2,000 DOP por transacción

### Cálculo de Comisiones

#### Usuarios Gratuitos
- **Comisión:** 20% del valor del servicio
- **Ejemplo:** Servicio de 2,000 DOP
  - Comisión: 400 DOP (20%)
  - Músico recibe: 1,600 DOP

#### Usuarios Premium
- **Comisión:** 15% del valor del servicio
- **Ejemplo:** Servicio de 2,000 DOP
  - Comisión: 300 DOP (15%)
  - Músico recibe: 1,700 DOP

#### Usuarios VIP
- **Comisión:** 12% del valor del servicio
- **Ejemplo:** Servicio de 2,000 DOP
  - Comisión: 240 DOP (12%)
  - Músico recibe: 1,760 DOP

### Límites de Comisión
- **Mínimo:** 100 DOP (servicios < 500 DOP)
- **Máximo:** 2,000 DOP (servicios > 10,000 DOP)
- **Aplicación:** Automática en el cálculo

## Estructura de Pagos

### Flujo de Pago
1. **Líder confirma** la contratación
2. **Sistema calcula** comisión automáticamente
3. **Líder paga** el monto total
4. **Sistema retiene** la comisión
5. **Músico recibe** el monto neto
6. **Transacción se completa**

### División de Pagos
```
Servicio: 3,000 DOP
├── Comisión (20%): 600 DOP
├── Músico recibe: 2,400 DOP
└── Plataforma recibe: 600 DOP
```

### Pagos por Etapas
- **Pago anticipado:** 50% al confirmar
- **Pago final:** 50% al completar el servicio
- **Comisión:** Se aplica al pago final

## Métodos de Pago

### Métodos Aceptados
- **Tarjeta de crédito/débito** (Visa, Mastercard)
- **Transferencia bancaria**
- **Pago móvil** (OPP, ATH Móvil)
- **Efectivo** (opcional, con validación)

### Procesamiento de Pagos
- **Pasarela principal:** Stripe
- **Pasarela secundaria:** PayPal
- **Pago móvil:** Integración con bancos locales
- **Efectivo:** Validación manual

### Tiempos de Procesamiento
- **Tarjeta:** Inmediato
- **Transferencia:** 1-3 días hábiles
- **Pago móvil:** Inmediato
- **Efectivo:** Validación manual (24 horas)

## Sistema de Reembolsos

### Política de Reembolsos
- **Cancelación del líder:** Reembolso completo
- **Cancelación del músico:** Sin reembolso
- **No show del músico:** Reembolso completo
- **No show del líder:** Sin reembolso

### Proceso de Reembolso
1. **Solicitud de reembolso** por el líder
2. **Validación** del motivo
3. **Aprobación** automática o manual
4. **Procesamiento** del reembolso
5. **Notificación** a ambas partes

### Tiempos de Reembolso
- **Tarjeta:** 3-5 días hábiles
- **Transferencia:** 1-3 días hábiles
- **Pago móvil:** 1-2 días hábiles
- **Efectivo:** Validación manual

## Sistema de Disputas

### Tipos de Disputas
- **Calidad del servicio:** Músico no cumplió expectativas
- **Pago no recibido:** Músico no recibió pago
- **Cancelación injusta:** Cancelación sin motivo válido
- **No show:** Una de las partes no se presentó

### Proceso de Disputa
1. **Reporte** de la disputa
2. **Investigación** por el equipo de soporte
3. **Resolución** en 48 horas
4. **Notificación** de la decisión
5. **Implementación** de la resolución

### Resolución de Disputas
- **A favor del líder:** Reembolso completo
- **A favor del músico:** Pago completo
- **Resolución parcial:** División del pago
- **Sin resolución:** Mantener el pago original

## Sistema de Retención

### Retención de Pagos
- **Período:** 7 días después del evento
- **Propósito:** Resolver disputas
- **Monto:** 5% del valor del servicio
- **Liberación:** Automática después del período

### Casos de Retención
- **Disputa activa:** Hasta resolución
- **Calificación pendiente:** Hasta calificación
- **Sospecha de fraude:** Hasta investigación
- **Cancelación tardía:** Hasta validación

## Reportes Financieros

### Reportes para Músicos
- **Ingresos mensuales:** Total de pagos recibidos
- **Comisiones pagadas:** Total de comisiones
- **Servicios completados:** Número de servicios
- **Calificaciones promedio:** Promedio de calificaciones

### Reportes para Líderes
- **Gastos mensuales:** Total de pagos realizados
- **Servicios contratados:** Número de servicios
- **Músicos favoritos:** Lista de músicos preferidos
- **Historial de pagos:** Detalle de transacciones

### Reportes para Administradores
- **Ingresos de la plataforma:** Total de comisiones
- **Volumen de transacciones:** Número de transacciones
- **Métricas de pago:** Tiempos y métodos
- **Disputas resueltas:** Estadísticas de disputas

## Referencias

- [Integración de Pagos](./02-payment-integration.md)
- [Gestión de Transacciones](./03-transaction-management.md)
- [Reglas de Negocio](../business/01-business-rules.md)
- [Configuración de Moneda](../technical/01-currency-config.md)
