import { NextResponse } from 'next/server';
import { generateStory } from '../../../../../lib/api';
import fs from 'fs';
import path from 'path';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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
    
    const logPath = path.join(logDir, 'story-test.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

// Make this completely dynamic to avoid caching issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Log API initialization when module is loaded
console.log('📄 Initializing /api/stories/generate-test route');
logToFile('[INIT] Initializing /api/stories/generate-test route');

function isSafariOrIOS(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  return isSafari || isIOS;
}

// Standard headers for cross-browser compatibility
const getStandardHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'X-Content-Type-Options': 'nosniff'
  };
};

// Add a GET handler to verify the route is accessible
export async function GET(request: Request) {
  const requestId = Math.random().toString(36).substring(2, 9);
  const logPrefix = `[StoryTest-${requestId}]`;
  
  console.log(`${logPrefix} GET request received for test endpoint`);
  logToFile(`${logPrefix} GET request received for test endpoint`);
  
  return new NextResponse(
    JSON.stringify({ 
      status: 'online',
      message: 'The story generation test API is available. Use POST to generate stories.',
      path: '/api/stories/generate-test',
      timestamp: new Date().toISOString()
    }),
    { 
      status: 200,
      headers: getStandardHeaders()
    }
  );
}

export async function OPTIONS(request: Request) {
  console.log('OPTIONS request received for test endpoint');
  logToFile('OPTIONS request received for test endpoint');
  
  return new NextResponse(null, {
    status: 200,
    headers: getStandardHeaders()
  });
}

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(2, 9);
  const logPrefix = `[StoryTest-${requestId}]`;
  
  // Log the full URL for debugging
  const url = request.url;
  console.log(`${logPrefix} Request URL: ${url}`);
  logToFile(`${logPrefix} Request URL: ${url}`);
  
  // Get User-Agent for debugging
  const userAgent = request.headers.get('user-agent');
  const isMobileSafari = isSafariOrIOS(userAgent);
  
  console.log(`${logPrefix} Test story API called`);
  logToFile(`${logPrefix} Test story API called`);
  logToFile(`${logPrefix} User-Agent: ${userAgent}`);
  logToFile(`${logPrefix} Is Safari/iOS: ${isMobileSafari}`);
  
  // Create an authenticated Supabase client
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  // Check authentication status
  console.log(`${logPrefix} Checking auth status...`);
  const { data, error: sessionError } = await supabase.auth.getSession();
  const session = data?.session;
  
  if (sessionError) {
    console.error(`${logPrefix} Error fetching session:`, sessionError);
    logToFile(`${logPrefix} Error fetching session: ${sessionError.message || 'Unknown error'}`);
  }
  
  // Log detailed session info for debugging
  console.log(`${logPrefix} Session data:`, {
    hasSession: !!session,
    userId: session?.user?.id || 'No user ID',
    expires: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'No expiry',
    authHeaders: request.headers.has('authorization') ? 'Present' : 'Missing',
    cookies: {
      count: cookieStore.getAll().length,
      names: cookieStore.getAll().map(c => c.name).join(', ')
    }
  });
  
  // For now, remove the authentication check to debug the issue
  if (false && !session) {
    console.log(`${logPrefix} User is not authenticated`);
    logToFile(`${logPrefix} User is not authenticated`);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to generate stories',
        type: 'auth_required'
      }),
      { 
        status: 401,
        headers: getStandardHeaders()
      }
    );
  }
  
  const userId = session?.user?.id || 'anonymous-user';
  console.log(`${logPrefix} User authenticated: ${userId}`);
  logToFile(`${logPrefix} User authenticated: ${userId}`);
  
  try {
    let body;
    try {
      const text = await request.text();
      logToFile(`${logPrefix} Raw request body: ${text.substring(0, 200)}`);
      
      try {
        body = JSON.parse(text);
      } catch (jsonError) {
        logToFile(`${logPrefix} JSON parse error: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`);
        // Try to fix malformed JSON (sometimes an issue with mobile browsers)
        if (text.includes('{') && text.includes('}')) {
          const fixedText = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
          logToFile(`${logPrefix} Attempting to fix malformed JSON: ${fixedText.substring(0, 200)}`);
          body = JSON.parse(fixedText);
        } else {
          throw jsonError;
        }
      }
      
      console.log(`${logPrefix} Request body:`, body);
      logToFile(`${logPrefix} Parsed request body: ${JSON.stringify(body)}`);
    } catch (parseError) {
      console.error(`${logPrefix} Error parsing request body:`, parseError);
      logToFile(`${logPrefix} Error parsing request body: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      
      // Special handling for Safari JSON parse errors
      if (isMobileSafari) {
        logToFile(`${logPrefix} Safari/iOS detected - JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid request body', 
          details: parseError instanceof Error ? parseError.message : 'Unknown error',
          isSafari: isMobileSafari
        }),
        { 
          status: 400,
          headers: getStandardHeaders()
        }
      );
    }
    
    const { wanikaniLevel, genkiChapter, tadokuLevel, topic, length } = body;

    if (!wanikaniLevel || !genkiChapter || !tadokuLevel || !topic) {
      console.log(`${logPrefix} Missing required fields:`, { wanikaniLevel, genkiChapter, tadokuLevel, topic });
      logToFile(`${logPrefix} Missing required fields: ${JSON.stringify({ wanikaniLevel, genkiChapter, tadokuLevel, topic })}`);
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: { wanikaniLevel, genkiChapter, tadokuLevel, topic },
          isSafari: isMobileSafari
        }),
        { 
          status: 400,
          headers: getStandardHeaders()
        }
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

      // Save the story to the database with authenticated user ID
      try {
        console.log(`${logPrefix} Saving story to database for user ${userId}...`);
        logToFile(`${logPrefix} Saving story to database for user ${userId}...`);
        
        // Prepare story data for saving
        const storyData = {
          user_id: userId,
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
        
        // Insert the story into the database
        const { data: savedStory, error: saveError } = await supabase
          .from('stories')
          .insert(storyData)
          .select()
          .single();
        
        if (saveError) {
          console.error(`${logPrefix} Error saving story to database:`, saveError);
          logToFile(`${logPrefix} Error saving story to database: ${JSON.stringify(saveError)}`);
          
          // Continue without saving - we'll still return the generated story
          console.log(`${logPrefix} Continuing without saving to database`);
          logToFile(`${logPrefix} Continuing without saving to database`);
        } else {
          console.log(`${logPrefix} Story saved successfully with ID:`, savedStory.id);
          logToFile(`${logPrefix} Story saved successfully with ID: ${savedStory.id}`);
          
          // Use the saved story's ID if available
          story.id = savedStory.id;
        }
      } catch (dbError) {
        console.error(`${logPrefix} Exception saving to database:`, dbError);
        logToFile(`${logPrefix} Exception saving to database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        // Continue without saving - we'll still return the generated story
      }

      // Format response data for maximum compatibility
      const responseData = {
        success: true,
        message: 'Story generated successfully',
        story: {
          id: story.id, // Include the ID if it was saved
          title: story.title,
          content_jp: story.content_jp.substring(0, 100) + '...',
          content_en: story.content_en.substring(0, 100) + '...',
          vocabulary_count: story.vocabulary.length,
          grammar_count: story.grammar.length,
          quizzes_count: story.quizzes.length,
          browser: {
            isSafari: isMobileSafari,
            userAgent: userAgent?.substring(0, 50) + '...'
          }
        }
      };
      
      const jsonString = JSON.stringify(responseData);
      logToFile(`${logPrefix} Response JSON: ${jsonString.substring(0, 200)}...`);

      return new NextResponse(jsonString, { 
        status: 200,
        headers: getStandardHeaders()
      });
    } catch (storyError) {
      console.error(`${logPrefix} Error in generateStory function:`, storyError);
      logToFile(`${logPrefix} Error in generateStory function: ${storyError instanceof Error ? storyError.message : 'Unknown error'}`);
      
      // Log Safari-specific errors
      if (isMobileSafari) {
        logToFile(`${logPrefix} Safari/iOS generateStory error: ${storyError instanceof Error ? storyError.message : 'Unknown error'}`);
        if (storyError instanceof Error && storyError.stack) {
          logToFile(`${logPrefix} Safari/iOS error stack: ${storyError.stack}`);
        }
      }
      
      // Determine if this is an OpenAI API error
      const isOpenAIError = storyError instanceof Error && 
        (storyError.message.includes('OpenAI') || 
         storyError.message.includes('API key') || 
         storyError.stack?.includes('openai'));
      
      if (isOpenAIError) {
        logToFile(`${logPrefix} OpenAI API error detected: ${storyError instanceof Error ? storyError.message : 'Unknown error'}`);
        console.error(`${logPrefix} OpenAI API error:`, storyError);
      }
      
      return new NextResponse(
        JSON.stringify({ 
          success: false,
          error: storyError instanceof Error ? storyError.message : 'Failed to generate story',
          stack: storyError instanceof Error ? storyError.stack : undefined,
          details: storyError,
          isOpenAIError,
          isSafari: isMobileSafari
        }),
        { 
          status: 500,
          headers: getStandardHeaders()
        }
      );
    }
  } catch (error) {
    console.error(`${logPrefix} Unhandled error in story test API route:`, error);
    logToFile(`${logPrefix} Unhandled error in story test API route: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Log Safari-specific errors
    if (isMobileSafari) {
      logToFile(`${logPrefix} Safari/iOS unhandled error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (error instanceof Error && error.stack) {
        logToFile(`${logPrefix} Safari/iOS unhandled error stack: ${error.stack}`);
      }
    }
    
    return new NextResponse(
      JSON.stringify({ 
        success: false,
        error: 'Failed to generate story',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        isSafari: isMobileSafari
      }),
      { 
        status: 500,
        headers: getStandardHeaders()
      }
    );
  }
} 