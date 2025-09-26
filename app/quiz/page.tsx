"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLeaderboard } from "../../hooks/useLeaderboard";
import { useQuizQuestions } from "../../hooks/useQuizQuestions";


export default function QuizPage() {
  const [userName, setUserName] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);
  const [showEarlySubmitConfirm, setShowEarlySubmitConfirm] = useState(false);
  const router = useRouter();
  const { submitScore } = useLeaderboard();
  const { questions, isLoading, error, submitAnswers } = useQuizQuestions(5);
  const [life, setLife] = useState(3);

  useEffect(() => {
    // Get user name from localStorage
    const storedName = localStorage.getItem("quizUserName");
    if (!storedName) {
      // If no name is stored, redirect back to home
      router.push("/");
      return;
    }
    setUserName(storedName);
  }, [router]);

  // Handle questions loading error
  useEffect(() => {
    if (error) {
      alert(error);
      router.push('/');
    }
  }, [error, router]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null || !questions.length || isCheckingAnswer) return;

    setIsCheckingAnswer(true);
    
    try {
      // Check the answer using the new API endpoint
      const response = await fetch('/api/check-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: questions[currentQuestion].id,
          answer: selectedAnswer,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setLastAnswerCorrect(result.isCorrect);
        setShowAnswerFeedback(true);
        
        // Update score if correct
        if (result.isCorrect) {
          setScore(prev => prev + 1);
        } else {
          // Reduce life if incorrect
          const newLife = life - 1;
          setLife(newLife);
          
          // Check if game over
          if (newLife <= 0) {
            setGameOver(true);
            setIsCheckingAnswer(false);
            return;
          }
        }

        // Store the answer for final submission
        const updatedAnswers = [...(localStorage.getItem('quizAnswers') ? JSON.parse(localStorage.getItem('quizAnswers')!) : [])];
        updatedAnswers[currentQuestion] = selectedAnswer;
        localStorage.setItem('quizAnswers', JSON.stringify(updatedAnswers));

        // Auto-advance after showing feedback
        setTimeout(() => {
          setShowAnswerFeedback(false);
          setLastAnswerCorrect(null);
          
          // Move to next question or complete quiz
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
          } else {
            handleFinishQuiz();
          }
          setIsCheckingAnswer(false);
        }, 2000); // Show feedback for 2 seconds
      }
    } catch (error) {
      console.error('Error checking answer:', error);
      setIsCheckingAnswer(false);
    }
  };

  const handleEarlySubmit = () => {
    setShowEarlySubmitConfirm(true);
  };

  const confirmEarlySubmit = () => {
    setShowEarlySubmitConfirm(false);
    handleFinishQuiz();
  };

  const cancelEarlySubmit = () => {
    setShowEarlySubmitConfirm(false);
  };

  const handleFinishQuiz = async () => {
    setIsSubmitting(true);
    
    try {
      // Get stored answers
      const answers = JSON.parse(localStorage.getItem('quizAnswers') || '[]');
      
      // Submit answers to get score using the hook
      const scoreData = await submitAnswers(answers);
      setScore(scoreData.score);
      
      // Submit to leaderboard using the hook
      try {
        const leaderboardData = await submitScore(userName, scoreData.score);
        console.log('Leaderboard updated:', leaderboardData);
      } catch (leaderboardError) {
        console.error('Failed to update leaderboard:', leaderboardError);
        // Continue anyway, the score was calculated successfully
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
      setQuizCompleted(true);
      // Clear stored data
      localStorage.removeItem('quizUserName');
      localStorage.removeItem('quizAnswers');
    }
  };

  if (!userName || isLoading || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-iwdc-purple)]">
        <div className="text-white text-xl">
          {!userName ? 'Redirecting...' : 'Loading quiz questions...'}
        </div>
      </div>
    );
  }

  // Game Over Screen
  if (gameOver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-iwdc-purple)] p-8">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full">
          <div className="text-6xl mb-4">💀</div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Game Over!
          </h1>
          <p className="text-lg mb-4 text-gray-700">
            Sorry <span className="font-semibold">{userName}</span>, you ran out of lives!
          </p>
          <div className="text-2xl font-bold text-[var(--color-iwdc-purple)] mb-6">
            Final Score: {score}/{currentQuestion + 1}
          </div>
          <p className="text-gray-600 mb-8">
            You answered correctly on {score} out of {currentQuestion + 1} questions before running out of lives.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-[var(--color-iwdc-purple)] text-white p-3 rounded-lg font-bold transition-all hover:bg-opacity-90"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="bg-gray-500 text-white p-3 rounded-lg font-bold transition-all hover:bg-opacity-90 block text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Completed Screen
  if (quizCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-iwdc-purple)] p-8">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-[var(--color-iwdc-purple)] mb-4">
            Quiz Completed!
          </h1>
          <p className="text-lg mb-4 text-[var(--color-iwdc-purple)]">
            Amazing! <span className="font-semibold">{userName}</span>!
          </p>
          <div className="text-4xl font-bold text-[var(--color-iwdc-purple)] mb-6">
            {isSubmitting ? '...' : `${score}/${questions.length}`}
          </div>
          <p className="text-gray-600 mb-4">
            {isSubmitting 
              ? 'Submitting your score...' 
              : `Kamu menjawab ${score} dari ${questions.length} pertanyaan dengan benar!`
            }
          </p>
          <p className="text-green-600 font-semibold mb-8">
            🏆 Congratulations! You completed the quiz with {life} {life === 1 ? 'life' : 'lives'} remaining!
          </p>
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="bg-[var(--color-iwdc-purple)] text-white p-3 rounded-lg font-bold transition-all hover:bg-opacity-90 block text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
		<div className="min-h-screen bg-[var(--color-iwdc-purple)] p-8">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-white text-center mb-8">
					<h1 className="text-3xl font-bold mb-2">Quiz IWDC</h1>
					<p className="text-lg">
						Welcome, <span className="font-semibold">{userName}</span>!
					</p>
					<div className="mt-4 flex flex-col items-center gap-2">
						<div className="flex items-center gap-2">
							<span className="text-lg font-semibold">Lives:</span>
							<div className="flex gap-1">
								{Array.from({ length: 3 }).map((_, i) => (
									<span
										key={i}
										className={`text-3xl transition-all duration-300 ${
											i < life
												? "text-red-500 heart-beat"
												: "text-gray-400 opacity-50"
										} ${
											showAnswerFeedback && !lastAnswerCorrect
												? "shake-animation"
												: ""
										}`}
									>
										{i < life ? "❤️" : "💀"}
									</span>
								))}
							</div>
						</div>
						<div className="text-sm text-[var(--color-iwdc-purple)] bg-white bg-opacity-20 px-3 py-1 rounded-full">
							📊 Question {currentQuestion + 1} of {questions.length} • Score:{" "}
							{score}
						</div>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="w-full bg-white bg-opacity-30 rounded-full h-4 mb-8 border border-white border-opacity-50">
					<div
						className={`h-4 rounded-full transition-all duration-500 life-progress ${
							life === 3 ? "life-full" : life === 2 ? "life-medium" : "life-low"
						}`}
						style={{
							width: `${((currentQuestion + 1) / questions.length) * 100}%`,
						}}
					></div>
				</div>

				{/* Early Submit Confirmation Modal */}
				{showEarlySubmitConfirm && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
							<div className="text-center">
								<div className="text-6xl mb-4">⚠️</div>
								<h3 className="text-2xl font-bold text-[var(--color-iwdc-purple)] mb-4">
									Submit Quiz Early?
								</h3>
								<p className="text-gray-700 mb-6">
									Are you sure you want to submit the quiz now? You&apos;ve answered{" "}
									<span className="font-bold">{currentQuestion + 1}</span> out of{" "}
									<span className="font-bold">{questions.length}</span> questions.
								</p>
								<p className="text-gray-600 mb-8">
									Your current score: <span className="font-bold text-[var(--color-iwdc-purple)]">{score}</span>
								</p>
								<div className="flex gap-4">
									<button
										onClick={cancelEarlySubmit}
										className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-bold transition-all hover:bg-opacity-90"
									>
										Continue Quiz
									</button>
									<button
										onClick={confirmEarlySubmit}
										className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-bold transition-all hover:bg-opacity-90"
									>
										Submit Now
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Question Card */}
				<div className="bg-white p-8 rounded-3xl shadow-xl relative">
					{/* Answer Feedback Overlay */}
					{showAnswerFeedback && (
						<div
							className={`absolute inset-0 rounded-3xl flex items-center justify-center z-10 fade-in-scale ${
								lastAnswerCorrect ? "correct-feedback" : "wrong-feedback"
							}`}
						>
							<div className="text-center text-white p-8">
								<div className="text-8xl mb-6 animate-bounce">
									{lastAnswerCorrect ? "🎉" : "💥"}
								</div>
								<h3 className="text-3xl font-bold mb-4">
									{lastAnswerCorrect ? "🎯 Excellent!" : "😅 Oops!"}
								</h3>
								{lastAnswerCorrect ? (
									<p className="text-xl">Great job! Keep it up! 🚀</p>
								) : (
									<div>
										<p className="text-xl mb-2">You lost a life! 💔</p>
										<p className="text-lg opacity-90">
											{life > 1
												? `${life - 1} ${
														life - 1 === 1 ? "life" : "lives"
												  } remaining!`
												: "Last life! Be careful! ⚠️"}
										</p>
									</div>
								)}
							</div>
						</div>
					)}

					<h2 className="text-2xl font-bold text-[var(--color-iwdc-purple)] mb-6">
						{currentQ.question}
					</h2>

					<div className="space-y-4 mb-8">
						{currentQ.options.map((option: string, index: number) => (
							<button
								key={index}
								onClick={() => handleAnswerSelect(index)}
								disabled={showAnswerFeedback || isCheckingAnswer}
								className={`w-full p-5 text-left border-2 rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${
									selectedAnswer === index
										? "border-[var(--color-iwdc-purple)] bg-[var(--color-iwdc-purple)] text-white shadow-lg scale-[1.02]"
										: "border-gray-300 hover:border-[var(--color-iwdc-purple)] text-[var(--color-iwdc-purple)] hover:shadow-md bg-white"
								} ${
									showAnswerFeedback || isCheckingAnswer
										? "opacity-60 cursor-not-allowed"
										: "cursor-pointer"
								}`}
							>
								<span
									className={`font-bold text-lg mr-4 inline-flex items-center justify-center w-8 h-8 rounded-full ${
										selectedAnswer === index
											? "bg-white text-[var(--color-iwdc-purple)]"
											: "bg-[var(--color-iwdc-purple)] text-white"
									}`}
								>
									{String.fromCharCode(65 + index)}
								</span>
								<span className="text-lg">{option}</span>
							</button>
						))}
					</div>

					<div className="flex flex-col gap-4">
						<button
							onClick={handleNextQuestion}
							disabled={
								selectedAnswer === null ||
								isCheckingAnswer ||
								showAnswerFeedback
							}
							className="w-full bg-[var(--color-iwdc-purple)] text-white px-6 py-3 rounded-lg font-bold transition-all hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isCheckingAnswer
								? "Checking..."
								: showAnswerFeedback
								? "Please wait..."
								: currentQuestion === questions.length - 1
								? "Finish Quiz"
								: "Submit Answer"}
						</button>
						
						{/* Early Submit Button - only show if not on last question */}
						{currentQuestion < questions.length - 1 && (
							<button
								onClick={handleEarlySubmit}
								disabled={isCheckingAnswer || showAnswerFeedback || isSubmitting}
								className="w-full bg-red-500 text-white px-6 py-3 rounded-lg font-bold transition-all hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-600"
							>
								🏁 Submit Quiz Early
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}