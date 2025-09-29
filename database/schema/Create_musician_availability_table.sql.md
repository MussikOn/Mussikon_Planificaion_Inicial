# Documentación de `Create_musician_availability_table.sql`

Este script SQL se encarga de gestionar la disponibilidad de los músicos en la plataforma. A continuación, se detalla su funcionalidad línea por línea:

## 1. Creación de la Tabla `musician_availability`

```sql
CREATE TABLE IF NOT EXISTS musician_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  musician_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_blocked BOOLEAN DEFAULT FALSE,
  reason VARCHAR(255), -- 'event', 'travel_buffer', 'unavailable'
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **`CREATE TABLE IF NOT EXISTS musician_availability`**: Esta línea inicia la creación de la tabla `musician_availability` si no existe ya.
- **`id UUID DEFAULT gen_random_uuid() PRIMARY KEY`**: Define la columna `id` como un identificador único universal (UUID), con un valor por defecto generado aleatoriamente, y la establece como clave primaria.
- **`musician_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`**: Define `musician_id` como un UUID que no puede ser nulo. Es una clave foránea que referencia la columna `id` de la tabla `users`. `ON DELETE CASCADE` significa que si un usuario es eliminado, todas sus entradas de disponibilidad también lo serán.
- **`event_date DATE NOT NULL`**: Define la columna `event_date` para almacenar la fecha del evento, no puede ser nula.
- **`start_time TIME NOT NULL`**: Define la columna `start_time` para almacenar la hora de inicio del evento, no puede ser nula.
- **`end_time TIME NOT NULL`**: Define la columna `end_time` para almacenar la hora de finalización del evento, no puede ser nula.
- **`is_blocked BOOLEAN DEFAULT FALSE`**: Define `is_blocked` como un booleano, con un valor por defecto de `FALSE`, indicando si el horario está bloqueado.
- **`reason VARCHAR(255)`**: Define `reason` como una cadena de texto de hasta 255 caracteres para almacenar la razón del bloqueo (por ejemplo, 'event', 'travel_buffer', 'unavailable').
- **`request_id UUID REFERENCES requests(id) ON DELETE CASCADE`**: Define `request_id` como un UUID que referencia la columna `id` de la tabla `requests`. Si una solicitud es eliminada, las entradas de disponibilidad asociadas también lo serán.
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define `created_at` para registrar la fecha y hora de creación, con la hora actual como valor por defecto.
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define `updated_at` para registrar la última fecha y hora de actualización, con la hora actual como valor por defecto.

## 2. Adición de Columnas de Tiempo a la Tabla `requests`

```sql
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME;
```
- **`ALTER TABLE requests`**: Modifica la tabla `requests`.
- **`ADD COLUMN IF NOT EXISTS start_time TIME`**: Añade la columna `start_time` de tipo `TIME` si no existe.
- **`ADD COLUMN IF NOT EXISTS end_time TIME`**: Añade la columna `end_time` de tipo `TIME` si no existe.

## 3. Creación de Índices para Rendimiento

```sql
CREATE INDEX IF NOT EXISTS idx_musician_availability_musician_date 
ON musician_availability(musician_id, event_date);

