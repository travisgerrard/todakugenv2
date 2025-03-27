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

        {story.vocabulary && story.vocabulary.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Vocabulary</h2>
            <ul className="list-none space-y-4">
              {story.vocabulary.map((item, index) => (
                <li key={index} className="p-4 bg-muted rounded-lg">
                  <div className="font-semibold">{item.word}</div>
                  <div className="text-sm text-muted-foreground">{item.reading}</div>
                  <div className="mt-2">{item.meaning}</div>
                  <div className="mt-2 text-sm">
                    <div>Example: {item.example}</div>
                    <div className="text-muted-foreground">{item.example_translation}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {story.grammar && story.grammar.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Grammar Points</h2>
            <ul className="list-none space-y-4">
              {story.grammar.map((item, index) => (
                <li key={index} className="p-4 bg-muted rounded-lg">
                  <div className="font-semibold">{item.pattern}</div>
                  <div className="mt-2">{item.explanation}</div>
                  <div className="mt-2 text-sm">
                    <div>Example: {item.example}</div>
                    <div className="text-muted-foreground">{item.example_translation}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {story.quizzes && story.quizzes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quizzes</h2>
            <QuizSection quizzes={story.quizzes} />
          </div>
        )}
      </div>
    </article>
  );
} 