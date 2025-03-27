'use client';

import { StoryPageError } from '@/components/story-page-error';

export default function StoryError({
  error,
}: {
  error: Error;
}) {
  return <StoryPageError error={error} />;
} 