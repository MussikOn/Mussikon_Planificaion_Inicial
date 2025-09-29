# Documentación del Archivo `verify_notifications_table.sql`

Este script SQL está diseñado para verificar la existencia y, si es necesario, crear o corregir la tabla `notifications` en una base de datos. Incluye la definición de la tabla con sus columnas, claves, referencias, índices para optimizar el rendimiento, la habilitación de la seguridad a nivel de fila (RLS) con políticas específicas para que los usuarios puedan ver y actualizar sus propias notificaciones, y el sistema pueda insertar notificaciones. También define una función para limpiar notificaciones antiguas y un trigger para actualizar automáticamente la columna `updated_at`.

---

## Contenido del Archivo Línea por Línea:

```sql
-- Script para verificar y corregir la tabla de notificaciones
-- Ejecutar en Supabase
```
- **`-- Script para verificar y corregir la tabla de notificaciones`**: Comentario que indica el propósito general del script.
- **`-- Ejecutar en Supabase`**: Comentario que especifica el entorno de ejecución recomendado para este script.

```sql
-- Verificar si la tabla existe
```
- **`-- Verificar si la tabla existe`**: Comentario que introduce la sección de verificación de existencia de la tabla.

```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications'
) AS table_exists;
```
- **`SELECT EXISTS (...) AS table_exists;`**: Esta consulta verifica si la tabla `notifications` existe en el esquema `public`. Retorna un valor booleano (`true` o `false`) como `table_exists`.

```sql
-- Verificar estructura de la tabla
```
- **`-- Verificar estructura de la tabla`**: Comentario que introduce la sección de verificación de la estructura de la tabla.

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```
- **`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'notifications' AND table_schema = 'public' ORDER BY ordinal_position;`**: Esta consulta selecciona información detallada sobre las columnas de la tabla `notifications` (nombre, tipo de dato, si es nula, valor por defecto), ordenadas por su posición ordinal.

```sql
-- Verificar políticas RLS
```
- **`-- Verificar políticas RLS`**: Comentario que introduce la sección de verificación de políticas RLS.

```sql
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'notifications';
```
- **`SELECT policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'notifications';`**: Esta consulta muestra las políticas de seguridad a nivel de fila (RLS) definidas para la tabla `notifications`, incluyendo su nombre, si son permisivas, los roles a los que aplican, el comando (SELECT, INSERT, etc.) y la condición de calificación.

```sql
-- Si la tabla no existe o está incompleta, crearla/corregirla
```
- **`-- Si la tabla no existe o está incompleta, crearla/corregirla`**: Comentario que indica la acción de creación/corrección de la tabla.

```sql
CREATE TABLE IF NOT EXISTS notifications (
```
- **`CREATE TABLE IF NOT EXISTS notifications (`**: Inicia la creación de la tabla `notifications`. `IF NOT EXISTS` previene errores si la tabla ya existe.

```sql
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
```
- **`id UUID DEFAULT gen_random_uuid() PRIMARY KEY,`**: Define la columna `id` como un UUID, clave primaria, con un valor por defecto generado aleatoriamente.

```sql
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
```
- **`user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,`**: Define `user_id` como un UUID no nulo, clave foránea que referencia a la tabla `users`. `ON DELETE CASCADE` asegura la eliminación en cascada.

```sql
    title VARCHAR(255) NOT NULL,
```
- **`title VARCHAR(255) NOT NULL,`**: Define `title` como una cadena de texto no nula de hasta 255 caracteres, para el título de la notificación.

```sql
    message TEXT NOT NULL,
```
- **`message TEXT NOT NULL,`**: Define `message` como un campo de texto no nulo, para el contenido del mensaje de la notificación.

```sql
    type VARCHAR(50) NOT NULL DEFAULT 'info',
```
- **`type VARCHAR(50) NOT NULL DEFAULT 'info',`**: Define `type` como una cadena de texto no nula de hasta 50 caracteres, con un valor por defecto de `'info'`, para el tipo de notificación (ej. info, warning, error, success).

```sql
    read BOOLEAN DEFAULT FALSE,
```
- **`read BOOLEAN DEFAULT FALSE,`**: Define `read` como un booleano, con un valor por defecto de `FALSE`, para indicar si la notificación ha sido leída.

```sql
    data JSONB,
```
- **`data JSONB,`**: Define `data` como un campo `JSONB`, para almacenar datos adicionales en formato JSON.

```sql
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
```
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),`**: Define `created_at` para registrar la fecha y hora de creación de la notificación, con la fecha y hora actual como valor por defecto.

```sql
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define `updated_at` para registrar la última fecha y hora de modificación de la notificación, con la fecha y hora actual como valor por defecto.
- **`);`**: Cierra la definición de la tabla `notifications`.

```sql
-- Crear índices si no existen
```
- **`-- Crear índices si no existen`**: Comentario que introduce la creación de índices para mejorar el rendimiento.

```sql
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
```
- **`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`**: Crea un índice en la columna `user_id` de la tabla `notifications` para acelerar las búsquedas por usuario.

```sql
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
```
- **`CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);`**: Crea un índice en la columna `read` de la tabla `notifications` para optimizar las consultas que filtran por notificaciones leídas o no leídas.

```sql
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
```
- **`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);`**: Crea un índice en la columna `created_at` de la tabla `notifications` para optimizar las consultas basadas en la fecha de creación.

```sql
-- Habilitar RLS
```
- **`-- Habilitar RLS`**: Comentario que indica la habilitación de la seguridad a nivel de fila.

```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```
- **`ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;`**: Habilita la seguridad a nivel de fila (RLS) para la tabla `notifications`.

```sql
-- Crear políticas RLS si no existen
```
- **`-- Crear políticas RLS si no existen`**: Comentario que introduce la definición de las políticas RLS.

```sql
DO $$
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can view their own notifications'
    ) THEN
        CREATE POLICY "Users can view their own notifications" ON notifications
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Política para INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'System can insert notifications'
    ) THEN
        CREATE POLICY "System can insert notifications" ON notifications
            FOR INSERT WITH CHECK (true);
    END IF;

    -- Política para UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can update their own notifications'
    ) THEN
        CREATE POLICY "Users can update their own notifications" ON notifications
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;
```
- **`DO $$ BEGIN ... END $$;`**: Bloque de código PL/pgSQL que permite ejecutar sentencias condicionales. Esto es útil para crear políticas solo si no existen, evitando errores.
- **`IF NOT EXISTS (...) THEN CREATE POLICY ... END IF;`**: Dentro del bloque `DO $$`, estas sentencias verifican la existencia de políticas RLS específicas (`Users can view their own notifications`, `System can insert notifications`, `Users can update their own notifications`) para la tabla `notifications` y las crean si no existen.
    - **`FOR SELECT USING (auth.uid() = user_id);`**: Permite a los usuarios ver solo sus propias notificaciones.
    - **`FOR INSERT WITH CHECK (true);`**: Permite al sistema insertar notificaciones (sin restricciones adicionales de usuario).
    - **`FOR UPDATE USING (auth.uid() = user_id);`**: Permite a los usuarios actualizar solo sus propias notificaciones.

```sql
-- Función para limpiar notificaciones antiguas
```
- **`-- Función para limpiar notificaciones antiguas`**: Comentario que introduce la función para limpiar notificaciones antiguas.

```sql
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    -- Eliminar notificaciones leídas de más de 30 días
    DELETE FROM notifications 
    WHERE read = true AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
