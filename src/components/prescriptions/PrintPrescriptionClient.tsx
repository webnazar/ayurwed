'use client';

import React from 'react';
import { Printer, ArrowLeft } from 'lucide-react';

export default function PrintPrescriptionClient() {
  return (
    <div className="print:hidden bg-card border-b border-border py-4 px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.close()}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Close
        </button>
        <span className="text-sm font-bold text-foreground">A4 Prescription Print Preview</span>
      </div>
      <button
        onClick={() => window.print()}
        className="btn-primary flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold shadow-md"
      >
        <Printer className="h-4 w-4" /> Print Prescription
      </button>
    </div>
  );
}
