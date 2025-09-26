import { useState, useEffect, useCallback } from 'react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

export function useLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data.leaderboard);
      } else {
        throw new Error('Failed to fetch leaderboard');
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard');
      // Fallback to default data
      setLeaderboardData([
        { rank: 1, name: "John Doe", score: 100 },
        { rank: 2, name: "Jane Smith", score: 90 },
        { rank: 3, name: "Bob Johnson", score: 80 },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const submitScore = async (name: string, score: number) => {
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, score }),
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data.leaderboard);
        return data;
      } else {
        throw new Error('Failed to submit score');
      }
    } catch (err) {
      console.error('Failed to submit score:', err);
      throw err;
    }
  };

  return {
    leaderboardData,
    isLoading,
    error,
    refetch: fetchLeaderboard,
    submitScore,
  };
}