'use client';

export default function ResultsActions() {
  const handleDownload = () => {
    const node = document.getElementById('results-root');
    if (!node) return;

    const doc = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>MediClarify - Guidance</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      /* Reset */
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: #0f172a; }
      /* Print layout */
      @page { margin: 16mm; }
      @media print {
        .no-print { display: none !important; }
        body { background: #fff !important; }
        a { color: inherit; text-decoration: none; }
      }
      /* Utility-ish styles mapped from Tailwind classes we used */
      .container { max-width: 960px; margin: 0 auto; padding: 0 16px; }
      .section { margin-top: 24px; }
      .card { border: 1px solid #e2e8f0; background: #fff; border-radius: 16px; padding: 24px; margin: 12px 0; }
      .title { font-weight: 700; font-size: 18px; margin: 0; color: #0f172a; }
      .subtitle { font-weight: 600; font-size: 16px; color: #0f172a; margin: 0 0 8px; }
      .muted { color: #334155; }
      .list { margin: 12px 0 0 18px; }
      .badge { display: inline-block; border-radius: 999px; padding: 2px 8px; font-size: 12px; font-weight: 600; margin-left: 8px; }
      .badge-slate { background: #e2e8f0; color: #334155; }
      .badge-red { background: #fee2e2; color: #b91c1c; }
      .badge-amber { background: #fde68a; color: #92400e; }
      .badge-emerald { background: #d1fae5; color: #065f46; }
      .card-emerald { background: #ecfdf5; border-color: #a7f3d0; }
      .card-amber { background: #fffbeb; border-color: #fde68a; }
      .card-indigo { background: #eef2ff; border-color: #c7d2fe; }
      .card-rose { background: #fff1f2; border-color: #fecdd3; }
      .small { font-size: 12px; color: #64748b; }
      .space { height: 8px; }
    </style>
  </head>
  <body>
    <div class="container">
      ${node.innerHTML}
    </div>
    <script>
      // Trigger print after DOM paints
      setTimeout(() => {
        window.print();
        setTimeout(() => window.close(), 300);
      }, 200);
    </script>
  </body>
</html>
    `.trim();

    const win = window.open('', '_blank', 'noopener,noreferrer,width=1024,height=768');
    if (!win) return;
    win.document.open();
    win.document.write(doc);
    win.document.close();
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:opacity-90"
        onClick={handleDownload}
      >
        Download PDF
      </button>
    </div>
  );
}
