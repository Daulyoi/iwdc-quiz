import { useState, useEffect } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
}

export function useQuizQuestions(limit?: number) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const url = limit ? `/api/questions?limit=${limit}` : '/api/questions';
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions);
        } else {
          throw new Error('Failed to fetch questions');
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [limit]);

  const submitAnswers = async (answers: number[]) => {
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Failed to submit answers');
      }
    } catch (err) {
      console.error('Error submitting answers:', err);
      throw err;
    }
  };

  return {
    questions,
    isLoading,
    error,
    submitAnswers,
  };
}