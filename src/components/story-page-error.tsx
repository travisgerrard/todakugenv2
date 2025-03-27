'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface StoryPageErrorProps {
  error: Error;
}

export function StoryPageError({ error }: StoryPageErrorProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || 'An error occurred while loading the story.'}
        </AlertDescription>
      </Alert>
    </div>
  );
} 