# Documentación Detallada de `supabase.sql`

Este script SQL define el esquema completo de la base de datos para la aplicación Mussikon, incluyendo la creación de varias tablas con sus respectivas columnas, tipos de datos, restricciones, claves primarias y foráneas. Este archivo es una representación del esquema y no está diseñado para ser ejecutado directamente, ya que el orden de las tablas y las restricciones pueden no ser válidos para una ejecución secuencial.

---

## 1. Tabla `public.admin_actions`

Esta tabla registra las acciones realizadas por los administradores sobre las solicitudes de los usuarios.

```sql
CREATE TABLE public.admin_actions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(), -- Columna: id. Tipo: UUID. No nulo. Valor por defecto: un UUID generado automáticamente. Es la clave primaria de la tabla.
  admin_id uuid NOT NULL, -- Columna: admin_id. Tipo: UUID. No nulo. Referencia al ID del administrador que realizó la acción.
  user_id uuid NOT NULL, -- Columna: user_id. Tipo: UUID. No nulo. Referencia al ID del usuario sobre el que se realizó la acción.
  action character varying NOT NULL CHECK (action::text = ANY (ARRAY['approve'::character varying, 'reject'::character varying, 'pending'::character varying]::text[])), -- Columna: action. Tipo: character varying. No nulo. Restricción: el valor debe ser 'approve', 'reject' o 'pending'.
  reason text, -- Columna: reason. Tipo: texto. Opcional. Almacena la razón de la acción del administrador.
  created_at timestamp with time zone DEFAULT now(), -- Columna: created_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales.
  CONSTRAINT admin_actions_pkey PRIMARY KEY (id), -- Restricción: admin_actions_pkey. Define la columna 'id' como clave primaria.
  CONSTRAINT admin_actions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id), -- Restricción: admin_actions_admin_id_fkey. Define 'admin_id' como clave foránea que referencia a 'id' en la tabla 'public.users'.
  CONSTRAINT admin_actions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) -- Restricción: admin_actions_user_id_fkey. Define 'user_id' como clave foránea que referencia a 'id' en la tabla 'public.users'.
);
```

---

## 2. Tabla `public.email_verification_tokens`

Esta tabla almacena los tokens utilizados para la verificación de correo electrónico de los usuarios.

```sql
CREATE TABLE public.email_verification_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(), -- Columna: id. Tipo: UUID. No nulo. Valor por defecto: un UUID generado aleatoriamente. Es la clave primaria de la tabla.
  user_id uuid NOT NULL, -- Columna: user_id. Tipo: UUID. No nulo. Referencia al ID del usuario al que pertenece el token.
  token character varying NOT NULL UNIQUE, -- Columna: token. Tipo: character varying. No nulo. Restricción: el token debe ser único.
  expires_at timestamp with time zone NOT NULL, -- Columna: expires_at. Tipo: timestamp con zona horaria. No nulo. Indica cuándo expira el token.
  used boolean DEFAULT false, -- Columna: used. Tipo: booleano. Valor por defecto: false. Indica si el token ya ha sido utilizado.
  created_at timestamp with time zone DEFAULT now(), -- Columna: created_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales.
  updated_at timestamp with time zone DEFAULT now(), -- Columna: updated_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales. Se actualiza automáticamente.
  verification_code character varying, -- Columna: verification_code. Tipo: character varying. Opcional. Almacena un código de verificación.
  attempts integer DEFAULT 0, -- Columna: attempts. Tipo: entero. Valor por defecto: 0. Cuenta los intentos de verificación.
  max_attempts integer DEFAULT 3, -- Columna: max_attempts. Tipo: entero. Valor por defecto: 3. Define el número máximo de intentos permitidos.
  locked_until timestamp with time zone, -- Columna: locked_until. Tipo: timestamp con zona horaria. Opcional. Indica hasta cuándo está bloqueado el token.
  CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (id), -- Restricción: email_verification_tokens_pkey. Define la columna 'id' como clave primaria.
  CONSTRAINT email_verification_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) -- Restricción: email_verification_tokens_user_id_fkey. Define 'user_id' como clave foránea que referencia a 'id' en la tabla 'public.users'.
);
```

