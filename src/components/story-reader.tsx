'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Database } from '@/lib/types';
import { QuizSection } from './quiz-section';

type Story = Database['public']['Tables']['stories']['Row'];

interface StoryReaderProps {
  story: Story;
}

export function StoryReader({ story }: StoryReaderProps) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const supabase = createClient();

  const handleUpvote = async () => {
    if (hasUpvoted) return;

    try {
      const { error } = await supabase
        .from('stories')
        .update({ upvotes: story.upvotes + 1 })
        .eq('id', story.id);

      if (error) throw error;
      setHasUpvoted(true);
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{story.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div>Level: {story.tadoku_level}</div>
          <div>Topic: {story.topic}</div>
          <button
            onClick={handleUpvote}
            disabled={hasUpvoted}
            className={`flex items-center gap-1 ${
              hasUpvoted ? 'text-primary' : 'hover:text-primary'
            }`}
          >
            <span>↑</span>
            <span>{story.upvotes + (hasUpvoted ? 1 : 0)}</span>
          </button>
        </div>
      </header>

      <div className="prose dark:prose-invert max-w-none">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Japanese Text</h2>
          <p className="whitespace-pre-wrap text-lg">{story.content_jp}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">English Translation</h2>
          <p className="whitespace-pre-wrap">{story.content_en}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Vocabulary</h2>
          <ul className="list-disc pl-6">
            {story.vocabulary.map((word, index) => (
              <li key={index}>{word}</li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Grammar Points</h2>
          <ul className="list-disc pl-6">
            {story.grammar.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={() => setIsReviewOpen(!isReviewOpen)}
          className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {isReviewOpen ? 'Hide Review' : 'Show Review'}
        </button>

        {isReviewOpen && (
          <div className="mt-6">
            <QuizSection storyId={story.id} />
          </div>
        )}
      </div>
    </article>
  );
} 