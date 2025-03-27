'use client';

import { StoryPageError } from '@/components/story-page-error';

export default function StoryNotFound() {
  return (
    <StoryPageError 
      error={new Error('Story not found. Please check the URL and try again.')} 
    />
  );
} 