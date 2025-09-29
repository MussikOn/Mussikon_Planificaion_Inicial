# Explicación de `Create_function_to_calculate_pricing.sql`

Este archivo SQL define una función en PostgreSQL llamada `calculate_event_price` que calcula el precio de un evento musical basándose en la duración del evento y una tarifa personalizada opcional. También considera comisiones de plataforma, tarifas de servicio e impuestos definidos en una tabla de configuración de precios.

---

```sql
-- Create function to calculate pricing
```
**Línea 1**: Este es un comentario que indica el propósito del script: crear una función para calcular precios.

```sql
CREATE OR REPLACE FUNCTION calculate_event_price(
```
**Línea 2**: Inicia la definición de una función. `CREATE OR REPLACE FUNCTION` significa que si la función ya existe, será reemplazada; de lo contrario, se creará una nueva. El nombre de la función es `calculate_event_price`.

```sql
  p_start_time TIME,
```
**Línea 3**: Define el primer parámetro de entrada de la función: `p_start_time` de tipo `TIME`. Representa la hora de inicio del evento.

```sql
  p_end_time TIME,
```
**Línea 4**: Define el segundo parámetro de entrada: `p_end_time` de tipo `TIME`. Representa la hora de finalización del evento.

```sql
  p_custom_rate DECIMAL(10,2) DEFAULT NULL
```
**Línea 5**: Define el tercer parámetro de entrada opcional: `p_custom_rate` de tipo `DECIMAL` con 10 dígitos en total y 2 decimales. Su valor por defecto es `NULL`, lo que permite usar una tarifa base si no se especifica una personalizada.

```sql
) RETURNS TABLE (
```
**Línea 6**: Indica que la función devolverá una tabla. Esto significa que el resultado de la función será un conjunto de filas con columnas predefinidas.

```sql
  base_hourly_rate DECIMAL(10,2),
```
**Línea 7**: Define la primera columna de la tabla de retorno: `base_hourly_rate` de tipo `DECIMAL(10,2)`. Representa la tarifa por hora utilizada en el cálculo.

```sql
  hours DECIMAL(4,2),
```
**Línea 8**: Define la segunda columna: `hours` de tipo `DECIMAL(4,2)`. Representa la duración del evento en horas.

```sql
  subtotal DECIMAL(10,2),
```
**Línea 9**: Define la tercera columna: `subtotal` de tipo `DECIMAL(10,2)`. Es el costo base del evento antes de comisiones, tarifas e impuestos.

```sql
  platform_commission DECIMAL(10,2),
```
**Línea 10**: Define la cuarta columna: `platform_commission` de tipo `DECIMAL(10,2)`. Es el monto de la comisión de la plataforma.

```sql
  service_fee DECIMAL(10,2),
```
**Línea 11**: Define la quinta columna: `service_fee` de tipo `DECIMAL(10,2)`. Es el monto de la tarifa de servicio.

```sql
  tax DECIMAL(10,2),
```
**Línea 12**: Define la sexta columna: `tax` de tipo `DECIMAL(10,2)`. Es el monto del impuesto aplicado.

```sql
  total DECIMAL(10,2),
```
**Línea 13**: Define la séptima columna: `total` de tipo `DECIMAL(10,2)`. Es el precio total final del evento.

```sql
  musician_earnings DECIMAL(10,2)
```
**Línea 14**: Define la octava columna: `musician_earnings` de tipo `DECIMAL(10,2)`. Es la cantidad que el músico ganará después de la comisión de la plataforma.

```sql
) AS $$
```
**Línea 15**: Marca el inicio del cuerpo de la función. `$$` es una forma de delimitar cadenas en PostgreSQL, útil para bloques de código.

```sql
DECLARE
```
**Línea 16**: Inicia la sección de declaración de variables locales dentro de la función.

```sql
  config_record pricing_config%ROWTYPE;
```
**Línea 17**: Declara una variable `config_record` que tendrá el mismo tipo de fila que la tabla `pricing_config`. Esto es útil para almacenar una fila completa de la configuración de precios.

```sql
  hourly_rate DECIMAL(10,2);
```
**Línea 18**: Declara `hourly_rate` como `DECIMAL(10,2)` para almacenar la tarifa por hora que se utilizará en el cálculo.

```sql
  event_hours DECIMAL(4,2);
```
**Línea 19**: Declara `event_hours` como `DECIMAL(4,2)` para almacenar la duración calculada del evento en horas.

```sql
  subtotal_amount DECIMAL(10,2);
```
**Línea 20**: Declara `subtotal_amount` como `DECIMAL(10,2)` para almacenar el subtotal del evento.

```sql
  commission_amount DECIMAL(10,2);
```
**Línea 21**: Declara `commission_amount` como `DECIMAL(10,2)` para almacenar el monto de la comisión.

```sql
  service_fee_amount DECIMAL(10,2);
```
**Línea 22**: Declara `service_fee_amount` como `DECIMAL(10,2)` para almacenar el monto de la tarifa de servicio.

```sql
  tax_amount DECIMAL(10,2);
```
**Línea 23**: Declara `tax_amount` como `DECIMAL(10,2)` para almacenar el monto del impuesto.

```sql
  total_amount DECIMAL(10,2);
```
**Línea 24**: Declara `total_amount` como `DECIMAL(10,2)` para almacenar el monto total.

```sql
  musician_earnings_amount DECIMAL(10,2);
```
**Línea 25**: Declara `musician_earnings_amount` como `DECIMAL(10,2)` para almacenar las ganancias del músico.

