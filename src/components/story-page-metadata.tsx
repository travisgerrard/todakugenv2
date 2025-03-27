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
      <meta name="description" content={`Read a Japanese graded reader story at Wanikani level ${story.wanikani_level}, Genki chapter ${story.genki_chapter}, and Tadoku level ${story.tadoku_level}.`} />
      <meta property="og:title" content={story.title} />
      <meta property="og:description" content={`Read a Japanese graded reader story at Wanikani level ${story.wanikani_level}, Genki chapter ${story.genki_chapter}, and Tadoku level ${story.tadoku_level}.`} />
      <meta property="og:type" content="article" />
      <meta property="article:published_time" content={story.created_at} />
      <meta property="article:author" content="Todaku Reader" />
      <meta property="article:section" content="Japanese Graded Readers" />
      <meta property="article:tag" content={`wanikani-level-${story.wanikani_level},genki-chapter-${story.genki_chapter},tadoku-level-${story.tadoku_level}`} />
    </>
  );
} 