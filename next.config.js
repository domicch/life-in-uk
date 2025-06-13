/** @type {import('next').NextConfig} */

// Check if this is a GitHub Pages build
const isGitHubPages = process.env.GITHUB_PAGES === 'true' || process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true'
const isProduction = process.env.NODE_ENV === 'production'

// Debug logging
console.log('\n🔧 Next.js Configuration:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   GITHUB_PAGES:', process.env.GITHUB_PAGES);
console.log('   NEXT_PUBLIC_GITHUB_PAGES:', process.env.NEXT_PUBLIC_GITHUB_PAGES);
console.log('   isProduction:', isProduction);
console.log('   isGitHubPages:', isGitHubPages);
console.log('   basePath:', isProduction && isGitHubPages ? '/life-in-uk' : '');
console.log('   assetPrefix:', isProduction && isGitHubPages ? '/life-in-uk/' : '');
console.log('');

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // Use base path for GitHub Pages deployment
  basePath: isProduction && isGitHubPages ? '/life-in-uk' : '',
  assetPrefix: isProduction && isGitHubPages ? '/life-in-uk/' : '',
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Generate unique build IDs for better cache busting
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  // Additional production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Webpack configuration for better production builds
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Disable source maps completely in production client builds
      config.devtool = false
    }
    
    return config
  },
}

module.exports = nextConfig
