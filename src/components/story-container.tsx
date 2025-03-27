'use client';

import { StoryHeader } from '@/components/story-header';
import { StoryContent } from '@/components/story-content';
import { StorySections } from '@/components/story-sections';
import { Database } from '@/lib/types';

type Story = Database['public']['Tables']['stories']['Row'];

interface StoryContainerProps {
  story: Story;
}

export function StoryContainer({ story }: StoryContainerProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <StoryHeader
        title={story.title}
        storyId={story.id}
        upvotes={story.upvotes}
      />

      <StoryContent contentJp={story.content_jp} contentEn={story.content_en} />

      <StorySections story={story} />
    </div>
  );
} 