'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { StoryGenerationProgress } from '@/components/story-generation-progress';

interface StoryGeneratorProps {
  className?: string;
}

export function StoryGenerator({ className }: StoryGeneratorProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<'generating' | 'processing' | 'complete' | 'error'>('generating');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGenerationStatus('generating');

    const formData = new FormData(e.currentTarget);
    const data = {
      wanikani_level: Number(formData.get('wanikani_level')),
      genki_chapter: Number(formData.get('genki_chapter')),
      tadoku_level: Number(formData.get('tadoku_level')),
      length: formData.get('length') as 'short' | 'medium' | 'long',
      topic: formData.get('topic') as string,
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please sign in to generate stories');
      }

      setGenerationStatus('processing');
      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate story');
      }

      const story = await response.json();
      setGenerationStatus('complete');
      
      // Wait a moment to show the completion state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push(`/stories/${story.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setGenerationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <StoryGenerationProgress status={generationStatus} error={error || undefined} />;
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 max-w-md mx-auto ${className}`}>
      <div className="space-y-4">
        <div>
          <label htmlFor="wanikani_level" className="block text-sm font-medium mb-1">
            Wanikani Level
          </label>
          <input
            type="number"
            id="wanikani_level"
            name="wanikani_level"
            min="1"
            max="60"
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label htmlFor="genki_chapter" className="block text-sm font-medium mb-1">
            Genki Chapter
          </label>
          <input
            type="number"
            id="genki_chapter"
            name="genki_chapter"
            min="1"
            max="23"
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label htmlFor="tadoku_level" className="block text-sm font-medium mb-1">
            Tadoku Level
          </label>
          <input
            type="number"
            id="tadoku_level"
            name="tadoku_level"
            min="0"
            max="5"
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label htmlFor="length" className="block text-sm font-medium mb-1">
            Story Length
          </label>
          <select
            id="length"
            name="length"
            required
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="short">Short (100-200 characters)</option>
            <option value="medium">Medium (200-400 characters)</option>
            <option value="long">Long (400+ characters)</option>
          </select>
        </div>
        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-1">
            Topic
          </label>
          <input
            type="text"
            id="topic"
            name="topic"
            required
            placeholder="e.g., daily life, travel, food"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {isLoading ? 'Generating...' : 'Generate Story'}
      </button>
    </form>
  );
} 