// Utility function to get the correct URL for assets with base path support

export function getAssetUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // Check if we're in GitHub Pages mode
  const isGitHubPages = 
    // Build-time environment variables
    process.env.GITHUB_PAGES === 'true' ||
    process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true' ||
    // Runtime detection for GitHub Pages
    (typeof window !== 'undefined' && window.location.hostname === 'domicch.github.io') ||
    // Fallback: if we're in production and the pathname starts with /life-in-uk/
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/life-in-uk/'))
  
  if (isGitHubPages) {
    return `/life-in-uk/${cleanPath}`
  }
  
  // For local development and local production testing
  return `/${cleanPath}`
}
