# Mussikon Database Structure

## Overview
This document describes the complete database structure for the Mussikon platform, including all tables, functions, triggers, and policies.

## Folder Structure
The `database` folder is organized into the following subdirectories:

- **`schema/`**: Contains SQL scripts for creating and defining database tables.
- **`migrations/`**: Contains SQL scripts for altering existing tables, adding new columns, or fixing data issues.
- **`functions/`**: Contains SQL scripts for creating database functions and stored procedures.
- **`seed_data/`**: Contains SQL scripts for inserting initial or default data into tables.
- **`supabase/`**: Contains SQL scripts specifically related to Supabase configurations or extensions.



## Detailed Explanation of Database Components

### 1. Schema (Definición de Tablas)
Esta sección describe los archivos SQL que definen la estructura inicial de nuestras tablas en la base de datos. Son como los "planos" de cómo se almacenarán nuestros datos.

*   **[complete_sql.sql](database/schema/complete_sql.sql)**: Este script contiene un conjunto completo de definiciones SQL para la base de datos, incluyendo la creación de múltiples tablas, índices y posiblemente algunas funciones o vistas.
*   **[create_balance_tables_simple.sql](database/schema/create_balance_tables_simple.sql)**: Este script crea las tablas básicas relacionadas con el balance de usuarios de una manera simplificada, ideal para configuraciones iniciales o entornos de desarrollo.
*   **[create_balance_tables_step_by_step.sql](database/schema/create_balance_tables_step_by_step.sql)**: Proporciona una creación de tablas de balance más detallada, posiblemente con pasos incrementales o configuraciones adicionales para una mayor granularidad.
*   **[create_email_verification_tokens.sql](database/schema/create_email_verification_tokens.sql)**: Define la tabla `email_verification_tokens`, utilizada para almacenar tokens temporales enviados a los usuarios para verificar sus direcciones de correo electrónico.
*   **[create_password_reset_code.sql](database/schema/create_password_reset_code.sql)**: Crea la tabla para almacenar códigos de un solo uso para el restablecimiento de contraseñas, asegurando un proceso seguro para los usuarios que olvidan su contraseña.
*   **[create_password_reset_tokens.sql](database/schema/create_password_reset_tokens.sql)**: Define la tabla `password_reset_tokens`, que guarda los tokens generados para permitir a los usuarios restablecer sus contraseñas de forma segura.
*   **[run_password_reset_setup.sql](database/schema/run_password_reset_setup.sql)**: Este script se encarga de la configuración completa del sistema de restablecimiento de contraseñas, incluyendo la creación de tablas y posiblemente funciones o procedimientos relacionados.
*   **[schema.sql](database/schema/schema.sql)**: Un script general que puede contener la definición de varias tablas y la estructura principal de la base de datos, sirviendo como un punto de partida para el esquema.
*   **[setup_email_and_password_tokens.sql](database/schema/setup_email_and_password_tokens.sql)**: Este script configura las tablas y funciones necesarias para la gestión de tokens de verificación de correo electrónico y restablecimiento de contraseñas.
*   **[setup_email_and_password_tokens_safe.sql](database/schema/setup_email_and_password_tokens_safe.sql)**: Una versión segura del script anterior, que puede incluir validaciones adicionales o un manejo de errores más robusto para la configuración de tokens.
*   **[verify_and_create_balance_tables.sql](database/schema/verify_and_create_balance_tables.sql)**: Este script verifica la existencia de las tablas de balance y las crea si no existen, asegurando que la estructura de balance esté siempre presente.
*   **[verify_and_create_balance_tables_final.sql](database/schema/verify_and_create_balance_tables_final.sql)**: Una versión final del script de verificación y creación de tablas de balance, que puede incluir optimizaciones o ajustes adicionales.
*   **[verify_notifications_table.sql](database/schema/verify_notifications_table.sql)**: Este script verifica la existencia de la tabla de notificaciones y la crea si no existe, garantizando que el sistema de notificaciones esté operativo.
*   **[Complete_Pricing_System.sql](database/schema/Complete_Pricing_System.sql)**: Este script crea las tablas y configuraciones necesarias para el sistema completo de precios, incluyendo tarifas base, comisiones y otros parámetros que afectan cómo se calculan los costos de los servicios musicales.
*   **[Create_musician_availability_table.sql](database/schema/Create_musician_availability_table.sql)**: Define la tabla `musician_availability`, que se utiliza para que los músicos puedan registrar cuándo están disponibles o no para eventos. Esto ayuda a gestionar sus horarios y evitar conflictos.
*   **[Create_notifications_table.sql](database/schema/Create_notifications_table.sql)**: Crea la tabla `notifications`, donde se almacenan todos los mensajes y alertas que los usuarios reciben en la plataforma, como nuevas solicitudes, ofertas o actualizaciones de estado.
*   **[Create_pricing_config_table.sql](database/schema/Create_pricing_config_table.sql)**: Este archivo crea la tabla `pricing_config`, que guarda los ajustes globales para el cálculo de precios, como la tarifa por hora, los mínimos y máximos de horas, y las tasas de impuestos.
*   **[Create_user_balances_table.sql](database/schema/Create_user_balances_table.sql)**: Define la tabla `user_balances`, que registra el saldo monetario de cada usuario en la plataforma. Es fundamental para el seguimiento de los pagos y cobros.