---

## 3. Tabla `public.musician_availability`

Esta tabla gestiona la disponibilidad de los músicos para eventos.

```sql
CREATE TABLE public.musician_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(), -- Columna: id. Tipo: UUID. No nulo. Valor por defecto: un UUID generado aleatoriamente. Es la clave primaria de la tabla.
  musician_id uuid NOT NULL, -- Columna: musician_id. Tipo: UUID. No nulo. Referencia al ID del músico.
  event_date date NOT NULL, -- Columna: event_date. Tipo: fecha. No nulo. La fecha del evento.
  start_time time without time zone NOT NULL, -- Columna: start_time. Tipo: hora sin zona horaria. No nulo. La hora de inicio de la disponibilidad.
  end_time time without time zone NOT NULL, -- Columna: end_time. Tipo: hora sin zona horaria. No nulo. La hora de fin de la disponibilidad.
  is_blocked boolean DEFAULT false, -- Columna: is_blocked. Tipo: booleano. Valor por defecto: false. Indica si el horario está bloqueado.
  reason character varying, -- Columna: reason. Tipo: character varying. Opcional. Razón del bloqueo, si aplica.
  request_id uuid, -- Columna: request_id. Tipo: UUID. Opcional. Referencia al ID de la solicitud asociada, si aplica.
  created_at timestamp with time zone DEFAULT now(), -- Columna: created_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales.
  updated_at timestamp with time zone DEFAULT now(), -- Columna: updated_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales. Se actualiza automáticamente.
  CONSTRAINT musician_availability_pkey PRIMARY KEY (id), -- Restricción: musician_availability_pkey. Define la columna 'id' como clave primaria.
  CONSTRAINT musician_availability_musician_id_fkey FOREIGN KEY (musician_id) REFERENCES public.users(id), -- Restricción: musician_availability_musician_id_fkey. Define 'musician_id' como clave foránea que referencia a 'id' en la tabla 'public.users'.
  CONSTRAINT musician_availability_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id) -- Restricción: musician_availability_request_id_fkey. Define 'request_id' como clave foránea que referencia a 'id' en la tabla 'public.requests'.
);
```

---

## 4. Tabla `public.notifications`

Esta tabla almacena las notificaciones para los usuarios.

```sql
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(), -- Columna: id. Tipo: UUID. No nulo. Valor por defecto: un UUID generado aleatoriamente. Es la clave primaria de la tabla.
  user_id uuid NOT NULL, -- Columna: user_id. Tipo: UUID. No nulo. Referencia al ID del usuario al que va dirigida la notificación.
  title character varying NOT NULL, -- Columna: title. Tipo: character varying. No nulo. El título de la notificación.
  message text NOT NULL, -- Columna: message. Tipo: texto. No nulo. El contenido del mensaje de la notificación.
  type character varying NOT NULL DEFAULT 'info'::character varying, -- Columna: type. Tipo: character varying. No nulo. Valor por defecto: 'info'. El tipo de notificación (e.g., 'info', 'warning', 'error').
  read boolean DEFAULT false, -- Columna: read. Tipo: booleano. Valor por defecto: false. Indica si la notificación ha sido leída.
  data jsonb, -- Columna: data. Tipo: JSONB. Opcional. Almacena datos adicionales en formato JSON.
  created_at timestamp with time zone DEFAULT now(), -- Columna: created_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales.
  updated_at timestamp with time zone DEFAULT now(), -- Columna: updated_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales. Se actualiza automáticamente.
  CONSTRAINT notifications_pkey PRIMARY KEY (id), -- Restricción: notifications_pkey. Define la columna 'id' como clave primaria.
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) -- Restricción: notifications_user_id_fkey. Define 'user_id' como clave foránea que referencia a 'id' en la tabla 'public.users'.
);
```

---

## 5. Tabla `public.offers`

Esta tabla registra las ofertas realizadas por los músicos para las solicitudes de eventos.

