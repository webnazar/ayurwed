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
      className="bg-brand-gold hover:bg-brand-green-light dark:hover:bg-brand-gold-light/10 text-brand-green dark:text-black hover:text-brand-green dark:hover:text-brand-gold border border-transparent hover:border-brand-green/20 dark:hover:border-brand-gold/20 font-bold px-6 py-3 rounded-full text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-300 shadow hover:shadow-lg w-full sm:w-[260px]"
    >
      <MessageSquare className="h-5 w-5 flex-shrink-0" />
      <span>Chat With Ayuri</span>
    </button>
  );
}
