import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/types';

type Story = Database['public']['Tables']['stories']['Row'];

export const metadata = {
  title: 'My Stories - Tadoku Reader',
  description: 'View all Japanese stories you have generated with Tadoku Reader',
}

export default async function MyStoriesPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  // If not authenticated, redirect to home page
  if (!session) {
    redirect('/');
  }
  
  // Fetch user's stories
  const { data: stories, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user stories:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-6">My Stories</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
          <p className="text-sm text-red-600">Error loading stories: {error.message}</p>
        </div>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Stories</h1>
        <Button asChild>
          <Link href="/">Create New Story</Link>
        </Button>
      </div>
      
      {stories && stories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/stories/${story.id}`}
              className="block p-6 bg-card rounded-lg border hover:border-primary transition-colors"
            >
              <h3 className="text-lg font-semibold mb-2">{story.title}</h3>
              <div className="text-sm text-muted-foreground mb-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {story.wanikani_level && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      WK: {story.wanikani_level}
                    </span>
                  )}
                  {story.genki_chapter && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Genki: {story.genki_chapter}
                    </span>
                  )}
                  {story.tadoku_level && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Tadoku: {story.tadoku_level}
                    </span>
                  )}
                </div>
                <div>Upvotes: {story.upvotes}</div>
                <div>Created: {new Date(story.created_at).toLocaleDateString()}</div>
              </div>
              <div className="text-sm line-clamp-3">{story.content_jp}</div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-3">No Stories Found</h2>
          <p className="text-muted-foreground mb-6">You haven't generated any stories yet.</p>
          <Button asChild>
            <Link href="/">Generate Your First Story</Link>
          </Button>
        </div>
      )}
    </div>
  );
} 