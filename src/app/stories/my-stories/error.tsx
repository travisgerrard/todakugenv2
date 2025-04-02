'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MyStoriesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Stories</h1>
      </div>
      
      <div className="bg-red-50 border border-red-200 rounded-md p-8 my-4 text-center">
        <h2 className="text-xl font-semibold text-red-800 mb-4">Something went wrong</h2>
        <p className="text-red-600 mb-6">{error.message || 'Error loading your stories'}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()} variant="outline">
            Try again
          </Button>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 