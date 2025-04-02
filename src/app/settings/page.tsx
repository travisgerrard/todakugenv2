'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
  full_name: string | null;
  wanikani_level: number | null;
  genki_chapter: number | null;
  tadoku_level: number | null;
}

export default function SettingsPage() {
  const [fullName, setFullName] = useState('');
  const [wanikaniLevel, setWanikaniLevel] = useState('0');
  const [genkiChapter, setGenkiChapter] = useState('0');
  const [tadokuLevel, setTadokuLevel] = useState('0');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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
          wanikani_level: parseInt(wanikaniLevel),
          genki_chapter: parseInt(genkiChapter),
          tadoku_level: parseInt(tadokuLevel),
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;
      setSuccess(true);
      
      // Clear localStorage cache to force a fresh reload of preferences
      if (typeof window !== 'undefined') {
        localStorage.removeItem('todaku_user_preferences');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleResetProfile = async () => {
    const confirmed = window.confirm(
      'Reset your profile? This will reset your Wanikani, Genki, and Tadoku levels to zero. Your name and avatar will be preserved. This action is helpful if you\'re experiencing issues with your profile data.'
    );
    
    if (!confirmed) return;
    
    setIsResetting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');
      
      // First, delete the existing profile
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', session.user.id);
      
      if (deleteError) throw deleteError;
      
      // Then create a new one with default values
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          full_name: fullName, // Preserve the name
          wanikani_level: 0,
          genki_chapter: 0,
          tadoku_level: 0,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Clear localStorage cache
      if (typeof window !== 'undefined') {
        localStorage.removeItem('todaku_user_preferences');
      }
      
      // Update state with new values
      setWanikaniLevel('0');
      setGenkiChapter('0');
      setTadokuLevel('0');
      
      setSuccess(true);
      
      // Reload the page to ensure everything is fresh
      router.refresh();
    } catch (err) {
      console.error('Error resetting profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset profile');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading profile...</span>
          </div>
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

          <div className="flex space-x-4">
            <Button type="submit" disabled={isSaving || isResetting}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
            
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleResetProfile} 
              disabled={isSaving || isResetting}
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : 'Reset Profile'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
} 