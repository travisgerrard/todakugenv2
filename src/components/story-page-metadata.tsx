'use client';

import { Database } from '@/lib/types';

type Story = Database['public']['Tables']['stories']['Row'];

interface StoryPageMetadataProps {
  story: Story;
}

export function StoryPageMetadata({ story }: StoryPageMetadataProps) {
  return (
    <>
      <title>{story.title}</title>
      <meta name="description" content={`Read a Japanese graded reader story: ${story.title}`} />
      <meta property="og:title" content={story.title} />
      <meta property="og:description" content={`Read a Japanese graded reader story: ${story.title}`} />
      <meta property="og:type" content="article" />
      <meta property="article:published_time" content={story.created_at} />
      <meta property="article:author" content="Todaku Reader" />
      <meta property="article:section" content="Japanese Graded Readers" />
    </>
  );
} 