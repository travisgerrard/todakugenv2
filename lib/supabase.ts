import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';

// Set to true for additional debug logging
const ENABLE_DEBUG_LOGGING = true;

// Helper to detect iOS browsers
export const isIOSClient = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) && /safari/.test(userAgent);
};

// Debug log helper - client-side only
export const logToConsole = (message: string, source: string = 'supabase') => {
  if (!ENABLE_DEBUG_LOGGING) return;
  
  // Only log to console
  console.log(`[${source}] ${message}`);
  
  // In a real app, consider also sending logs to a server endpoint
  // or using a service like Sentry for client-side logging
};

// Process URL hash if present - can help with auth redirects
const processUrlHash = () => {
  if (typeof window === 'undefined') return;
  
  // Check if there's a hash that might contain auth data
  if (window.location.hash && window.location.hash.includes('access_token')) {
    logToConsole('Found access_token in URL hash', 'supabase-client');
    
    // The hash will be processed automatically when creating the Supabase client
    // We just need to ensure it's detected
  }
};

// Create client for browser use
export const createClient = () => {
  const requestId = Math.random().toString(36).substring(2, 6);
  
  if (ENABLE_DEBUG_LOGGING && typeof window !== 'undefined') {
    logToConsole(`[Client-${requestId}] Creating client component client (browser)`, 'supabase-client');
    
    // Process hash if it exists
    processUrlHash();
    
    // Check for existing session in localStorage (where Supabase stores it)
    try {
      const supabaseKey = Object.keys(localStorage).find(key => key.includes('supabase.auth.token'));
      if (supabaseKey) {
        logToConsole(`[Client-${requestId}] Found existing auth token in localStorage: ${supabaseKey}`, 'supabase-client');
        const sessionData = JSON.parse(localStorage.getItem(supabaseKey) || '{}');
        logToConsole(`[Client-${requestId}] Session data exists: ${!!sessionData}`, 'supabase-client');
        
        // Log the expiry time if it exists
        if (sessionData?.expires_at) {
          const expiryDate = new Date(sessionData.expires_at * 1000);
          const now = new Date();
          const isExpired = expiryDate < now;
          logToConsole(`[Client-${requestId}] Session expiry: ${expiryDate.toISOString()}, Current time: ${now.toISOString()}, Is expired: ${isExpired}`, 'supabase-client');
        }
      } else {
        logToConsole(`[Client-${requestId}] No auth token found in localStorage`, 'supabase-client');
      }
    } catch (error) {
      logToConsole(`[Client-${requestId}] Error checking localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`, 'supabase-client');
    }
  }
  
  // Create client with cookie-based sessions enabled
  const client = createClientComponentClient({
    // For client component, we don't need to specify cookies options
    // The browser will handle cookies automatically
  });
  
  return client;
}; 