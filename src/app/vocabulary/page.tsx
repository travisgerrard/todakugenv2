import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/types';
import { VocabularyCollection } from './vocabulary-collection';

type Story = Database['public']['Tables']['stories']['Row'];

interface VocabularyItem {
  word: string;
  reading: string;
  meaning: string;
  example: string;
  example_translation: string;
  storyTitle: string;
  storyId: string;
}

export const metadata = {
  title: 'Vocabulary Collection | Tadoku Reader',
  description: 'Browse all vocabulary from Japanese graded readers based on your level.',
};

export default async function VocabularyPage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  // Fetch user preferences for filtering
  const { data: session } = await supabase.auth.getSession();
  let userLevels = { wanikaniLevel: 0, genkiChapter: 0, tadokuLevel: 0 };

  if (session?.user) {
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('wanikani_level, genki_chapter, tadoku_level')
      .eq('user_id', session.user.id)
      .single();

    if (preferences) {
      userLevels = {
        wanikaniLevel: preferences.wanikani_level || 0,
        genkiChapter: preferences.genki_chapter || 0,
        tadokuLevel: preferences.tadoku_level || 0,
      };
    }
  }

  // Fetch stories with vocabulary
  const { data: stories, error } = await supabase
    .from('stories')
    .select('id, title, vocabulary, wanikani_level, genki_chapter, tadoku_level')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching vocabulary:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-6">Vocabulary Collection</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
          <p className="text-sm text-red-600">Error loading vocabulary: {error.message}</p>
        </div>
      </div>
    );
  }

  // Process and filter vocabulary
  const allVocabulary: VocabularyItem[] = [];
  
  if (stories) {
    stories.forEach((story) => {
      if (Array.isArray(story.vocabulary)) {
        story.vocabulary.forEach((vocab) => {
          allVocabulary.push({
            ...vocab,
            storyTitle: story.title,
            storyId: story.id,
          });
        });
      }
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Vocabulary Collection</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Browse all vocabulary from Japanese graded readers. Filter by level or search for specific words.
      </p>
      
      <VocabularyCollection vocabulary={allVocabulary} userLevels={userLevels} />
    </div>
  );
} 