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

    if (error) {
      console.error('Auth error:', error, error_description);
      return NextResponse.redirect(
        `${requestUrl.origin}?error=${encodeURIComponent(error_description || error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${requestUrl.origin}?error=${encodeURIComponent('No code provided')}`
      );
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Exchange code error:', exchangeError);
      return NextResponse.redirect(
        `${requestUrl.origin}?error=${encodeURIComponent('Failed to exchange code')}`
      );
    }

    // Successful authentication
    return NextResponse.redirect(requestUrl.origin);
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(
      `${new URL(request.url).origin}?error=${encodeURIComponent('An unexpected error occurred')}`
    );
  }
} 