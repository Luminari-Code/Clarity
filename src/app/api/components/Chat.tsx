'use client';

import { useState, useRef, useEffect } from 'react';

type Msg = { 
  role: 'user' | 'assistant'; 
  content: string; 
  timestamp: Date;
  urgent?: boolean;
};

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const submit = async () => {
    const value = input.trim();
    if (!value || loading) return;

    const userMessage: Msg = { 
      role: 'user', 
      content: value, 
      timestamp: new Date() 
    };

    setMessages((ms) => [userMessage, ...ms]);
    setInput('');
    setLoading(true);
    setIsFirstMessage(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: value, region: 'IN' }),
      });
      
      const data = await res.json();
      const assistantMessage: Msg = {
        role: 'assistant', 
        content: data?.ui || data?.error || 'I apologize, but I couldn\'t process your request. Please try again or consult a healthcare professional.',
        timestamp: new Date(),
        urgent: data?.urgent || false
      };

      setMessages((ms) => [assistantMessage, ...ms]);
    } catch {
      const errorMessage: Msg = {
        role: 'assistant', 
        content: 'I\'m unable to connect right now. Please try again in a moment, or contact a healthcare provider if this is urgent.',
        timestamp: new Date()
      };
      setMessages((ms) => [errorMessage, ...ms]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xl">🩺</span>
          </div>
          <div>
            <h1 className="font-semibold text-slate-800">MediClarify</h1>
            <p className="text-sm text-slate-500">Your caring health guidance assistant</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {isFirstMessage && (
          <WelcomeMessage />
        )}

        {messages.length > 0 && (
          <>
            {messages.slice().reverse().map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit()}
              placeholder={isFirstMessage ? "Tell me what you're experiencing..." : "Continue the conversation..."}
              disabled={loading}
              aria-label="Health concern description"
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
              onClick={submit}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <p className="mt-2 text-xs text-slate-500 text-center">
          💙 This is guidance, not medical diagnosis. Consult healthcare professionals for serious concerns.
        </p>
      </div>
    </div>
  );
}

function WelcomeMessage() {
  return (
    <div className="flex justify-center">
      <div className="max-w-md text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👋</span>
        </div>
        <h3 className="font-semibold text-slate-800 mb-2">Hi there! I'm here to help</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Share what you're experiencing and I'll provide gentle, caring guidance about your next steps. 
          Take your time—I'm here to listen.
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Msg }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-slate-600' : message.urgent ? 'bg-red-100' : 'bg-blue-100'
        }`}>
          <span className="text-sm">
            {isUser ? '👤' : message.urgent ? '🚨' : '🩺'}
          </span>
        </div>
        
        {/* Message bubble */}
        <div className={`px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-slate-600 text-white rounded-br-md' 
            : message.urgent
            ? 'bg-red-50 text-red-900 border border-red-200 rounded-bl-md'
            : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-md'
        }`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
          <div className={`text-xs mt-2 ${
            isUser ? 'text-slate-300' : 'text-slate-500'
          }`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex gap-3 max-w-[80%]">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm">🩺</span>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm px-4 py-3 rounded-2xl rounded-bl-md">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}