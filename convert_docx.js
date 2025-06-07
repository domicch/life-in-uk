const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

// Function to convert a single .docx file to .txt with proper formatting
async function convertDocxToTxtWithFormatting(docxPath, txtPath) {
    try {
        // Extract with formatting information
        const result = await mammoth.convertToHtml({ path: docxPath });
        
        let htmlContent = result.value;
        
        // Pre-process HTML to fix question number issues
        // Remove bold formatting from question numbers specifically
        htmlContent = htmlContent.replace(/<strong>(\d+)\.<\/strong>/g, '$1.');
        htmlContent = htmlContent.replace(/<b>(\d+)\.<\/b>/g, '$1.');
        htmlContent = htmlContent.replace(/<strong>(\d+)\.\s*/g, '$1. ');
        htmlContent = htmlContent.replace(/<b>(\d+)\.\s*/g, '$1. ');
        
        // Also handle cases where the whole question is in bold
        htmlContent = htmlContent.replace(/<strong>(\d+\.[^<]+)<\/strong>/g, '$1');
        htmlContent = htmlContent.replace(/<b>(\d+\.[^<]+)<\/b>/g, '$1');
        
        // Process the content more carefully
        // Split by paragraphs and lists
        const sections = htmlContent.split(/(<p[^>]*>|<\/p>|<ul[^>]*>|<\/ul>|<li[^>]*>|<\/li>)/);
        const processedSections = [];
        
        let inList = false;
        
        for (let section of sections) {
            // Skip HTML tags
            if (section.match(/^<[^>]*>$/)) {
                if (section.includes('<ul')) inList = true;
                if (section.includes('</ul')) inList = false;
                continue;
            }
            
            section = section.trim();
            if (!section) continue;
            
            // Check if this section contains a question (starts with number)
            const questionMatch = section.match(/^(\d+)\.\s*(.+)/);
            
            if (questionMatch) {
                // This is definitely a question
                console.log(`📝 Found question ${questionMatch[1]}: ${questionMatch[2].substring(0, 30)}...`);
                
                // Remove all bold formatting from questions
                section = section.replace(/<strong>(.*?)<\/strong>/g, '$1');
                section = section.replace(/<b>(.*?)<\/b>/g, '$1');
                
                processedSections.push(section);
            } else if (inList || section.match(/^-/) || section.includes('![](media/image')) {
                // This is an answer option
                // Keep bold formatting as **
                section = section.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
                section = section.replace(/<b>(.*?)<\/b>/g, '**$1**');
                
                // Clean up image references and ensure proper dash formatting
                section = section.replace(/!\[\]\(media\/image\d+\.wmf\)/g, '');
                
                if (!section.startsWith('-') && section.trim()) {
                    section = '- ' + section.trim();
                }
                
                if (section.includes('**')) {
                    console.log(`📌 Found correct answer: ${section.substring(0, 50)}...`);
                }
                
                processedSections.push(section);
            } else {
                // This is explanatory text
                section = section.replace(/<strong>(.*?)<\/strong>/g, '$1');
                section = section.replace(/<b>(.*?)<\/b>/g, '$1');
                
                processedSections.push(section);
            }
        }
        
        let processedText = processedSections.join('\n');
        
        // Remove all remaining HTML tags
        processedText = processedText.replace(/<[^>]*>/g, '');
        
        // Decode HTML entities
        processedText = processedText.replace(/&nbsp;/g, ' ');
        processedText = processedText.replace(/&amp;/g, '&');
        processedText = processedText.replace(/&lt;/g, '<');
        processedText = processedText.replace(/&gt;/g, '>');
        processedText = processedText.replace(/&quot;/g, '"');
        
        // FINAL CRITICAL FIX: Process line by line to catch and fix question numbering
        const lines = processedText.split('\n');
        const finalLines = [];
        let questionCounter = 1;
        
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;
            
            // Check if this line is already a properly numbered question
            if (line.match(/^\d+\./)) {
                // Update our counter to match
                const match = line.match(/^(\d+)\./);
                if (match) {
                    questionCounter = parseInt(match[1]) + 1;
                }
                finalLines.push(line);
                console.log(`✅ Found properly numbered question: ${line.substring(0, 50)}...`);
                continue;
            }
            
            // SPECIFIC FIX: If a line starts with "- **" and looks like a question, 
            // it's likely a misformatted first question
            if (line.match(/^-\s*\*\*.*\?/)) {
                let questionText = line.replace(/^-\s*\*\*/, '').replace(/\*\*$/, '').trim();
                line = `${questionCounter}. ${questionText}`;
                questionCounter++;
                console.log(`🚨 Fixed misformatted question: ${line}`);
                finalLines.push(line);
                continue;
            }
            
            // Also catch cases where question numbers got converted to **
            if (line.match(/^\*\*\d+\.\*\*/)) {
                line = line.replace(/^\*\*(\d+\.)\*\*/, '$1');
                const match = line.match(/^(\d+)\./);
                if (match) {
                    questionCounter = parseInt(match[1]) + 1;
                }
                console.log(`✅ Fixed question number: ${line}`);
                finalLines.push(line);
                continue;
            }
            
            // CRITICAL FIX: Catch questions that lost their numbers entirely
            // Look for lines that end with ? and don't start with - (answer options)
            if (line.match(/\?$/) && !line.startsWith('-') && !line.includes('**')) {
                // Check if this looks like a question by looking for question words
                if (line.match(/^(What|When|Where|Who|Which|How|Why|Is|Are|Does|Do|Can|Should|The)/i)) {
                    line = `${questionCounter}. ${line}`;
                    questionCounter++;
                    console.log(`🔧 Added missing question number: ${line}`);
                    finalLines.push(line);
                    continue;
                }
            }
            
            // Default: add the line as-is
            finalLines.push(line);
        }
        
        processedText = finalLines.join('\n');
        
        fs.writeFileSync(txtPath, processedText);
        console.log(`✅ Converted: ${path.basename(docxPath)}`);
        
        // Show the first few lines to verify
        const firstLines = processedText.split('\n').slice(0, 8);
        console.log('🔍 First lines of converted file:');
        firstLines.forEach((line, index) => {
            if (line.trim()) {
                console.log(`  ${line}`);
            }
        });
        console.log('---\n');
        
        return true;
    } catch (error) {
        console.error(`Error converting ${docxPath}:`, error.message);
        return false;
    }
}

