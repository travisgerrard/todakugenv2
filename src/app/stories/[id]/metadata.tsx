import { Metadata } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/types';

type Story = Database['public']['Tables']['stories']['Row'];

interface MetadataProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies });
  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !story) {
    return {
      title: 'Story Not Found',
      description: 'The story you\'re looking for doesn\'t exist or has been removed.',
    };
  }

  return {
    title: story.title,
    description: `Read a Japanese graded reader story at Wanikani level ${story.wanikani_level}, Genki chapter ${story.genki_chapter}, and Tadoku level ${story.tadoku_level}.`,
    openGraph: {
      title: story.title,
      description: `Read a Japanese graded reader story at Wanikani level ${story.wanikani_level}, Genki chapter ${story.genki_chapter}, and Tadoku level ${story.tadoku_level}.`,
      type: 'article',
      publishedTime: story.created_at,
      authors: ['Todaku Reader'],
      tags: [`wanikani-level-${story.wanikani_level}`, `genki-chapter-${story.genki_chapter}`, `tadoku-level-${story.tadoku_level}`],
    },
  };
} 