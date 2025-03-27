'use client';

import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { Database } from '@/lib/types';
import { useEffect, useState } from 'react';

type Story = Database['public']['Tables']['stories']['Row'];

export function RecentStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStories() {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setStories(data as Story[] || []);
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stories');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStories();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground">
        Loading recent stories...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading stories: {error}
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No stories yet. Be the first to generate one!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <Link
          key={story.id}
          href={`/stories/${story.id}`}
          className="block p-6 bg-card rounded-lg border hover:border-primary transition-colors"
        >
          <h3 className="text-lg font-semibold mb-2">{story.title}</h3>
          <div className="text-sm text-muted-foreground mb-4">
            <div>Upvotes: {story.upvotes}</div>
          </div>
          <div className="text-sm line-clamp-3">{story.content_jp}</div>
        </Link>
      ))}
    </div>
  );
} 