### 2. Migrations (Cambios y Correcciones)
Esta sección contiene scripts SQL que se utilizan para realizar cambios incrementales en el esquema de la base de datos. Son esenciales para actualizar la base de datos a nuevas versiones sin perder datos.

*   **[alter_email_verification_tokens_table.sql](database/migrations/alter_email_verification_tokens_table.sql)**: Este script modifica la tabla `email_verification_tokens`, posiblemente añadiendo nuevas columnas, alterando tipos de datos o añadiendo restricciones para mejorar la gestión de tokens.
*   **[cleanup_and_setup_tokens.sql](database/migrations/cleanup_and_setup_tokens.sql)**: Se encarga de limpiar datos antiguos o inconsistentes relacionados con tokens y luego configura las tablas de tokens para su uso correcto.
*   **[fix_balance_tables.sql](database/migrations/fix_balance_tables.sql)**: Este script corrige problemas o inconsistencias en las tablas de balance, asegurando la integridad y precisión de los registros financieros.
*   **[fix_balance_tables_complete.sql](database/migrations/fix_balance_tables_complete.sql)**: Una versión más completa del script de corrección de tablas de balance, que aborda un conjunto más amplio de posibles problemas.
*   **[fix_user_balances_table.sql](database/migrations/fix_user_balances_table.sql)**: Se enfoca específicamente en corregir la tabla `user_balances`, resolviendo errores o mejorando su estructura.
*   **[fix_user_transactions_table.sql](database/migrations/fix_user_transactions_table.sql)**: Este script está diseñado para corregir la tabla `user_transactions`, asegurando que todas las transacciones de los usuarios se registren correctamente.
*   **[fix_verification_code_ambiguity.sql](database/migrations/fix_verification_code_ambiguity.sql)**: Resuelve cualquier ambigüedad en los códigos de verificación, lo que podría implicar la adición de nuevas columnas o la modificación de restricciones para garantizar la unicidad.
*   **[update_email_verification_numeric.sql](database/migrations/update_email_verification_numeric.sql)**: Actualiza el formato o el tipo de datos de los códigos de verificación de correo electrónico a un formato numérico, lo que puede mejorar la eficiencia o la seguridad.

### 3. Functions (Funciones de Base de Datos)
Aquí se encuentran los scripts SQL que definen funciones personalizadas para la base de datos. Estas funciones son bloques de código reutilizables que realizan tareas específicas, como cálculos complejos o manipulaciones de datos.
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
*   **[Create_function_to_calculate_pricing.sql](database/functions/Create_function_to_calculate_pricing.sql)**: Crea una función que calcula el precio de un servicio musical basándose en varios factores, como la duración, el tipo de evento y las configuraciones de precios.
*   **[Create_trigger_function_to_update_updated_at_timestamp.sql](database/functions/Create_trigger_function_to_update_updated_at_timestamp.sql)**: Define una función de disparo (trigger function) que actualiza automáticamente la columna `updated_at` de una tabla cada vez que se modifica una fila. Esto es útil para rastrear la última vez que se actualizó un registro.

