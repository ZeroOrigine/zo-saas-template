import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { PROJECT_CONFIG, SERVER_CONFIG } from '@/lib/config';

export function createAdminClient() {
  return createClient<Database>(
    PROJECT_CONFIG.supabaseUrl,
    SERVER_CONFIG.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
