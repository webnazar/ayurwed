'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, User, ShieldAlert, Bot, RefreshCw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AyuriChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Namaste! I am Ayuri, your AI Ayurveda guide. AYURWED offers an authentic Ayurvedic Shop, an educational Knowledge Center, and a verified Doctors List. I can help you discover classical remedies, understand Doshas, or find practitioner contact details. How can I guide your wellness journey today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "🌿 Herbs for Vata balance",
    "🛍️ Explore Shop remedies",
    "📚 Knowledge Center: Doshas",
    "👨‍⚕️ Browse Doctors List",
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

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
          { role: 'assistant', content: "I encountered an issue retrieving information from the Ayurveda library. Please try again shortly." },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Connection issue detected. Please verify your internet connection." },
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
          className="relative bg-brand-gold text-brand-green dark:text-black p-4 rounded-full shadow-2xl flex items-center justify-center group hover:scale-105 transition-all duration-300 border border-brand-gold/40"
          title="Ask Ayuri AI"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-green"></span>
          </span>
          <Bot className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 font-extrabold text-xs tracking-wide whitespace-nowrap uppercase">
            Ayuri AI Guide
          </span>
        </button>
      )}

      {/* Chat Dialog Widget */}
      {isOpen && (
        <div
          id="ayuri-chat-widget"
          className="bg-card/95 backdrop-blur-md rounded-3xl shadow-2xl border border-border w-[340px] sm:w-[410px] h-[520px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-green via-emerald-800 to-brand-green text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-brand-gold p-2 rounded-2xl text-brand-green dark:text-black shadow-inner">
                <Sparkles className="h-5 w-5 animate-pulse-slow" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                  Ayuri AI Assistant
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Live
                  </span>
                </h3>
                <span className="text-[10px] text-brand-green-light/80 block">Ayurvedic Wisdom, Shop Remedies &amp; Doctor Directory</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              title="Close chat"
            >
              <X className="h-5 w-5 text-white/90" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-brand-green-light/20 to-transparent">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 max-w-[88%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`p-1.5 rounded-2xl h-8 w-8 flex items-center justify-center flex-shrink-0 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-gold text-brand-green dark:text-black'
                      : 'bg-brand-green text-white'
                  }`}
                >
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={`rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-gold/15 text-brand-gold-dark font-medium border border-brand-gold/30 rounded-tr-none'
                      : 'bg-card text-brand-foreground border border-border/80 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 max-w-[85%] animate-pulse">
                <div className="p-1.5 rounded-2xl h-8 w-8 bg-brand-green text-white flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 animate-spin" />
                </div>
                <div className="rounded-2xl p-3.5 text-xs bg-card text-brand-foreground/70 border border-border shadow-sm rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-brand-green rounded-full animate-ping"></span>
                  Consulting Ayurvedic botanical library...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick reply chips */}
          {!loading && (
            <div className="px-3 py-2 bg-muted/40 border-t border-border/50 flex flex-wrap gap-1.5">
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(reply.replace(/^[^\s]+\s*/, ''))}
                  className="bg-card hover:bg-brand-green-light hover:text-brand-green border border-border text-foreground/80 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all duration-200 shadow-2xs"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Advisory warning */}
          <div className="px-3.5 py-2 bg-amber-500/10 border-t border-amber-500/20 flex gap-2 items-center text-[10px] text-amber-900 dark:text-amber-300 font-medium">
            <ShieldAlert className="h-4 w-4 flex-shrink-0 text-amber-600" />
            <span><strong>Platform Scope:</strong> Informational guide for our Shop, Knowledge Center &amp; Doctors List. We do not provide prescriptions or book appointments.</span>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t border-border flex gap-2 bg-card"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Doshas, remedies, or herbs..."
              className="flex-grow bg-muted/50 text-xs border border-border rounded-full py-2 px-4 focus:outline-none focus:border-brand-gold transition-colors"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary p-2.5 rounded-full flex-shrink-0 text-white disabled:opacity-50"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