### 4. Seed Data (Datos Iniciales)
Esta sección contiene scripts SQL que insertan datos iniciales en la base de datos. Estos datos son útiles para poblar la base de datos con información básica necesaria para el funcionamiento de la aplicación o para propósitos de prueba.

*   **[insert_initial_balances.sql](database/seed_data/insert_initial_balances.sql)**: Este script inserta registros iniciales en las tablas de balance de usuarios, estableciendo saldos predeterminados para nuevos usuarios o para pruebas.

### 5. Supabase (Configuración de Supabase)
Esta sección contiene scripts SQL específicos para la configuración y gestión de la base de datos con Supabase. Incluye definiciones de tablas, funciones o políticas de seguridad que son particulares de la plataforma Supabase.

*   **[supabase.sql](database/supabase/supabase.sql)**: Este script contiene la configuración inicial o las extensiones específicas para la integración con Supabase, como la configuración de autenticación, almacenamiento o funciones de borde.

Aquí se encuentran los scripts SQL que modifican la estructura de la base de datos o corrigen datos existentes después de su creación inicial. Son como las "actualizaciones" o "parches" de la base de datos.

*   **[alter_email_verification_tokens_table.sql](database/migrations/alter_email_verification_tokens_table.sql)**: Este script realiza cambios en la tabla de tokens de verificación de correo electrónico, posiblemente añadiendo nuevas columnas o modificando las existentes para mejorar la seguridad o funcionalidad.
*   **[cleanup_and_setup_tokens.sql](database/migrations/cleanup_and_setup_tokens.sql)**: Se encarga de limpiar y reconfigurar los tokens utilizados para procesos como la verificación de correo o el restablecimiento de contraseñas, asegurando que el sistema de tokens funcione correctamente.
*   **[fix_balance_tables.sql](database/migrations/fix_balance_tables.sql)**: Contiene correcciones específicas para las tablas de balance, abordando posibles inconsistencias o errores en los registros financieros de los usuarios.
*   **[fix_balance_tables_complete.sql](database/migrations/fix_balance_tables_complete.sql)**: Un script más completo para verificar y corregir de manera exhaustiva las tablas de balance, asegurando la integridad y precisión de todos los datos financieros.
*   **[fix_user_balances_table.sql](database/migrations/fix_user_balances_table.sql)**: Se enfoca en corregir problemas específicos dentro de la tabla `user_balances`, como saldos incorrectos o entradas duplicadas.
*   **[fix_user_transactions_table.sql](database/migrations/fix_user_transactions_table.sql)**: Este script corrige errores o inconsistencias en la tabla `user_transactions`, que registra el historial de todas las transacciones financieras de los usuarios.
*   **[fix_verification_code_ambiguity.sql](database/migrations/fix_verification_code_ambiguity.sql)**: Resuelve cualquier ambigüedad o problema con los códigos de verificación, garantizando que el proceso de verificación de usuarios sea claro y seguro.
*   **[update_email_verification_numeric.sql](database/migrations/update_email_verification_numeric.sql)**: Actualiza el sistema de verificación de correo electrónico para usar códigos numéricos, lo que puede mejorar la facilidad de uso o la seguridad.

### 3. Functions (Funciones de Base de Datos)
Estos scripts crean "mini-programas" dentro de la base de datos que realizan tareas específicas, como cálculos o automatización de procesos.

