# Documentación del Archivo `insert_initial_balances.sql`

Este script SQL está diseñado para insertar balances iniciales en la tabla `user_balances` para todos los usuarios existentes en la tabla `users` que aún no tienen un registro de balance. Utiliza una subconsulta para asegurar que no se inserten duplicados, garantizando que cada usuario tenga solo un registro de balance.

---

## Contenido del Archivo Línea por Línea:

```sql
-- Insertar balances iniciales para usuarios existentes
```
- **`-- Insertar balances iniciales para usuarios existentes`**: Comentario que indica el propósito principal del script.

```sql
-- Usando una subconsulta para evitar duplicados
```
- **`-- Usando una subconsulta para evitar duplicados`**: Comentario que explica la estrategia utilizada para prevenir la inserción de registros duplicados.

```sql
INSERT INTO user_balances (user_id, total_earnings, pending_earnings, available_balance, currency)
```
- **`INSERT INTO user_balances (...)`**: Inicia una sentencia `INSERT` para añadir nuevos registros a la tabla `user_balances`. Se especifican las columnas `user_id`, `total_earnings`, `pending_earnings`, `available_balance` y `currency`.

```sql
SELECT 
    u.id, 
    0.00, 
    0.00, 
    0.00, 
    'DOP'
```
- **`SELECT u.id, 0.00, 0.00, 0.00, 'DOP'`**: Esta subconsulta selecciona los datos que se insertarán. Para cada usuario (`u.id`), se establecen `total_earnings`, `pending_earnings` y `available_balance` en `0.00`, y la `currency` en `'DOP'`.

```sql
FROM users u
```
- **`FROM users u`**: Indica que los datos se obtienen de la tabla `users`, a la que se le asigna el alias `u`.

```sql
LEFT JOIN user_balances ub ON u.id = ub.user_id
```
- **`LEFT JOIN user_balances ub ON u.id = ub.user_id`**: Realiza un `LEFT JOIN` con la tabla `user_balances` (alias `ub`) utilizando `user_id` como clave de unión. Esto permite incluir todos los usuarios de la tabla `users` y, si existen, sus balances correspondientes.

```sql
WHERE ub.user_id IS NULL;
```
- **`WHERE ub.user_id IS NULL;`**: Esta cláusula `WHERE` filtra los resultados del `LEFT JOIN`. Solo se seleccionan los usuarios de la tabla `users` para los cuales no hay un registro coincidente en la tabla `user_balances` (es decir, `ub.user_id` es `NULL`). Esto asegura que solo se inserten balances para usuarios que aún no tienen uno.