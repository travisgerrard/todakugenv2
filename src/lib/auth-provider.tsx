'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, logToConsole } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

// Create a shared Supabase client for the entire app
const supabase = createClient();

// Create context for auth state
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to sign in with Google
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      logToConsole('Starting sign in with Google (AuthProvider)', 'auth');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        logToConsole(`Sign in error: ${error.message}`, 'auth');
        throw error;
      }

      if (data?.url) {
        logToConsole(`Redirecting to: ${data.url}`, 'auth');
        window.location.href = data.url;
      }
    } catch (error) {
      logToConsole(`Error during sign in: ${error instanceof Error ? error.message : 'Unknown error'}`, 'auth');
      setIsLoading(false);
    }
  };

  // Function to sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      logToConsole('Starting sign out (AuthProvider)', 'auth');
      
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Sign out of all tabs/windows
      });
      
      if (error) {
        logToConsole(`Sign out error: ${error.message}`, 'auth');
        throw error;
      }
      
      logToConsole('Signed out successfully', 'auth');
      setUser(null);
      
      // Force reload the page to clear any cached state
      window.location.href = window.location.origin;
    } catch (error) {
      logToConsole(`Error signing out: ${error instanceof Error ? error.message : 'Unknown error'}`, 'auth');
      setIsLoading(false);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const checkUser = async () => {
      try {
        logToConsole('Initializing auth state (AuthProvider)', 'auth');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logToConsole(`Error getting session: ${error.message}`, 'auth');
          return;
        }
        
        logToConsole(`Session check: ${!!session ? 'Found' : 'Not found'}`, 'auth');
        setUser(session?.user || null);
      } catch (error) {
        logToConsole(`Error checking auth: ${error instanceof Error ? error.message : 'Unknown error'}`, 'auth');
      } finally {
        setIsLoading(false);
      }
    };

    // Check user on initial load
    checkUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      logToConsole(`Auth state changed: ${event}`, 'auth');
      setUser(session?.user || null);
      
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 