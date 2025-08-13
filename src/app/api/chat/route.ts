import { NextRequest, NextResponse } from 'next/server';
import { analyzeSymptoms } from '@/ai/flows/analyze-symptoms';
import { assessRiskLevel } from '@/ai/flows/assess-risk-level';


export async function POST(req: NextRequest) {
  try {
    const { messages, region } = await req.json();

    const caseIntake = await analyzeSymptoms({ messages, region: region || 'IN' });
    if (!caseIntake) {
      return NextResponse.json({ error: 'Failed to parse symptoms' }, { status: 400 });
    }

    const riskResult = await assessRiskLevel(caseIntake);
    return NextResponse.json(riskResult);
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
