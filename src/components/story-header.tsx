'use client';

import { UpvoteButton } from '@/components/upvote-button';

interface StoryHeaderProps {
  title: string;
  storyId: string;
  upvotes: number;
}

export function StoryHeader({ title, storyId, upvotes }: StoryHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <div className="flex items-center gap-4">
        <UpvoteButton storyId={storyId} upvotes={upvotes} />
      </div>
    </div>
  );
} 