const Module = require('module');
const path = require('path');
const fs = require('fs');

// Save the original resolve functionality
const originalResolveFilename = Module._resolveFilename;

// Get the absolute path to the workspace root
const PROJECT_ROOT = '/root/todakugenv2';
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

// Debug mode for troubleshooting import issues
const DEBUG = false;

function debug(...args) {
  if (DEBUG) {
    console.log('[src-loader]', ...args);
  }
}

// Intercept the module resolution to prioritize the src directory
Module._resolveFilename = function (request, parent, isMain, options) {
  // Log the resolution attempt if in debug mode
  debug('Resolving:', request, 'from parent:', parent?.filename);
  
  // Handle aliased imports with @/ prefix
  if (request.startsWith('@/')) {
    const srcPath = path.join(SRC_DIR, request.substring(2));
    debug('Aliased import:', request, 'to', srcPath);
    request = srcPath;
  }

  // Try to resolve the module normally first
  try {
    return originalResolveFilename.call(this, request, parent, isMain, options);
  } catch (e) {
    // If the normal resolution fails and we're not already in the src directory
    // try resolving relative to src
    if (!request.startsWith('/') && !request.startsWith('.') && parent) {
      try {
        // Try to resolve the module in the src directory
        const srcRequest = path.join(SRC_DIR, request);
        debug('Trying src directory fallback:', srcRequest);
        
        // Check if the path exists before trying to resolve
        if (fs.existsSync(srcRequest) || fs.existsSync(srcRequest + '.js') || 
            fs.existsSync(srcRequest + '.jsx') || fs.existsSync(srcRequest + '.ts') || 
            fs.existsSync(srcRequest + '.tsx')) {
          return originalResolveFilename.call(this, srcRequest, parent, isMain, options);
        }
      } catch (srcError) {
        debug('Src directory fallback failed:', srcError.message);
      }
    }
    
    // If all resolution attempts fail, throw the original error
    throw e;
  }
}; 