const fs = require('fs');
const path = require('path');

// Function to read and parse a single text exam file
function parseExamFile(filePath, examNumber) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const questions = [];
        const answers = [];
        
        // Split content into lines and clean up
        const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        let currentQuestion = null;
        let currentQuestionNumber = null;
        let currentAnswers = [];
        let currentReference = '';
        let answerIndex = 1;
        let inAnswerSection = false;
        let inReferenceSection = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Skip empty lines
            if (!line.trim()) continue;
            
            // Check if this line contains a question number pattern
            const questionMatch = line.match(/^\*?\*?(\d+)\.\s*(.+)/);
            if (questionMatch) {
                // Save previous question if exists
                if (currentQuestion && currentQuestionNumber) {
                    questions.push({
                        examNumber: examNumber,
                        questionNumber: currentQuestionNumber,
                        question: currentQuestion.trim(),
                        reference: currentReference.trim()
                    });
                    
                    // Add answers for previous question
                    currentAnswers.forEach(answer => {
                        answers.push(answer);
                    });
                }
                
                // Start new question
                currentQuestionNumber = parseInt(questionMatch[1]);
                currentQuestion = questionMatch[2].trim();
                currentAnswers = [];
                currentReference = '';
                answerIndex = 1;
                inAnswerSection = false;
                inReferenceSection = false;
                continue;
            }
            
            // Check if this line is an answer option (starts with -)
            if (line.startsWith('-') && currentQuestionNumber) {
                inAnswerSection = true;
                inReferenceSection = false;
                
                let answerText = line.substring(1).trim();
                
                // Check if answer is marked as correct (contains **)
                const isCorrect = answerText.includes('**');
                
                // Remove ** markers from the answer text
                answerText = answerText.replace(/\*\*/g, '').trim();
                
                if (answerText) {
                    currentAnswers.push({
                        examNumber: examNumber,
                        questionNumber: currentQuestionNumber,
                        answerNumber: answerIndex,
                        answer: answerText,
                        isCorrect: isCorrect ? 'yes' : ''
                    });
                    answerIndex++;
                }
                continue;
            }
            
            // If we're in a question and this line doesn't start with '-', it might be continuation of question
            if (currentQuestion && !inAnswerSection && !line.startsWith('-')) {
                // Check if we've finished with answers and this is reference/explanation text
                if (answerIndex > 1) {
                    // We've seen answers, so this is likely reference text
                    inReferenceSection = true;
                    
                    // Add to reference
                    if (currentReference) {
                        currentReference += ' ' + line;
                    } else {
                        currentReference = line;
                    }
                } else {
                    // Still in question, add to current question
                    currentQuestion += ' ' + line;
                }
                continue;
            }
            
            // If we're past the answer section, collect reference text
            if (inAnswerSection && !line.startsWith('-') && currentQuestionNumber) {
                inReferenceSection = true;
                
                // Add to reference
                if (currentReference) {
                    currentReference += ' ' + line;
                } else {
                    currentReference = line;
                }
                continue;
            }
        }
        
        // Don't forget the last question
        if (currentQuestion && currentQuestionNumber) {
            questions.push({
                examNumber: examNumber,
                questionNumber: currentQuestionNumber,
                question: currentQuestion.trim(),
                reference: currentReference.trim()
            });
            
            currentAnswers.forEach(answer => {
                answers.push(answer);
            });
        }
        
        return { questions, answers };
        
    } catch (error) {
        console.error(`Error parsing file ${filePath}:`, error);
        return { questions: [], answers: [] };
    }
}

// Function to convert array to CSV
function arrayToCSV(data, headers) {
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
}

// Main function to process all exam files
function processAllExams() {
    const txtExamsDir = path.join(__dirname, 'txt_exams');
    const allQuestions = [];
    const allAnswers = [];
    
    try {
        // Check if txt_exams directory exists
        if (!fs.existsSync(txtExamsDir)) {
            console.error('txt_exams directory not found. Please run convert_docx.js first.');
            return;
        }
        
        // Read all files in txt_exams directory
        const files = fs.readdirSync(txtExamsDir);
        const examFiles = files.filter(file => file.startsWith('Exam_') && file.endsWith('.txt'));
        
        console.log(`Found ${examFiles.length} exam files to process\n`);
        
        examFiles.forEach(file => {
            // Extract exam number from filename
            const examMatch = file.match(/Exam_(\d+)\.txt/);
            if (examMatch) {
                const examNumber = parseInt(examMatch[1]);
                const filePath = path.join(txtExamsDir, file);
                
                console.log(`Processing ${file}...`);
                
                const { questions, answers } = parseExamFile(filePath, examNumber);
                allQuestions.push(...questions);
                allAnswers.push(...answers);
                
                console.log(`Found ${questions.length} questions and ${answers.length} answers`);
                
                // Show correct answers count for this exam
                const correctAnswers = answers.filter(a => a.isCorrect === 'yes');
                console.log(`Correct answers found: ${correctAnswers.length}`);
                
                // Show sample reference for first question
                if (questions.length > 0) {
                    const firstQ = questions[0];
                    console.log(`Sample reference: ${firstQ.reference.substring(0, 100)}...`);
                }
                console.log('---');
            }
        });
        
        // Generate CSV files with updated headers
        const questionsCSV = arrayToCSV(allQuestions, ['examNumber', 'questionNumber', 'question', 'reference']);
        const answersCSV = arrayToCSV(allAnswers, ['examNumber', 'questionNumber', 'answerNumber', 'answer', 'isCorrect']);
        
        // Write CSV files
        fs.writeFileSync(path.join(__dirname, 'questions.csv'), questionsCSV);
        fs.writeFileSync(path.join(__dirname, 'answers.csv'), answersCSV);
        
        console.log(`\nGenerated CSV files:`);
        console.log(`- questions.csv: ${allQuestions.length} questions (with reference column)`);
        console.log(`- answers.csv: ${allAnswers.length} answers`);
        
        // Summary of correct answers
        const totalCorrectAnswers = allAnswers.filter(a => a.isCorrect === 'yes').length;
        console.log(`- Total correct answers marked: ${totalCorrectAnswers}`);
        
        // Sample of questions with references
        console.log(`\nSample questions with references:`);
        allQuestions.slice(0, 3).forEach(q => {
            console.log(`Q${q.questionNumber}: ${q.question.substring(0, 50)}...`);
            console.log(`Ref: ${q.reference.substring(0, 80)}...`);
            console.log('');
        });
        
    } catch (error) {
        console.error('Error processing exams:', error);
    }
}

// Run the processing
processAllExams();
