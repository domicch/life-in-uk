// Suppress source map errors in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Override console.error to filter out source map errors
  const originalError = console.error
  console.error = (...args) => {
    const errorMessage = args.join(' ')
    
    // Filter out source map related errors
    if (
      errorMessage.includes('Source map error') ||
      errorMessage.includes('installHook.js.map') ||
      errorMessage.includes('sourcemap') ||
      errorMessage.includes('.map')
    ) {
      return // Suppress these errors
    }
    
    // Allow other errors through
    originalError.apply(console, args)
  }

  // Also suppress window errors related to source maps
  window.addEventListener('error', (event) => {
    if (
      event.message.includes('Source map error') ||
      event.message.includes('installHook.js.map') ||
      event.filename?.includes('.map')
    ) {
      event.stopPropagation()
      event.preventDefault()
      return false
    }
  })
}

export {}
