'use client';

import { createClient } from '@/lib/supabase';
import { useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';

export const NavBar = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Starting sign in...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      console.log('Sign in response:', data);
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error during sign in:', error);
      setIsLoading(false);
    }
  }, [supabase.auth]);

  const handleSignOut = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Starting sign out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase.auth, router]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        console.log('Session:', session);
        if (mounted) {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (mounted) {
        setUser(session?.user ?? null);
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          router.refresh();
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  if (isLoading) {
    return (
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold">
              Tadoku Reader
            </Link>
            <div>
              <Button disabled>Loading...</Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-bold">
            Tadoku Reader
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-700">
                  <Settings className="h-5 w-5" />
                </Link>
                <span className="text-sm text-gray-500">
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing out...' : 'Sign Out'}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? 'Redirecting...' : 'Sign in with Google'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}; 