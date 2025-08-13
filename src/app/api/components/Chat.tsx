'use client';

import { useState } from 'react';
import MessageBubble from './MessageBubble';

export default function Chat() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages((ms) => [...ms, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: userMessage.content, region: 'IN' }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((ms) => [...ms, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else {
        setMessages((ms) => [...ms, { role: 'assistant', content: data.ui || 'No response' }]);
      }
    } catch {
      setMessages((ms) => [...ms, { role: 'assistant', content: 'Failed to fetch response.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto border rounded-lg shadow p-4">
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && <p className="text-gray-500">Describe your symptoms to begin.</p>}
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} />
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          placeholder="e.g., I have a headache since yesterday..."
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? 'Thinking…' : 'Send'}
        </button>
      </div>
    </div>
  );
}
