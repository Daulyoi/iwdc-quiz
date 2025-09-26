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

    const trimmedName = name.trim();
    
    // Check if user already exists
    const existingUser = await prisma.submissions.findFirst({
      where: { name: trimmedName },
      orderBy: { score: 'desc' }
    });

    let submission;
    let isNewHighScore = false;
    let previousBestScore = 0;

    if (existingUser) {
      previousBestScore = existingUser.score;
      
      if (score > existingUser.score) {
        // Update with new high score
        submission = await prisma.submissions.update({
          where: { id: existingUser.id },
          data: { 
            score,
            timestamp: new Date()
          }
        });
        isNewHighScore = true;
        console.log(`Updated high score for ${trimmedName}: ${previousBestScore} -> ${score}`);
      } else {
        // Keep existing record, just return current state
        submission = existingUser;
        console.log(`Score ${score} not higher than existing best ${existingUser.score} for ${trimmedName}`);
      }
    } else {
      // Create new user submission
      submission = await prisma.submissions.create({
        data: {
          name: trimmedName,
          score
        }
      });
      isNewHighScore = true;
      console.log('New user submission created:', submission);
    }

    // Get the updated leaderboard with ranks
    const rankedLeaderboard = await getLeaderboardWithRanks();
    
    // Find the rank of the user
    const userRank = rankedLeaderboard.find(entry => 
      entry.name === submission.name
    )?.rank;

    // Create appropriate message
    let message;
    if (existingUser) {
      if (isNewHighScore) {
        message = `New high score! Previous best: ${previousBestScore}. You ranked #${userRank}!`;
      } else {
        message = `Score recorded! Your best score remains ${existingUser.score}. Current rank: #${userRank}`;
      }
    } else {
      message = `Welcome! Score submitted successfully! You ranked #${userRank}`;
    }

    return NextResponse.json({
      success: true,
      rank: userRank,
      leaderboard: rankedLeaderboard,
      message,
      isNewHighScore,
      previousBestScore: existingUser ? previousBestScore : null,
      currentScore: submission.score
    });
  } catch (error) {
    console.error('Error submitting score:', error);
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    );
  }
}