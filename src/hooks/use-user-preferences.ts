import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Database } from '@/lib/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Default preferences to use if none are set
const DEFAULT_PREFERENCES = {
  wanikani_level: 0,
  genki_chapter: 0,
  tadoku_level: 0,
};

// Local storage key
const PREFERENCES_STORAGE_KEY = 'todaku_user_preferences';

export function useUserPreferences() {
  // Try to get cached preferences first
  const getCachedPreferences = (): Profile | null => {
    if (typeof window === 'undefined') return null;
    const cached = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    return cached ? JSON.parse(cached) : null;
  };

  const [preferences, setPreferences] = useState<Profile | null>(getCachedPreferences());
  const [isLoading, setIsLoading] = useState(!preferences);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    
    const fetchPreferences = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // First, check if the profile exists
        const { data, error: selectError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (selectError) {
          if (selectError.code === 'PGRST116') {
            // No profile exists, create one with default values
            console.log('No profile found, creating with defaults');
            
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                ...DEFAULT_PREFERENCES,
                updated_at: new Date().toISOString()
              })
              .select()
              .single();
            
            if (insertError) throw insertError;
            
            if (isMounted) {
              // Cache in localStorage immediately
              if (typeof window !== 'undefined' && newProfile) {
                localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(newProfile));
              }
              setPreferences(newProfile as Profile);
            }
          } else {
            throw selectError;
          }
        } else {
          // Profile exists, populate it with any missing default values
          const updatedProfile = {
            ...DEFAULT_PREFERENCES,
            ...data
          };
          
          // Update if any defaults were missing
          if (
            data.wanikani_level === null || 
            data.genki_chapter === null || 
            data.tadoku_level === null
          ) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update(updatedProfile)
              .eq('id', session.user.id);
            
            if (updateError) throw updateError;
          }
          
          if (isMounted) {
            // Cache in localStorage immediately
            if (typeof window !== 'undefined') {
              localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updatedProfile));
            }
            setPreferences(updatedProfile as Profile);
          }
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // If we don't have cached preferences, fetch them
    if (!preferences) {
      fetchPreferences();
    } else {
      // Even if we have cached preferences, fetch the latest in the background
      fetchPreferences();
    }
    
    return () => {
      isMounted = false;
    };
  }, [supabase, preferences]);

  const updatePreferences = async (updates: Partial<Profile>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Update the cached preferences
      if (typeof window !== 'undefined' && data) {
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(data));
      }
      
      setPreferences(data as Profile);
      return data;
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