'use client';

import { useState } from 'react';
import PromptBar, { ResultPayload } from 'src/app/api/components/PromptBar';
import ResultsActions from 'src/app/api/components/ResultsActions';

/* =========================
   Types (duplicate-safe)
   ========================= */

type StableAssessment = {
  overall_risk_tier?: 'Emergency/Urgent' | 'Non-urgent but monitor' | 'Self-care' | string;
  rationale?: string;
  condition_clusters?: { name?: string; tier?: string; why?: string }[];
  action_plan?: { now?: string[]; monitor?: string[]; care_guidance?: string[] };
  red_flags_to_watch?: string[];
  data_gaps?: string[];
  disclaimer?: string;
};

/* =========================
   Page
   ========================= */

export default function Home() {
  // Local state that holds the latest guidance result
  const [result, setResult] = useState<ResultPayload | null>(null);

  return (
    <main className="min-h-screen">
      {/* Hero with search bar */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 blur-xl animate-pulse" />
        <div
          className="absolute bottom-32 right-16 w-24 h-24 bg-emerald-100 rounded-full opacity-30 blur-lg animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div className="mx-auto max-w-4xl px-6 pt-16 pb-10 sm:pt-24 sm:pb-12 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
              <span className="mr-2">🩺</span>
              Trusted health guidance
            </div>
          </div>
          <h1 className="text-slate-800 tracking-tight font-bold text-3xl leading-tight sm:text-5xl">
            Get clear, caring guidance for your
            <span className="text-blue-600 block mt-2">health concerns</span>
          </h1>
          <p className="mt-6 text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Simply describe what you're experiencing. Our AI provides gentle guidance to help you understand your next
            steps—always with your safety in mind.
          </p>

          {/* Search bar */}
          <div className="mt-10 sm:mt-12 flex justify-center">
            <div className="w-full max-w-3xl">
              <PromptBar
                endpoint="/api/chat"
                region="IN"
                placeholder="Tell me what you're experiencing today..."
                // CRITICAL: render results right under this bar
                onResult={(data) => setResult(data)}
              />
            </div>
          </div>

          <p className="mt-6 text-sm text-slate-500 max-w-md mx-auto">
            💙 Remember: This is guidance, not a medical diagnosis. Always consult healthcare professionals for serious
            concerns.
          </p>
        </div>

        {/* RESULTS RIGHT UNDER THE SEARCH BAR */}
        <div className="mx-auto max-w-4xl px-6 pb-10">
          <ResultsPanel data={result} />
        </div>
      </section>

      {/* You can keep other sections below if desired */}
      {/* <TrustSection /> */}
      {/* <HowItWorksSection /> */}
    </main>
  );
}

/* =========================
   Results Panel (shows inline)
   ========================= */

function ResultsPanel({ data }: { data: ResultPayload | null }) {
  if (!data) return null;

  const { urgent, ui, stable } = data;

  return (
    <section className="mt-6">
      {/* Actions (PDF download) */}
      <div className="mb-3 flex items-center justify-end">
        <ResultsActions />
      </div>

      {/* Printable root (only this area is exported to PDF) */}
      <div id="results-root">
        {!stable ? (
          // If only UI text exists
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              {urgent ? 'Urgent guidance' : 'MediClarify guidance'}
            </h2>
            <div className="mt-3 text-slate-700 whitespace-pre-wrap">{ui || 'No guidance available.'}</div>
          </div>
        ) : (
          <StructuredResults ui={ui} stable={stable} />
        )}
      </div>
    </section>
  );
}

/* =========================
   Structured Results
   - “MediClarify assessment” hidden on screen, included in PDF
   ========================= */

function StructuredResults({ ui, stable }: { ui?: string; stable: StableAssessment }) {
  const tierBadge = (tier?: string) => {
    const t = (tier || '').toLowerCase();
    let cls = 'bg-slate-100 text-slate-700';
    if (t.includes('urgent')) cls = 'bg-red-100 text-red-700';
    else if (t.includes('monitor')) cls = 'bg-amber-100 text-amber-700';
    else if (t.includes('self-care')) cls = 'bg-emerald-100 text-emerald-700';
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
        {tier || 'Guidance'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Print-only summary (included in PDF, hidden on screen) */}
      <div className="hidden print:block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">MediClarify assessment</h2>
          {tierBadge(stable.overall_risk_tier)}
        </div>
        {stable.rationale ? <p className="mt-3 text-slate-700">{stable.rationale}</p> : null}
        {ui ? <p className="mt-3 text-slate-700 whitespace-pre-wrap">{ui}</p> : null}
      </div>

      {/* Action plan */}
      {(stable.action_plan?.now?.length ||
        stable.action_plan?.monitor?.length ||
        stable.action_plan?.care_guidance?.length) && (
        <div className="grid gap-6 sm:grid-cols-3">
          {stable.action_plan?.now?.length ? (
            <ResultCard title="Do now" tone="now" items={stable.action_plan.now} />
          ) : null}
          {stable.action_plan?.monitor?.length ? (
            <ResultCard title="Monitor" tone="monitor" items={stable.action_plan.monitor} />
          ) : null}
          {stable.action_plan?.care_guidance?.length ? (
            <ResultCard title="Care guidance" tone="care" items={stable.action_plan.care_guidance} />
          ) : null}
        </div>
      )}

      {/* Possible causes under review */}
      {stable.condition_clusters?.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Possible causes under review</h3>
          <ul className="mt-3 space-y-3">
            {stable.condition_clusters.map((c, i) => (
              <li key={i} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{c.name || 'Condition'}</span>
                  {c.tier ? tierBadge(c.tier) : null}
                </div>
                {c.why ? <p className="mt-1 text-sm text-slate-700">{c.why}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Watch for red flags */}
      {stable.red_flags_to_watch?.length ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-rose-800">Watch for red flags</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-rose-900">
            {stable.red_flags_to_watch.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Helpful clarifications */}
      {stable.data_gaps?.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Helpful clarifications</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
            {stable.data_gaps.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Disclaimer */}
      <p className="text-xs text-slate-500">
        ℹ️ {stable.disclaimer || 'This is caring guidance, not a medical diagnosis. Seek professional care for urgent concerns.'}
      </p>
    </div>
  );
}

/* =========================
   Result Card
   ========================= */

function ResultCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: 'now' | 'monitor' | 'care';
}) {
  const toneCls =
    tone === 'now'
      ? 'border-emerald-200 bg-emerald-50'
      : 'monitor' === tone
      ? 'border-amber-200 bg-amber-50'
      : 'border-indigo-200 bg-indigo-50';

  return (
    <div className={`rounded-2xl border ${toneCls} p-6 shadow-sm`}>
      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-800">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
