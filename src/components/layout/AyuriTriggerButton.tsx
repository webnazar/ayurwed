'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function AyuriTriggerButton() {
  const handleClick = () => {
    const trigger = document.getElementById('ayuri-chat-widget-trigger');
    if (trigger) {
      trigger.click();
    } else {
      // Direct search fallback
      const widget = document.getElementById('ayuri-chat-widget');
      if (widget) {
        widget.classList.remove('hidden');
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-brand-gold hover:bg-white text-brand-green font-bold px-6 py-3 rounded-full text-sm sm:text-base flex items-center gap-2 transition-all duration-300 shadow hover:shadow-lg"
    >
      <MessageSquare className="h-5 w-5" />
      <span>Start Chat with Ayuri</span>
    </button>
  );
}
