[Volver al Índice Principal](../../README.md)

# Explicación de `Create_trigger_function_to_update_updated_at_timestamp.sql`

Este archivo SQL define una función de disparador (`trigger function`) en PostgreSQL que actualiza automáticamente la columna `updated_at` de una tabla a la marca de tiempo actual cada vez que se actualiza una fila. También define dos disparadores que utilizan esta función para las tablas `musician_availability` y `pricing_config`.

---

```sql
-- Create trigger function to update updated_at timestamp
```
**Línea 1**: Este es un comentario que indica el propósito del script: crear una función de disparador para actualizar la marca de tiempo `updated_at`.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
```
**Línea 2**: Inicia la definición de una función. `CREATE OR REPLACE FUNCTION` significa que si la función ya existe, será reemplazada; de lo contrario, se creará una nueva. El nombre de la función es `update_updated_at_column`. Esta función no toma parámetros explícitos.

```sql
RETURNS TRIGGER AS $$
```
**Línea 3**: Indica que la función devuelve un tipo `TRIGGER`. Esto es necesario para las funciones que se usarán como disparadores. `$$` marca el inicio del cuerpo de la función.

```sql
BEGIN
```
**Línea 4**: Marca el inicio del bloque ejecutable de la función.

```sql
  NEW.updated_at = NOW();
```
**Línea 5**: Dentro de una función de disparador, `NEW` es una variable especial que representa la nueva fila de datos que se está insertando o actualizando. Esta línea establece el valor de la columna `updated_at` de la nueva fila a la marca de tiempo actual (`NOW()`).

```sql
  RETURN NEW;
```
**Línea 6**: La función de disparador debe devolver `NEW` (la fila modificada) para que la operación de inserción o actualización continúe con los cambios realizados por el disparador.

```sql
END;
```
**Línea 7**: Marca el final del bloque `BEGIN` de la función.

```sql
$$ LANGUAGE plpgsql;
```
**Línea 8**: Cierra el delimitador de cadena `$$` y especifica que el lenguaje de la función es `plpgsql` (Procedural Language/PostgreSQL).

```sql
-- Create triggers
```
**Línea 9**: Comentario que indica que la siguiente sección crea los disparadores.

```sql
CREATE TRIGGER update_musician_availability_updated_at
```
**Línea 10**: Inicia la creación de un disparador. El nombre del disparador es `update_musician_availability_updated_at`.

```sql
  BEFORE UPDATE ON musician_availability
```
**Línea 11**: Especifica que este disparador se ejecutará `BEFORE UPDATE` (antes de que se realice una operación de actualización) en la tabla `musician_availability`.

```sql
  FOR EACH ROW
```
**Línea 12**: Indica que el disparador se ejecutará una vez por cada fila afectada por la operación de actualización.

```sql
  EXECUTE FUNCTION update_updated_at_column();
```
**Línea 13**: Especifica que la función `update_updated_at_column()` se ejecutará cuando se active el disparador.

```sql
CREATE TRIGGER update_pricing_config_updated_at
```
**Línea 14**: Inicia la creación de un segundo disparador. El nombre del disparador es `update_pricing_config_updated_at`.

```sql
  BEFORE UPDATE ON pricing_config
```
**Línea 15**: Especifica que este disparador se ejecutará `BEFORE UPDATE` en la tabla `pricing_config`.

```sql
  FOR EACH ROW
```
**Línea 16**: Indica que el disparador se ejecutará una vez por cada fila afectada.

```sql
  EXECUTE FUNCTION update_updated_at_column();
```
**Línea 17**: Especifica que la función `update_updated_at_column()` se ejecutará cuando se active este disparador.