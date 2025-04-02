'use client';

import { Suspense } from 'react';
import { StoryContent } from '@/components/story-content';
import { StoryPageLoading } from '@/components/story-page-loading';
import { StoryPageError } from '@/components/story-page-error';
import { Database } from '@/lib/types';

type Story = Database['public']['Tables']['stories']['Row'];

interface StoryPageContainerProps {
  story: Story | null;
  error?: Error;
}

export function StoryPageContainer({ story, error }: StoryPageContainerProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<StoryPageLoading />}>
        <StoryContent story={story} error={error} />
      </Suspense>
    </div>
  );
} 