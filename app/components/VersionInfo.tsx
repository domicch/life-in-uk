'use client'

import { useEffect, useState } from 'react'

export default function VersionInfo() {
  const [buildTime, setBuildTime] = useState<string>('')
  const [envInfo, setEnvInfo] = useState<string>('')

  useEffect(() => {
    // This will be different for each build
    setBuildTime(process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString())
    
    // Debug environment info
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      GITHUB_PAGES: process.env.GITHUB_PAGES,
      NEXT_PUBLIC_GITHUB_PAGES: process.env.NEXT_PUBLIC_GITHUB_PAGES,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'server'
    }
    setEnvInfo(JSON.stringify(env, null, 2))
  }, [])

  return (
    <div className="fixed bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow opacity-50 hover:opacity-100 transition-opacity group">
      <div>v{buildTime.slice(0, 16)}</div>
      <div className="hidden group-hover:block mt-1 text-[10px] max-w-xs">
        <pre className="whitespace-pre-wrap">{envInfo}</pre>
      </div>
    </div>
  )
}
