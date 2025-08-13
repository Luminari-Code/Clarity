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
    const redPrompt = ai.definePrompt({
      name: 'redFlagCheck',
      input: { schema: CaseIntakeSchema },
      output: { schema: z.object({ urgent: z.boolean(), reasons: z.array(z.string()).optional() }) },
      prompt: `${GLOBAL_POLICY}\n${REDFLAG_MICROCHECK}`,
    });

    const redCheck = await redPrompt(caseIntake);

    if (redCheck.output?.urgent) {
      const urgentPrompt = ai.definePrompt({
        name: 'urgentUxWrapper',
        input: { schema: z.object({ reasons: z.string() }) },
        output: { schema: z.string().default('') },
        prompt: `Create a calm, user-facing message for an urgent medical situation. The reasons are: {{reasons}}. Include the disclaimer: ${DISCLAIMER}`,
      });

      // Parse output here to convert null to ''
      const urgentUI = z.string().default('').parse(
        (await urgentPrompt({
          reasons: redCheck.output?.reasons?.join(', ') || '',
        })).output
      );

      return { urgent: true, ui: urgentUI, stable: null };
    }

    const stablePrompt = ai.definePrompt({
      name: 'stableAssessment',
      input: { schema: CaseIntakeSchema },
      output: { schema: StableAssessmentSchema },
      prompt: `${GLOBAL_POLICY}\n${RISK_STABLE_ASSESSMENT}`,
    });

    let stable = StableAssessmentSchema.parse(
      (await stablePrompt(caseIntake)).output ?? {},
    );

    const guardPrompt = ai.definePrompt({
      name: 'medsGuardrails',
      input: { schema: StableAssessmentSchema },
      output: { schema: z.object({ now: z.array(z.string()).default([]), notes: z.string().optional() }) },
      prompt: `${GLOBAL_POLICY}\n${MEDS_SELFCARE_GUARDRAILS}`,
    });

    const guardrailResult = (await guardPrompt(stable)).output;
    if (guardrailResult?.now) {
      stable.action_plan.now = guardrailResult.now;
    }

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

    const conPrompt = ai.definePrompt({
      name: 'consistencyCheck',
      input: { schema: z.object({ stable_assessment: StableAssessmentSchema, case_intake: CaseIntakeSchema }) },
      output: { schema: StableAssessmentSchema },
      prompt: `${GLOBAL_POLICY}\n${CONFLICTS_CONSISTENCY}`,
    });

    stable = StableAssessmentSchema.parse(
      (await conPrompt({ stable_assessment: stable, case_intake: caseIntake })).output ?? stable,
    );

    const uxPrompt = ai.definePrompt({
      name: 'uxWrapper',
      input: { schema: StableAssessmentSchema },
      output: { schema: z.string().default('') },
      prompt: `${GLOBAL_POLICY}\n${UX_WRAPPER}`,
    });

    // Parse output here to convert null to ''
    const ui = z.string().default('').parse(
      (await uxPrompt(stable)).output
    );

    return { urgent: false, ui, stable };
  },
);

export async function assessRiskLevel(input: any) {
  return assessRiskLevelFlow(input);
}
