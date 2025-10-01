-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_actions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  admin_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action character varying NOT NULL CHECK (action::text = ANY (ARRAY['approve'::character varying, 'reject'::character varying, 'pending'::character varying]::text[])),
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_actions_pkey PRIMARY KEY (id),
  CONSTRAINT admin_actions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id),
  CONSTRAINT admin_actions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.email_verification_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token character varying NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  verification_code character varying,
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  locked_until timestamp with time zone,
  CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT email_verification_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.musician_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  musician_id uuid NOT NULL,
  event_date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  is_blocked boolean DEFAULT false,
  reason character varying,
  request_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT musician_availability_pkey PRIMARY KEY (id),
  CONSTRAINT musician_availability_musician_id_fkey FOREIGN KEY (musician_id) REFERENCES public.users(id),
  CONSTRAINT musician_availability_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  type character varying NOT NULL DEFAULT 'info'::character varying,
  read boolean DEFAULT false,
  data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.offers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  request_id uuid NOT NULL,
  musician_id uuid NOT NULL,
  proposed_price numeric NOT NULL CHECK (proposed_price >= 600::numeric),
  availability_confirmed boolean NOT NULL DEFAULT false,
  message text,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'selected'::character varying, 'rejected'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT offers_pkey PRIMARY KEY (id),
  CONSTRAINT offers_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.requests(id),
  CONSTRAINT offers_musician_id_fkey FOREIGN KEY (musician_id) REFERENCES public.users(id)
);
CREATE TABLE public.password_reset_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token character varying NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.pricing_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  base_hourly_rate numeric NOT NULL DEFAULT 500.00,
  minimum_hours numeric NOT NULL DEFAULT 2.00,
  maximum_hours numeric NOT NULL DEFAULT 12.00,
  platform_commission numeric NOT NULL DEFAULT 0.1500,
  service_fee numeric NOT NULL DEFAULT 100.00,
  tax_rate numeric NOT NULL DEFAULT 0.1800,
  currency character varying NOT NULL DEFAULT 'DOP'::character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pricing_config_pkey PRIMARY KEY (id)
);
CREATE TABLE public.requests (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  leader_id uuid NOT NULL,
  event_type character varying NOT NULL,
  event_date timestamp with time zone NOT NULL,
  location character varying NOT NULL,
  description text,
  required_instrument character varying NOT NULL,
  status character varying NOT NULL DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'closed'::character varying, 'cancelled'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  start_time time without time zone,
  end_time time without time zone,
  extra_amount numeric DEFAULT 0,
  event_status character varying DEFAULT 'scheduled'::character varying CHECK (event_status::text = ANY (ARRAY['scheduled'::character varying, 'started'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[])),
  event_started_at timestamp with time zone,
  event_completed_at timestamp with time zone,
  started_by_musician_id uuid,
  musician_id uuid,
  musician_status character varying DEFAULT 'pending'::character varying CHECK (musician_status::text = ANY (ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[])),
  accepted_by_musician_id uuid,
  CONSTRAINT requests_pkey PRIMARY KEY (id),
  CONSTRAINT requests_started_by_musician_id_fkey FOREIGN KEY (started_by_musician_id) REFERENCES public.users(id),
  CONSTRAINT requests_leader_id_fkey FOREIGN KEY (leader_id) REFERENCES public.users(id),
  CONSTRAINT requests_musician_id_fkey FOREIGN KEY (musician_id) REFERENCES public.users(id),
  CONSTRAINT requests_accepted_by_musician_id_fkey FOREIGN KEY (accepted_by_musician_id) REFERENCES public.users(id)
);


-- Añadir musician_id si no existe
DO $$ BEGIN
    ALTER TABLE public.requests ADD COLUMN musician_id uuid;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column musician_id already exists in public.requests.';
END $$;

-- Añadir musician_status si no existe
DO $$ BEGIN
    ALTER TABLE public.requests ADD COLUMN musician_status TEXT;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column musician_status already exists in public.requests.';
END $$;

-- Añadir accepted_by_musician_id si no existe
DO $$ BEGIN
    ALTER TABLE public.requests ADD COLUMN accepted_by_musician_id uuid;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'column accepted_by_musician_id already exists in public.requests.';
END $$;

-- Añadir la clave foránea para musician_id si no existe
DO $$ BEGIN
    ALTER TABLE public.requests ADD CONSTRAINT requests_musician_id_fkey FOREIGN KEY (musician_id) REFERENCES public.users(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'constraint requests_musician_id_fkey already exists on public.requests.';
END $$;

-- Añadir la clave foránea para accepted_by_musician_id si no existe
DO $$ BEGIN
    ALTER TABLE public.requests ADD CONSTRAINT requests_accepted_by_musician_id_fkey FOREIGN KEY (accepted_by_musician_id) REFERENCES public.users(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'constraint requests_accepted_by_musician_id_fkey already exists on public.requests.';
END $$;

-- Añadir la restricción CHECK para musician_status si no existe
DO $$ BEGIN
    ALTER TABLE public.requests ADD CONSTRAINT musician_status_check CHECK (musician_status IN ('pending', 'accepted', 'rejected', 'cancelled'));
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'constraint musician_status_check already exists on public.requests.';
END $$;



CREATE TABLE public.user_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance numeric DEFAULT 0.00 CHECK (balance >= 0::numeric),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_balances_pkey PRIMARY KEY (id),
  CONSTRAINT user_balances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_instruments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  instrument character varying NOT NULL,
  years_experience integer NOT NULL CHECK (years_experience >= 0 AND years_experience <= 50),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_instruments_pkey PRIMARY KEY (id),
  CONSTRAINT user_instruments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_passwords (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  password character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_passwords_pkey PRIMARY KEY (id),
  CONSTRAINT user_passwords_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['credit'::character varying, 'debit'::character varying, 'payment'::character varying, 'refund'::character varying, 'commission'::character varying]::text[])),
  amount numeric NOT NULL,
  description text,
  reference_id uuid,
  reference_type character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT user_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone character varying NOT NULL,
  role character varying NOT NULL CHECK (role::text = ANY (ARRAY['leader'::character varying, 'musician'::character varying, 'admin'::character varying]::text[])),
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'pending'::character varying, 'rejected'::character varying]::text[])),
  church_name character varying,
  location character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  active_role character varying DEFAULT 'musician'::character varying CHECK (active_role::text = ANY (ARRAY['leader'::character varying, 'musician'::character varying]::text[])),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);