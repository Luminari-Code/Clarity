'use client';

import { useState } from 'react';
import PromptBar from 'src/app/api/components/PromptBar';

// Lightweight types to render structured results
type StableAssessment = {
  overall_risk_tier?: 'Emergency/Urgent' | 'Non-urgent but monitor' | 'Self-care' | string;
  rationale?: string;
  condition_clusters?: { name?: string; tier?: string; why?: string }[];
  action_plan?: { now?: string[]; monitor?: string[]; care_guidance?: string[] };
  red_flags_to_watch?: string[];
  data_gaps?: string[];
  disclaimer?: string;
};

type ResultPayload = {
  urgent?: boolean;
  ui?: string;
  stable?: StableAssessment | null;
};

export default function Home() {
  // NEW: local state to show structured results on the same page
  const [result, setResult] = useState<ResultPayload | null>(null);

  return (
    <main className="min-h-screen">
      <HeroMediClarify onResult={setResult} />
      {/* NEW: Results Panel appears right after the Hero when available */}
      <div className="max-w-4xl mx-auto px-6">
        <ResultsPanel data={result} />
      </div>
      <TrustSection />
      <HowItWorksSection />
    </main>
  );
}

function HeroMediClarify({ onResult }: { onResult: (data: ResultPayload) => void }) {
  return (
    <section className="relative overflow-hidden">
      {/* Softer gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50" />
      
      {/* Subtle decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 blur-xl animate-pulse"></div>
      <div className="absolute bottom-32 right-16 w-24 h-24 bg-emerald-100 rounded-full opacity-30 blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="mx-auto max-w-4xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
        {/* Gentle introduction */}
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
          Simply describe what you're experiencing. Our AI provides gentle guidance to help you understand your next steps—always with your safety in mind.
        </p>

        <div className="mt-10 sm:mt-12 flex justify-center">
          <div className="w-full max-w-3xl">
            <PromptBar
              endpoint="/api/chat"
              region="IN"
              placeholder="Tell me what you're experiencing today..."
              // NEW: capture results and render below via ResultsPanel
              onResult={(data: ResultPayload) => onResult(data)}
            />
          </div>
        </div>

        {/* Reassuring note */}
        <p className="mt-6 text-sm text-slate-500 max-w-md mx-auto">
          💙 Remember: This is guidance, not medical diagnosis. Always consult healthcare professionals for serious concerns.
        </p>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="py-12 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Privacy First</h3>
            <p className="text-slate-600 text-sm">Your health information stays private and secure</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Personalized</h3>
            <p className="text-slate-600 text-sm">Guidance tailored to your specific situation</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Instant Help</h3>
            <p className="text-slate-600 text-sm">Get guidance in seconds, anytime you need it</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">How MediClarify helps you</h2>
          <p className="text-slate-600">Simple steps to get the guidance you need</p>
        </div>
        
        <div className="space-y-8">
          <div className="flex items-start gap-6">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Describe your symptoms</h3>
              <p className="text-slate-600">Tell us what you're experiencing in your own words. No medical jargon needed.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-6">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Get personalized guidance</h3>
              <p className="text-slate-600">Receive clear, caring advice about your next steps and what to watch for.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-6">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Take informed action</h3>
              <p className="text-slate-600">Know when to rest, monitor, or seek professional care with confidence.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================
   Structured Results Panel
   ========================= */

function ResultsPanel({ data }: { data: ResultPayload | null }) {
  if (!data) return null;

  const { urgent, ui, stable } = data;

  // Fallback: if only ui text is available, render a single guidance card
  if (!stable) {
    return (
      <section aria-label="Results" className="mt-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            {urgent ? 'Urgent guidance' : 'MediClarify guidance'}
          </h2>
          <div className="mt-3 text-slate-700 whitespace-pre-wrap">{ui || 'No guidance available.'}</div>
        </div>
      </section>
    );
  }

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
    <section aria-label="Results" className="mt-10 space-y-6">
      {/* Summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

      {/* Condition clusters */}
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

      {/* Red flags */}
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

      {/* Data gaps */}
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
      {stable.disclaimer ? (
        <p className="text-xs text-slate-500">ℹ️ {stable.disclaimer}</p>
      ) : (
        <p className="text-xs text-slate-500">
          ℹ️ This is caring guidance, not a medical diagnosis. Seek professional care for urgent concerns.
        </p>
      )}
    </section>
  );
}

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
      : tone === 'monitor'
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
