'use client';

type StableAssessment = {
  overall_risk_tier?: 'Emergency/Urgent' | 'Non-urgent but monitor' | 'Self-care' | string;
  rationale?: string;
  condition_clusters?: { name?: string; tier?: string; why?: string }[];
  action_plan?: {
    now?: string[];
    monitor?: string[];
    care_guidance?: string[];
  };
  red_flags_to_watch?: string[];
  data_gaps?: string[];
  disclaimer?: string;
};

type ResultPayload = {
  urgent?: boolean;
  ui?: string;
  stable?: StableAssessment | null;
};

export default function ResultsPanel({ data }: { data: ResultPayload | null }) {
  if (!data) return null;

  const { urgent, ui, stable } = data;

  // If we only have a UI string, show a single card
  if (!stable) {
    return (
      <section aria-label="Results" className="mt-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            {urgent ? 'Urgent guidance' : 'Clarity guidance'}
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
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{tier || 'Guidance'}</span>;
  };

  return (
    <section aria-label="Results" className="mt-10 space-y-6">
      {/* Summary header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Clarity assessment</h2>
          {tierBadge(stable.overall_risk_tier)}
        </div>
        {stable.rationale ? (
          <p className="mt-3 text-slate-700">{stable.rationale}</p>
        ) : null}
        {ui ? <p className="mt-3 text-slate-700 whitespace-pre-wrap">{ui}</p> : null}
      </div>

      {/* Action plan */}
      {(stable.action_plan?.now?.length ||
        stable.action_plan?.monitor?.length ||
        stable.action_plan?.care_guidance?.length) && (
        <div className="grid gap-6 sm:grid-cols-3">
          {stable.action_plan?.now?.length ? (
            <Card title="Do now" tone="now" items={stable.action_plan.now} />
          ) : null}
          {stable.action_plan?.monitor?.length ? (
            <Card title="Monitor" tone="monitor" items={stable.action_plan.monitor} />
          ) : null}
          {stable.action_plan?.care_guidance?.length ? (
            <Card title="Care guidance" tone="care" items={stable.action_plan.care_guidance} />
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
          <h3 className="text-base font-semibold text-slate-900">Helpful clarifications for me</h3>
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

function Card({ title, items, tone }: { title: string; items: string[]; tone: 'now' | 'monitor' | 'care' }) {
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