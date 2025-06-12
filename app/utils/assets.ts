// Utility function to get the correct URL for assets with base path support

export function getAssetUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // Check if we're in GitHub Pages mode (either production with GITHUB_PAGES env var)
  const isGitHubPages = process.env.GITHUB_PAGES === 'true' || 
    (typeof window !== 'undefined' && window.location.hostname === 'domicch.github.io')
  
  if (isGitHubPages) {
    return `/life-in-uk/${cleanPath}`
  }
  
  // For local development and local production testing
  return `/${cleanPath}`
}
