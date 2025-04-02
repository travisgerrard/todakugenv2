import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storyId = params.id;

    // Check if user has already upvoted this story
    const { data: existingVote } = await supabase
      .from('story_upvotes')
      .select()
      .eq('user_id', session.user.id)
      .eq('story_id', storyId)
      .single();

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already upvoted this story' },
        { status: 400 }
      );
    }

    // Start a transaction
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('upvotes')
      .eq('id', storyId)
      .single();

    if (storyError) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Create upvote record and update story upvotes count
    const { error: transactionError } = await supabase.rpc('upvote_story', {
      p_story_id: storyId,
      p_user_id: session.user.id,
    });

    if (transactionError) {
      console.error('Error in upvote transaction:', transactionError);
      return NextResponse.json(
        { error: 'Failed to process upvote' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing upvote:', error);
    return NextResponse.json(
      { error: 'Failed to process upvote' },
      { status: 500 }
    );
  }
} 