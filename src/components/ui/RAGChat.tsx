'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../providers/AppStateProvider';
import { chat } from '@/lib/ai/chat';
import { Product } from '@/types';

type Message = {
  role: 'user' | 'assistant';
  text: string;
};

type RAGChatProps = {
  product: Product;
};

export default function RAGChat({ product }: RAGChatProps) {
  const { state } = useAppState();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const reply = await chat(userMsg, product, state.apiKeys);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: `Sorry, I encountered an error: ${errMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keep only the last 3 exchanges (6 messages total: 3 user, 3 assistant)
  const visibleMessages = messages.slice(-6);

  return (
    <div className="bg-ytBackground border border-ytBorder rounded p-3 flex flex-col space-y-3">
      <div className="text-[11px] font-semibold text-ytTextSecondary uppercase tracking-wider">
        Product AI Assistant
      </div>

      {/* Input bar - pinned top/bottom on mobile card */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask anything about this product..."
          className="flex-1 bg-ytSurface border border-ytBorder focus:border-ytRed outline-none rounded text-xs px-3 h-[38px] text-white transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || input.trim() === ''}
          className="bg-ytSurface border border-ytBorder hover:bg-[#3f3f3f] disabled:opacity-50 text-white text-xs px-3 h-[38px] rounded transition-colors font-medium"
        >
          Send
        </button>
      </form>

      {/* Inline Responses below the input */}
      <div className="max-h-[150px] overflow-y-auto space-y-2.5 pr-1">
        {visibleMessages.length === 0 ? (
          <div className="text-center text-[11px] text-ytTextSecondary py-1 select-none">
            Query specifications or verify tone details.
          </div>
        ) : (
          visibleMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col space-y-0.5 rounded p-2.5 text-xs ${
                msg.role === 'user'
                  ? 'bg-ytSurface/50 text-[#dfdfdf] border-l-2 border-ytTextSecondary'
                  : 'bg-ytSurface text-white border-l-2 border-ytRed'
              }`}
            >
              <span className="text-[10px] font-semibold text-ytTextSecondary uppercase tracking-wider">
                {msg.role === 'user' ? 'You' : 'AI Assistant'}
              </span>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex items-center space-x-1.5 text-xs text-ytTextSecondary p-2 select-none">
            <div className="w-1.5 h-1.5 bg-ytRed rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 bg-ytRed rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 bg-ytRed rounded-full animate-bounce" />
            <span className="text-[11px] ml-1">Analyzing guidelines...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
    </div>
  );
}
