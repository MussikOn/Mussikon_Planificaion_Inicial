# Documentación de `Create_notifications_table.sql`

Este script SQL se encarga de crear y configurar la tabla `notifications` para gestionar las notificaciones de los usuarios en la plataforma. A continuación, se detalla su funcionalidad línea por línea:

## 1. Creación de la Tabla `notifications`

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **`CREATE TABLE IF NOT EXISTS notifications`**: Esta línea inicia la creación de la tabla `notifications` si no existe ya.
- **`id UUID DEFAULT gen_random_uuid() PRIMARY KEY`**: Define la columna `id` como un identificador único universal (UUID), con un valor por defecto generado aleatoriamente, y la establece como clave primaria.
- **`user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`**: Define `user_id` como un UUID que no puede ser nulo. Es una clave foránea que referencia la columna `id` de la tabla `users`. `ON DELETE CASCADE` significa que si un usuario es eliminado, todas sus notificaciones también lo serán.
- **`title VARCHAR(255) NOT NULL`**: Define la columna `title` para almacenar el título de la notificación, con un máximo de 255 caracteres y no puede ser nulo.
- **`message TEXT NOT NULL`**: Define la columna `message` para almacenar el contenido completo de la notificación, no puede ser nulo.
- **`type VARCHAR(50) NOT NULL DEFAULT 'info'`**: Define la columna `type` para categorizar la notificación (por ejemplo, 'info', 'warning', 'error'), con un máximo de 50 caracteres y un valor por defecto de 'info'.
- **`read BOOLEAN DEFAULT FALSE`**: Define `read` como un booleano, con un valor por defecto de `FALSE`, indicando si la notificación ha sido leída.
- **`data JSONB`**: Define la columna `data` para almacenar datos adicionales de la notificación en formato JSON binario, lo que permite flexibilidad para diferentes tipos de notificaciones.
- **`created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define `created_at` para registrar la fecha y hora de creación, con la hora actual como valor por defecto.
- **`updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`**: Define `updated_at` para registrar la última fecha y hora de actualización, con la hora actual como valor por defecto.

## 2. Creación de Índices para Rendimiento

```sql
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
```
- **`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`**: Crea un índice en `notifications` para búsquedas eficientes por `user_id`.
- **`CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read)`**: Crea un índice para búsquedas por el estado `read` de la notificación.
- **`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)`**: Crea un índice para búsquedas por la fecha de creación de la notificación.

## 3. Habilitación de RLS (Row Level Security)

```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```
- **`ALTER TABLE notifications ENABLE ROW LEVEL SECURITY`**: Habilita la seguridad a nivel de fila para la tabla `notifications`, permitiendo un control granular sobre quién puede acceder a qué filas.

## 4. Creación de Políticas de Seguridad

```sql
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);
```
- **`CREATE POLICY "Users can view their own notifications" ... FOR SELECT USING (auth.uid() = user_id)`**: Crea una política que permite a los usuarios (identificados por `auth.uid()`) ver solo sus propias notificaciones.
- **`CREATE POLICY "Users can update their own notifications" ... FOR UPDATE USING (auth.uid() = user_id)`**: Crea una política que permite a los usuarios actualizar solo sus propias notificaciones.
- **`CREATE POLICY "System can insert notifications" ... FOR INSERT WITH CHECK (true)`**: Crea una política que permite al sistema insertar notificaciones sin restricciones, ya que `WITH CHECK (true)` siempre es verdadero.

---
Este documento proporciona una explicación detallada del script `Create_notifications_table.sql`.