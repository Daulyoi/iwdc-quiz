import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  timestamp: string;
}

async function getLeaderboardWithRanks(): Promise<LeaderboardEntry[]> {
  const submissions = await prisma.submissions.findMany({
    orderBy: [
      { score: 'desc' },
      { timestamp: 'asc' }
    ],
    take: 50 // Limit to top 50 entries
  });

  return submissions.map((entry, index) => ({
    rank: index + 1,
    name: entry.name,
    score: entry.score,
    timestamp: entry.timestamp.toISOString()
  }));
}

export async function GET() {
  try {
    const rankedLeaderboard = await getLeaderboardWithRanks();
    
    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      total: rankedLeaderboard.length
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, score } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { error: 'Score must be a non-negative number' },
        { status: 400 }
      );
    }

    // Save the submission to the database
    const newSubmission = await prisma.submissions.create({
      data: {
        name: name.trim(),
        score
      }
    });

    if (newSubmission) {
      console.log('New submission saved:', newSubmission);
    }

    // Get the updated leaderboard with ranks
    const rankedLeaderboard = await getLeaderboardWithRanks();
    
    // Find the rank of the newly added entry
    const userRank = rankedLeaderboard.find(entry => 
      entry.name === newSubmission.name && 
      Math.abs(new Date(entry.timestamp).getTime() - newSubmission.timestamp.getTime()) < 1000
    )?.rank;

    return NextResponse.json({
      success: true,
      rank: userRank,
      leaderboard: rankedLeaderboard,
      message: `Score submitted successfully! You ranked #${userRank}`
    });
  } catch (error) {
    console.error('Error submitting score:', error);
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}