import type { Metadata } from 'next';
import 'styles/globals.css'; // adjust if your globals.css lives elsewhere
import { Inter } from 'next/font/google';
import React from 'react';
// C:\Code\Clarity\styles\globals.css
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Clarity - Caring Health Guidance',
  description:
    'Get gentle, clear guidance for your health concerns with AI-powered support that puts your wellbeing first.',
  keywords:
    'health guidance, medical advice, symptom checker, healthcare assistant, triage, self-care',
  authors: [{ name: 'Clarity Team' }],
  creator: 'Clarity',
  publisher: 'Clarity',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
  icons: {
    icon:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🩺</text></svg>",
  },
  openGraph: {
    title: 'Clarity - Caring Health Guidance',
    description: 'Get gentle, clear guidance for your health concerns',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clarity - Caring Health Guidance',
    description: 'Get gentle, clear guidance for your health concerns',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🩺</text></svg>"
        />
      </head>
      <body
        className={`
          font-sans antialiased 
          bg-slate-50 text-slate-900 
          selection:bg-blue-100 selection:text-blue-900
          min-h-screen
        `}
      >
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>

          {/* Subtle footer */}
          <footer className="mt-auto border-t border-slate-200 bg-white py-6">
            <div className="mx-auto max-w-4xl px-6 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <span className="text-lg">🩺</span>
                <span className="font-medium">Clarity</span>
                <span>•</span>
                <span>
                  Calm, clear guidance. Not a substitute for professional medical
                  advice.
                </span>
              </div>

              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
                <a className="hover:text-slate-700" href="/privacy">
                  Privacy
                </a>
                <a className="hover:text-slate-700" href="/terms">
                  Terms
                </a>
                <a className="hover:text-slate-700" href="/contact">
                  Contact
                </a>
              </div>

              <div className="mt-3 text-xs text-slate-400">
                © {new Date().getFullYear()} Clarity. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
