/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // Only use base path for GitHub Pages deployment, not local production testing
  basePath: process.env.GITHUB_PAGES === 'true' ? '/life-in-uk' : '',
  assetPrefix: process.env.GITHUB_PAGES === 'true' ? '/life-in-uk/' : '',
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