```sql
BEGIN
```
**Línea 26**: Marca el inicio del bloque ejecutable de la función.

```sql
  -- Get active pricing configuration
```
**Línea 27**: Comentario que indica que la siguiente sección obtiene la configuración de precios activa.

```sql
  SELECT * INTO config_record
```
**Línea 28**: Selecciona todas las columnas de una fila y las asigna a la variable `config_record`.

```sql
  FROM pricing_config
```
**Línea 29**: Especifica que la selección se realiza desde la tabla `pricing_config`.

```sql
  WHERE is_active = TRUE
```
**Línea 30**: Filtra las filas para seleccionar solo aquella donde la columna `is_active` es `TRUE`.

```sql
  LIMIT 1;
```
**Línea 31**: Limita el resultado a una sola fila, asegurando que solo se obtenga una configuración de precios activa.

```sql
  -- Use custom rate if provided, otherwise use base rate
```
**Línea 32**: Comentario que explica la lógica para determinar la tarifa por hora.

```sql
  hourly_rate := COALESCE(p_custom_rate, config_record.base_hourly_rate);
```
**Línea 33**: Asigna un valor a `hourly_rate`. `COALESCE` devuelve el primer argumento no nulo. Si `p_custom_rate` (la tarifa personalizada) no es nula, se usa; de lo contrario, se usa `config_record.base_hourly_rate` (la tarifa base de la configuración).

```sql
  -- Calculate hours
```
**Línea 34**: Comentario que indica el cálculo de las horas.

```sql
  event_hours := EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 3600;
```
**Línea 35**: Calcula la duración del evento en horas. `p_end_time - p_start_time` da un intervalo. `EXTRACT(EPOCH FROM ...)` convierte ese intervalo a segundos, y luego se divide por 3600 (segundos en una hora) para obtener las horas.

```sql
  -- Calculate subtotal
```
**Línea 36**: Comentario que indica el cálculo del subtotal.

```sql
  subtotal_amount := event_hours * hourly_rate;
```
**Línea 37**: Calcula el `subtotal_amount` multiplicando las horas del evento por la tarifa por hora.

```sql
  -- Calculate platform commission
```
**Línea 38**: Comentario que indica el cálculo de la comisión de la plataforma.

```sql
  commission_amount := subtotal_amount * config_record.platform_commission;
```
**Línea 39**: Calcula la `commission_amount` multiplicando el subtotal por el porcentaje de comisión de la plataforma de la configuración.

```sql
  -- Calculate service fee
```
**Línea 40**: Comentario que indica el cálculo de la tarifa de servicio.

```sql
  service_fee_amount := config_record.service_fee;
```
**Línea 41**: Asigna el valor de la tarifa de servicio directamente desde la configuración.

```sql
  -- Calculate total before tax
```
**Línea 42**: Comentario que indica el cálculo del total antes de impuestos.

```sql
  total_amount := subtotal_amount + commission_amount + service_fee_amount;
```
**Línea 43**: Calcula el `total_amount` sumando el subtotal, la comisión y la tarifa de servicio.

```sql
  -- Calculate tax
```
**Línea 44**: Comentario que indica el cálculo del impuesto.

```sql
  tax_amount := total_amount * config_record.tax_rate;
```
**Línea 45**: Calcula el `tax_amount` multiplicando el `total_amount` (antes de impuestos) por la tasa de impuestos de la configuración.

```sql
  -- Calculate final total
```
**Línea 46**: Comentario que indica el cálculo del total final.

```sql
  total_amount := total_amount + tax_amount;
```
**Línea 47**: Actualiza el `total_amount` sumándole el monto del impuesto.

```sql
  -- Calculate musician earnings (subtotal - platform commission)
```
**Línea 48**: Comentario que indica el cálculo de las ganancias del músico.

```sql
  musician_earnings_amount := subtotal_amount - commission_amount;
```
**Línea 49**: Calcula las `musician_earnings_amount` restando la comisión de la plataforma del subtotal.

```sql
  -- Return results
```
**Línea 50**: Comentario que indica que la siguiente sección devuelve los resultados.

```sql
  RETURN QUERY SELECT
```
**Línea 51**: `RETURN QUERY` se utiliza para devolver el resultado de una consulta como una tabla.

```sql
    hourly_rate,
```
**Línea 52**: Devuelve el valor calculado de `hourly_rate`.

```sql
    event_hours,
```
**Línea 53**: Devuelve el valor calculado de `event_hours`.

```sql
    subtotal_amount,
```
**Línea 54**: Devuelve el valor calculado de `subtotal_amount`.

```sql
    commission_amount,
```
**Línea 55**: Devuelve el valor calculado de `commission_amount`.

```sql
    service_fee_amount,
```
**Línea 56**: Devuelve el valor calculado de `service_fee_amount`.

```sql
    tax_amount,
```
**Línea 57**: Devuelve el valor calculado de `tax_amount`.

```sql
    total_amount,
```
**Línea 58**: Devuelve el valor calculado de `total_amount`.

```sql
    musician_earnings_amount;
```
**Línea 59**: Devuelve el valor calculado de `musician_earnings_amount`.

```sql
END;
```
**Línea 60**: Marca el final del bloque `BEGIN` de la función.

```sql
$$ LANGUAGE plpgsql;
```
**Línea 61**: Cierra el delimitador de cadena `$$` y especifica que el lenguaje de la función es `plpgsql` (Procedural Language/PostgreSQL).

[Volver al Índice Principal](../../README.md)