import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { generateStory } from '../../../../lib/api';
import fs from 'fs';
import path from 'path';

// Enable better logging for debugging
const ENABLE_FILE_LOGGING = true;

function logToFile(message: string) {
  if (!ENABLE_FILE_LOGGING) return;
  
  try {
    const logDir = path.join(process.cwd(), 'logs');
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logPath = path.join(logDir, 'story-generation.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(2, 9);
  const logPrefix = `[StoryGen-${requestId}]`;
  
  console.log(`${logPrefix} Story generation API called`);
  logToFile(`${logPrefix} Story generation API called`);
  
  try {
    // Create Supabase client with options for Safari
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore,
    });
    
    console.log(`${logPrefix} Supabase client created, checking session`);
    logToFile(`${logPrefix} Supabase client created, checking session`);
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error(`${logPrefix} Error fetching session:`, error);
      logToFile(`${logPrefix} Error fetching session: ${JSON.stringify(error)}`);
      return NextResponse.json({ error: 'Session error', details: error }, { status: 500 });
    }
    
    console.log(`${logPrefix} Session check response:`, {
      hasSession: !!data.session,
      userId: data.session?.user?.id || 'No user ID',
    });
    logToFile(`${logPrefix} Session check: ${!!data.session ? 'Authenticated' : 'Not authenticated'}`);

    if (!data.session) {
      console.log(`${logPrefix} User is not authenticated`);
      logToFile(`${logPrefix} User is not authenticated`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
      console.log(`${logPrefix} Request body:`, body);
      logToFile(`${logPrefix} Request body: ${JSON.stringify(body)}`);
    } catch (parseError) {
      console.error(`${logPrefix} Error parsing request body:`, parseError);
      logToFile(`${logPrefix} Error parsing request body: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      return NextResponse.json(
        { error: 'Invalid request body', details: parseError instanceof Error ? parseError.message : 'Unknown error' },
        { status: 400 }
      );
    }
    
    const { wanikaniLevel, genkiChapter, tadokuLevel, topic, length } = body;

    if (!wanikaniLevel || !genkiChapter || !tadokuLevel || !topic) {
      console.log(`${logPrefix} Missing required fields:`, { wanikaniLevel, genkiChapter, tadokuLevel, topic });
      logToFile(`${logPrefix} Missing required fields: ${JSON.stringify({ wanikaniLevel, genkiChapter, tadokuLevel, topic })}`);
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`${logPrefix} Generating story with params:`, {
      wanikani_level: wanikaniLevel,
      genki_chapter: genkiChapter,
      tadoku_level: tadokuLevel,
      length: length || 'medium',
      topic,
    });
    logToFile(`${logPrefix} Generating story with params: ${JSON.stringify({
      wanikani_level: wanikaniLevel,
      genki_chapter: genkiChapter,
      tadoku_level: tadokuLevel,
      length: length || 'medium',
      topic,
    })}`);

    try {
      const story = await generateStory({
        wanikani_level: wanikaniLevel,
        genki_chapter: genkiChapter,
        tadoku_level: tadokuLevel,
        length: length || 'medium',
        topic,
      });
      
      console.log(`${logPrefix} Story generated successfully, title:`, story.title);
      logToFile(`${logPrefix} Story generated successfully, title: ${story.title}`);

      // Save the story with JSONB data
      const storyData = {
        user_id: data.session.user.id,
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

      console.log(`${logPrefix} Saving story to database...`);
      logToFile(`${logPrefix} Saving story to database...`);
      const { data: savedStory, error: saveError } = await supabase
        .from('stories')
        .insert(storyData)
        .select()
        .single();

      if (saveError) {
        console.error(`${logPrefix} Error saving story to database:`, saveError);
        logToFile(`${logPrefix} Error saving story to database: ${JSON.stringify(saveError)}`);
        return NextResponse.json(
          { error: 'Failed to save story', details: saveError },
          { status: 500 }
        );
      }

      console.log(`${logPrefix} Story saved successfully with ID:`, savedStory.id);
      logToFile(`${logPrefix} Story saved successfully with ID: ${savedStory.id}`);
      return NextResponse.json(savedStory);
    } catch (storyError) {
      console.error(`${logPrefix} Error in generateStory function:`, storyError);
      logToFile(`${logPrefix} Error in generateStory function: ${storyError instanceof Error ? storyError.message : 'Unknown error'}`);
      
      // Determine if this is an OpenAI API error
      const isOpenAIError = storyError instanceof Error && 
        (storyError.message.includes('OpenAI') || 
         storyError.message.includes('API key') || 
         storyError.stack?.includes('openai'));
      
      if (isOpenAIError) {
        logToFile(`${logPrefix} OpenAI API error detected: ${storyError instanceof Error ? storyError.message : 'Unknown error'}`);
        console.error(`${logPrefix} OpenAI API error:`, storyError);
      }
      
      return NextResponse.json(
        { 
          error: storyError instanceof Error ? storyError.message : 'Failed to generate story',
          stack: storyError instanceof Error ? storyError.stack : undefined,
          details: storyError,
          isOpenAIError
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`${logPrefix} Unhandled error in story generation API route:`, error);
    logToFile(`${logPrefix} Unhandled error in story generation API route: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return NextResponse.json(
      { 
        error: 'Failed to generate story',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 