// Main function to convert all .docx files in exams directory
async function convertAllDocxFiles() {
    const examsDir = path.join(__dirname, '../exams');
    const txtDir = path.join(__dirname, 'txt_exams');
    
    try {
        // Create txt_exams directory if it doesn't exist
        if (!fs.existsSync(txtDir)) {
            fs.mkdirSync(txtDir);
            console.log('Created txt_exams directory');
        }
        
        // Read all files in exams directory  
        const files = fs.readdirSync(examsDir);
        const docxFiles = files.filter(file => file.endsWith('.docx')).sort();
        
        console.log(`🔄 Converting ${docxFiles.length} .docx files...\n`);
        
        let successCount = 0;
        
        for (const file of docxFiles) {
            const docxPath = path.join(examsDir, file);
            const txtFileName = file.replace('.docx', '.txt');
            const txtPath = path.join(txtDir, txtFileName);
            
            console.log(`🔄 Converting ${file}...`);
            const success = await convertDocxToTxtWithFormatting(docxPath, txtPath);
            if (success) successCount++;
        }
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`✅ CONVERSION COMPLETE: ${successCount}/${docxFiles.length} files converted`);
        console.log(`🎯 Fixed question numbering issues`);
        console.log(`${'='.repeat(60)}`);
        
    } catch (error) {
        console.error('Error during conversion:', error);
    }
}

// Run the conversion
convertAllDocxFiles();
