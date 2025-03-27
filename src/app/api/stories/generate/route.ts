import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateStory } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { wanikaniLevel, genkiChapter, tadokuLevel, topic } = body;

    if (!wanikaniLevel || !genkiChapter || !tadokuLevel || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const story = await generateStory({
      wanikani_level: wanikaniLevel,
      genki_chapter: genkiChapter,
      tadoku_level: tadokuLevel,
      length: 'medium',
      topic,
    });

    // Save the story with JSONB data
    const storyData = {
      user_id: session.user.id,
      title: story.title,
      content_jp: story.content_jp,
      content_en: story.content_en,
      wanikani_level: wanikaniLevel,
      genki_chapter: genkiChapter,
      tadoku_level: tadokuLevel,
      topic,
      vocabulary: story.vocabulary || [],
      grammar: story.grammar || [],
      quizzes: story.quizzes || [],
      upvotes: 0,
    };

    const { data: savedStory, error: saveError } = await supabase
      .from('stories')
      .insert(storyData)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving story:', saveError);
      return NextResponse.json(
        { error: 'Failed to save story' },
        { status: 500 }
      );
    }

    return NextResponse.json(savedStory);
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
} 