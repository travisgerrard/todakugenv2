import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/types';
import { QuizCollection } from './quiz-collection';

type Story = Database['public']['Tables']['stories']['Row'];

interface QuizItem {
  type: 'vocabulary' | 'grammar' | 'comprehension';
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  related_item?: string;
  storyTitle: string;
  storyId: string;
}

export const metadata = {
  title: 'Quiz Collection | Tadoku Reader',
  description: 'Test your Japanese knowledge with interactive quizzes based on your reading level.',
};

export default async function QuizzesPage() {
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

  // Fetch stories with quizzes
  const { data: stories, error } = await supabase
    .from('stories')
    .select('id, title, quizzes, wanikani_level, genki_chapter, tadoku_level')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quizzes:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-6">Quiz Collection</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
          <p className="text-sm text-red-600">Error loading quizzes: {error.message}</p>
        </div>
      </div>
    );
  }

  // Process and filter quizzes
  const allQuizzes: QuizItem[] = [];
  
  if (stories) {
    stories.forEach((story) => {
      if (Array.isArray(story.quizzes)) {
        story.quizzes.forEach((quiz) => {
          allQuizzes.push({
            ...quiz,
            storyTitle: story.title,
            storyId: story.id,
          });
        });
      }
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Quiz Collection</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Test your Japanese knowledge with these interactive quizzes. Filter by quiz type or level.
      </p>
      
      <QuizCollection quizzes={allQuizzes} userLevels={userLevels} />
    </div>
  );
} 