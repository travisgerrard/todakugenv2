const Module = require('module');
const path = require('path');
const originalResolveFilename = Module._resolveFilename;

// Intercept the module resolution to prioritize the src directory
Module._resolveFilename = function (request, parent, isMain, options) {
  // Check if the request starts with '@/' which we use for relative imports
  if (request.startsWith('@/')) {
    request = path.join('/root/todakugenv2/src', request.substring(2));
  }

  // Try to resolve the module in the src directory first
  try {
    return originalResolveFilename.call(this, request, parent, isMain, options);
  } catch (e) {
    // If it fails, try to resolve it in the src directory
    if (!request.startsWith('/') && !request.startsWith('.') && parent) {
      const srcRequest = path.join('/root/todakugenv2/src', request);
      try {
        return originalResolveFilename.call(this, srcRequest, parent, isMain, options);
      } catch (srcError) {
        // If that also fails, throw the original error
        throw e;
      }
    }
    throw e;
  }
}; 