const fs = require('fs');
const path = require('path');

// Function to analyze questions.csv and find exams without 24 questions
function findExamsWithoutTwentyFourQuestions() {
    try {
        // Read the questions.csv file
        const questionsPath = path.join(__dirname, 'questions.csv');
        const csvContent = fs.readFileSync(questionsPath, 'utf8');
        
        // Parse CSV
        const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
        const header = lines[0];
        const dataLines = lines.slice(1);
        
        console.log(`Analyzing ${dataLines.length} question records...\n`);
        
        // Count questions per exam
        const examQuestionCounts = {};
        
        dataLines.forEach(line => {
            // Extract exam number (first field before comma)
            const firstComma = line.indexOf(',');
            if (firstComma > 0) {
                const examNumber = parseInt(line.substring(0, firstComma));
                if (!isNaN(examNumber)) {
                    examQuestionCounts[examNumber] = (examQuestionCounts[examNumber] || 0) + 1;
                }
            }
        });
        
        // Sort exam numbers
        const examNumbers = Object.keys(examQuestionCounts).map(Number).sort((a, b) => a - b);
        
        // Find exams without exactly 24 questions
        const examsWithoutTwentyFour = [];
        
        console.log('QUESTION COUNT PER EXAM:');
        console.log('========================');
        
        examNumbers.forEach(examNumber => {
            const questionCount = examQuestionCounts[examNumber];
            const status = questionCount === 24 ? '✅' : '❌';
            const missing = questionCount < 24 ? ` (missing ${24 - questionCount})` : questionCount > 24 ? ` (${questionCount - 24} extra)` : '';
            
            console.log(`${status} Exam ${examNumber}: ${questionCount} questions${missing}`);
            
            if (questionCount !== 24) {
                examsWithoutTwentyFour.push({
                    examNumber,
                    questionCount,
                    difference: questionCount - 24
                });
            }
        });
        
        console.log('\n' + '='.repeat(50));
        
        if (examsWithoutTwentyFour.length === 0) {
            console.log('🎉 ALL EXAMS HAVE EXACTLY 24 QUESTIONS!');
        } else {
            console.log(`⚠️  FOUND ${examsWithoutTwentyFour.length} EXAMS WITHOUT 24 QUESTIONS:`);
            console.log('='.repeat(50));
            
            examsWithoutTwentyFour.forEach(exam => {
                if (exam.difference < 0) {
                    console.log(`❌ Exam ${exam.examNumber}: ${exam.questionCount} questions (missing ${Math.abs(exam.difference)})`);
                } else {
                    console.log(`❌ Exam ${exam.examNumber}: ${exam.questionCount} questions (${exam.difference} extra)`);
                }
            });
            
            // Show which question numbers are missing for exams with < 24 questions
            console.log('\nDETAILED ANALYSIS FOR INCOMPLETE EXAMS:');
            console.log('=====================================');
            
            examsWithoutTwentyFour.filter(exam => exam.difference < 0).forEach(exam => {
                console.log(`\nExam ${exam.examNumber} - Missing Questions:`);
                
                // Find which question numbers exist
                const existingQuestions = new Set();
                dataLines.forEach(line => {
                    const fields = parseCSVLine(line);
                    if (fields.length >= 2) {
                        const examNum = parseInt(fields[0]);
                        const questionNum = parseInt(fields[1]);
                        if (examNum === exam.examNumber && !isNaN(questionNum)) {
                            existingQuestions.add(questionNum);
                        }
                    }
                });
                
                // Find missing question numbers
                const missingQuestions = [];
                for (let i = 1; i <= 24; i++) {
                    if (!existingQuestions.has(i)) {
                        missingQuestions.push(i);
                    }
                }
                
                if (missingQuestions.length > 0) {
                    console.log(`Missing question numbers: ${missingQuestions.join(', ')}`);
                } else {
                    console.log('All question numbers 1-24 are present, but some may be duplicated');
                }
                
                // Show existing questions in order
                const sortedQuestions = Array.from(existingQuestions).sort((a, b) => a - b);
                console.log(`Existing questions: ${sortedQuestions.join(', ')}`);
            });
        }
        
        // Summary statistics
        console.log('\nSUMMARY STATISTICS:');
        console.log('==================');
        console.log(`Total exams analyzed: ${examNumbers.length}`);
        console.log(`Exams with exactly 24 questions: ${examNumbers.length - examsWithoutTwentyFour.length}`);
        console.log(`Exams with incorrect question count: ${examsWithoutTwentyFour.length}`);
        
        const totalQuestions = Object.values(examQuestionCounts).reduce((sum, count) => sum + count, 0);
        console.log(`Total questions across all exams: ${totalQuestions}`);
        console.log(`Expected total (${examNumbers.length} × 24): ${examNumbers.length * 24}`);
        console.log(`Difference: ${totalQuestions - (examNumbers.length * 24)}`);
        
    } catch (error) {
        console.error('Error analyzing questions.csv:', error.message);
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
findExamsWithoutTwentyFourQuestions();
