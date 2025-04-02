import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ 
    req: request, 
    res: NextResponse.next() 
  });

  // Check if this is coming through Tailscale
  const host = request.headers.get('host') || '';
  const isTailscaleRequest = host.includes('tail34f81d.ts.net');
  const pathname = request.nextUrl.pathname;
  
  // Check if this is an internal request with bypass header
  const hasBypassHeader = request.headers.get('X-Tailscale-Bypass') === '1';
  
  console.log('Middleware processing request:', { 
    host, 
    pathname, 
    isTailscaleRequest,
    hasBypassHeader 
  });

  // Skip middleware for static assets and API routes if they have the bypass header
  if (hasBypassHeader) {
    return NextResponse.next();
  }

  // Special handling for Tailscale requests
  if (isTailscaleRequest && !hasBypassHeader) {
    console.log('Handling Tailscale request:', pathname);
    
    // Create a clone of the URL to modify
    const url = request.nextUrl.clone();
    
    // For root path requests, use our special API route
    if (pathname === '/') {
      url.pathname = '/api/tailscale-entry';
      return NextResponse.rewrite(url);
    }
    
    // For static assets and other paths, add our bypass header and rewrite
    // This ensures static assets are fetched directly from the server
    const headers = new Headers(request.headers);
    headers.set('X-Tailscale-Bypass', '1');
    
    return NextResponse.next({
      request: {
        headers
      }
    });
  }

  // Continue with the normal flow for other requests
  return await getAuthResponse(supabase, request);
}

async function getAuthResponse(supabase: any, request: NextRequest) {
  // Refresh session if expired
  const { data } = await supabase.auth.getSession();
  
  // Continue the request
  return NextResponse.next();
}

// Add a matcher for all routes that need authentication
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public (public files)
    // - auth/callback (auth callback route)
    '/((?!_next/static|_next/image|favicon.ico|public|auth/callback).*)',
    // Additionally, match static assets for Tailscale handling
    '/_next/static/:path*',
  ],
}; 