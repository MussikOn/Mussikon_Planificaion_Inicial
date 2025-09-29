# Índice de Documentación de la Base de Datos

Este documento sirve como un índice centralizado para toda la documentación detallada de los scripts SQL de la base de datos. Cada archivo SQL tiene un archivo `.md` asociado que explica su propósito y funcionamiento línea por línea.

## Contenido

- [Estructura General de la Base de Datos](#estructura-general-de-la-base-de-datos)
- [Funciones](#funciones)
- [Migraciones](#migraciones)
- [Esquema](#esquema)
- [Datos de Semilla (Seed Data)](#datos-de-semilla-seed-data)
- [Supabase](#supabase)

---

## Estructura General de la Base de Datos

- [DATABASE_STRUCTURE.md](DATABASE_STRUCTURE.md)

## Funciones

- [Create_function_to_calculate_pricing.sql.md](functions/Create_function_to_calculate_pricing.sql.md)
- [Create_trigger_function_to_update_updated_at_timestamp.sql.md](functions/Create_trigger_function_to_update_updated_at_timestamp.sql.md)

## Migraciones

- [alter_email_verification_tokens_table.sql.md](migrations/alter_email_verification_tokens_table.sql.md)
- [cleanup_and_setup_tokens.sql.md](migrations/cleanup_and_setup_tokens.sql.md)
- [fix_balance_tables.sql.md](migrations/fix_balance_tables.sql.md)
- [fix_balance_tables_complete.sql.md](migrations/fix_balance_tables_complete.sql.md)
- [fix_user_balances_table.sql.md](migrations/fix_user_balances_table.sql.md)
- [fix_user_transactions_table.sql.md](migrations/fix_user_transactions_table.sql.md)
- [fix_verification_code_ambiguity.sql.md](migrations/fix_verification_code_ambiguity.sql.md)
- [update_email_verification_numeric.sql.md](migrations/update_email_verification_numeric.sql.md)

## Esquema

- [Complete_Pricing_System.sql.md](schema/Complete_Pricing_System.sql.md)
- [Create_musician_availability_table.sql.md](schema/Create_musician_availability_table.sql.md)
- [Create_notifications_table.sql.md](schema/Create_notifications_table.sql.md)
- [Create_pricing_config_table.sql.md](schema/Create_pricing_config_table.sql.md)
- [Create_user_balances_table.sql.md](schema/Create_user_balances_table.sql.md)
- [create_balance_tables_simple.sql.md](schema/create_balance_tables_simple.sql.md)
- [create_balance_tables_step_by_step.sql.md](schema/create_balance_tables_step_by_step.sql.md)
- [create_email_verification_tokens.sql.md](schema/create_email_verification_tokens.sql.md)
- [create_password_reset_code.sql.md](schema/create_password_reset_code.sql.md)
- [create_password_reset_tokens.sql.md](schema/create_password_reset_tokens.sql.md)
- [run_password_reset_setup.sql.md](schema/run_password_reset_setup.sql.md)
- [schema.sql.md](schema/schema.sql.md)
- [setup_email_and_password_tokens.sql.md](schema/setup_email_and_password_tokens.sql.md)
- [setup_email_and_password_tokens_safe.sql.md](schema/setup_email_and_password_tokens_safe.sql.md)
- [verify_and_create_balance_tables.sql.md](schema/verify_and_create_balance_tables.sql.md)
- [verify_and_create_balance_tables_final.sql.md](schema/verify_and_create_balance_tables_final.sql.md)
- [verify_notifications_table.sql.md](schema/verify_notifications_table.sql.md)

## Datos de Semilla (Seed Data)

- [insert_initial_balances.sql.md](seed_data/insert_initial_balances.sql.md)

## Supabase

- [supabase.sql.md](supabase/supabase.sql.md)