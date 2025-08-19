import { NextRequest, NextResponse } from 'next/server';
import { calculatePoints } from '@/lib/points';

export async function GET() {
  // Test cases for the points calculation system
  const testCases = [
    {
      name: "Exact Score",
      predicted: { home: 2, away: 1 },
      actual: { home: 2, away: 1 },
      expectedPoints: 5
    },
    {
      name: "Correct Goal Difference + Winner",
      predicted: { home: 2, away: 1 },
      actual: { home: 3, away: 2 },
      expectedPoints: 3
    },
    {
      name: "Correct Winner Only",
      predicted: { home: 2, away: 0 },
      actual: { home: 1, away: 0 },
      expectedPoints: 1
    },
    {
      name: "Draw - Exact Score",
      predicted: { home: 1, away: 1 },
      actual: { home: 1, away: 1 },
      expectedPoints: 5
    },
    {
      name: "Draw - Correct GD + Winner",
      predicted: { home: 1, away: 1 },
      actual: { home: 2, away: 2 },
      expectedPoints: 3
    },
    {
      name: "Draw - Correct GD + Winner",
      predicted: { home: 0, away: 0 },
      actual: { home: 1, away: 1 },
      expectedPoints: 3
    },
    {
      name: "Completely Wrong",
      predicted: { home: 3, away: 0 },
      actual: { home: 0, away: 2 },
      expectedPoints: 0
    },
    {
      name: "Away Win - Exact Score",
      predicted: { home: 0, away: 2 },
      actual: { home: 0, away: 2 },
      expectedPoints: 5
    },
    {
      name: "Away Win - Correct GD + Winner",
      predicted: { home: 1, away: 3 },
      actual: { home: 0, away: 2 },
      expectedPoints: 3
    },
    {
      name: "Wrong Winner but Same GD",
      predicted: { home: 2, away: 1 },
      actual: { home: 1, away: 2 },
      expectedPoints: 0
    }
  ];

  const results = testCases.map(testCase => {
    const calculation = calculatePoints(
      testCase.predicted.home,
      testCase.predicted.away,
      testCase.actual.home,
      testCase.actual.away
    );

    return {
      ...testCase,
      actualPoints: calculation.points,
      category: calculation.category,
      description: calculation.description,
      passed: calculation.points === testCase.expectedPoints,
      predictionText: `${testCase.predicted.home}-${testCase.predicted.away}`,
      actualText: `${testCase.actual.home}-${testCase.actual.away}`
    };
  });

  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;

  return NextResponse.json({
    success: true,
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      passRate: `${Math.round((passedTests / totalTests) * 100)}%`
    },
    testResults: results
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { predictedHome, predictedAway, actualHome, actualAway } = body;

    if (predictedHome === undefined || predictedAway === undefined || 
        actualHome === undefined || actualAway === undefined) {
      return NextResponse.json({
        error: 'Missing required fields: predictedHome, predictedAway, actualHome, actualAway'
      }, { status: 400 });
    }

    const calculation = calculatePoints(predictedHome, predictedAway, actualHome, actualAway);

    return NextResponse.json({
      success: true,
      prediction: `${predictedHome}-${predictedAway}`,
      actual: `${actualHome}-${actualAway}`,
      ...calculation
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Invalid request'
    }, { status: 400 });
  }
}