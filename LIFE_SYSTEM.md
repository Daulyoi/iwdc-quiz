# 🎮 Quiz IWDC - Life System Feature

## 🎯 Life System Overview

The Quiz IWDC application now features an engaging **Life System** that adds challenge and excitement to the quiz experience!

### ❤️ How the Life System Works

- **Starting Lives**: Each player begins with **3 lives** (❤️❤️❤️)
- **Wrong Answer Penalty**: Lose 1 life for each incorrect answer
- **Game Over**: Quiz automatically ends when lives reach 0
- **Immediate Feedback**: See results instantly after each answer
- **Visual Effects**: Animated hearts, shake effects, and colorful feedback

### 🎪 Key Features

#### 1. **Real-time Answer Checking** ⚡
- Answers are validated immediately using `/api/check-answer`
- No waiting until the end - instant feedback!
- Shows correct/incorrect status with animations

#### 2. **Dynamic Visual Feedback** 🎨
- ✅ **Correct Answer**: Green celebration with confetti emoji
- ❌ **Wrong Answer**: Red warning with explosion effect
- 💔 **Life Lost**: Hearts shake and turn gray
- 🎯 **Life Status**: Color-coded progress bar (green → yellow → red)

#### 3. **Enhanced UI/UX** 🌟
- **Animated Hearts**: Beating hearts show remaining lives
- **Smart Progress Bar**: Changes color based on life status
- **Answer Feedback Overlay**: Full-screen feedback with 2-second display
- **Button States**: Disabled during answer checking for smooth UX

#### 4. **Game States** 🎮
- **Playing**: Normal quiz with life tracking
- **Game Over**: Special screen when lives = 0
- **Quiz Complete**: Victory screen when finishing with lives remaining

### 🔧 Technical Implementation

#### API Endpoints
```typescript
// Check individual answers immediately
POST /api/check-answer
Body: { questionId: number, answer: number }
Response: { isCorrect: boolean, correctAnswer: number, explanation: string }

// Original endpoints still work for final submission
GET /api/questions
POST /api/questions (for final scoring)
GET/POST /api/leaderboard
```

#### Life System Logic
```typescript
// Starting state
const [life, setLife] = useState(3);

// Answer checking flow
handleNextQuestion() -> 
  API call to check answer -> 
  Update score/life -> 
  Show feedback -> 
  Continue or end game
```

### 🎯 Game Flow

1. **Start Quiz**: Player enters name and begins with 3 lives
2. **Answer Question**: Select answer and click "Submit Answer"
3. **Immediate Feedback**: 
   - ✅ Correct: Celebration + move to next question
   - ❌ Wrong: Life lost + warning message
4. **Continue**: Keep playing until all questions answered OR lives = 0
5. **End Game**: 
   - **Victory**: Complete all questions with lives remaining
   - **Game Over**: Lives reach 0 before completion

### 🎨 Visual Elements

#### Life Display
- **Full Life**: ❤️ (red, beating animation)
- **Lost Life**: 💔 (gray, static)
- **Danger**: Shake animation when life lost

#### Progress Bar Colors
- **3 Lives**: 🟢 Green (safe)
- **2 Lives**: 🟡 Yellow (caution)  
- **1 Life**: 🔴 Red (danger)

#### Feedback Animations
- **Correct**: 🎉 Green gradient with celebration
- **Wrong**: 💥 Red gradient with warning
- **Button hover**: Scale effect for better interaction

### 🚀 Try It Out!

Visit **http://localhost:3001** and experience the thrilling life system:

1. Enter your name
2. Start the quiz
3. Try answering some questions wrong to see the life system in action!
4. See if you can complete all questions with lives remaining! 🏆

---

**Challenge yourself and see how many questions you can answer correctly before running out of lives!** 💪🎯