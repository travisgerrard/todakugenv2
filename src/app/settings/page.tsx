'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  wanikani_level: number | null;
  genki_chapter: number | null;
  tadoku_level: number | null;
}

export default function SettingsPage() {
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [wanikaniLevel, setWanikaniLevel] = useState('0');
  const [genkiChapter, setGenkiChapter] = useState('0');
  const [tadokuLevel, setTadokuLevel] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        
        const profile = data as unknown as Profile;
        setFullName(profile.full_name || '');
        setAvatarUrl(profile.avatar_url || '');
        setWanikaniLevel(profile.wanikani_level?.toString() || '0');
        setGenkiChapter(profile.genki_chapter?.toString() || '0');
        setTadokuLevel(profile.tadoku_level?.toString() || '0');
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          wanikani_level: parseInt(wanikaniLevel),
          genki_chapter: parseInt(genkiChapter),
          tadoku_level: parseInt(tadokuLevel),
        })
        .eq('id', session.user.id);

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="text-center">Loading profile...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="URL to your avatar image"
            />
          </div>

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

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-500 text-sm">Profile updated successfully!</div>
          )}

          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </main>
  );
} 