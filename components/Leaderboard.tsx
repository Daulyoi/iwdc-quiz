import React from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

interface LeaderboardProps {
  entries?: LeaderboardEntry[];
  refreshTrigger?: number; // Used to trigger refresh
}

export default function Leaderboard({ entries, refreshTrigger }: LeaderboardProps) {
  const { leaderboardData, isLoading, refetch } = useLeaderboard();

  // Refresh when refreshTrigger changes
  React.useEffect(() => {
    if (refreshTrigger) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const displayData = entries || leaderboardData;
  return (
    <div className="lg:col-span-2 bg-[var(--color-iwdc-purple)] p-10 text-[var(--color-iwdc-white)] flex flex-col gap-10 justify-start items-center">
      <div className="w-full flex flex-col gap-6 justify-center items-center border-2 border-[var(--color-iwdc-white)] p-6 rounded-2xl backdrop-blur-sm bg-opacity-80">
        <h2 className="text-2xl font-bold">Leaderboard</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-[var(--color-iwdc-white)] text-lg">
              <th className="py-2 px-4 text-center">Rank</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-center">Score</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="py-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              displayData.map((entry, index) => (
                <tr
                  key={`${entry.name}-${entry.rank}-${index}`}
                  className={`${
                    index < displayData.length - 1 
                      ? "border-b border-[var(--color-iwdc-white)] border-opacity-40" 
                      : ""
                  } hover:bg-[var(--color-iwdc-purple-lighter)] hover:bg-opacity-10 transition-colors`}
                >
                  <td className="py-3 px-4 text-center font-bold">{entry.rank}</td>
                  <td className="py-3 px-4">{entry.name}</td>
                  <td className="py-3 px-4 text-center font-bold">{entry.score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}