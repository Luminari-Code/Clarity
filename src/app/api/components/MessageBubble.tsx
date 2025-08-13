import React from 'react';

export default function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] whitespace-pre-wrap p-3 rounded-lg ${isUser ? 'bg-indigo-100 text-indigo-900' : 'bg-gray-200 text-gray-900'}`}
      >
        {content}
      </div>
    </div>
  );
}
