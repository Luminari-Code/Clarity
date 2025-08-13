import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GLOBAL_POLICY } from '@/ai/prompts/global-policy';
import { INTAKE_ORCHESTRATOR } from '@/ai/prompts/intake-orchestrator';

const IntakeInputSchema = z.object({
  messages: z.string(),
  region: z.enum(['IN', 'GLOBAL']).default('IN'),
});

export const CaseIntakeSchema = z.object({
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

export const analyzeSymptomsFlow = ai.defineFlow(
  {
    name: 'analyzeSymptomsFlow',
    inputSchema: IntakeInputSchema,
    outputSchema: CaseIntakeSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'intakePrompt',
      input: { schema: IntakeInputSchema },
      output: { schema: CaseIntakeSchema },
      prompt: `${GLOBAL_POLICY}\n${INTAKE_ORCHESTRATOR}`,
    });

    const rawOutput = (await prompt(input)).output ?? {};
    return CaseIntakeSchema.parse(rawOutput);
  }
);

export async function analyzeSymptoms(input: z.infer<typeof IntakeInputSchema>) {
  return analyzeSymptomsFlow(input);
}
