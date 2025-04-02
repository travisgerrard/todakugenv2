import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    console.log('Debug profile API called');
    
    // Create Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore,
    });
    
    // Get the session to check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return NextResponse.json({ error: 'Session error' }, { status: 500 });
    }
    
    if (!session) {
      console.log('User is not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      
      // If error is that no rows were returned (PGRST116), the profile doesn't exist
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({
          session: {
            user: {
              id: session.user.id,
              email: session.user.email,
            }
          },
          profile: null,
          localStorage: null,
          error: 'No profile exists for this user'
        });
      }
      
      return NextResponse.json({
        error: 'Error fetching profile',
        details: profileError
      }, { status: 500 });
    }
    
    // Return debug information
    return NextResponse.json({
      session: {
        user: {
          id: session.user.id,
          email: session.user.email,
        }
      },
      profile,
      message: 'This is debug information. If you were directed here to troubleshoot issues with your profile, please share this data with support.'
    });
    
  } catch (error) {
    console.error('Unhandled error in debug profile API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug information' },
      { status: 500 }
    );
  }
} 