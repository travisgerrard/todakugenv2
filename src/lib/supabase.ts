import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null;

export const createClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient();
  }
  return supabaseClient;
}; 