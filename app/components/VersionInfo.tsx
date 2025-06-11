'use client'

import { useEffect, useState } from 'react'

export default function VersionInfo() {
  const [buildTime, setBuildTime] = useState<string>('')

  useEffect(() => {
    // This will be different for each build
    setBuildTime(process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString())
  }, [])

  return (
    <div className="fixed bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow opacity-50 hover:opacity-100 transition-opacity">
      v{buildTime.slice(0, 16)}
    </div>
  )
}
