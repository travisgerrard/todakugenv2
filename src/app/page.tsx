'use client';

import { useState, FormEvent, ChangeEvent, Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase';
import { RecentStories } from '@/components/recent-stories';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from 'next/navigation';

export default function Home() {
  const [wanikaniLevel, setWanikaniLevel] = useState('');
  const [genkiChapter, setGenkiChapter] = useState('');
  const [tadokuLevel, setTadokuLevel] = useState('');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { preferences, isLoading: preferencesLoading, updatePreferences } = useUserPreferences();
  const router = useRouter();

  // Load preferences when they're available
  useEffect(() => {
    if (preferences) {
      console.log('Loading preferences:', preferences);
      setWanikaniLevel(preferences.wanikani_level?.toString() || '0');
      setGenkiChapter(preferences.genki_chapter?.toString() || '0');
      setTadokuLevel(preferences.tadoku_level?.toString() || '0');
    }
  }, [preferences]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to generate stories');
      }

      // Update preferences
      await updatePreferences({
        wanikani_level: parseInt(wanikaniLevel),
        genki_chapter: parseInt(genkiChapter),
        tadoku_level: parseInt(tadokuLevel),
      });

      const response = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wanikaniLevel: parseInt(wanikaniLevel),
          genkiChapter: parseInt(genkiChapter),
          tadokuLevel: parseInt(tadokuLevel),
          topic,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate story');
      }

      const data = await response.json();
      router.push(`/stories/${data.id}`);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate story');
    } finally {
      setIsLoading(false);
    }
  };

  if (preferencesLoading) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="text-center">Loading preferences...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Tadoku Japanese Reader</h1>
          <p className="text-xl text-muted-foreground">
            Generate personalized Japanese stories based on your level and interests
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wanikaniLevel">Wanikani Level</Label>
            <Select value={wanikaniLevel} onValueChange={setWanikaniLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select Wanikani level" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {[...Array(61)].map((_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    Level {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genkiChapter">Genki Chapter</Label>
            <Select value={genkiChapter} onValueChange={setGenkiChapter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Genki chapter" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {[...Array(24)].map((_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    Chapter {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tadokuLevel">Tadoku Level</Label>
            <Select value={tadokuLevel} onValueChange={setTadokuLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select Tadoku level" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(6)].map((_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    Level {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
              placeholder="e.g., Daily Life"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Story'}
          </Button>
        </form>
      </section>
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <h2 className="text-2xl font-bold mb-6">Recent Stories</h2>
        <Suspense fallback={<div className="text-center">Loading recent stories...</div>}>
          <RecentStories />
        </Suspense>
      </section>
    </main>
  );
} 