```sql
CREATE TABLE public.offers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(), -- Columna: id. Tipo: UUID. No nulo. Valor por defecto: un UUID generado automáticamente. Es la clave primaria de la tabla.
  request_id uuid NOT NULL, -- Columna: request_id. Tipo: UUID. No nulo. Referencia al ID de la solicitud de evento.
  musician_id uuid NOT NULL, -- Columna: musician_id. Tipo: UUID. No nulo. Referencia al ID del músico que hace la oferta.
  proposed_price numeric NOT NULL CHECK (proposed_price >= 600::numeric), -- Columna: proposed_price. Tipo: numérico. No nulo. Restricción: el precio propuesto debe ser mayor o igual a 600.
  availability_confirmed boolean NOT NULL DEFAULT false, -- Columna: availability_confirmed. Tipo: booleano. No nulo. Valor por defecto: false. Indica si la disponibilidad del músico ha sido confirmada.
  message text, -- Columna: message. Tipo: texto. Opcional. Mensaje adicional del músico.
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'selected'::character varying, 'rejected'::character varying]::text[])), -- Columna: status. Tipo: character varying. No nulo. Valor por defecto: 'pending'. Restricción: el estado debe ser 'pending', 'selected' o 'rejected'.
  created_at timestamp with time zone DEFAULT now(), -- Columna: created_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales.
  updated_at timestamp with time zone DEFAULT now(), -- Columna: updated_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales. Se actualiza automáticamente.
  CONSTRAINT offers_pkey PRIMARY KEY (id), -- Restricción: offers_pkey. Define la columna 'id' como clave primaria.
  CONSTRAINT offers_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id), -- Restricción: offers_request_id_fkey. Define 'request_id' como clave foránea que referencia a 'id' en la tabla 'public.requests'.
  CONSTRAINT offers_musician_id_fkey FOREIGN KEY (musician_id) REFERENCES public.users(id) -- Restricción: offers_musician_id_fkey. Define 'musician_id' como clave foránea que referencia a 'id' en la tabla 'public.users'.
);
```

---

## 6. Tabla `public.password_reset_tokens`

Esta tabla almacena los tokens utilizados para restablecer las contraseñas de los usuarios.

```sql
CREATE TABLE public.password_reset_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(), -- Columna: id. Tipo: UUID. No nulo. Valor por defecto: un UUID generado aleatoriamente. Es la clave primaria de la tabla.
  user_id uuid NOT NULL, -- Columna: user_id. Tipo: UUID. No nulo. Referencia al ID del usuario al que pertenece el token.
  token character varying NOT NULL UNIQUE, -- Columna: token. Tipo: character varying. No nulo. Restricción: el token debe ser único.
  expires_at timestamp with time zone NOT NULL, -- Columna: expires_at. Tipo: timestamp con zona horaria. No nulo. Indica cuándo expira el token.
  used boolean DEFAULT false, -- Columna: used. Tipo: booleano. Valor por defecto: false. Indica si el token ya ha sido utilizado.
  created_at timestamp with time zone DEFAULT now(), -- Columna: created_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales.
  updated_at timestamp with time zone DEFAULT now(), -- Columna: updated_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales. Se actualiza automáticamente.
  CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id), -- Restricción: password_reset_tokens_pkey. Define la columna 'id' como clave primaria.
  CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) -- Restricción: password_reset_tokens_user_id_fkey. Define 'user_id' como clave foránea que referencia a 'id' en la tabla 'public.users'.
);
```

---

## 7. Tabla `public.pricing_config`

Esta tabla almacena la configuración de precios y tarifas de la plataforma.

