interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  urgent?: boolean;
}

export default function MessageBubble({ 
  role, 
  content, 
  timestamp, 
  urgent = false 
}: Message) {
  const isUser = role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex gap-3 max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-slate-600' : urgent ? 'bg-red-100' : 'bg-blue-100'
        }`}>
          <span className="text-sm">
            {isUser ? '👤' : urgent ? '🚨' : '🩺'}
          </span>
        </div>
        
        {/* Message content */}
        <div className="flex flex-col gap-1">
          {/* Message bubble */}
          <div className={`px-4 py-3 rounded-2xl ${
            isUser 
              ? 'bg-slate-600 text-white rounded-br-md' 
              : urgent
              ? 'bg-red-50 text-red-900 border border-red-200 rounded-bl-md'
              : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-md'
          }`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {content}
            </div>
          </div>
          
          {/* Timestamp */}
          {timestamp && (
            <div className={`text-xs px-2 ${
              isUser ? 'text-right text-slate-400' : 'text-left text-slate-500'
            }`}>
              {timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          )}
          
          {/* Urgent indicator */}
          {urgent && !isUser && (
            <div className="flex items-center gap-1 px-2 text-xs text-red-600">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Urgent guidance</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}