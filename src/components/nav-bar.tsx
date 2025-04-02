'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Book, Settings, BookOpen, ScrollText, GraduationCap, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';

export const NavBar = () => {
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold flex items-center">
              <BookOpen className="h-6 w-6 mr-2" />
              Tadoku Reader
            </Link>

            {/* Desktop menu */}
            <div className="hidden md:flex ml-10 space-x-4">
              <Link href="/vocabulary" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                <Book className="h-4 w-4 mr-1" />
                Vocabulary
              </Link>
              <Link href="/grammar" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                <ScrollText className="h-4 w-4 mr-1" />
                Grammar
              </Link>
              <Link href="/quizzes" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                <GraduationCap className="h-4 w-4 mr-1" />
                Quizzes
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {user ? (
              <>
                <Link href="/stories/my-stories" className="text-sm text-gray-500 hover:text-gray-700 hidden md:block">
                  My Stories
                </Link>
                <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-700">
                  <Settings className="h-5 w-5" />
                </Link>
                <span className="text-sm text-gray-500 hidden md:inline">
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

      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
            <Link 
              href="/vocabulary"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Book className="h-5 w-5 mr-2" />
              Vocabulary
            </Link>
            <Link 
              href="/grammar"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ScrollText className="h-5 w-5 mr-2" />
              Grammar
            </Link>
            <Link 
              href="/quizzes"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <GraduationCap className="h-5 w-5 mr-2" />
              Quizzes
            </Link>
            {user && (
              <Link 
                href="/stories/my-stories"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Stories
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}; 