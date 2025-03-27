import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Database } from '@/lib/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setPreferences(data as Profile);
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [supabase]);

  const updatePreferences = async (updates: Partial<Profile>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id)
        .select()
        .single();

      if (error) throw error;
      setPreferences(data as Profile);
    } catch (err) {
      console.error('Error updating preferences:', err);
      throw err;
    }
  };

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
  };
} 