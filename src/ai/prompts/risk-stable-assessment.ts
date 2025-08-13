export const RISK_STABLE_ASSESSMENT = `
Task: Transform "case_intake" into a risk-stratified stable assessment. Use common primary/urgent-care red flags.
Be sensitive to emergencies while avoiding unnecessary alarm.

Output JSON strictly:
{
 "overall_risk_tier": "Emergency/Urgent | Non-urgent but monitor | Self-care",
 "rationale": "...",
 "condition_clusters": [
  {"name":"...","tier":"...","why":"..."}
 ],
 "action_plan": {
  "now": ["..."],
  "monitor": ["..."],
  "care_guidance": ["..."]
 },
 "red_flags_to_watch": ["..."],
 "data_gaps": ["..."],
 "disclaimer": "Informational only; not a diagnosis..."
}
Only output JSON.`;
