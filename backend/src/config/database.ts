import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

const supabase: SupabaseClient = createClient(
  config.database.supabaseUrl,
  config.database.supabaseServiceRoleKey
);

export default supabase;
