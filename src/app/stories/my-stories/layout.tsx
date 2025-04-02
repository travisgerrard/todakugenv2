import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function MyStoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  // If not authenticated, redirect to home
  if (!session) {
    redirect('/');
  }
  
  return (
    <main className="min-h-screen bg-background">
      {children}
    </main>
  );
} 