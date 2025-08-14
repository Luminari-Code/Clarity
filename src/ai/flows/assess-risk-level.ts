'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GLOBAL_POLICY } from '@/ai/prompts/global-policy';
import { REDFLAG_MICROCHECK } from '@/ai/prompts/redflag-microcheck';
import { RISK_STABLE_ASSESSMENT } from '@/ai/prompts/risk-stable-assessment';
import { MEDS_SELFCARE_GUARDRAILS } from '@/ai/prompts/meds-selfcare-guardrails';
import { LOCALIZER_INDIA } from '@/ai/prompts/localizer-india';
import { CONFLICTS_CONSISTENCY } from '@/ai/prompts/conflicts-consistency';
import { UX_WRAPPER } from '@/ai/prompts/ux-wrapper';
import { DISCLAIMER } from '@/ai/prompts/disclaimer';

// ----- Schemas -----
const CaseIntakeSchema = z.object({
  demographics: z.object({
    age: z.number().optional(),
    sexAtBirth: z.enum(['male', 'female', 'intersex', 'unknown']).optional(),
    country: z.string().optional(),
    state: z.string().optional(),
  }).default({}),
  chief_concern: z.string().default(''),
  onset: z.string().optional().default(''),
  severity: z.enum(['mild', 'moderate', 'severe', 'unknown']).optional(),
  red_flags_screen: z.array(z.string()).default([]),
  history: z.array(z.string()).default([]),
  meds_allergies: z.array(z.string()).default([]),
  associated_symptoms: z.array(z.string()).default([]),
  context: z.array(z.string()).default([]),
  preferences: z.object({
    care_mode: z.enum(['telemedicine', 'in-person', 'either']).optional(),
    watchful_waiting_ok: z.boolean().optional(),
  }).default({}),
  data_gaps: z.array(z.string()).default([]),
  region: z.enum(['IN', 'GLOBAL']).optional(),
});

const StableAssessmentSchema = z.object({
  overall_risk_tier: z.enum(['Emergency/Urgent', 'Non-urgent but monitor', 'Self-care']).default('Self-care'),
  rationale: z.string().default(''),
  condition_clusters: z.array(z.object({
    name: z.string().default(''),
    tier: z.string().default(''),
    why: z.string().default(''),
  })).default([]),
  action_plan: z.object({
    now: z.array(z.string()).default([]),
    monitor: z.array(z.string()).default([]),
    care_guidance: z.array(z.string()).default([]),
  }).default({ now: [], monitor: [], care_guidance: [] }),
  red_flags_to_watch: z.array(z.string()).default([]),
  data_gaps: z.array(z.string()).default([]),
  disclaimer: z.string().default(''),
});

// Helper function to generate text without schema validation
async function generateTextSafely(prompt: string, fallback: string): Promise<string> {
  try {
    // Use generate without schema validation for text outputs
    const result = await ai.generate({
      prompt,
      // Don't specify output schema - let it return raw text
    }) as any; // Type assertion to avoid TypeScript issues
    
    // Extract text from the result - check various possible properties
    if (result?.text && typeof result.text === 'string' && result.text.trim()) {
      return result.text.trim();
    }
    
    // Try other common response properties
    if (result?.output && typeof result.output === 'string' && result.output.trim()) {
      return result.output.trim();
    }
    
    // If result itself is a string
    if (typeof result === 'string' && result.trim()) {
      return result.trim();
    }
    
    // Try to stringify if it's an object with content
    if (result && typeof result === 'object') {
      const stringified = JSON.stringify(result);
      if (stringified && stringified !== '{}' && stringified !== 'null') {
        // Try to extract readable content from the stringified result
        const match = stringified.match(/"(?:text|content|message|output)":"([^"]+)"/i);
        if (match && match[1]) {
          return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
      }
    }
    
    return fallback;
  } catch (error) {
    console.error('Text generation failed:', error);
    return fallback;
  }
}