```sql
CREATE TABLE public.pricing_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(), -- Columna: id. Tipo: UUID. No nulo. Valor por defecto: un UUID generado aleatoriamente. Es la clave primaria de la tabla.
  base_hourly_rate numeric NOT NULL DEFAULT 500.00, -- Columna: base_hourly_rate. Tipo: numérico. No nulo. Valor por defecto: 500.00. Tarifa base por hora.
  minimum_hours numeric NOT NULL DEFAULT 2.00, -- Columna: minimum_hours. Tipo: numérico. No nulo. Valor por defecto: 2.00. Horas mínimas de contratación.
  maximum_hours numeric NOT NULL DEFAULT 12.00, -- Columna: maximum_hours. Tipo: numérico. No nulo. Valor por defecto: 12.00. Horas máximas de contratación.
  platform_commission numeric NOT NULL DEFAULT 0.1500, -- Columna: platform_commission. Tipo: numérico. No nulo. Valor por defecto: 0.1500. Comisión de la plataforma.
  service_fee numeric NOT NULL DEFAULT 100.00, -- Columna: service_fee. Tipo: numérico. No nulo. Valor por defecto: 100.00. Tarifa de servicio.
  tax_rate numeric NOT NULL DEFAULT 0.1800, -- Columna: tax_rate. Tipo: numérico. No nulo. Valor por defecto: 0.1800. Tasa de impuestos.
  currency character varying NOT NULL DEFAULT 'DOP'::character varying, -- Columna: currency. Tipo: character varying. No nulo. Valor por defecto: 'DOP'. Moneda utilizada.
  is_active boolean DEFAULT true, -- Columna: is_active. Tipo: booleano. Valor por defecto: true. Indica si esta configuración de precios está activa.
  created_at timestamp with time zone DEFAULT now(), -- Columna: created_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales.
  updated_at timestamp with time zone DEFAULT now(), -- Columna: updated_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales. Se actualiza automáticamente.
  CONSTRAINT pricing_config_pkey PRIMARY KEY (id) -- Restricción: pricing_config_pkey. Define la columna 'id' como clave primaria.
);
```

---

## 8. Tabla `public.requests`

Esta tabla almacena las solicitudes de eventos realizadas por los líderes.

```sql
CREATE TABLE public.requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(), -- Columna: id. Tipo: UUID. No nulo. Valor por defecto: un UUID generado automáticamente. Es la clave primaria de la tabla.
  leader_id uuid NOT NULL, -- Columna: leader_id. Tipo: UUID. No nulo. Referencia al ID del líder que creó la solicitud.
  event_type character varying NOT NULL, -- Columna: event_type. Tipo: character varying. No nulo. El tipo de evento (e.g., 'boda', 'fiesta').
  event_date timestamp with time zone NOT NULL, -- Columna: event_date. Tipo: timestamp con zona horaria. No nulo. La fecha y hora del evento.
  location character varying NOT NULL, -- Columna: location. Tipo: character varying. No nulo. La ubicación del evento.
  description text, -- Columna: description. Tipo: texto. Opcional. Descripción detallada del evento.
  required_instrument character varying NOT NULL, -- Columna: required_instrument. Tipo: character varying. No nulo. El instrumento requerido para el evento.
  status character varying NOT NULL DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'closed'::character varying, 'cancelled'::character varying]::text[])), -- Columna: status. Tipo: character varying. No nulo. Valor por defecto: 'active'. Restricción: el estado debe ser 'active', 'closed' o 'cancelled'.
  created_at timestamp with time zone DEFAULT now(), -- Columna: created_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales.
  updated_at timestamp with time zone DEFAULT now(), -- Columna: updated_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales. Se actualiza automáticamente.
  start_time time without time zone, -- Columna: start_time. Tipo: hora sin zona horaria. Opcional. Hora de inicio del evento.
  end_time time without time zone, -- Columna: end_time. Tipo: hora sin zona horaria. Opcional. Hora de finalización del evento.
  extra_amount numeric DEFAULT 0, -- Columna: extra_amount. Tipo: numérico. Valor por defecto: 0. Cantidad extra asociada a la solicitud.
  event_status character varying DEFAULT 'scheduled'::character varying CHECK (event_status::text = ANY (ARRAY['scheduled'::character varying, 'started'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[])), -- Columna: event_status. Tipo: character varying. Valor por defecto: 'scheduled'. Restricción: el estado del evento debe ser 'scheduled', 'started', 'completed' o 'cancelled'.
  event_started_at timestamp with time zone, -- Columna: event_started_at. Tipo: timestamp con zona horaria. Opcional. Fecha y hora de inicio real del evento.
  event_completed_at timestamp with time zone, -- Columna: event_completed_at. Tipo: timestamp con zona horaria. Opcional. Fecha y hora de finalización real del evento.
  started_by_musician_id uuid, -- Columna: started_by_musician_id. Tipo: UUID. Opcional. Referencia al ID del músico que inició el evento.
  CONSTRAINT requests_pkey PRIMARY KEY (id), -- Restricción: requests_pkey. Define la columna 'id' como clave primaria.
  CONSTRAINT requests_started_by_musician_id_fkey FOREIGN KEY (started_by_musician_id) REFERENCES public.users(id), -- Restricción: requests_started_by_musician_id_fkey. Define 'started_by_musician_id' como clave foránea que referencia a 'id' en la tabla 'public.users'.
  CONSTRAINT requests_leader_id_fkey FOREIGN KEY (leader_id) REFERENCES public.users(id) -- Restricción: requests_leader_id_fkey. Define 'leader_id' como clave foránea que referencia a 'id' en la tabla 'public.users'.
);
```

