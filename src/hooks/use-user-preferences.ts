import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Database } from '@/lib/types';
import { useAuth } from '@/lib/auth-provider';

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
    console.log('Checking cached preferences:', cached ? JSON.parse(cached) : 'none found');
    return cached ? JSON.parse(cached) : null;
  };

  // Only try to get cached preferences on client side
  const initialPreferences = typeof window === 'undefined' ? null : getCachedPreferences();
  const [preferences, setPreferences] = useState<Profile | null>(initialPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    const fetchPreferences = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching user preferences from database');
        
        // Use the user from auth context instead of fetching session again
        console.log('Auth context user:', user ? `User authenticated: ${user.id}` : 'No active user');
        
        if (!user) {
          console.log('No authenticated user, stopping preferences fetch');
          if (isMounted) setIsLoading(false);
          return;
        }

        // First, check if the profile exists
        console.log('Checking if profile exists for user:', user.id);
        const { data, error: selectError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (selectError) {
          console.log('Profile select error:', selectError);
          if (selectError.code === 'PGRST116') {
            // No profile exists, create one with default values
            console.log('No profile found, creating with defaults');
            
            // Try to create profile with updated_at
            try {
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: user.id,
                  ...DEFAULT_PREFERENCES,
                  updated_at: new Date().toISOString()
                })
                .select()
                .single();
              
              if (insertError) {
                // If error is about updated_at column, try without it
                if (insertError.code === 'PGRST204') {
                  console.log('updated_at column not found, trying without it');
                  const { data: newProfileNoUpdate, error: insertErrorNoUpdate } = await supabase
                    .from('profiles')
                    .insert({
                      id: user.id,
                      ...DEFAULT_PREFERENCES
                    })
                    .select()
                    .single();
                  
                  if (insertErrorNoUpdate) {
                    console.error('Error inserting profile without updated_at:', insertErrorNoUpdate);
                    throw insertErrorNoUpdate;
                  }
                  
                  console.log('Created new profile without updated_at:', newProfileNoUpdate);
                  
                  if (isMounted) {
                    // Cache in localStorage immediately
                    if (typeof window !== 'undefined' && newProfileNoUpdate) {
                      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(newProfileNoUpdate));
                      console.log('Cached new profile in localStorage');
                    }
                    setPreferences(newProfileNoUpdate as Profile);
                    console.log('Set preferences state with new profile');
                  }
                } else {
                  // Other insert error
                  console.error('Error inserting profile:', insertError);
                  throw insertError;
                }
              } else {
                console.log('Created new profile with updated_at:', newProfile);
                
                if (isMounted) {
                  // Cache in localStorage immediately
                  if (typeof window !== 'undefined' && newProfile) {
                    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(newProfile));
                    console.log('Cached new profile in localStorage');
                  }
                  setPreferences(newProfile as Profile);
                  console.log('Set preferences state with new profile');
                }
              }
            } catch (insertCatchError) {
              console.error('Error in profile creation:', insertCatchError);
              throw insertCatchError;
            }
          } else {
            throw selectError;
          }
        } else {
          console.log('Profile found:', data);
          // Profile exists, populate it with any missing default values
          const updatedProfile = {
            ...DEFAULT_PREFERENCES,
            ...data
          };
          
          console.log('Profile with defaults merged:', updatedProfile);
          
          // Update if any defaults were missing
          if (
            data.wanikani_level === null || 
            data.genki_chapter === null || 
            data.tadoku_level === null
          ) {
            console.log('Profile has null values, updating with defaults');
            
            try {
              // First try with updated_at
              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  ...updatedProfile,
                  updated_at: new Date().toISOString()
                })
                .eq('id', user.id);
              
              if (updateError) {
                // If error is about updated_at column, try without it
                if (updateError.code === 'PGRST204') {
                  console.log('updated_at column not found, trying without it');
                  const { error: updateErrorNoUpdate } = await supabase
                    .from('profiles')
                    .update(updatedProfile)
                    .eq('id', user.id);
                  
                  if (updateErrorNoUpdate) {
                    console.error('Error updating profile without updated_at:', updateErrorNoUpdate);
                    throw updateErrorNoUpdate;
                  }
                } else {
                  console.error('Error updating profile with defaults:', updateError);
                  throw updateError;
                }
              }
              console.log('Updated profile with defaults');
            } catch (updateCatchError) {
              console.error('Error in profile update:', updateCatchError);
              throw updateCatchError;
            }
          }
          
          if (isMounted) {
            // Cache in localStorage immediately
            if (typeof window !== 'undefined') {
              localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updatedProfile));
              console.log('Cached profile in localStorage');
            }
            setPreferences(updatedProfile as Profile);
            console.log('Set preferences state with existing profile');
          }
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log('Preferences loading complete, state:', { preferences, isLoading: false, error });
        }
      }
    };

    // If we have a user, fetch preferences when user object changes
    if (user) {
      console.log('User is logged in, fetching preferences');
      fetchPreferences();
    } else {
      console.log('No authenticated user, preferences not fetched');
      setIsLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, supabase]); // Depend on user from auth context

  const updatePreferences = async (updates: Partial<Profile>) => {
    try {
      console.log('Updating preferences with:', updates);
      
      // Use the user from auth context
      if (!user) {
        console.error('No active user when updating preferences');
        throw new Error('No active session');
      }

      // First try with updated_at field
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          // If the error is about updated_at column, try without it
          if (error.code === 'PGRST204') {
            console.log('updated_at column not found, trying update without it');
            const { data: dataNoUpdate, error: errorNoUpdate } = await supabase
              .from('profiles')
              .update(updates)
              .eq('id', user.id)
              .select()
              .single();

            if (errorNoUpdate) {
              console.error('Error updating preferences without updated_at:', errorNoUpdate);
              throw errorNoUpdate;
            }

            // Update preferences state and localStorage cache
            if (typeof window !== 'undefined' && dataNoUpdate) {
              const updatedPrefs = { ...preferences, ...dataNoUpdate };
              localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updatedPrefs));
              setPreferences(updatedPrefs as Profile);
              console.log('Updated preferences without updated_at');
            }
            return dataNoUpdate;
          } else {
            console.error('Error updating preferences:', error);
            throw error;
          }
        }

        // Update preferences state and localStorage cache
        if (typeof window !== 'undefined' && data) {
          const updatedPrefs = { ...preferences, ...data };
          localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updatedPrefs));
          setPreferences(updatedPrefs as Profile);
          console.log('Updated preferences with updated_at');
        }
        return data;
      } catch (error) {
        console.error('Error in update preferences:', error);
        throw error;
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    }
  };

  return { preferences, isLoading, error, updatePreferences };
} 