'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, User, ShieldAlert } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AyuriChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Namaste! I am Ayuri, your Ayurveda guide on AYURWED. I can help you discover preparations, understand ingredients, or find the right consultant — I never push products, I only guide. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "What is Ashwagandha used for?",
    "Find a consultant for stress",
    "How do I balance Vata Dosha?",
    "Which herbs help digestion?",
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
        }),
      });

      const data = await res.json();
      if (res.ok && data.content) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: "I encountered an error connecting to my wellness library. Please try again soon." },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Connection issue detected. Please check your network." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Trigger Button */}
      {!isOpen && (
        <button
          id="ayuri-chat-widget-trigger"
          onClick={() => setIsOpen(true)}
          className="bg-brand-green hover:bg-brand-gold text-white hover:text-brand-green p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group hover:scale-105 border border-brand-green-border/20"
          title="Ask Ayuri AI"
        >
          <MessageSquare className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-bold text-sm whitespace-nowrap">
            Ask Ayuri AI
          </span>
        </button>
      )}

      {/* Chat Dialog Widget */}
      {isOpen && (
        <div
          id="ayuri-chat-widget"
          className="bg-white rounded-3xl shadow-2xl border border-brand-green-border/10 w-[340px] sm:w-[400px] h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header */}
          <div className="bg-brand-green text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-brand-gold p-1.5 rounded-full text-brand-green">
                <Sparkles className="h-4.5 w-4.5 animate-pulse-slow" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Ayuri AI Assistant</h3>
                <span className="text-[10px] text-brand-green-light">Discovery & Wellness Guide</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-brand-green-border/40 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-brand-gold-light/45">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`p-1.5 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-brand-gold text-brand-green' : 'bg-brand-green text-white'
                  }`}
                >
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
                <div
                  className={`rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-gold/15 text-brand-gold-dark font-medium rounded-tr-none'
                      : 'bg-white text-brand-foreground border border-brand-green-border/10 shadow-sm rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="p-1.5 rounded-full h-8 w-8 bg-brand-green text-white flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 animate-spin" />
                </div>
                <div className="rounded-2xl p-3 text-xs bg-white text-brand-foreground/50 border border-brand-green-border/10 shadow-sm rounded-tl-none">
                  Ayuri is exploring the wellness library...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length === 1 && !loading && (
            <div className="px-4 py-2 bg-brand-gold-light/40 border-t border-brand-green-light flex flex-wrap gap-2">
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(reply)}
                  className="bg-white border border-brand-green-border/10 text-brand-green text-[10px] font-bold px-3 py-1.5 rounded-full hover:border-brand-gold transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Advisory warning */}
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex gap-2 items-center text-[10px] text-amber-800">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            <span>Ayuri guides discovery — not purchases. Always consult a certified practitioner for advice.</span>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t border-brand-green-light flex gap-2 bg-white"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Doshas, oils, or herbs..."
              className="flex-grow bg-brand-green-light/40 text-xs border border-brand-green-border/10 rounded-full py-2 px-4 focus:outline-none focus:border-brand-gold"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white p-2 rounded-full transition-colors flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
