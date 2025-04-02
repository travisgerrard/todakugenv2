import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Log the request path for debugging
  console.log(`Middleware processing: ${req.nextUrl.pathname}`);
  
  try {
    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
    const { data } = await supabase.auth.getSession();
    console.log(`Middleware auth check: ${data.session ? 'Authenticated' : 'Not authenticated'}`);
  } catch (error) {
    console.error('Error in auth middleware:', error);
  }
  
  return res;
}

// Add a matcher for all routes that need authentication
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public (public files)
    // - api (API routes that handle their own auth)
    // - auth/callback (auth callback route)
    '/((?!_next/static|_next/image|favicon.ico|public|api|auth/callback).*)',
  ],
}; 