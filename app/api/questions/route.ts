import { NextResponse } from 'next/server';
import { questions } from './questions';

// Convert the questions format to match API expectations
const convertedQuestions = questions.map(q => ({
  id: q.id,
  question: q.question_text,
  options: q.options,
  correctAnswer: q.options.indexOf(q.correct_answer),
  category: "Web Development"
}));

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');

  let filteredQuestions = convertedQuestions;

  // Limit the number of questions if specified
  if (limit) {
    const limitNum = parseInt(limit);
    if (limitNum > 0) {
      filteredQuestions = filteredQuestions.slice(0, limitNum);
    }
  }

  // Remove correct answers from the response for security
  const questionsWithoutAnswers = filteredQuestions.map((q) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { correctAnswer, ...question } = q;
    return question;
  });

  return NextResponse.json({
    questions: questionsWithoutAnswers,
    total: filteredQuestions.length
  });
}

export async function POST(request: Request) {
  try {
    const { answers } = await request.json();
    
    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Answers must be an array' },
        { status: 400 }
      );
    }

    let score = 0;
    const results = answers.map((answer, index) => {
      const question = convertedQuestions[index];
      const isCorrect = question && answer === question.correctAnswer;
      if (isCorrect) score++;
      
      return {
        questionId: question?.id,
        userAnswer: answer,
        correctAnswer: question?.correctAnswer,
        isCorrect
      };
    });

    return NextResponse.json({
      score,
      total: answers.length,
      percentage: Math.round((score / answers.length) * 100),
      results
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}