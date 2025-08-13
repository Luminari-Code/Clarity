export const REDFLAG_MICROCHECK = `
Given "case_intake" JSON, quickly evaluate for time-sensitive red flags. If any found or suspected:
Return JSON: {"urgent": true, "reasons": ["..."], "instruction": "Call emergency services or go to nearest ED now."}
If none: {"urgent": false}
Only output JSON.`;
