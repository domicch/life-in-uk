# Google Analytics Quiz Tracking - Data Collection Guide

## 📊 What Data You'll Collect

Your Life in the UK website now tracks detailed analytics about how users interact with your quiz questions. Here's what you'll be able to see:

### 1. **Question Performance Analytics**

#### Incorrect Answers (Most Important)
- **Event**: `question_incorrect`
- **Data Collected**:
  - Exam number and question number
  - Question text (first 100 characters)
  - User's selected answers vs. correct answers
  - Whether it's multiple choice
  - Mode (practice vs. test)
  - Time spent on question

#### Correct Answers
- **Event**: `question_correct`
- **Data Collected**:
  - Question identification
  - Time spent answering
  - Mode (practice vs. test)

### 2. **User Behavior Analytics**

#### Questions Marked for Review
- **Event**: `question_review`
- **Shows**: Which questions users find confusing or want to revisit

#### Session Completion
- **Event**: `quiz_session_complete`
- **Data Collected**:
  - Total questions attempted
  - Questions answered
  - Correct answers
  - Completion rate
  - Accuracy rate
  - Session duration

#### Quiz Engagement
- **Event**: `quiz_start` - When users begin practice/test
- **Event**: `quiz_abandon` - If users leave before finishing

### 3. **Question Difficulty Tracking**
- **Event**: `question_attempted` - Every question attempt
- **Event**: `question_difficulty_high` - Questions with high error rates

## 🔍 How to View This Data in Google Analytics

### Option 1: Real-time Reports
1. Go to **Reports** → **Realtime** → **Events**
2. Look for events like `question_incorrect`, `question_correct`, etc.

### Option 2: Custom Reports (Recommended)
1. Go to **Explore** → **Free form**
2. Add dimensions:
   - Event name
   - Custom parameter: `exam_number`
   - Custom parameter: `question_number`
3. Add metrics:
   - Event count
   - Users

### Option 3: Detailed Analysis
1. Go to **Reports** → **Engagement** → **Events**
2. Click on specific event names (e.g., `question_incorrect`)
3. View all custom parameters for detailed analysis

## 📈 Key Insights You Can Extract

### 1. **Most Difficult Questions**
Questions with the highest `question_incorrect` event counts:
- Filter by `event_name = "question_incorrect"`
- Group by `exam_number` and `question_number`
- Sort by event count (descending)

### 2. **Question Performance by Mode**
Compare practice vs. test performance:
- Use the `mode` parameter to segment data
- See if questions are harder in test mode vs. practice

### 3. **Time Analysis**
- Questions that take longest to answer
- Correlation between time spent and correctness

### 4. **User Journey Analysis**
- Which questions cause users to mark for review
- Completion rates for different quiz modes
- Session duration patterns

## 🛠 Advanced Analysis

### Export Data for Deeper Analysis
1. Go to **Explore** → **Free form**
2. Set up your dimensions and metrics
3. Export to Google Sheets or CSV
4. Analyze in Excel/Google Sheets for:
   - Question difficulty ranking
   - Success rate by topic
   - Time-to-answer analysis

### Create Custom Dashboards
1. Go to **Reports** → **Library**
2. Create custom reports for:
   - "Top 10 Most Difficult Questions"
   - "Practice vs. Test Performance"
   - "User Engagement Metrics"

## 📋 Example Questions You Can Answer

1. **"Which questions do users get wrong most often?"**
   - Filter: `event_name = "question_incorrect"`
   - Group by: `exam_number`, `question_number`
   - Sort by: Event count

2. **"How long do users spend on difficult questions?"**
   - Compare `time_spent` parameter for correct vs. incorrect answers

3. **"Which questions cause users to give up?"**
   - Look at `quiz_abandon` events and the last question viewed

4. **"Are multiple choice questions harder than single choice?"**
   - Filter by `is_multiple_choice` parameter
   - Compare success rates

5. **"What's the average completion rate?"**
   - Look at `completion_rate` in `quiz_session_complete` events

## 🎯 Actionable Improvements

Based on this data, you can:

1. **Improve Difficult Questions**
   - Rewrite confusing questions
   - Add better explanations
   - Provide additional context

2. **Optimize Content**
   - Focus study materials on frequently missed topics
   - Create additional practice for problem areas

3. **Enhance User Experience**
   - Adjust timer based on average completion times
   - Improve navigation for questions users review most

4. **Content Strategy**
   - Create blog posts about commonly missed topics
   - Develop targeted study guides

This analytics setup will give you comprehensive insights into user behavior and question performance, helping you continuously improve your Life in the UK test preparation materials!