CREATE INDEX IF NOT EXISTS idx_musician_availability_date_time 
ON musician_availability(event_date, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_musician_availability_blocked 
ON musician_availability(is_blocked);
```
- **`CREATE INDEX IF NOT EXISTS idx_musician_availability_musician_date ON musician_availability(musician_id, event_date)`**: Crea un índice en `musician_availability` para búsquedas eficientes por `musician_id` y `event_date`.
- **`CREATE INDEX IF NOT EXISTS idx_musician_availability_date_time ON musician_availability(event_date, start_time, end_time)`**: Crea un índice para búsquedas por `event_date`, `start_time` y `end_time`.
- **`CREATE INDEX IF NOT EXISTS idx_musician_availability_blocked ON musician_availability(is_blocked)`**: Crea un índice para búsquedas por el estado `is_blocked`.

## 4. Habilitación de RLS (Row Level Security)

```sql
ALTER TABLE musician_availability ENABLE ROW LEVEL SECURITY;
```
- **`ALTER TABLE musician_availability ENABLE ROW LEVEL SECURITY`**: Habilita la seguridad a nivel de fila para la tabla `musician_availability`, permitiendo un control granular sobre quién puede acceder a qué filas.

## 5. Creación de Políticas de Seguridad

```sql
CREATE POLICY "Musicians can manage their own availability" ON musician_availability
  FOR ALL USING (musician_id = auth.uid());

CREATE POLICY "Admins can manage all availability" ON musician_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
```
- **`CREATE POLICY "Musicians can manage their own availability" ... FOR ALL USING (musician_id = auth.uid())`**: Crea una política que permite a los músicos (identificados por `auth.uid()`) gestionar (ver, insertar, actualizar, eliminar) solo sus propias entradas en `musician_availability`.
- **`CREATE POLICY "Admins can manage all availability" ...`**: Crea una política que permite a los usuarios con el rol de 'admin' gestionar todas las entradas en `musician_availability`.

## 6. Creación de Funciones de Utilidad

### `check_availability_conflict`

```sql
CREATE OR REPLACE FUNCTION check_availability_conflict(
  p_musician_id UUID,
  p_event_date DATE,
  p_start_time TIME,
  p_end_time TIME
) RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check for conflicts considering 1.5 hour travel buffer
  SELECT COUNT(*) INTO conflict_count
  FROM musician_availability
  WHERE musician_id = p_musician_id
    AND event_date = p_event_date
    AND is_blocked = TRUE
    AND (
      -- New event starts before existing event ends + travel buffer
      p_start_time < (end_time + INTERVAL '90 minutes')
      OR
      -- New event ends after existing event starts
      p_end_time > start_time
    );
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;
```
- **`CREATE OR REPLACE FUNCTION check_availability_conflict(...)`**: Define o reemplaza una función que verifica conflictos de disponibilidad.
- **`p_musician_id UUID, p_event_date DATE, p_start_time TIME, p_end_time TIME`**: Parámetros de entrada para la función: ID del músico, fecha del evento, hora de inicio y hora de fin.
- **`RETURNS BOOLEAN`**: La función devuelve un valor booleano (`TRUE` si hay conflicto, `FALSE` si no).
- **`DECLARE conflict_count INTEGER;`**: Declara una variable local para contar los conflictos.
- **`SELECT COUNT(*) INTO conflict_count ...`**: Consulta la tabla `musician_availability` para encontrar entradas bloqueadas que se superpongan con el horario propuesto, considerando un buffer de 90 minutos (1.5 horas) después de la hora de finalización de un evento existente.
- **`RETURN conflict_count > 0;`**: Devuelve `TRUE` si se encuentra al menos un conflicto, `FALSE` en caso contrario.

### `block_availability_with_buffer`

```sql
CREATE OR REPLACE FUNCTION block_availability_with_buffer(
  p_musician_id UUID,
  p_event_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_request_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Block the actual event time
  INSERT INTO musician_availability (
    musician_id, event_date, start_time, end_time, 
    is_blocked, reason, request_id
  ) VALUES (
    p_musician_id, p_event_date, p_start_time, p_end_time,
    TRUE, 'event', p_request_id
  );
  
  -- Block travel buffer time (1.5 hours after event ends)
  INSERT INTO musician_availability (
    musician_id, event_date, start_time, end_time,
    is_blocked, reason, request_id
  ) VALUES (
    p_musician_id, p_event_date, 
    p_end_time, 
    (p_end_time + INTERVAL '90 minutes'),
    TRUE, 'travel_buffer', p_request_id
  );
END;
$$ LANGUAGE plpgsql;
```
- **`CREATE OR REPLACE FUNCTION block_availability_with_buffer(...)`**: Define o reemplaza una función para bloquear la disponibilidad de un músico, incluyendo un buffer de tiempo para el viaje.
- **`p_musician_id UUID, p_event_date DATE, p_start_time TIME, p_end_time TIME, p_request_id UUID DEFAULT NULL`**: Parámetros de entrada: ID del músico, fecha, horas de inicio y fin del evento, y un ID de solicitud opcional.
- **`RETURNS VOID`**: La función no devuelve ningún valor.
- **`INSERT INTO musician_availability (...) VALUES (...)`**: Inserta una entrada en `musician_availability` para el tiempo real del evento, marcándolo como bloqueado con la razón 'event'.
- **`INSERT INTO musician_availability (...) VALUES (...)`**: Inserta una segunda entrada para el tiempo de buffer de viaje (90 minutos después del final del evento), marcándolo como bloqueado con la razón 'travel_buffer'.

---
Este documento proporciona una explicación detallada del script `Create_musician_availability_table.sql`.