'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function DebugPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const checkProfile = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    
    try {
      const response = await fetch('/api/debug/profile');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch profile data');
      }
      
      setData(result);
    } catch (err) {
      console.error('Error checking profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-3xl font-bold mb-4">Debug Tools</h1>
        
        <div className="prose max-w-none mb-6">
          <p>
            This page provides tools to help troubleshoot issues with your profile data.
            If you're experiencing problems with your preferences not being saved or loaded correctly,
            these tools can help identify the source of the problem.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-2">Check Your Profile</h2>
          <p>
            Click the button below to check your profile data. This will show information about your
            user session and profile in the database. If you're reporting an issue, this information
            may be helpful for support.
          </p>
        </div>
        
        <Button 
          onClick={checkProfile} 
          disabled={loading} 
          className="mb-6"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking Profile...
            </>
          ) : 'Check My Profile'}
        </Button>
        
        {error && (
          <div className="p-4 mb-6 bg-red-50 text-red-800 rounded-md border border-red-200">
            <h3 className="font-bold mb-2">Error</h3>
            <p>{error}</p>
          </div>
        )}
        
        {data && (
          <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
            <h3 className="font-bold mb-2">Profile Data</h3>
            <pre className="whitespace-pre-wrap bg-slate-100 p-4 rounded-md overflow-auto max-h-96 text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
            
            <div className="mt-4">
              <h3 className="font-bold mb-2">What to Look For</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Session data</strong>: Confirms you're logged in. If you don't see session data, you might need to sign in again.
                </li>
                <li>
                  <strong>Profile data</strong>: Shows your saved preferences. If this is missing, your profile might not exist in the database.
                </li>
                <li>
                  <strong>Level values</strong>: Check if wanikani_level, genki_chapter, and tadoku_level values match what you expect.
                </li>
              </ul>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
              <h3 className="font-bold mb-1">Troubleshooting Tips</h3>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Try clearing your browser cache and refreshing the page</li>
                <li>Sign out and sign back in to refresh your session</li>
                <li>Go to Settings and use the "Reset Profile" button to recreate your profile with default values</li>
                <li>If all else fails, contact support with this profile data</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 