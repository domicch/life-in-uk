'use client'

export default function DebugInfo() {
  const handleClearStorage = () => {
    localStorage.clear()
    console.log('LocalStorage cleared')
    window.location.reload()
  }

  const handleCheckStorage = () => {
    const consent = localStorage.getItem('cookie-consent')
    console.log('Current consent status:', consent)
    alert(`Current consent: ${consent || 'Not set'}`)
  }

  return (
    <div className="fixed top-4 left-4 bg-white p-4 border rounded shadow z-50">
      <h4 className="font-bold mb-2">Debug Tools</h4>
      <div className="space-y-2">
        <button
          onClick={handleClearStorage}
          className="block w-full bg-red-500 text-white px-3 py-1 rounded text-sm"
        >
          Clear Storage
        </button>
        <button
          onClick={handleCheckStorage}
          className="block w-full bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Check Storage
        </button>
      </div>
    </div>
  )
}