```
- **`CREATE OR REPLACE FUNCTION cleanup_old_notifications() RETURNS void AS $$ ... $$ LANGUAGE plpgsql;`**: Define o reemplaza una función llamada `cleanup_old_notifications` que no retorna ningún valor (`void`).
- **`DELETE FROM notifications WHERE read = true AND created_at < NOW() - INTERVAL '30 days';`**: Dentro de la función, esta sentencia `DELETE` elimina las notificaciones que han sido leídas (`read = true`) y que fueron creadas hace más de 30 días.

```sql
-- Trigger para actualizar updated_at
```
- **`-- Trigger para actualizar updated_at`**: Comentario que introduce el trigger para actualizar la columna `updated_at`.

```sql
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
- **`CREATE OR REPLACE FUNCTION update_notifications_updated_at() RETURNS TRIGGER AS $$ ... $$ LANGUAGE plpgsql;`**: Define o reemplaza una función llamada `update_notifications_updated_at`. Esta función es un `TRIGGER` que se ejecuta antes de una operación de actualización en una tabla. Establece el valor de `updated_at` a la fecha y hora actual (`NOW()`) y retorna la nueva fila (`NEW`).

```sql
-- Crear trigger si no existe
```
- **`-- Crear trigger si no existe`**: Comentario que introduce la creación del trigger.

```sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_notifications_updated_at'
    ) THEN
        CREATE TRIGGER update_notifications_updated_at
            BEFORE UPDATE ON notifications
            FOR EACH ROW
            EXECUTE FUNCTION update_notifications_updated_at();
    END IF;
END $$;
```
- **`DO $$ BEGIN ... END $$;`**: Bloque de código PL/pgSQL para ejecutar sentencias condicionales.
- **`IF NOT EXISTS (...) THEN CREATE TRIGGER ... END IF;`**: Dentro del bloque `DO $$`, esta sentencia verifica si el trigger `update_notifications_updated_at` ya existe y lo crea si no. Este trigger se ejecuta `BEFORE UPDATE` en la tabla `notifications` `FOR EACH ROW`, llamando a la función `update_notifications_updated_at()`.

```sql
-- Comentarios
```
- **`-- Comentarios`**: Comentario que introduce la sección de comentarios para tablas y columnas.

```sql
COMMENT ON TABLE notifications IS 'Notificaciones del sistema para usuarios';
COMMENT ON COLUMN notifications.user_id IS 'ID del usuario que recibe la notificación';
COMMENT ON COLUMN notifications.title IS 'Título de la notificación';
COMMENT ON COLUMN notifications.message IS 'Mensaje de la notificación';
COMMENT ON COLUMN notifications.type IS 'Tipo de notificación (info, warning, error, success)';
COMMENT ON COLUMN notifications.read IS 'Indica si la notificación ha sido leída';
COMMENT ON COLUMN notifications.data IS 'Datos adicionales en formato JSON';
```
- **`COMMENT ON TABLE ... IS ...;`**: Añade un comentario descriptivo a la tabla `notifications`.
- **`COMMENT ON COLUMN ... IS ...;`**: Añade comentarios descriptivos a las columnas `user_id`, `title`, `message`, `type`, `read` y `data` de la tabla `notifications`.

```sql
-- Verificar que todo esté configurado correctamente
```
- **`-- Verificar que todo esté configurado correctamente`**: Comentario que introduce la sección de verificación final.

```sql
SELECT 'Tabla notifications verificada y configurada correctamente' AS status;
```
- **`SELECT 'Tabla notifications verificada y configurada correctamente' AS status;`**: Retorna un mensaje de confirmación de que la tabla ha sido verificada y configurada correctamente.