const fs = require('fs');
const path = require('path');

// Function to analyze answers.csv and find questions without correct answers
function findQuestionsWithoutCorrectAnswers() {
    try {
        // Read the answers.csv file
        const answersPath = path.join(__dirname, 'answers.csv');
        const csvContent = fs.readFileSync(answersPath, 'utf8');
        
        // Parse CSV
        const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
        const header = lines[0];
        const dataLines = lines.slice(1);
        
        console.log(`Analyzing ${dataLines.length} answer records...\n`);
        
        // Group answers by exam and question
        const questionAnswers = {};
        
        dataLines.forEach(line => {
            // Parse CSV line (handle commas in quoted text)
            const fields = parseCSVLine(line);
            
            if (fields.length >= 5) {
                const examNumber = parseInt(fields[0]);
                const questionNumber = parseInt(fields[1]);
                const answerNumber = parseInt(fields[2]);
                const answerText = fields[3];
                const isCorrect = fields[4];
                
                if (!isNaN(examNumber) && !isNaN(questionNumber)) {
                    const questionKey = `${examNumber}-${questionNumber}`;
                    
                    if (!questionAnswers[questionKey]) {
                        questionAnswers[questionKey] = {
                            examNumber,
                            questionNumber,
                            answers: [],
                            hasCorrectAnswer: false
                        };
                    }
                    
                    questionAnswers[questionKey].answers.push({
                        answerNumber,
                        answerText: answerText.replace(/^"|"$/g, ''), // Remove quotes
                        isCorrect: isCorrect.trim().toLowerCase() === 'yes'
                    });
                    
                    if (isCorrect.trim().toLowerCase() === 'yes') {
                        questionAnswers[questionKey].hasCorrectAnswer = true;
                    }
                }
            }
        });
        
        // Find questions without correct answers
        const questionsWithoutCorrectAnswers = [];
        
        Object.values(questionAnswers).forEach(question => {
            if (!question.hasCorrectAnswer) {
                questionsWithoutCorrectAnswers.push(question);
            }
        });
        
        // Sort by exam number, then question number
        questionsWithoutCorrectAnswers.sort((a, b) => {
            if (a.examNumber !== b.examNumber) {
                return a.examNumber - b.examNumber;
            }
            return a.questionNumber - b.questionNumber;
        });
        
        // Display results
        console.log('QUESTIONS WITHOUT CORRECT ANSWERS:');
        console.log('==================================');
        
        if (questionsWithoutCorrectAnswers.length === 0) {
            console.log('✅ All questions have correct answers marked!');
        } else {
            console.log(`❌ Found ${questionsWithoutCorrectAnswers.length} questions without correct answers:\n`);
            
            let currentExam = null;
            
            questionsWithoutCorrectAnswers.forEach(question => {
                if (currentExam !== question.examNumber) {
                    currentExam = question.examNumber;
                    console.log(`\n--- EXAM ${question.examNumber} ---`);
                }
                
                console.log(`Question ${question.questionNumber}:`);
                question.answers.forEach(answer => {
                    const marker = answer.isCorrect ? '✓' : '✗';
                    console.log(`  ${marker} ${answer.answerNumber}. ${answer.answerText}`);
                });
                console.log('');
            });
        }
        
        // Summary by exam
        console.log('\nSUMMARY BY EXAM:');
        console.log('================');
        
        const examSummary = {};
        questionsWithoutCorrectAnswers.forEach(question => {
            if (!examSummary[question.examNumber]) {
                examSummary[question.examNumber] = 0;
            }
            examSummary[question.examNumber]++;
        });
        
        const allExams = [...new Set(Object.values(questionAnswers).map(q => q.examNumber))].sort((a, b) => a - b);
        
        allExams.forEach(examNumber => {
            const missingCount = examSummary[examNumber] || 0;
            const status = missingCount === 0 ? '✅' : '❌';
            console.log(`${status} Exam ${examNumber}: ${missingCount} questions without correct answers`);
        });
        
        console.log(`\nTotal questions analyzed: ${Object.keys(questionAnswers).length}`);
        console.log(`Questions without correct answers: ${questionsWithoutCorrectAnswers.length}`);
        
    } catch (error) {
        console.error('Error analyzing answers.csv:', error.message);
    }
}

// Helper function to parse CSV line (handles quoted fields with commas)
function parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
            current += char;
        } else if (char === ',' && !inQuotes) {
            fields.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    fields.push(current);
    return fields;
}

// Run the analysis
findQuestionsWithoutCorrectAnswers();