---

## 9. Tabla `public.user_balances`

Esta tabla almacena los balances de los usuarios.

```sql
CREATE TABLE public.user_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid(), -- Columna: id. Tipo: UUID. No nulo. Valor por defecto: un UUID generado aleatoriamente. Es la clave primaria de la tabla.
  user_id uuid NOT NULL UNIQUE, -- Columna: user_id. Tipo: UUID. No nulo. Restricción: debe ser único. Referencia al ID del usuario.
  balance numeric DEFAULT 0.00 CHECK (balance >= 0::numeric), -- Columna: balance. Tipo: numérico. Valor por defecto: 0.00. Restricción: el balance debe ser mayor o igual a 0.
  created_at timestamp with time zone DEFAULT now(), -- Columna: created_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales.
  updated_at timestamp with time zone DEFAULT now(), -- Columna: updated_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales. Se actualiza automáticamente.
  CONSTRAINT user_balances_pkey PRIMARY KEY (id), -- Restricción: user_balances_pkey. Define la columna 'id' como clave primaria.
  CONSTRAINT user_balances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) -- Restricción: user_balances_user_id_fkey. Define 'user_id' como clave foránea que referencia a 'id' en la tabla 'public.users'.
);
```

---

## 10. Tabla `public.user_instruments`

Esta tabla registra los instrumentos que toca cada músico.

```sql
CREATE TABLE public.user_instruments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(), -- Columna: id. Tipo: UUID. No nulo. Valor por defecto: un UUID generado automáticamente. Es la clave primaria de la tabla.
  user_id uuid NOT NULL, -- Columna: user_id. Tipo: UUID. No nulo. Referencia al ID del usuario (músico).
  instrument character varying NOT NULL, -- Columna: instrument. Tipo: character varying. No nulo. El nombre del instrumento.
  years_experience integer NOT NULL CHECK (years_experience >= 0 AND years_experience <= 50), -- Columna: years_experience. Tipo: entero. No nulo. Restricción: los años de experiencia deben estar entre 0 y 50.
  created_at timestamp with time zone DEFAULT now(), -- Columna: created_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales.
  CONSTRAINT user_instruments_pkey PRIMARY KEY (id), -- Restricción: user_instruments_pkey. Define la columna 'id' como clave primaria.
  CONSTRAINT user_instruments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) -- Restricción: user_instruments_user_id_fkey. Define 'user_id' como clave foránea que referencia a 'id' en la tabla 'public.users'.
);
```

---

## 11. Tabla `public.user_passwords`

Esta tabla almacena las contraseñas de los usuarios.

```sql
CREATE TABLE public.user_passwords (
  id uuid NOT NULL DEFAULT uuid_generate_v4(), -- Columna: id. Tipo: UUID. No nulo. Valor por defecto: un UUID generado automáticamente. Es la clave primaria de la tabla.
  user_id uuid NOT NULL, -- Columna: user_id. Tipo: UUID. No nulo. Referencia al ID del usuario.
  password character varying NOT NULL, -- Columna: password. Tipo: character varying. No nulo. La contraseña del usuario (debería estar hasheada).
  created_at timestamp with time zone DEFAULT now(), -- Columna: created_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales.
  CONSTRAINT user_passwords_pkey PRIMARY KEY (id), -- Restricción: user_passwords_pkey. Define la columna 'id' como clave primaria.
  CONSTRAINT user_passwords_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) -- Restricción: user_passwords_user_id_fkey. Define 'user_id' como clave foránea que referencia a 'id' en la tabla 'public.users'.
);
```

