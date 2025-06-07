const fs = require('fs');
const path = require('path');

// Function to parse exam text content
function parseExamText(content, examNumber) {
    const questions = [];
    const answers = [];
    
    // Split content by question numbers
    const questionBlocks = content.split(/(?=^\d+\.)/m).filter(block => block.trim());
    
    questionBlocks.forEach(block => {
        const lines = block.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length === 0) return;
        
        // Extract question number and text
        const firstLine = lines[0];
        const questionMatch = firstLine.match(/^(\d+)\.(.+)/);
        
        if (!questionMatch) return;
        
        const questionNumber = parseInt(questionMatch[1]);
        const questionText = questionMatch[2].trim();
        
        // Add the question
        questions.push({
            examNumber: examNumber,
            questionNumber: questionNumber,
            question: questionText
        });
        
        // Find answer options
        let answerIndex = 1;
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            
            // Check if this line is an answer option (starts with -)
            if (line.startsWith('-')) {
                let answerText = line.substring(1).trim();
                let isCorrect = '';
                
                // Check if marked as correct
                if (answerText.includes('**correct**')) {
                    isCorrect = 'yes';
                    answerText = answerText.replace('**correct**', '').trim();
                }
                
                answers.push({
                    examNumber: examNumber,
                    questionNumber: questionNumber,
                    answerNumber: answerIndex,
                    answer: answerText,
                    isCorrect: isCorrect
                });
                
                answerIndex++;
            }
        }
    });
    
    return { questions, answers };
}

// Function to convert array to CSV
function arrayToCSV(data, headers) {
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    data.forEach(row => {
        const values = headers.map(header => {
            let value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma, quotes, or newlines
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
}

// Test with sample file
function testWithSample() {
    try {
        const samplePath = path.join(__dirname, 'Exam_1_sample.txt');
        const content = fs.readFileSync(samplePath, 'utf8');
        
        const { questions, answers } = parseExamText(content, 1);
        
        console.log(`Parsed ${questions.length} questions and ${answers.length} answers from sample`);
        
        // Generate CSV files
        const questionsCSV = arrayToCSV(questions, ['examNumber', 'questionNumber', 'question']);
        const answersCSV = arrayToCSV(answers, ['examNumber', 'questionNumber', 'answerNumber', 'answer', 'isCorrect']);
        
        // Write CSV files
        fs.writeFileSync(path.join(__dirname, 'questions_sample.csv'), questionsCSV);
        fs.writeFileSync(path.join(__dirname, 'answers_sample.csv'), answersCSV);
        
        console.log('Generated sample CSV files:');
        console.log('- questions_sample.csv');
        console.log('- answers_sample.csv');
        
        // Show first few entries
        console.log('\nFirst question:', questions[0]);
        console.log('First answer:', answers[0]);
        console.log('Sample correct answer:', answers.find(a => a.isCorrect === 'yes'));
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Export functions for use
module.exports = {
    parseExamText,
    arrayToCSV
};

// Run test if this file is executed directly
if (require.main === module) {
    testWithSample();
}
