import { NextRequest, NextResponse } from 'next/server';

// API route specifically for handling Tailscale requests
export async function GET(request: NextRequest) {
  console.log('Tailscale entry point called', { 
    url: request.url,
    headers: Object.fromEntries([...request.headers.entries()])
  });
  
  // Get the base URL and create a URL for the home page
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  
  try {
    // Try to fetch the home page content
    const response = await fetch(`${baseUrl}`, {
      method: 'GET',
      headers: {
        'Host': url.host,
        'User-Agent': request.headers.get('user-agent') || 'node-fetch',
        'X-Tailscale-Bypass': '1'  // Special header to prevent loops
      }
    });
    
    // If we successfully got the content, return it
    if (response.ok) {
      let html = await response.text();
      
      // Fix static asset paths to ensure they're loaded correctly
      // Replace relative paths with absolute URLs including the host
      html = html.replace(
        /(href|src)="(\/_next\/static\/[^"]+)"/g, 
        `$1="${baseUrl}$2"`
      );
      
      // Add a base tag to help with relative URLs
      html = html.replace(
        '<head>', 
        `<head><base href="${baseUrl}/">`
      );
      
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    }
    
    // If there was an error, fall back to redirecting
    console.log('Failed to fetch home page, redirecting', { 
      status: response.status 
    });
  } catch (error) {
    console.error('Error fetching home page:', error);
  }
  
  // As a fallback, redirect to the root
  return NextResponse.redirect(new URL('/', request.url));
} 