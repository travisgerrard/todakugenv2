import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { StoryPageContainer } from '@/components/story-page-container';
import { StoryPageLoading } from '@/components/story-page-loading';
import { StoryPageError } from '@/components/story-page-error';
import { StoryPageMetadata } from '@/components/story-page-metadata';
import { notFound } from 'next/navigation';

interface StoryPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 3600; // Revalidate every hour

export default async function StoryPage({ params }: StoryPageProps) {
  const supabase = createServerComponentClient({ cookies });

  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    console.error('Error fetching story:', error);
    return <StoryPageError error={error} />;
  }

  if (!story) {
    notFound();
  }

  // Log the story data to check the structure
  console.log('Fetched story:', story);

  return (
    <>
      <StoryPageMetadata story={story} />
      <Suspense fallback={<StoryPageLoading />}>
        <StoryPageContainer story={story} />
      </Suspense>
    </>
  );
} 