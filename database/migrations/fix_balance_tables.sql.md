[Volver al Índice Principal](../../README.md)

# Explicación de `fix_balance_tables.sql`

Este script SQL está diseñado para asegurar la integridad de la tabla `user_balances` y para inicializar los balances de los usuarios que aún no los tienen. Realiza dos acciones principales: primero, verifica y crea una restricción `UNIQUE` en la columna `user_id` de la tabla `user_balances` si no existe; segundo, inserta registros de balance iniciales para todos los usuarios existentes que aún no tienen un balance asociado.

---

```sql
-- Verificar si la restricción UNIQUE existe en user_balances
-- Si no existe, crearla
DO $$
BEGIN
    -- Verificar si la restricción unique_user_id existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_user_id' 
        AND conrelid = 'user_balances'::regclass
    ) THEN
        -- Crear la restricción UNIQUE
        ALTER TABLE user_balances ADD CONSTRAINT unique_user_id UNIQUE (user_id);
        RAISE NOTICE 'Restricción UNIQUE creada en user_balances';
    ELSE
        RAISE NOTICE 'La restricción UNIQUE ya existe en user_balances';
    END IF;
END $$;
```
**Línea 1-17**: Este bloque `DO $$ BEGIN ... END $$;` es un bloque anónimo de PL/pgSQL que se ejecuta una sola vez. Su propósito es verificar la existencia de una restricción `UNIQUE` en la tabla `user_balances` y crearla si no está presente.
- **Línea 1-2**: Comentarios que describen la intención del bloque: verificar y crear una restricción `UNIQUE`.
- **Línea 3**: Inicia el bloque anónimo de PL/pgSQL.
- **Línea 5-10**: La cláusula `IF NOT EXISTS (...) THEN` verifica si ya existe una restricción con el nombre `unique_user_id` en la tabla `user_balances`.
    - `SELECT 1 FROM pg_constraint`: Consulta la tabla del sistema `pg_constraint` que almacena información sobre las restricciones de la base de datos.
    - `WHERE conname = 'unique_user_id'`: Filtra por el nombre de la restricción.
    - `AND conrelid = 'user_balances'::regclass`: Filtra por la tabla a la que pertenece la restricción, usando `::regclass` para convertir el nombre de la tabla a su OID (identificador de objeto).
- **Línea 12**: Si la restricción no existe, se ejecuta `ALTER TABLE user_balances ADD CONSTRAINT unique_user_id UNIQUE (user_id);` para añadir la restricción `UNIQUE` a la columna `user_id`. Esto asegura que cada usuario solo pueda tener un registro de balance.
- **Línea 13**: `RAISE NOTICE 'Restricción UNIQUE creada en user_balances';` emite un mensaje informativo si la restricción fue creada.
- **Línea 15**: Si la restricción ya existe, se ejecuta `RAISE NOTICE 'La restricción UNIQUE ya existe en user_balances';` para informar que no se realizó ningún cambio.
- **Línea 17**: Finaliza el bloque anónimo.

```sql
-- Ahora insertar los balances iniciales
INSERT INTO user_balances (user_id, total_earnings, pending_earnings, available_balance, currency)
SELECT id, 0.00, 0.00, 0.00, 'DOP'
FROM users
WHERE id NOT IN (SELECT user_id FROM user_balances)
ON CONFLICT (user_id) DO NOTHING;
```
**Línea 19-24**: Este bloque inserta balances iniciales para los usuarios que aún no tienen un registro en la tabla `user_balances`.
- **Línea 19**: Comentario que indica la siguiente acción.
- **Línea 20-21**: `INSERT INTO user_balances (...) SELECT ...`: Esta es una sentencia `INSERT` con un `SELECT` subyacente.
    - Se insertan valores en las columnas `user_id`, `total_earnings`, `pending_earnings`, `available_balance` y `currency`.
    - `SELECT id, 0.00, 0.00, 0.00, 'DOP' FROM users`: Selecciona el `id` de cada usuario de la tabla `users` y asigna valores iniciales de `0.00` para las ganancias y `DOP` (pesos dominicanos) como moneda.
- **Línea 23**: `WHERE id NOT IN (SELECT user_id FROM user_balances)`: Esta cláusula asegura que solo se inserten balances para los usuarios cuyo `id` no existe ya en la tabla `user_balances`. Esto previene la duplicación de registros.
- **Línea 24**: `ON CONFLICT (user_id) DO NOTHING;`: Esta cláusula maneja posibles conflictos si, por alguna razón, se intenta insertar un `user_id` que ya existe (a pesar de la cláusula `WHERE` anterior). En caso de conflicto en la columna `user_id` (que ahora tiene una restricción `UNIQUE`), la acción es `DO NOTHING`, lo que significa que la inserción se ignora silenciosamente sin generar un error.