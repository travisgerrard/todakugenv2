'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';

export const NavBar = () => {
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();

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
                <Link href="/stories/my-stories" className="text-sm text-gray-500 hover:text-gray-700">
                  My Stories
                </Link>
                <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-700">
                  <Settings className="h-5 w-5" />
                </Link>
                <span className="text-sm text-gray-500">
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  onClick={signOut}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing out...' : 'Sign Out'}
                </Button>
              </>
            ) : (
              <Button
                onClick={signInWithGoogle}
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