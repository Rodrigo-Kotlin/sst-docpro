import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[SST DocPro] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'Running in offline mode (localStorage only). ' +
    'Configure the env vars in your hosting platform to enable cloud sync.'
  );
}

// When env vars are missing, fall back to a client pointing at an
// invalid host. Every request will fail at the network layer and be
// caught by SyncProvider, which surfaces the "Erro de conexao" UI.
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://supabase-not-configured.invalid',
  supabaseAnonKey || 'public-anon-key-missing'
);

export { isSupabaseConfigured };
