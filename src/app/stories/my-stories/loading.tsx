import React from 'react';
import { Loader2 } from 'lucide-react';

export default function MyStoriesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Stories</h1>
      </div>
      
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your stories...</p>
      </div>
    </div>
  );
} 