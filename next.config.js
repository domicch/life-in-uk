/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/life-in-uk' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/life-in-uk/' : '',
  images: {
    unoptimized: true
  },
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Generate unique build IDs for better cache busting
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
}

module.exports = nextConfig