*   **[Create_function_to_calculate_pricing.sql](database/functions/Create_function_to_calculate_pricing.sql)**: Crea una función que calcula el precio de un servicio musical basándose en varios factores, como la duración, el tipo de evento y las configuraciones de precios.
*   **[Create_trigger_function_to_update_updated_at_timestamp.sql](database/functions/Create_trigger_function_to_update_updated_at_timestamp.sql)**: Define una función que se activa automáticamente (como un "gatillo") cada vez que se actualiza un registro en ciertas tablas, para que el campo `updated_at` (fecha de última actualización) se actualice automáticamente.

### 4. Seed Data (Datos Iniciales)
Estos archivos contienen comandos para insertar datos de ejemplo o datos esenciales que la aplicación necesita para funcionar desde el principio.

*   **[insert_initial_balances.sql](database/seed_data/insert_initial_balances.sql)**: Inserta datos iniciales en la tabla de saldos, estableciendo los valores de balance predeterminados para los usuarios o el sistema.

### 5. Supabase (Configuración Específica)
Esta sección agrupa scripts relacionados con la plataforma Supabase, que podría incluir configuraciones de autenticación, almacenamiento o extensiones específicas.

*   **[supabase.sql](database/supabase/supabase.sql)**: Contiene configuraciones y definiciones específicas para la integración con Supabase, incluyendo la configuración de autenticación, almacenamiento y otras características de la plataforma.

## Tables

### Core Tables
1. **users** - User accounts and profiles
   - id (UUID, Primary Key)
   - name (VARCHAR)
   - email (VARCHAR, Unique)
   - phone (VARCHAR)
   - role (VARCHAR: 'leader', 'musician', 'admin')
   - active_role (VARCHAR: 'leader', 'musician')
   - status (VARCHAR: 'active', 'pending', 'rejected')
   - church_name (VARCHAR)
   - location (VARCHAR)
   - created_at, updated_at (TIMESTAMP)

2. **user_passwords** - User authentication
   - id (UUID, Primary Key)
   - user_id (UUID, Foreign Key to users)
   - password (VARCHAR, hashed)
   - created_at (TIMESTAMP)

3. **user_instruments** - Musician instruments
   - id (UUID, Primary Key)
   - user_id (UUID, Foreign Key to users)
   - instrument (VARCHAR)
   - years_experience (INTEGER)
   - created_at (TIMESTAMP)

### Business Logic Tables
4. **requests** - Musical service requests
   - id (UUID, Primary Key)
   - leader_id (UUID, Foreign Key to users)
   - event_type (VARCHAR)
   - event_date (TIMESTAMP)
   - start_time (TIME)
   - end_time (TIME)
   - location (VARCHAR)
   - budget (DECIMAL)
   - description (TEXT)
   - required_instrument (VARCHAR)
   - status (VARCHAR: 'active', 'closed', 'cancelled')
   - created_at, updated_at (TIMESTAMP)

5. **offers** - Musician offers for requests
   - id (UUID, Primary Key)
   - request_id (UUID, Foreign Key to requests)
   - musician_id (UUID, Foreign Key to users)
   - proposed_price (DECIMAL)
   - availability_confirmed (BOOLEAN)
   - message (TEXT)
   - status (VARCHAR: 'pending', 'selected', 'rejected')
   - created_at, updated_at (TIMESTAMP)

6. **admin_actions** - Admin decision tracking
   - id (UUID, Primary Key)
   - admin_id (UUID, Foreign Key to users)
   - user_id (UUID, Foreign Key to users)
   - action (VARCHAR: 'approve', 'reject', 'pending')
   - reason (TEXT)
   - created_at (TIMESTAMP)

### Advanced Features Tables
7. **notifications** - User notifications
   - id (UUID, Primary Key)
   - user_id (UUID, Foreign Key to users)
   - title (VARCHAR)
   - message (TEXT)
   - type (VARCHAR)
   - read (BOOLEAN)
   - data (JSONB)
   - created_at, updated_at (TIMESTAMP)

8. **musician_availability** - Musician availability management
   - id (UUID, Primary Key)
   - musician_id (UUID, Foreign Key to users)
   - event_date (DATE)
   - start_time (TIME)
   - end_time (TIME)
   - is_blocked (BOOLEAN)
   - reason (TEXT)
   - created_at, updated_at (TIMESTAMP)

