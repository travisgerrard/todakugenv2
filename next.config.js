/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  distDir: '.next',
  swcMinify: true,
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    
    // Ensure proper symlink handling for development
    config.resolve.symlinks = true;
    
    // Add support for Fast Refresh
    // Disable split chunks during development for better Fast Refresh
    if (process.env.NODE_ENV === 'development') {
      config.optimization.splitChunks = false;
    }
    
    return config;
  },
}

module.exports = nextConfig 