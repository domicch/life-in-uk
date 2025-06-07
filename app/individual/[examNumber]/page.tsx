// Static params generation function for build-time pre-rendering
export async function generateStaticParams() {
  try {
    // Try to read the CSV file to get actual exam numbers
    const fs = require('fs')
    const path = require('path')
    const csvPath = path.join(process.cwd(), 'public', 'questions.csv')
    
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf8')
      const lines = csvContent.split('\n')
      const examNumbers = new Set<string>()
      
      // Skip header and parse exam numbers
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line) {
          const firstComma = line.indexOf(',')
          if (firstComma > 0) {
            const examNum = line.substring(0, firstComma).trim()
            if (examNum && !isNaN(parseInt(examNum))) {
              examNumbers.add(examNum)
            }
          }
        }
      }
      
      console.log('Found exam numbers:', Array.from(examNumbers).sort())
      return Array.from(examNumbers).map(num => ({ examNumber: num }))
    }
  } catch (error) {
    console.error('Error reading CSV for static params:', error)
  }
  
  // Fallback to a reasonable range if CSV reading fails
  console.log('Using fallback exam numbers 1-20')
  return Array.from({ length: 20 }, (_, i) => ({ examNumber: (i + 1).toString() }))
}

// Import the client component
import IndividualTestClient from './client-component'

// Server Component wrapper that passes params to the Client Component
export default function IndividualTestPage({ params }: { params: { examNumber: string } }) {
  return <IndividualTestClient params={params} />
}
