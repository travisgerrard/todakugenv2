import { createClient } from '@/lib/supabase';

export const supabase = createClient();

export async function signInWithGoogle() {
  // Determine the base URL based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction 
    ? 'https://todakureader.com' 
    : window.location.origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  return user;
} 