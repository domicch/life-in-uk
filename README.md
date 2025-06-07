# Life in the UK Test Website

A Next.js application for practicing Life in the UK citizenship test questions.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy your CSV files to the public directory:
```bash
cp questions.csv public/
cp answers.csv public/
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Practice Mode**: Practice with all questions, no time limit
- **Test Mode**: Official test format (24 questions, 45 minutes)
- **Question Navigation**: Easy navigation between questions
- **Progress Tracking**: Visual indicators for answered/unanswered questions
- **Timer**: Countdown timer for test mode
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   └── test/
│       └── page.tsx        # Test interface
├── public/
│   ├── questions.csv       # Questions data
│   └── answers.csv         # Answers data
├── components/             # Reusable components (future)
└── lib/                   # Utility functions (future)
```

## Data Format

The application expects two CSV files:

### questions.csv
- examNumber: Number
- questionNumber: Number  
- question: String
- reference: String (explanation)

### answers.csv
- examNumber: Number
- questionNumber: Number
- answerNumber: Number
- answer: String
- isCorrect: "yes" or empty

## Build and Deploy

```bash
npm run build
npm start
```

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **PapaParse**: CSV parsing library
