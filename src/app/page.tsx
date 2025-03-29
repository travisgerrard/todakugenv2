'use client';

import { useState, FormEvent, ChangeEvent, Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Loader2 } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-provider';

export default function Home() {
  const [wanikaniLevel, setWanikaniLevel] = useState('0');
  const [genkiChapter, setGenkiChapter] = useState('0');
  const [tadokuLevel, setTadokuLevel] = useState('0');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const { preferences, isLoading: preferencesLoading, error: preferencesError, updatePreferences } = useUserPreferences();
  const router = useRouter();
  const { user, isLoading: authLoading, signInWithGoogle } = useAuth();

  console.log('Home component rendering', { 
    preferencesLoading, 
    preferences, 
    preferencesError,
    currentState: { wanikaniLevel, genkiChapter, tadokuLevel },
    authStatus: { isAuthenticated: !!user, authLoading }
  });

  // Load preferences when they're available
  useEffect(() => {
    if (!preferencesLoading && preferences) {
      console.log('Loading preferences into state:', {
        wanikani_level: preferences.wanikani_level,
        genki_chapter: preferences.genki_chapter,
        tadoku_level: preferences.tadoku_level
      });
      
      // Convert values to strings, ensuring they're not undefined/null
      const wkLevel = preferences.wanikani_level !== null && preferences.wanikani_level !== undefined
        ? preferences.wanikani_level.toString()
        : '0';
        
      const gkChapter = preferences.genki_chapter !== null && preferences.genki_chapter !== undefined
        ? preferences.genki_chapter.toString()
        : '0';
        
      const tdLevel = preferences.tadoku_level !== null && preferences.tadoku_level !== undefined
        ? preferences.tadoku_level.toString()
        : '0';
      
      setWanikaniLevel(wkLevel);
      setGenkiChapter(gkChapter);
      setTadokuLevel(tdLevel);
      
      console.log('State updated to:', { wkLevel, gkChapter, tdLevel });
    }
  }, [preferences, preferencesLoading]);

  // Function to get the correct base URL for API calls
  const getApiBaseUrl = () => {
    if (typeof window === 'undefined') {
      // Server-side, use environment variable or default
      return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
    }
    
    // Client-side, determine from current URL
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}`;
  };
  
  // Define multiple endpoints to try in case the primary one fails
  const getApiEndpoints = () => {
    const baseUrl = getApiBaseUrl();
    console.log('Base URL for API requests:', baseUrl);
    return [
      // Try the standard API route first
      `${baseUrl}/api/stories/generate-test`,
      // Try the app router route directly
      `${baseUrl}/stories/generate-test`, 
      // Try with explicit path segment
      `${baseUrl}/stories/generate-test/`,
      // Try relative paths as last resort
      '/api/stories/generate-test',
      '/stories/generate-test'
    ];
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setGenerationStatus('Starting story generation...');

    try {
      // First check if user is authenticated using our auth context
      if (!user) {
        console.log("User is not authenticated");
        setError("You must be logged in to generate stories. Please sign in first.");
        setGenerationStatus(null);
        setIsLoading(false);
        
        // Show alert with login instructions
        alert("You need to sign in to generate stories. Please use the login button in the top navigation.");
        return;
      }
      
      console.log("User is authenticated:", user.id);
      
      // Verify we have the user's preferences
      if (!preferences) {
        console.warn('No user preferences available, using defaults');
      }

      // Prepare the request body
      const requestBody = {
        wanikaniLevel: parseInt(preferences?.wanikani_level?.toString() || "1"),
        genkiChapter: parseInt(preferences?.genki_chapter?.toString() || "1"),
        tadokuLevel: parseInt(preferences?.tadoku_level?.toString() || "1"),
        topic: topic || "School",
        length: 'medium',
      };

      console.log('Story generation request payload:', requestBody);
      setGenerationStatus('Preparing to send request...');
      
      // Get all endpoints to try
      const endpointsToTry = getApiEndpoints();
      console.log('Will try the following endpoints:', endpointsToTry);
      
      let succeeded = false;
      let lastError = null;
      let responseData = null;
      let lastResponse = null;
      
      // Set a much longer timeout - 3 minutes
      const TIMEOUT_MS = 180000; // 3 minutes
      
      // For showing elapsed time
      const startTime = Date.now();
      const updateLoadingMessage = () => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        setGenerationStatus(`Generating story... (${elapsedSeconds}s elapsed)`);
      };
      
      // Update the loading message every second
      const loadingInterval = setInterval(updateLoadingMessage, 1000);

      // Try each endpoint until one succeeds
      for (const endpoint of endpointsToTry) {
        if (succeeded) break;
        
        try {
          console.log(`Attempting endpoint: ${endpoint}`);
          setGenerationStatus(`Connecting to ${endpoint}... This may take up to 3 minutes.`);
          
          // Create AbortController to timeout long requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
          
          try {
            // Show a message with a note about the longer generation time
            setGenerationStatus(`Generating story with AI... This usually takes 1-2 minutes. Please wait.`);
            
            const response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
              signal: controller.signal
            });
            
            // Clear the timeout
            clearTimeout(timeoutId);
            
            // Save the response for debugging
            lastResponse = response;
            console.log(`Response from ${endpoint}:`, { 
              status: response.status, 
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries())
            });
            
            // Check if this is an HTML response (likely an error page)
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('text/html')) {
              const htmlText = await response.text();
              console.error(`Received HTML response from ${endpoint}:`, htmlText.substring(0, 200));
              throw new Error(`Server returned HTML instead of JSON (status ${response.status})`);
            }

            // Try to parse the JSON response
            const text = await response.text();
            console.log(`Raw response from ${endpoint}:`, text.substring(0, 200));
            
            let data;
            try {
              data = JSON.parse(text);
            } catch (jsonError) {
              console.error(`Failed to parse JSON from ${endpoint}:`, text.substring(0, 200));
              throw new Error(`Invalid JSON response: ${jsonError.message}`);
            }

            if (response.ok) {
              responseData = data;
              succeeded = true;
              console.log(`Successfully generated story using ${endpoint}:`, data);
              
              // If we used a fallback route, log it
              if (data.story?.type === 'fallback') {
                console.log("Used fallback API route for story generation");
              }
              
              break;
            } else {
              console.error(`API error from ${endpoint}:`, data);
              throw new Error(data.error || `API error: ${response.status} ${response.statusText}`);
            }
          } catch (abortError) {
            if (abortError.name === 'AbortError') {
              throw new Error(`Request to ${endpoint} timed out after ${TIMEOUT_MS/1000} seconds`);
            }
            throw abortError;
          }
        } catch (fetchError) {
          console.error(`Error with endpoint ${endpoint}:`, fetchError);
          lastError = fetchError;
          // Continue to the next endpoint
        }
      }
      
      // Clear the loading interval
      clearInterval(loadingInterval);

      if (!succeeded || !responseData) {
        let errorMessage = lastError?.message || "Failed to generate story after trying all endpoints";
        
        // Add more debugging info
        if (lastResponse) {
          errorMessage += ` (Last response status: ${lastResponse.status})`;
        }
        
        throw new Error(errorMessage);
      }

      // Process the successful response
      if (responseData.success) {
        const story = responseData.story;
        setGenerationStatus('Story generated successfully!');
        setError(null);
        
        // Check if story has an ID (means it was saved to DB)
        if (story.id) {
          // Redirect to the story page
          router.push(`/stories/${story.id}`);
          return;
        }
        
        // If no ID (not saved), show an alert
        alert(`Story generated successfully!\n\nTitle: ${story.title}\n\nJapanese: ${story.content_jp?.substring(0, 50)}...\n\nEnglish: ${story.content_en?.substring(0, 50)}...`);
        
        // Show an alert if the story was generated but not saved due to authentication
        if (responseData.message?.includes('not logged in') || responseData.story?.type === 'fallback') {
          setError("Story generated successfully, but it wasn't saved because you're not logged in. Log in to save stories.");
        }
      } else {
        throw new Error(responseData.error || "Unknown error generating story");
      }
    } catch (error) {
      console.error("Error generating story:", error);
      setError(error instanceof Error ? error.message : String(error));
      setGenerationStatus('Generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1">
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Tadoku Japanese Reader</h1>
          <p className="text-xl text-muted-foreground">
            Generate personalized Japanese stories based on your level and interests
          </p>
        </div>
        
        {/* Authentication Check and Story Generator Form */}
        {authLoading ? (
          <div className="flex justify-center my-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Checking authentication status...</span>
          </div>
        ) : user ? (
          <>
            {preferencesLoading ? (
              <div className="flex justify-center my-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading your preferences...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wanikaniLevel">Wanikani Level</Label>
                  <Select 
                    value={wanikaniLevel} 
                    onValueChange={setWanikaniLevel} 
                    defaultValue="0"
                    disabled={preferencesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {wanikaniLevel ? `Level ${wanikaniLevel}` : "Select Wanikani level"}
                      </SelectValue>
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
                  <Select 
                    value={genkiChapter} 
                    onValueChange={setGenkiChapter}
                    defaultValue="0"
                    disabled={preferencesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {genkiChapter ? `Chapter ${genkiChapter}` : "Select Genki chapter"}
                      </SelectValue>
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
                  <Select 
                    value={tadokuLevel} 
                    onValueChange={setTadokuLevel}
                    defaultValue="0"
                    disabled={preferencesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {tadokuLevel ? `Level ${tadokuLevel}` : "Select Tadoku level"}
                      </SelectValue>
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
                    disabled={preferencesLoading}
                  />
                </div>

                {/* Enhanced loading indicator */}
                {isLoading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 my-4">
                    <div className="flex items-center mb-2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                      <h3 className="font-medium text-blue-700">Generating Story</h3>
                    </div>
                    <p className="text-sm text-blue-600">{generationStatus || 'Processing your request...'}</p>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                    <p className="mt-2 text-xs text-blue-500">
                      Story generation can take 1-2 minutes as our AI carefully crafts your personalized Japanese story.
                    </p>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button type="submit" disabled={isLoading || preferencesLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : 'Generate Story'}
                </Button>
              </form>
            )}

            {/* Link to user's stories */}
            <div className="mt-6 text-center">
              <Button variant="outline" asChild>
                <Link href="/stories/my-stories">
                  View All My Stories
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-muted p-6 rounded-lg text-center max-w-xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">Sign in to Generate Stories</h2>
            <p className="mb-4">You need to be logged in to generate personalized Japanese stories.</p>
            <Button onClick={signInWithGoogle}>
              Sign in with Google
            </Button>
          </div>
        )}
      </section>
      
      {/* Recent Stories Section (visible to everyone) */}
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <h2 className="text-2xl font-bold mb-6">Recent Stories</h2>
        <Suspense fallback={
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading recent stories...</span>
          </div>
        }>
          <RecentStories />
        </Suspense>
      </section>
      
      {/* Help section */}
      <section className="container mx-auto px-4 py-6 border-t border-slate-200">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-2">Having Trouble?</h3>
          <p className="text-sm text-slate-600 mb-3">
            If your preferences aren't being loaded correctly or you're experiencing issues, 
            visit our debugging page for troubleshooting help.
          </p>
          <Button variant="outline" asChild size="sm">
            <a href="/debug">Debug Tools</a>
          </Button>
        </div>
      </section>
    </main>
  );
} 