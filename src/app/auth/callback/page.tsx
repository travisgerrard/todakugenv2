'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('Processing authentication...');
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // If we have a hash fragment in the URL, it may contain our auth token
        if (window.location.hash && window.location.hash.length > 1) {
          console.log('Found hash in URL, processing auth data');
          setMessage('Detected authentication response, setting up your session...');
          
          // Let Supabase Auth handle the hash fragment
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            setMessage(`Error setting up your session: ${error.message}`);
            return;
          }
          
          if (data?.session) {
            console.log('Session established successfully', data.session.user.id);
            setMessage('Authentication successful! Redirecting...');
            
            // Wait a moment before redirecting to ensure session is properly established
            setTimeout(() => {
              router.push('/');
              router.refresh();
            }, 1000);
          } else {
            console.warn('No session found after auth callback');
            setMessage('No session found after authentication. Please try again.');
            
            // Redirect back to home after a delay
            setTimeout(() => {
              router.push('/');
            }, 2000);
          }
        } else {
          // If no hash fragment, check if there's an error parameter
          const urlParams = new URLSearchParams(window.location.search);
          const error = urlParams.get('error');
          
          if (error) {
            console.error('Authentication error:', error);
            setMessage(`Authentication error: ${error}`);
            
            // Redirect to home after showing error
            setTimeout(() => {
              router.push('/');
            }, 2000);
          } else {
            // No hash and no error: redirect to home
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        setMessage(`Unexpected error during authentication: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // Redirect to home after error
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    };
    
    handleAuthCallback();
  }, [router, supabase.auth]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-lg border p-6 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium mb-2">Authentication in Progress</h2>
        <p className="text-muted-foreground mb-2">{message}</p>
        <p className="text-sm text-muted-foreground">You'll be redirected automatically once complete.</p>
      </div>
    </div>
  );
} 