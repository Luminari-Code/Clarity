'use client';

import { useRef, useState } from 'react';

type StableAssessment = {
  overall_risk_tier?: string;
  rationale?: string;
  condition_clusters?: { name?: string; tier?: string; why?: string }[];
  action_plan?: { now?: string[]; monitor?: string[]; care_guidance?: string[] };
  red_flags_to_watch?: string[];
  data_gaps?: string[];
  disclaimer?: string;
};

export type ResultPayload = {
  urgent?: boolean;
  ui?: string;
  stable?: StableAssessment | null;
};

export default function PromptBar({
  endpoint = '/api/chat',
  region = 'IN',
  placeholder = "Tell me what you're experiencing today...",
  onResult,
}: {
  endpoint?: string;
  region?: string;
  placeholder?: string;
  onResult?: (data: ResultPayload) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string>('');     // controlled value
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const emit = (data: ResultPayload) => {
    if (typeof onResult === 'function') onResult(data);
  };

  const submit = async () => {
    const text = value.trim();
    if (!text || loading) return;

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: text, region }),
      });
      const data = (await res.json()) as ResultPayload;
      emit(data);
      // Do NOT clear input — it stays for the user to edit/change later
    } catch {
      emit({ ui: 'Unable to reach MediClarify. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const setSuggestion = (text: string) => {
    setValue(text);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full">
      <div
        className={`rounded-[28px] border bg-white px-5 py-4 shadow-sm transition-all sm:px-6 ${
          focused ? 'border-slate-400' : 'border-slate-300'
        }`}
      >
        <label htmlFor="symptoms" className="block text-sm font-medium text-slate-700">
          Describe your symptoms
        </label>

        <input
          id="symptoms"
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full bg-transparent text-[15px] placeholder:text-slate-400 focus:outline-none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={loading}
          aria-label="Describe symptoms"
        />

        <div className="mt-3 flex items-center justify-between">
          {/* Helpful suggestions */}
          <div className="flex flex-wrap gap-2">
            <SuggestionChip text="Headache since yesterday, mild fever" onClick={setSuggestion} />
            <SuggestionChip text="Stomach cramps after eating, no vomiting" onClick={setSuggestion} />
            <SuggestionChip text="Cough for 3 days, no breathing issues" onClick={setSuggestion} />
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            aria-label="Get MediClarify guidance"
          >
            {loading ? 'Thinking…' : 'Assess'}
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">Your information is private and secure.</p>
    </div>
  );
}

function SuggestionChip({ text, onClick }: { text: string; onClick: (text: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(text)}
      className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-200"
      aria-label={`Use suggestion: ${text}`}
      title={text}
    >
      {text}
    </button>
  );
}
