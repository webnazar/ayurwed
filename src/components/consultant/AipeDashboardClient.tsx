'use client';

import React, { useState } from 'react';
import { Sparkles, Save, CheckCircle2, Plus, Trash2, Edit2, AlertCircle, X, Search, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function AipeDashboardClient({ appointment, allIndications, allPreparations }: any) {
  const router = useRouter();
  const [selectedIndications, setSelectedIndications] = useState<number[]>(
    appointment.prescription?.indications?.map((i: any) => i.id) || []
  );
  
  const [showIndicationModal, setShowIndicationModal] = useState(false);
  const [indicationSearch, setIndicationSearch] = useState('');

  const [showPrepModal, setShowPrepModal] = useState(false);
  const [prepSearch, setPrepSearch] = useState('');

  const [items, setItems] = useState<any[]>(
    appointment.prescription?.items?.map((item: any) => ({
      preparationId: item.preparationId,
      preparationName: allPreparations.find((p: any) => p.id === item.preparationId)?.name || 'Unknown',
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      instructions: item.instructions || '',
      reason: ''
    })) || []
  );

  const [consultantJudgment, setConsultantJudgment] = useState(appointment.prescription?.consultantJudgment || '');
  const [dosageInstructions, setDosageInstructions] = useState(appointment.prescription?.dosageInstructions || '');
  
  const presetFollowUps = ['', '3 days', '5 days', '1 week', '2 weeks', '3 weeks', '1 month', '2 months', '3 months'];
  const [followUpAdvice, setFollowUpAdvice] = useState(appointment.prescription?.followUpAdvice || '');
  const [isCustomFollowUp, setIsCustomFollowUp] = useState(
    appointment.prescription?.followUpAdvice ? !presetFollowUps.includes(appointment.prescription.followUpAdvice) : false
  );
  
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowIndicationModal(false);
        setShowPrepModal(false);
      }
    };

    if (showIndicationModal || showPrepModal) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showIndicationModal, showPrepModal]);

  const patient = {
    age: appointment.patientAge,
    gender: appointment.patientGender,
    weight: appointment.patientWeight,
    chronicDiseases: appointment.chronicDiseases,
    allergies: appointment.allergies,
  };

  const handleGenerateAI = async () => {
    if (selectedIndications.length === 0) {
      toast.error('Please select at least one indication');
      return;
    }

    setGenerating(true);
    const indicationObjs = allIndications.filter((i: any) => selectedIndications.includes(i.id));
    
    try {
      const res = await fetch('/api/consultant/prescriptions/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient,
          indications: indicationObjs,
          notes: appointment.concern + '\n' + (appointment.notes || '')
        })
      });

      if (!res.ok) throw new Error('Failed to fetch AI suggestions');
      
      const data = await res.json();
      setItems(data.suggestions);
      toast.success('AI Suggestions generated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Error connecting to AIPE');
    } finally {
      setGenerating(false);
    }
  };

  const savePrescription = async (status: 'DRAFT' | 'PRESCRIBED') => {
    setSaving(true);
    try {
      const res = await fetch('/api/consultant/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.id,
          patientId: appointment.userId,
          status,
          consultantJudgment,
          dosageInstructions,
          followUpAdvice,
          items
        })
      });

      if (!res.ok) throw new Error('Failed to save prescription');
      
      toast.success(`Prescription saved as ${status}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleIndication = (id: number) => {
    setSelectedIndications(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleManualPreparation = (prep: any) => {
    const exists = items.some(i => i.preparationId === prep.id);
    if (exists) {
      setItems(items.filter(i => i.preparationId !== prep.id));
      toast.success('Preparation removed');
    } else {
      setItems([...items, {
        preparationId: prep.id,
        preparationName: prep.name,
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        reason: 'Added manually'
      }]);
      toast.success('Preparation added');
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const applyFirstToAll = () => {
    if (items.length < 2) return;
    const { dosage, frequency, duration, instructions } = items[0];
    setItems(items.map((item, idx) =>
      idx === 0 ? item : { ...item, dosage, frequency, duration, instructions }
    ));
    toast.success(`Applied dosage, frequency, duration & instructions to all ${items.length} preparations`);
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Context */}
      <div className="space-y-6 lg:col-span-1">
        {/* Patient Profile */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
          <h3 className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-4">Patient Profile</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-brand-foreground/60">Name</span><span className="font-bold text-brand-green">{appointment.patientName || appointment.user.name}</span></div>
            <div className="flex justify-between"><span className="text-brand-foreground/60">Age / Gender</span><span className="font-semibold">{appointment.patientAge || '?'} yrs / {appointment.patientGender || '?'}</span></div>
            <div className="flex justify-between"><span className="text-brand-foreground/60">Weight</span><span className="font-semibold">{appointment.patientWeight || '?'} kg</span></div>
            
            <div className="pt-2 border-t border-border mt-2">
              <span className="text-brand-foreground/60 block mb-1">Chronic Diseases</span>
              <p className="font-medium text-amber-700">{appointment.chronicDiseases || 'None reported'}</p>
            </div>
            <div>
              <span className="text-brand-foreground/60 block mb-1">Allergies</span>
              <p className="font-medium text-rose-700">{appointment.allergies || 'None reported'}</p>
            </div>
          </div>
        </div>

        {/* Consultation Information */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
          <h3 className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-4">Consultation Notes</h3>
          <p className="text-sm text-brand-foreground/80 leading-relaxed mb-4">{appointment.concern}</p>
          {appointment.notes && (
            <div className="p-3 bg-brand-gold-light/20 rounded-xl text-sm italic text-brand-foreground/70">
              {appointment.notes}
            </div>
          )}
        </div>

        {/* Indications Selection */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider">Selected Indications</h3>
            <button
              onClick={() => setShowIndicationModal(true)}
              className="text-xs font-bold text-brand-green bg-brand-green-light/40 hover:bg-brand-green-light px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedIndications.length === 0 ? (
              <div className="text-sm text-brand-foreground/50 py-4 italic">No indications selected. Click Add to select.</div>
            ) : (
              selectedIndications.map(id => {
                const ind = allIndications.find((i: any) => i.id === id);
                if (!ind) return null;
                return (
                  <div key={id} className="flex items-center gap-1.5 bg-brand-green text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                    {ind.name}
                    <button onClick={() => toggleIndication(id)} className="hover:text-rose-300 ml-1 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Engine & Prescription */}
      <div className="space-y-6 lg:col-span-2">
        {/* AI Action Area */}
        <div className="bg-gradient-to-br from-[#0f381b] to-brand-green rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles className="h-32 w-32" /></div>
          <div className="relative z-10 space-y-4 max-w-lg">
            <h2 className="text-2xl font-extrabold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-brand-gold" /> Ancient Intelligence Engine
            </h2>
            <p className="text-brand-green-light text-sm leading-relaxed">
              Generate AI-powered prescription suggestions based on patient profile, selected indications, and standard Ayurvedic protocols. The AI never prescribes; it only suggests.
            </p>
            <button
              onClick={handleGenerateAI}
              disabled={generating || selectedIndications.length === 0}
              className="mt-2 bg-brand-gold text-[#0f381b] font-extrabold px-6 py-3 rounded-2xl hover:brightness-110 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generating ? 'Engine Processing...' : 'Generate AI Suggestions'}
            </button>
          </div>
        </div>
        {/* Prescription Editor */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-3">
            <h3 className="text-lg font-bold text-brand-green">Prescription Editor</h3>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setShowPrepModal(true)} className="text-xs font-bold text-brand-green bg-brand-green-light/20 hover:bg-brand-green-light/40 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 border border-brand-green/30">
                <Plus className="h-3.5 w-3.5" /> Add Manual Preparations
              </button>
              {appointment.prescription && (
                <a
                  href={`/prescriptions/print/${appointment.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-white bg-brand-gold hover:bg-brand-green px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" /> Print A4
                </a>
              )}
              {appointment.prescription?.status === 'PRESCRIBED' ? (
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold uppercase tracking-wide">Finalized</span>
              ) : (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold uppercase tracking-wide">Draft</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 text-brand-foreground/40 text-sm font-medium border-2 border-dashed border-border rounded-2xl">
                No preparations added yet.<br/>Generate from AI or add manually.
              </div>
            ) : items.map((item, idx) => (
              <div key={idx} className="bg-brand-gold-light/20 border border-brand-gold/30 rounded-2xl p-4 flex gap-4 items-start relative group">
                <div className="flex-1 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-brand-green text-base">{item.preparationName}</span>
                    <div className="flex items-center gap-2">
                      {idx === 0 && items.length > 1 && (item.dosage || item.frequency || item.duration) && (
                        <button
                          onClick={applyFirstToAll}
                          title="Copy dosage, frequency, duration & instructions from this row to all others"
                          className="text-[10px] font-bold text-[#1a73e8] bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                        >
                          ⬇ Apply to All
                        </button>
                      )}
                      <button onClick={() => removeItem(idx)} className="text-rose-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    <div>
                      <span className="block text-[10px] uppercase text-brand-foreground/50 font-bold mb-1">Dosage</span>
                      <input 
                        type="text" 
                        list="dosage-options"
                        value={item.dosage} 
                        onChange={e => {const n=[...items];n[idx].dosage=e.target.value;setItems(n);}} 
                        className="w-full bg-background border border-border rounded px-2.5 py-1.5 focus:ring-1 focus:ring-brand-green focus:outline-none" 
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-brand-foreground/50 font-bold mb-1">Frequency</span>
                      <input 
                        type="text" 
                        list="frequency-options"
                        value={item.frequency} 
                        onChange={e => {const n=[...items];n[idx].frequency=e.target.value;setItems(n);}} 
                        className="w-full bg-background border border-border rounded px-2.5 py-1.5 focus:ring-1 focus:ring-brand-green focus:outline-none" 
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-brand-foreground/50 font-bold mb-1">Duration</span>
                      <input 
                        type="text" 
                        list="duration-options"
                        value={item.duration} 
                        onChange={e => {const n=[...items];n[idx].duration=e.target.value;setItems(n);}} 
                        className="w-full bg-background border border-border rounded px-2.5 py-1.5 focus:ring-1 focus:ring-brand-green focus:outline-none" 
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-3 md:col-span-1">
                      <span className="block text-[10px] uppercase text-brand-foreground/50 font-bold mb-1">Instructions</span>
                      <input 
                        type="text" 
                        list="instructions-options"
                        value={item.instructions} 
                        onChange={e => {const n=[...items];n[idx].instructions=e.target.value;setItems(n);}} 
                        placeholder="e.g. After meals" 
                        className="w-full bg-background border border-border rounded px-2.5 py-1.5 focus:ring-1 focus:ring-brand-green focus:outline-none" 
                      />
                    </div>
                  </div>
                  {item.reason && (
                    <div className="text-xs text-brand-foreground/60 italic bg-brand-gold-light/40 p-2 rounded">AI Note: {item.reason}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* General Instructions */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <label className="block text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Consultant Judgment / Diagnosis Notes</label>
              <textarea value={consultantJudgment} onChange={e=>setConsultantJudgment(e.target.value)} rows={2} className="w-full bg-brand-gold-light/20 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none resize-none" placeholder="Add your clinical judgment here..."></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">General Diet/Lifestyle Instructions</label>
                <textarea value={dosageInstructions} onChange={e=>setDosageInstructions(e.target.value)} rows={2} className="w-full bg-brand-gold-light/20 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none resize-none" placeholder="General instructions for the patient..."></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Recommended Follow-up</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className={isCustomFollowUp ? 'sm:w-1/3 w-full' : 'w-full'}>
                    <select 
                      value={isCustomFollowUp ? 'custom' : followUpAdvice} 
                      onChange={e => {
                        if (e.target.value === 'custom') {
                          setIsCustomFollowUp(true);
                          setFollowUpAdvice('');
                        } else {
                          setIsCustomFollowUp(false);
                          setFollowUpAdvice(e.target.value);
                        }
                      }}
                      className="bg-brand-gold-light/20 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none w-full"
                    >
                      <option value="">No Follow-up Scheduled</option>
                      <option value="3 days">In 3 Days</option>
                      <option value="5 days">In 5 Days</option>
                      <option value="1 week">In 1 Week</option>
                      <option value="2 weeks">In 2 Weeks</option>
                      <option value="3 weeks">In 3 Weeks</option>
                      <option value="1 month">In 1 Month</option>
                      <option value="2 months">In 2 Months</option>
                      <option value="3 months">In 3 Months</option>
                      <option value="custom">Custom...</option>
                    </select>
                  </div>
                  {isCustomFollowUp && (
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={followUpAdvice} 
                        onChange={e => setFollowUpAdvice(e.target.value)} 
                        placeholder="e.g. In 10 days, Next Monday..." 
                        className="bg-brand-gold-light/20 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green focus:outline-none w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-4 pt-6">
            <button onClick={() => savePrescription('DRAFT')} disabled={saving || items.length === 0} className="flex-1 bg-transparent border-2 border-brand-green text-brand-green font-bold py-3 rounded-2xl hover:bg-brand-green hover:text-white transition-colors flex items-center justify-center gap-2">
              <Save className="h-5 w-5" /> Save as Draft
            </button>
            <button onClick={() => savePrescription('PRESCRIBED')} disabled={saving || items.length === 0} className="flex-1 bg-brand-green text-white font-bold py-3 rounded-2xl hover:bg-brand-green/90 transition-colors shadow-md flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Prescribe (Finalize)
            </button>
          </div>
          <p className="text-center text-[10px] text-brand-foreground/50 mt-4 uppercase tracking-widest">
            By clicking Prescribe, this prescription becomes official and read-only.
          </p>
        </div>
      </div>

      {/* Indication Selection Modal */}
      {showIndicationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowIndicationModal(false)} />
          <div className="relative bg-card w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-brand-green">Add Indications</h3>
              <button onClick={() => setShowIndicationModal(false)} className="text-brand-foreground/50 hover:text-brand-foreground bg-muted hover:bg-muted/80 p-1.5 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
                <input
                  type="text"
                  placeholder="Search indications..."
                  autoFocus
                  value={indicationSearch}
                  onChange={(e) => setIndicationSearch(e.target.value)}
                  className="pl-9 bg-brand-gold-light/20 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 w-full"
                />
              </div>
            </div>
            <div className="p-2 overflow-y-auto flex-1">
              {allIndications
                .filter((ind: any) => ind.name.toLowerCase().includes(indicationSearch.toLowerCase()))
                .map((ind: any) => (
                  <button
                    key={ind.id}
                    onClick={() => toggleIndication(ind.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                      selectedIndications.includes(ind.id)
                        ? 'bg-brand-green-light/30 text-brand-green font-bold'
                        : 'hover:bg-brand-gold-light/30 text-brand-foreground/80'
                    }`}
                  >
                    {ind.name}
                    {selectedIndications.includes(ind.id) && <CheckCircle2 className="h-4 w-4 text-brand-green" />}
                  </button>
                ))}
            </div>
            <div className="p-4 border-t border-border shrink-0">
              <button
                onClick={() => setShowIndicationModal(false)}
                className="w-full bg-brand-green text-white font-bold py-3 rounded-2xl hover:bg-brand-green/90 transition-colors shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preparation Selection Modal */}
      {showPrepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowPrepModal(false)} />
          <div className="relative bg-card w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-brand-green">Add Preparation</h3>
              <button onClick={() => setShowPrepModal(false)} className="text-brand-foreground/50 hover:text-brand-foreground bg-muted hover:bg-muted/80 p-1.5 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
                <input
                  type="text"
                  placeholder="Search preparations by name..."
                  autoFocus
                  value={prepSearch}
                  onChange={(e) => setPrepSearch(e.target.value)}
                  className="pl-9 bg-brand-gold-light/20 border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 w-full"
                />
              </div>
            </div>
            <div className="p-2 overflow-y-auto flex-1">
              {allPreparations
                .filter((p: any) => p.name.toLowerCase().includes(prepSearch.toLowerCase()))
                .slice(0, 50)
                .map((prep: any) => (
                  <button
                    key={prep.id}
                    onClick={() => toggleManualPreparation(prep)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                      items.some((i: any) => i.preparationId === prep.id)
                        ? 'bg-brand-green-light/30 text-brand-green font-bold'
                        : 'hover:bg-brand-gold-light/30 text-brand-foreground/80'
                    }`}
                  >
                    {prep.name}
                    {items.some((i: any) => i.preparationId === prep.id) ? (
                      <CheckCircle2 className="h-4 w-4 text-brand-green" />
                    ) : (
                      <Plus className="h-4 w-4 text-brand-green opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
                {allPreparations.filter((p: any) => p.name.toLowerCase().includes(prepSearch.toLowerCase())).length === 0 && (
                  <div className="p-4 text-center text-sm text-brand-foreground/50 italic">No preparations found.</div>
                )}
            </div>
            <div className="p-4 border-t border-border shrink-0">
              <button
                onClick={() => {
                  setShowPrepModal(false);
                  setPrepSearch('');
                }}
                className="w-full bg-brand-green text-white font-bold py-3 rounded-2xl hover:bg-brand-green/90 transition-colors shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Autocomplete Datalists */}
      <datalist id="dosage-options">
        {['1 tablet', '2 tablets', '1 capsule', '2 capsules', '5 ml', '10 ml', '15 ml', '1/2 tsp', '1 tsp', '2 tsp', '1/2 gm', '1 gm', '2 gm'].map(opt => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
      <datalist id="frequency-options">
        {['Once daily', 'Twice daily (BD)', 'Three times daily (TD)', 'Four times daily', 'Once daily before breakfast', 'Twice daily before food', 'Twice daily after food', 'At bedtime (HS)', 'As needed (PRN)'].map(opt => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
      <datalist id="duration-options">
        {['3 days', '5 days', '1 week', '2 weeks', '3 weeks', '1 month', '2 months', '3 months'].map(opt => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
      <datalist id="instructions-options">
        {['With warm water', 'With warm milk', 'With honey', 'After meals', 'Before meals', 'On an empty stomach', 'Apply locally'].map(opt => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </div>
  );
}
