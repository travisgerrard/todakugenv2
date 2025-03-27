'use client';

import { useState, useEffect } from 'react';
import { Database } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { StoryPageLoading } from '@/components/story-page-loading';
import { StoryPageError } from '@/components/story-page-error';
import { VocabularySection } from '@/components/vocabulary-section';
import { GrammarSection } from '@/components/grammar-section';
import { QuizSection } from '@/components/quiz-section';

type Story = Database['public']['Tables']['stories']['Row'];

interface StoryContentProps {
  story: Story | null;
  error?: Error;
}

export function StoryContent({ story, error }: StoryContentProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [parsedStory, setParsedStory] = useState<Story | null>(null);

  useEffect(() => {
    if (story) {
      // Parse the JSONB data if it's a string
      const parsedVocabulary = typeof story.vocabulary === 'string' 
        ? JSON.parse(story.vocabulary) 
        : story.vocabulary;
      
      const parsedGrammar = typeof story.grammar === 'string' 
        ? JSON.parse(story.grammar) 
        : story.grammar;
      
      const parsedQuizzes = typeof story.quizzes === 'string' 
        ? JSON.parse(story.quizzes) 
        : story.quizzes;

      setParsedStory({
        ...story,
        vocabulary: parsedVocabulary,
        grammar: parsedGrammar,
        quizzes: parsedQuizzes,
      });
    }
  }, [story]);

  if (error) {
    return <StoryPageError error={error} />;
  }

  if (!parsedStory) {
    return <StoryPageLoading />;
  }

  return (
    <div className="prose dark:prose-invert max-w-none">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Japanese Text</h2>
        <p className="whitespace-pre-wrap text-lg">{parsedStory.content_jp}</p>
      </div>

      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => setShowTranslation(!showTranslation)}
          className="w-full flex items-center justify-between"
        >
          <span>English Translation</span>
          {showTranslation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {showTranslation && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="whitespace-pre-wrap">{parsedStory.content_en}</p>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {parsedStory.vocabulary?.length > 0 && <VocabularySection vocabulary={parsedStory.vocabulary} />}
        {parsedStory.grammar?.length > 0 && <GrammarSection grammar={parsedStory.grammar} />}
        {parsedStory.quizzes?.length > 0 && <QuizSection quizzes={parsedStory.quizzes} />}
      </div>
    </div>
  );
} 