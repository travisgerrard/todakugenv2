'use client';

import { useEffect } from 'react';
import { StoryPageError } from '@/components/story-page-error';

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export default function StoryErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('Story page error:', error);
  }, [error]);

  return <StoryPageError error={error} />;
} 