---

## 12. Tabla `public.user_transactions`

Esta tabla registra las transacciones financieras de los usuarios.

```sql
CREATE TABLE public.user_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(), -- Columna: id. Tipo: UUID. No nulo. Valor por defecto: un UUID generado aleatoriamente. Es la clave primaria de la tabla.
  user_id uuid NOT NULL, -- Columna: user_id. Tipo: UUID. No nulo. Referencia al ID del usuario.
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['credit'::character varying, 'debit'::character varying, 'payment'::character varying, 'refund'::character varying, 'commission'::character varying]::text[])), -- Columna: type. Tipo: character varying. No nulo. Restricción: el tipo debe ser 'credit', 'debit', 'payment', 'refund' o 'commission'.
  amount numeric NOT NULL, -- Columna: amount. Tipo: numérico. No nulo. El monto de la transacción.
  description text, -- Columna: description. Tipo: texto. Opcional. Descripción de la transacción.
  reference_id uuid, -- Columna: reference_id. Tipo: UUID. Opcional. ID de referencia para la transacción (e.g., ID de una solicitud).
  reference_type character varying, -- Columna: reference_type. Tipo: character varying. Opcional. Tipo de referencia (e.g., 'request').
  created_at timestamp with time zone DEFAULT now(), -- Columna: created_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales.
  CONSTRAINT user_transactions_pkey PRIMARY KEY (id), -- Restricción: user_transactions_pkey. Define la columna 'id' como clave primaria.
  CONSTRAINT user_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) -- Restricción: user_transactions_user_id_fkey. Define 'user_id' como clave foránea que referencia a 'id' en la tabla 'public.users'.
);
```

---

## 13. Tabla `public.users`

Esta tabla almacena la información principal de los usuarios de la aplicación.

```sql
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(), -- Columna: id. Tipo: UUID. No nulo. Valor por defecto: un UUID generado automáticamente. Es la clave primaria de la tabla.
  name character varying NOT NULL, -- Columna: name. Tipo: character varying. No nulo. Nombre completo del usuario.
  email character varying NOT NULL UNIQUE, -- Columna: email. Tipo: character varying. No nulo. Restricción: el correo electrónico debe ser único.
  phone character varying NOT NULL, -- Columna: phone. Tipo: character varying. No nulo. Número de teléfono del usuario.
  role character varying NOT NULL CHECK (role::text = ANY (ARRAY['leader'::character varying, 'musician'::character varying, 'admin'::character varying]::text[])), -- Columna: role. Tipo: character varying. No nulo. Restricción: el rol debe ser 'leader', 'musician' o 'admin'.
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'pending'::character varying, 'rejected'::character varying]::text[])), -- Columna: status. Tipo: character varying. No nulo. Valor por defecto: 'pending'. Restricción: el estado debe ser 'active', 'pending' o 'rejected'.
  church_name character varying, -- Columna: church_name. Tipo: character varying. Opcional. Nombre de la iglesia, si aplica.
  location character varying, -- Columna: location. Tipo: character varying. Opcional. Ubicación del usuario.
  created_at timestamp with time zone DEFAULT now(), -- Columna: created_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales.
  updated_at timestamp with time zone DEFAULT now(), -- Columna: updated_at. Tipo: timestamp con zona horaria. Valor por defecto: la fecha y hora actuales. Se actualiza automáticamente.
  active_role character varying DEFAULT 'musician'::character varying CHECK (active_role::text = ANY (ARRAY['leader'::character varying, 'musician'::character varying]::text[])), -- Columna: active_role. Tipo: character varying. Valor por defecto: 'musician'. Restricción: el rol activo debe ser 'leader' o 'musician'.
  CONSTRAINT users_pkey PRIMARY KEY (id) -- Restricción: users_pkey. Define la columna 'id' como clave primaria.
);
```