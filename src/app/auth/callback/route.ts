import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const error_description = requestUrl.searchParams.get('error_description');

    // Determine the base URL - in production, use todakureader.com
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://todakureader.com' 
      : requestUrl.origin;

    if (error) {
      console.error('Auth error:', error, error_description);
      return NextResponse.redirect(
        `${baseUrl}?error=${encodeURIComponent(error_description || error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${baseUrl}?error=${encodeURIComponent('No code provided')}`
      );
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Exchange code error:', exchangeError);
      return NextResponse.redirect(
        `${baseUrl}?error=${encodeURIComponent('Failed to exchange code')}`
      );
    }

    // Check if a profile exists for this user, if not create one
    if (data?.session?.user) {
      const userId = data.session.user.id;
      
      // Check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // PGRST116 means no rows were returned, so we need to create a profile
        console.log('Creating new user profile');
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            wanikani_level: 0,
            genki_chapter: 0,
            tadoku_level: 0,
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      } else if (profileError) {
        console.error('Error checking for profile:', profileError);
      }
    }

    // Successful authentication - redirect to the base URL
    return NextResponse.redirect(baseUrl);
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://todakureader.com' 
      : new URL(request.url).origin;
    
    return NextResponse.redirect(
      `${baseUrl}?error=${encodeURIComponent('An unexpected error occurred')}`
    );
  }
} 