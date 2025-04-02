import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h2 className="text-3xl font-bold mb-4">404 - Page Not Found</h2>
      <p className="text-lg text-muted-foreground mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link 
        href="/" 
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
} 