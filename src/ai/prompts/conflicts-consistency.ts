export const CONFLICTS_CONSISTENCY = `
Input: "stable assessment" JSON and "case_intake".
Check for:
- Advice contradicting risk tier or red-flag status.
- Medication conflicts with allergies/pregnancy/comorbidities.
- Overly definitive diagnostic language.
- Missing disclaimer.
Fix issues and output corrected stable assessment JSON. Only JSON.`;