9. **pricing_config** - Dynamic pricing configuration
   - id (UUID, Primary Key)
   - base_hourly_rate (DECIMAL)
   - minimum_hours (DECIMAL)
   - maximum_hours (DECIMAL)
   - platform_commission (DECIMAL)
   - service_fee (DECIMAL)
   - tax_rate (DECIMAL)
   - currency (VARCHAR)
   - is_active (BOOLEAN)
   - created_at, updated_at (TIMESTAMP)

10. **user_balances** - User financial balances
    - id (UUID, Primary Key)
    - user_id (UUID, Foreign Key to users)
    - balance (DECIMAL)
    - currency (VARCHAR)
    - created_at, updated_at (TIMESTAMP)

11. **user_transactions** - Financial transaction history
    - id (UUID, Primary Key)
    - user_id (UUID, Foreign Key to users)
    - transaction_type (VARCHAR)
    - amount (DECIMAL)
    - description (TEXT)
    - reference_id (UUID)
    - created_at, updated_at (TIMESTAMP)

## Functions

### Utility Functions
1. **update_updated_at_column()** - Updates updated_at timestamp
2. **check_availability_conflict()** - Checks for availability conflicts
3. **block_availability_with_buffer()** - Blocks availability with travel buffer
4. **calculate_event_price()** - Calculates event pricing
5. **update_user_balance()** - Updates user balance

### Notification Functions
6. **create_notification()** - Creates a notification for a user
7. **notify_musicians_new_request()** - Notifies all musicians about new requests
8. **notify_leader_new_offer()** - Notifies leader about new offers
9. **notify_musician_offer_selected()** - Notifies musician about offer selection

## Triggers

### Updated At Triggers
- update_users_updated_at
- update_requests_updated_at
- update_offers_updated_at
- trigger_user_balances_updated_at
- trigger_user_transactions_updated_at

### Notification Triggers
- trigger_notify_musicians_new_request
- trigger_notify_leader_new_offer
- trigger_notify_musician_offer_selected

## Indexes

### Performance Indexes
- idx_users_email
- idx_users_role
- idx_users_status
- idx_requests_leader_id
- idx_requests_status
- idx_requests_required_instrument
- idx_offers_request_id
- idx_offers_musician_id
- idx_offers_status
- idx_user_instruments_user_id
- idx_admin_actions_user_id
- idx_notifications_user_id
- idx_notifications_read
- idx_notifications_created_at

## Row Level Security (RLS)

### Policies
- Users can read/update own data
- Public can read active requests
- Leaders can manage own requests
- Musicians can create/update own offers
- Leaders can update offers for their requests
- Admin can read/update all data
- Users can view their own notifications
- Musicians can manage their own availability
- Everyone can read active pricing config
- Users can view their own balance/transactions

## Default Data

### Admin Users
1. **admin@mussikon.com** - Default admin (password: admin123)
2. **jasbootstudios@gmail.com** - Jefry Astacio (password: P0pok@tepel01)

## Features Supported

### Core Features
- ✅ User registration and authentication
- ✅ Role-based access control (leader, musician, admin)
- ✅ Dynamic role switching for musicians
- ✅ Request creation and management
- ✅ Offer creation and management
- ✅ Admin user management
- ✅ Password management

### Advanced Features
- ✅ Real-time notifications
- ✅ Musician availability management
- ✅ Travel buffer system (1.5 hours)
- ✅ Dynamic pricing configuration
- ✅ User balance tracking
- ✅ Transaction history
- ✅ Row Level Security (RLS)
- ✅ WebSocket support

### Business Logic
- ✅ Musicians can only see their own offers
- ✅ Leaders can see all offers for their requests
- ✅ Admins have full access
- ✅ Automatic balance updates
- ✅ Availability conflict checking
- ✅ Price calculation with commissions

## Database Version
- **Version**: MVP 1.0
- **Last Updated**: 2024
- **Compatible with**: Supabase PostgreSQL
- **Extensions**: uuid-ossp
