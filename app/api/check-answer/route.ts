import { NextResponse } from 'next/server';
import { questions as originalQuestions } from '../questions/questions';

// Convert the questions format to match API expectations
const questions = originalQuestions.map(q => ({
  id: q.id,
  question: q.question_text,
  options: q.options,
  correctAnswer: q.options.indexOf(q.correct_answer),
}));

export async function POST(request: Request) {
  try {
    const { questionId, answer } = await request.json();
    
    if (typeof questionId !== 'number' || typeof answer !== 'number') {
      return NextResponse.json(
        { error: 'Question ID and answer must be numbers' },
        { status: 400 }
      );
    }

    // Find the question by ID
    const question = questions.find(q => q.id === questionId);
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    const isCorrect = answer === question.correctAnswer;
    
    return NextResponse.json({
      questionId,
      userAnswer: answer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: isCorrect 
        ? "Benar! Selamat!" 
        : `Salah :( `
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}