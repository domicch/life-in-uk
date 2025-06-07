// Utility function to get the correct URL for assets with base path support

export function getAssetUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  // In production with GitHub Pages, we need to add the base path
  if (process.env.NODE_ENV === 'production') {
    return `/life-in-uk/${cleanPath}`
  }
  
  // In development, use relative path from root
  return `/${cleanPath}`
}
