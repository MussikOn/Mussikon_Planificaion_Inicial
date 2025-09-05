# Configuración de Moneda - Mussikon

## Configuración Principal

### Moneda Base
- **Código ISO:** DOP (Peso Dominicano)
- **Símbolo:** $DOP o RD$
- **Formato de Visualización:** $1,500 DOP
- **Decimales:** 2 (1,500.00 DOP)
- **Separador de miles:** Coma (,)
- **Separador decimal:** Punto (.)

### Configuración Regional
- **País:** República Dominicana
- **Idioma:** Español (es-DO)
- **Zona horaria:** America/Santo_Domingo (UTC-4)
- **Formato de fecha:** DD/MM/YYYY
- **Formato de hora:** 24 horas (HH:MM)

## Precios Mínimos

### Precio Mínimo por Solicitud
- **Monto:** 600 DOP
- **Aplicación:** Todas las solicitudes
- **Validación:** Frontend y backend
- **Mensaje de error:** "El precio mínimo es de 600 DOP"
- **Configuración:** No modificable por usuarios

### Precios Mínimos por Instrumento
```
Guitarrista:     600 DOP/hora
Pianista:        800 DOP/hora
Baterista:       1,000 DOP/hora
Bajista:         600 DOP/hora
Cantante:        800 DOP/hora
Violinista:      1,000 DOP/hora
Trompetista:     800 DOP/hora
Saxofonista:     800 DOP/hora
```

### Precios Mínimos por Evento
```
Servicio Dominical:    1,500 DOP
Boda Cristiana:        3,000 DOP
Conferencia:           2,000 DOP
Retiro Juvenil:        1,500 DOP
Evento Especial:       2,000 DOP
Funeral Cristiano:     1,500 DOP
Bautizo:              1,000 DOP
```

## Rangos de Precio

### Servicios por Hora (MVP - duración mínima 2 horas)
- **Guitarrista:** 300 - 1,000 DOP/hora
- **Pianista:** 400 - 1,100 DOP/hora
- **Baterista:** 500 - 1,200 DOP/hora
- **Bajista:** 300 - 1,100 DOP/hora
- **Cantante:** 400 - 1,500 DOP/hora
- **Violinista:** 1,000 - 1,800 DOP/hora

### Servicios por Evento (MVP)
- **Servicio Dominical:** 850 - 3,000 DOP
- **Boda Cristiana:** 1,000 - 8,000 DOP
- **Conferencia:** 900 - 5,000 DOP
- **Retiro Juvenil:** 1,500 - 4,000 DOP

### Servicios por Duración
- **Por Hora:** 600 - 1,800 DOP
- **Por Evento:** 1,000 - 8,000 DOP
- **Por Día:** 2,000 - 10,000 DOP
- **Por Semana:** 8,000 - 30,000 DOP
- **Por Mes:** 25,000 - 80,000 DOP

## Configuración de Comisiones

### Comisión de la Plataforma
- **Usuarios Gratuitos:** 20% del valor del servicio
- **Usuarios Premium:** 15% del valor del servicio
- **Usuarios VIP:** 12% del valor del servicio

### Límites de Comisión
- **Mínimo:** 100 DOP (servicios < 500 DOP)
- **Máximo:** 2,000 DOP (servicios > 10,000 DOP)
- **Aplicación:** Automática en el cálculo

### Ejemplos de Cálculo
```
Servicio: 2,000 DOP
├── Usuario Gratuito (20%): 400 DOP
├── Usuario Premium (15%): 300 DOP
└── Usuario VIP (12%): 240 DOP

Servicio: 5,000 DOP
├── Usuario Gratuito (20%): 1,000 DOP
├── Usuario Premium (15%): 750 DOP
└── Usuario VIP (12%): 600 DOP
```

## Configuración de Pagos

### Métodos de Pago Aceptados
- **Tarjeta de crédito/débito:** Visa, Mastercard
- **Transferencia bancaria:** Bancos locales
- **Pago móvil:** OPP, ATH Móvil
- **Efectivo:** Opcional, con validación

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

## Configuración de Reembolsos

### Política de Reembolsos
- **Cancelación del líder:** Reembolso completo
- **Cancelación del músico:** Sin reembolso
- **No show del músico:** Reembolso completo
- **No show del líder:** Sin reembolso

### Tiempos de Reembolso
- **Tarjeta:** 3-5 días hábiles
- **Transferencia:** 1-3 días hábiles
- **Pago móvil:** 1-2 días hábiles
- **Efectivo:** Validación manual

## Configuración de Retención

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

## Configuración de Descuentos

### Descuentos por Volumen
- **5+ eventos/mes:** 5% de descuento
- **10+ eventos/mes:** 10% de descuento
- **20+ eventos/mes:** 15% de descuento
- **Aplicación:** Automática

### Descuentos por Lealtad
- **6+ meses activo:** 5% de descuento
- **12+ meses activo:** 10% de descuento
- **24+ meses activo:** 15% de descuento
- **Aplicación:** Automática

### Descuentos Especiales
- **Primera solicitud:** 10% de descuento
- **Referir amigo:** 5% de descuento
- **Eventos de caridad:** 20% de descuento
- **Aplicación:** Manual

## Configuración de Impuestos

### Impuestos Aplicables
- **ITBIS:** 18% (Impuesto sobre Transferencias de Bienes Industrializados y Servicios)
- **Aplicación:** Solo a servicios > 1,000 DOP
- **Inclusión:** En el precio final
- **Exención:** Servicios de caridad

### Cálculo de Impuestos
```
Servicio: 2,000 DOP
├── ITBIS (18%): 360 DOP
├── Total con impuestos: 2,360 DOP
├── Comisión (20%): 472 DOP
└── Músico recibe: 1,888 DOP
```

## Configuración de Monedas Futuras

### Expansión Planificada
- **USD:** Dólar estadounidense
- **EUR:** Euro
- **MXN:** Peso mexicano
- **COP:** Peso colombiano

### Configuración de Conversión
- **Tipo de cambio:** Automático
- **Actualización:** Diaria
- **Fuente:** API de cambio de divisas
- **Precisión:** 4 decimales

### Configuración Regional
- **USD:** Estados Unidos
- **EUR:** España
- **MXN:** México
- **COP:** Colombia

## Configuración de Reportes

### Reportes Financieros
- **Moneda base:** DOP
- **Conversión:** Automática a USD
- **Formato:** PDF, Excel, CSV
- **Frecuencia:** Diaria, semanal, mensual

### Métricas de Precio
- **Precio promedio:** Por instrumento, evento
- **Rango de precios:** Mínimo, máximo, mediana
- **Tendencias:** Evolución de precios
- **Comparación:** Por región, temporada

## Referencias

- [Lógica de Cobro](../payments/01-payment-logic.md)
- [Reglas de Negocio](../business/01-business-rules.md)
- [Integración de Pagos](../payments/02-payment-integration.md)
- [Gestión de Transacciones](../payments/03-transaction-management.md)
