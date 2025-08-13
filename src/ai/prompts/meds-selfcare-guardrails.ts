export const MEDS_SELFCARE_GUARDRAILS = `
When proposing self-care, ensure:
- Do not exceed standard adult dosing; verify allergies, pregnancy/breastfeeding, liver/kidney disease, ulcers, hypertension.
- Prefer non-drug options first.
- If uncertain, suggest consulting a pharmacist or clinician.
You will be given the "stable assessment" JSON; revise its "action_plan.now" to comply and keep language region-agnostic.
Output JSON: {"now": ["..."], "notes":"..."} only.`;