// ----- Flow -----
export const assessRiskLevelFlow = ai.defineFlow(
  {
    name: 'assessRiskLevelFlow',
    inputSchema: CaseIntakeSchema,
    outputSchema: z.object({
      urgent: z.boolean(),
      ui: z.string().default(''),
      stable: StableAssessmentSchema.nullable(),
    }),
  },
  async (caseIntake) => {
    // 1. Red flag check
    const redPrompt = ai.definePrompt({
      name: 'redFlagCheck',
      input: { schema: CaseIntakeSchema },
      output: { schema: z.object({ urgent: z.boolean(), reasons: z.array(z.string()).optional() }) },
      prompt: `${GLOBAL_POLICY}\n${REDFLAG_MICROCHECK}`,
    });

    const redCheck = await redPrompt(caseIntake);

    if (redCheck.output?.urgent) {
      // Generate urgent UI message without schema validation
      const urgentPrompt = `Create a calm, user-facing message for an urgent medical situation. The reasons are: ${redCheck.output?.reasons?.join(', ') || ''}. Include the disclaimer: ${DISCLAIMER}`;
      const urgentUI = await generateTextSafely(
        urgentPrompt,
        `This appears to be an urgent medical situation. Please seek immediate medical attention. ${DISCLAIMER}`
      );

      return { urgent: true, ui: urgentUI, stable: null };
    }

    // 2. Stable assessment
    const stablePrompt = ai.definePrompt({
      name: 'stableAssessment',
      input: { schema: CaseIntakeSchema },
      output: { schema: StableAssessmentSchema },
      prompt: `${GLOBAL_POLICY}\n${RISK_STABLE_ASSESSMENT}`,
    });

    let stable = StableAssessmentSchema.parse(
      (await stablePrompt(caseIntake)).output ?? {},
    );

    // 3. Guardrails
    const guardPrompt = ai.definePrompt({
      name: 'medsGuardrails',
      input: { schema: StableAssessmentSchema },
      output: { schema: z.object({ now: z.array(z.string()).default([]), notes: z.string().optional() }) },
      prompt: `${GLOBAL_POLICY}\n${MEDS_SELFCARE_GUARDRAILS}`,
    });

    const guardrailResult = (await guardPrompt(stable)).output;
    if (guardrailResult?.now) stable.action_plan.now = guardrailResult.now;

    // 4. Localize if India
    if (caseIntake.region === 'IN') {
      const locPrompt = ai.definePrompt({
        name: 'localizerIndia',
        input: { schema: StableAssessmentSchema },
        output: { schema: z.object({ care_guidance: z.array(z.string()).default([]) }) },
        prompt: `${GLOBAL_POLICY}\n${LOCALIZER_INDIA}`,
      });

      const localizationResult = (await locPrompt(stable)).output;
      if (localizationResult?.care_guidance) {
        stable.action_plan.care_guidance = localizationResult.care_guidance;
      }
    }

    // 5. Consistency check
    const conPrompt = ai.definePrompt({
      name: 'consistencyCheck',
      input: { schema: z.object({ stable_assessment: StableAssessmentSchema, case_intake: CaseIntakeSchema }) },
      output: { schema: StableAssessmentSchema },
      prompt: `${GLOBAL_POLICY}\n${CONFLICTS_CONSISTENCY}`,
    });

    stable = StableAssessmentSchema.parse(
      (await conPrompt({ stable_assessment: stable, case_intake: caseIntake })).output ?? stable,
    );

    // 6. UX wrapper - Generate text without schema validation
    const uxPromptText = `${GLOBAL_POLICY}\n${UX_WRAPPER}\n\nStable Assessment: ${JSON.stringify(stable)}`;
    const ui = await generateTextSafely(
      uxPromptText,
      'Risk assessment completed. Please review the detailed analysis below.'
    );

    return { urgent: false, ui, stable };
  },
);

export async function assessRiskLevel(input: any) {
  try {
    return await assessRiskLevelFlow(input);
  } catch (error) {
    console.error('Error in assessRiskLevel:', error);
    // Return a safe fallback response
    return {
      urgent: false,
      ui: 'Unable to complete risk assessment. Please consult a healthcare provider.',
      stable: null
    };
  }
}