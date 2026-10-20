'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sparkles, Save, CheckCircle2, Plus, Trash2, Edit2, AlertCircle, X, Search, Printer, RotateCcw, RefreshCw, Cloud, Check, Wifi, WifiOff, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function AipeDashboardClient({ appointment, previousAppointment, allIndications, allPreparations = [], allProducts = [], initialCustomMedicines = [] }: any) {
  const router = useRouter();
  const prepList = useMemo(() => (allProducts && allProducts.length > 0 ? allProducts : allPreparations), [allProducts, allPreparations]);

  const hasCurrentPrescription = Boolean(appointment.prescription && appointment.prescription.items && appointment.prescription.items.length > 0);
  const prevPrescription = previousAppointment?.prescription;

  const [isPrePopulatedFromPrevious, setIsPrePopulatedFromPrevious] = useState<boolean>(() => {
    return !hasCurrentPrescription && Boolean(prevPrescription && prevPrescription.items && prevPrescription.items.length > 0);
  });

  const [selectedIndications, setSelectedIndications] = useState<number[]>(() => {
    if (appointment.prescription?.indications?.length) {
      return appointment.prescription.indications.map((i: any) => i.id);
    }
    if (prevPrescription?.indications?.length) {
      return prevPrescription.indications.map((i: any) => i.id);
    }
    return [];
  });
  
  const [showIndicationModal, setShowIndicationModal] = useState(false);
  const [indicationSearch, setIndicationSearch] = useState('');

  const [showPrepModal, setShowPrepModal] = useState(false);
  const [prepSearch, setPrepSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [customSearch, setCustomSearch] = useState('');
  const [modalTab, setModalTab] = useState<'PREPARATION' | 'PRODUCT' | 'CUSTOM'>('PREPARATION');

  const [customMedicines, setCustomMedicines] = useState<any[]>(initialCustomMedicines);
  const [showAddCustomForm, setShowAddCustomForm] = useState(false);
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  const [newCustom, setNewCustom] = useState({
    name: '',
    type: 'Tablet',
    dosage: '1-0-1',
    duration: '7 days',
    instructions: 'After food with warm water',
    manufacturer: 'External / Own Clinic',
    price: ''
  });

  const [items, setItems] = useState<any[]>(() => {
    if (appointment.prescription?.items?.length) {
      return appointment.prescription.items.map((item: any) => ({
        preparationId: item.preparationId,
        productId: item.productId,
        customMedicineId: item.customMedicineId,
        customName: item.customName,
        preparationName: item.preparation?.name || item.product?.name || item.customMedicine?.name || item.customName || 'Medicine',
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions || '',
        reason: ''
      }));
    }
    if (prevPrescription?.items?.length) {
      return prevPrescription.items.map((item: any) => ({
        preparationId: item.preparationId,
        productId: item.productId,
        customMedicineId: item.customMedicineId,
        customName: item.customName,
        preparationName: item.preparation?.name || item.product?.name || item.customMedicine?.name || item.customName || 'Medicine',
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions || '',
        reason: 'Pre-filled from previous consultation'
      }));
    }
    return [];
  });

  const [consultantJudgment, setConsultantJudgment] = useState<string>(() => {
    return appointment.prescription?.consultantJudgment || prevPrescription?.consultantJudgment || '';
  });
  
  const [dosageInstructions, setDosageInstructions] = useState<string>(() => {
    return appointment.prescription?.dosageInstructions || prevPrescription?.dosageInstructions || '';
  });
  
  const presetFollowUps = ['', '3 days', '5 days', '1 week', '2 weeks', '3 weeks', '1 month', '2 months', '3 months'];
  const [followUpAdvice, setFollowUpAdvice] = useState(appointment.prescription?.followUpAdvice || '');
  const [isCustomFollowUp, setIsCustomFollowUp] = useState(
    appointment.prescription?.followUpAdvice ? !presetFollowUps.includes(appointment.prescription.followUpAdvice) : false
  );
  
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-Save & Bandwidth-Friendly Draft System
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'SAVED' | 'SAVING' | 'DIRTY' | 'OFFLINE_SAVED' | 'ERROR'>('SAVED');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasLocalDraft, setHasLocalDraft] = useState<boolean>(false);
  const isFirstRenderRef = useRef<boolean>(true);
  const lastSavedPayloadRef = useRef<string>('');

  const DRAFT_STORAGE_KEY = `ayurwed_aipe_draft_appt_${appointment.id}`;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowIndicationModal(false);
        setShowPrepModal(false);
      }
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setShowPrepModal(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const initialHeight = appointment.patientHeight || appointment.prescription?.patientHeight || appointment.user?.consumerProfile?.height || '';
  const initialWeight = appointment.patientWeight || appointment.prescription?.patientWeight || appointment.user?.consumerProfile?.weight || '';
  const initialTemp = appointment.patientBodyTemperature || appointment.prescription?.patientBodyTemperature || appointment.user?.consumerProfile?.bodyTemperature || '';
  const initialBP = appointment.patientBloodPressure || appointment.prescription?.patientBloodPressure || appointment.user?.consumerProfile?.bloodPressure || '';
  const initialPrakruti = appointment.patientPrakruti || appointment.prescription?.patientPrakruti || appointment.user?.consumerProfile?.prakruti || '';
  const initialActivity = appointment.patientActivityLevel || appointment.prescription?.patientActivityLevel || appointment.user?.consumerProfile?.activityLevel || 'Sedentary';

  const [patientName, setPatientName] = useState<string>(
    appointment.patientName || appointment.prescription?.patientName || appointment.user?.name || ''
  );
  const [patientAge, setPatientAge] = useState<string>(
    appointment.patientAge ? String(appointment.patientAge) : (appointment.prescription?.patientAge ? String(appointment.prescription.patientAge) : '')
  );
  const [patientGender, setPatientGender] = useState<string>(
    appointment.patientGender || appointment.prescription?.patientGender || appointment.user?.consumerProfile?.gender || 'Male'
  );
  const [patientHeight, setPatientHeight] = useState<string>(initialHeight ? String(initialHeight) : '');
  const [patientWeight, setPatientWeight] = useState<string>(initialWeight ? String(initialWeight) : '');
  const [patientBodyTemperature, setPatientBodyTemperature] = useState<string>(initialTemp ? String(initialTemp) : '');
  const [patientBloodPressure, setPatientBloodPressure] = useState<string>(initialBP || '');
  const [patientActivityLevel, setPatientActivityLevel] = useState<string>(initialActivity);
  const [selectedPrakruti, setSelectedPrakruti] = useState<string[]>(() => {
    if (!initialPrakruti) return [];
    return initialPrakruti.split(/,\s*|-\s*/).map((s: string) => s.trim()).filter(Boolean).slice(0, 2);
  });
  const [chronicDiseases, setChronicDiseases] = useState<string>(
    appointment.chronicDiseases || appointment.prescription?.chronicConditions || ''
  );
  const [allergies, setAllergies] = useState<string>(
    appointment.allergies || ''
  );
  const [doctorNotes, setDoctorNotes] = useState<string>(
    appointment.notes || ''
  );
  const [concern, setConcern] = useState<string>(
    appointment.concern || ''
  );

  const togglePrakrutiDosha = (dosha: string) => {
    if (selectedPrakruti.includes(dosha)) {
      if (selectedPrakruti.length <= 1) {
        toast.error('At least 1 Prakruti dosha must be selected');
        return;
      }
      setSelectedPrakruti(prev => prev.filter(d => d !== dosha));
    } else {
      if (selectedPrakruti.length >= 2) {
        toast.error('Maximum 2 Prakruti doshas can be selected');
        return;
      }
      setSelectedPrakruti(prev => [...prev, dosha]);
    }
  };

  const formattedHeight = patientHeight && !isNaN(parseFloat(patientHeight)) ? parseFloat(patientHeight) : null;
  const formattedWeight = patientWeight && !isNaN(parseFloat(patientWeight)) ? parseFloat(patientWeight) : null;
  const formattedTemp = patientBodyTemperature && !isNaN(parseFloat(patientBodyTemperature)) ? parseFloat(patientBodyTemperature) : null;

  // Body Mass Index (Asia-Pacific / Indian Standard)
  const bmiVal = (formattedHeight && formattedWeight && formattedHeight > 0) 
    ? (formattedWeight / Math.pow(formattedHeight / 100, 2)) 
    : null;
  const bmi = bmiVal ? bmiVal.toFixed(1) : null;

  let bmiCategory = '';
  let bmiCategoryBadge = '';
  let ayurvedicMetabolicTendency = '';

  if (bmiVal) {
    if (bmiVal < 18.5) {
      bmiCategory = 'Underweight (Vata Risk)';
      bmiCategoryBadge = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300';
      ayurvedicMetabolicTendency = 'Karshya / Dhatu Kshaya (Vata Pradhan)';
    } else if (bmiVal <= 22.9) {
      bmiCategory = 'Normal Weight (Optimal)';
      bmiCategoryBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300';
      ayurvedicMetabolicTendency = 'Sama Dhatu / Balanced Agni';
    } else if (bmiVal <= 24.9) {
      bmiCategory = 'Overweight (Pre-Stholya Risk)';
      bmiCategoryBadge = 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300';
      ayurvedicMetabolicTendency = 'Pre-Stholya / Medo Accumulation';
    } else {
      bmiCategory = 'Obese (Kapha-Medo High Risk)';
      bmiCategoryBadge = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300';
      ayurvedicMetabolicTendency = 'Stholya / Manda Agni (Kapha-Medo Vriddhi)';
    }
  }

  // Clinical Body Temperature Evaluation
  let tempStatus: { label: string; badge: string; inputBorder: string } | null = null;
  if (formattedTemp) {
    if (formattedTemp > 100.4) {
      tempStatus = { label: 'High Fever (High Risk)', badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300', inputBorder: 'border-rose-400 focus:border-rose-500 text-rose-600 dark:text-rose-400' };
    } else if (formattedTemp > 99.0) {
      tempStatus = { label: 'Mild Fever (Pyrexia)', badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300', inputBorder: 'border-amber-400 focus:border-amber-500 text-amber-600 dark:text-amber-400' };
    } else if (formattedTemp < 97.0) {
      tempStatus = { label: 'Low Temp (Hypothermia)', badge: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300', inputBorder: 'border-cyan-400 focus:border-cyan-500 text-cyan-600 dark:text-cyan-400' };
    } else {
      tempStatus = { label: 'Normal (97-99°F)', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300', inputBorder: 'border-emerald-400 focus:border-emerald-500 text-emerald-600 dark:text-emerald-400' };
    }
  }

  // Clinical Blood Pressure Evaluation
  let bpStatus: { label: string; badge: string; inputBorder: string } | null = null;
  if (patientBloodPressure && patientBloodPressure.includes('/')) {
    const [sysStr, diaStr] = patientBloodPressure.split('/');
    const sys = parseInt(sysStr);
    const dia = parseInt(diaStr);
    if (!isNaN(sys) && !isNaN(dia)) {
      if (sys >= 180 || dia >= 120) {
        bpStatus = { label: 'Crisis (Emergency Risk)', badge: 'bg-rose-600 text-white border-rose-700 animate-pulse', inputBorder: 'border-rose-600 text-rose-600 font-black' };
      } else if (sys >= 140 || dia >= 90) {
        bpStatus = { label: 'Stage 2 High BP (High Risk)', badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300', inputBorder: 'border-rose-400 focus:border-rose-500 text-rose-600 dark:text-rose-400' };
      } else if (sys >= 130 || dia >= 80) {
        bpStatus = { label: 'Stage 1 High BP (Elevated)', badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300', inputBorder: 'border-amber-400 focus:border-amber-500 text-amber-600 dark:text-amber-400' };
      } else if (sys >= 120 && dia < 80) {
        bpStatus = { label: 'Elevated BP (Mild)', badge: 'bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-950/60 dark:text-lime-300', inputBorder: 'border-lime-400 focus:border-lime-500 text-lime-600 dark:text-lime-400' };
      } else {
        bpStatus = { label: 'Normal BP (<120/80)', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300', inputBorder: 'border-emerald-400 focus:border-emerald-500 text-emerald-600 dark:text-emerald-400' };
      }
    }
  }

  // BSA (Body Surface Area - Mosteller Formula)
  const bsa = (formattedHeight && formattedWeight) 
    ? Math.sqrt((formattedHeight * formattedWeight) / 3600).toFixed(2) 
    : null;

  // Ideal Body Weight (IBW - Devine Formula adapted)
  const ibw = (formattedHeight && formattedHeight > 100) 
    ? (
        patientGender === 'Female' 
          ? (45.5 + 0.9 * (formattedHeight - 152.4)) 
          : (50 + 0.9 * (formattedHeight - 152.4))
      ).toFixed(1) 
    : null;

  // BMR (Mifflin-St Jeor Formula)
  const parsedAgeNum = patientAge ? parseInt(patientAge) : 30;
  const isFemale = patientGender === 'Female';
  const bmrVal = (formattedHeight && formattedWeight && parsedAgeNum > 0)
    ? (10 * formattedWeight + 6.25 * formattedHeight - 5 * parsedAgeNum + (isFemale ? -161 : 5))
    : null;
  const bmr = bmrVal ? Math.round(bmrVal) : null;

  // Physical Activity Multiplier & Total Daily Energy Expenditure (TDEE)
  const actMult = 
    patientActivityLevel === 'Active' ? 1.725 :
    patientActivityLevel === 'Moderate' ? 1.55 :
    patientActivityLevel === 'Light' ? 1.375 : 1.2;

  const tdee = bmr ? Math.round(bmr * actMult) : null;

  // Ayurvedic Ahara / Pathya Calorie Target
  let calorieTarget = tdee;
  let calorieTargetReason = 'Sama Ahara (Maintenance Diet)';
  if (bmiVal && tdee) {
    if (bmiVal >= 25.0) {
      calorieTarget = Math.round(tdee * 0.8);
      calorieTargetReason = 'Medohara / Langhana Deficit (-20%)';
    } else if (bmiVal >= 23.0) {
      calorieTarget = Math.round(tdee * 0.9);
      calorieTargetReason = 'Light Deficit (-10%)';
    } else if (bmiVal < 18.5) {
      calorieTarget = Math.round(tdee * 1.15);
      calorieTargetReason = 'Brimhana Surplus (+15%)';
    }
  }

  const patient = {
    name: patientName,
    age: patientAge ? parseInt(patientAge) : appointment.patientAge,
    gender: patientGender,
    height: formattedHeight,
    weight: formattedWeight,
    bodyTemperature: formattedTemp,
    bloodPressure: patientBloodPressure,
    prakruti: selectedPrakruti.join(', '),
    activityLevel: patientActivityLevel,
    bmi,
    bmiCategory,
    bsa,
    ibw,
    bmr,
    tdee,
    calorieTarget,
    calorieTargetReason,
    ayurvedicMetabolicTendency,
    chronicDiseases,
    allergies,
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
          notes: (concern || '') + (doctorNotes ? '\nDoctor Notes: ' + doctorNotes : '')
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

  const currentPayloadObj = useMemo(() => ({
    appointmentId: appointment.id,
    patientId: appointment.userId,
    patientName,
    patientAge: patientAge ? parseInt(patientAge) : null,
    patientGender,
    patientHeight: formattedHeight,
    patientWeight: formattedWeight,
    patientBodyTemperature: formattedTemp,
    patientBloodPressure: patientBloodPressure,
    patientPrakruti: selectedPrakruti.join(', '),
    patientActivityLevel,
    chronicDiseases,
    allergies,
    notes: doctorNotes,
    concern,
    status: 'DRAFT',
    consultantJudgment,
    dosageInstructions,
    followUpAdvice,
    items,
    selectedIndications
  }), [
    appointment.id, appointment.userId, patientName, patientAge, patientGender,
    formattedHeight, formattedWeight, formattedTemp, patientBloodPressure,
    selectedPrakruti, patientActivityLevel, chronicDiseases, allergies,
    doctorNotes, concern, consultantJudgment, dosageInstructions,
    followUpAdvice, items, selectedIndications
  ]);

  const currentPayloadStr = useMemo(() => JSON.stringify(currentPayloadObj), [currentPayloadObj]);

  // Check local draft on mount
  useEffect(() => {
    lastSavedPayloadRef.current = currentPayloadStr;
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && parsed.payload) {
          const draftStr = JSON.stringify(parsed.payload);
          if (draftStr !== currentPayloadStr) {
            setHasLocalDraft(true);
          }
        }
      }
    } catch (e) {
      console.error('Error checking local draft:', e);
    }
  }, []);

  // Restore or discard local draft
  const restoreLocalDraft = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const { payload } = JSON.parse(savedDraft);
        if (payload) {
          if (payload.patientName !== undefined) setPatientName(payload.patientName || '');
          if (payload.patientAge !== undefined) setPatientAge(payload.patientAge !== null ? String(payload.patientAge) : '');
          if (payload.patientGender) setPatientGender(payload.patientGender);
          if (payload.patientHeight !== undefined) setPatientHeight(payload.patientHeight !== null ? String(payload.patientHeight) : '');
          if (payload.patientWeight !== undefined) setPatientWeight(payload.patientWeight !== null ? String(payload.patientWeight) : '');
          if (payload.patientBodyTemperature !== undefined) setPatientBodyTemperature(payload.patientBodyTemperature !== null ? String(payload.patientBodyTemperature) : '');
          if (payload.patientBloodPressure !== undefined) setPatientBloodPressure(payload.patientBloodPressure || '');
          if (payload.patientPrakruti !== undefined) {
            const pArr = payload.patientPrakruti ? payload.patientPrakruti.split(/,\s*/).filter(Boolean) : [];
            setSelectedPrakruti(pArr);
          }
          if (payload.patientActivityLevel) setPatientActivityLevel(payload.patientActivityLevel);
          if (payload.chronicDiseases !== undefined) setChronicDiseases(payload.chronicDiseases || '');
          if (payload.allergies !== undefined) setAllergies(payload.allergies || '');
          if (payload.notes !== undefined) setDoctorNotes(payload.notes || '');
          if (payload.concern !== undefined) setConcern(payload.concern || '');
          if (payload.consultantJudgment !== undefined) setConsultantJudgment(payload.consultantJudgment || '');
          if (payload.dosageInstructions !== undefined) setDosageInstructions(payload.dosageInstructions || '');
          if (payload.followUpAdvice !== undefined) setFollowUpAdvice(payload.followUpAdvice || '');
          if (Array.isArray(payload.items)) setItems(payload.items);
          if (Array.isArray(payload.selectedIndications)) setSelectedIndications(payload.selectedIndications);
          
          toast.success('Local draft restored!');
        }
      }
    } catch (e) {
      toast.error('Failed to restore draft');
    } finally {
      setHasLocalDraft(false);
    }
  };

  const discardLocalDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {}
    setHasLocalDraft(false);
    toast.success('Local draft discarded');
  };

  // Debounced Silent Auto-Save to Backend
  useEffect(() => {
    // 1. Instant local storage sync (Zero Bandwidth)
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
        timestamp: Date.now(),
        payload: currentPayloadObj
      }));
    } catch (e) {}

    // 2. Skip auto-save on initial mount
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    // 3. Dirty checking: If no changes compared to last saved server payload, set SAVED
    if (currentPayloadStr === lastSavedPayloadRef.current) {
      setAutoSaveStatus('SAVED');
      return;
    }

    if (!autoSaveEnabled) {
      setAutoSaveStatus('DIRTY');
      return;
    }

    setAutoSaveStatus('DIRTY');

    // 4. Debounce by 1500ms
    const timer = setTimeout(async () => {
      setAutoSaveStatus('SAVING');
      try {
        const res = await fetch('/api/consultant/prescriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentPayloadObj)
        });

        if (res.ok) {
          lastSavedPayloadRef.current = currentPayloadStr;
          setAutoSaveStatus('SAVED');
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSavedTime(nowStr);
        } else {
          setAutoSaveStatus('OFFLINE_SAVED');
        }
      } catch (err) {
        setAutoSaveStatus('OFFLINE_SAVED');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentPayloadStr, currentPayloadObj, autoSaveEnabled, DRAFT_STORAGE_KEY]);

  const savePrescription = async (status: 'DRAFT' | 'PRESCRIBED') => {
    setSaving(true);
    try {
      const res = await fetch('/api/consultant/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentPayloadObj,
          status
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save prescription');
      }
      
      lastSavedPayloadRef.current = currentPayloadStr;
      setAutoSaveStatus('SAVED');
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(nowStr);
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}
      setHasLocalDraft(false);

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

  const toggleManualItem = (itemType: 'PREPARATION' | 'PRODUCT' | 'CUSTOM', itemData: any) => {
    let exists = false;
    if (itemType === 'PREPARATION') exists = items.some(i => i.preparationId === itemData.id);
    else if (itemType === 'PRODUCT') exists = items.some(i => i.productId === itemData.id);
    else if (itemType === 'CUSTOM') exists = items.some(i => i.customMedicineId === itemData.id);

    if (exists) {
      setItems(items.filter(i => {
        if (itemType === 'PREPARATION') return i.preparationId !== itemData.id;
        if (itemType === 'PRODUCT') return i.productId !== itemData.id;
        if (itemType === 'CUSTOM') return i.customMedicineId !== itemData.id;
        return true;
      }));
      toast.success(`${itemType === 'PREPARATION' ? 'Preparation' : itemType === 'PRODUCT' ? 'Product' : 'Custom Medicine'} removed`);
    } else {
      setItems([...items, {
        preparationId: itemType === 'PREPARATION' ? itemData.id : null,
        productId: itemType === 'PRODUCT' ? itemData.id : null,
        customMedicineId: itemType === 'CUSTOM' ? itemData.id : null,
        customName: itemType === 'CUSTOM' ? itemData.name : null,
        preparationName: itemData.name,
        dosage: itemData.dosage || '',
        frequency: '1-0-1',
        duration: itemData.duration || '7 days',
        instructions: itemData.instructions || '',
        reason: 'Added manually'
      }]);
      toast.success(`${itemType === 'PREPARATION' ? 'Preparation' : itemType === 'PRODUCT' ? 'Product' : 'Custom Medicine'} added`);
    }
  };

  const handleCreateCustomMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustom.name.trim()) {
      toast.error('Please enter a medicine name');
      return;
    }

    setIsSavingCustom(true);
    try {
      const res = await fetch('/api/consultant/custom-medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustom)
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save custom medicine');

      const createdMed = data.customMedicine;
      setCustomMedicines(prev => [createdMed, ...prev]);

      // Automatically add to current prescription items
      setItems(prev => [...prev, {
        preparationId: null,
        productId: null,
        customMedicineId: createdMed.id,
        customName: createdMed.name,
        preparationName: createdMed.name,
        dosage: createdMed.dosage || '1-0-1',
        frequency: '1-0-1',
        duration: '7 days',
        instructions: createdMed.instructions || '',
        reason: 'Custom doctor prescription'
      }]);

      toast.success(`"${createdMed.name}" saved to database & added to prescription!`);
      setShowAddCustomForm(false);
      setNewCustom({
        name: '',
        type: 'Tablet',
        dosage: '1-0-1',
        duration: '7 days',
        instructions: 'After food with warm water',
        manufacturer: 'External / Own Clinic',
        price: ''
      });
    } catch (err: any) {
      toast.error(err.message || 'Error saving custom medicine');
    } finally {
      setIsSavingCustom(false);
    }
  };

  const handleDeleteCustomMedicine = async (customId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this custom medicine from your saved database list?')) return;

    try {
      const res = await fetch(`/api/consultant/custom-medicines?id=${customId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete custom medicine');

      setCustomMedicines(prev => prev.filter(c => c.id !== customId));
      toast.success('Custom medicine removed from saved list');
    } catch (err: any) {
      toast.error(err.message || 'Error deleting custom medicine');
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-28">
      {/* Pre-loaded from Previous Consultation Banner */}
      {isPrePopulatedFromPrevious && (
        <div className="lg:col-span-3 bg-brand-gold/15 border-2 border-brand-gold/40 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-gold/25 text-brand-gold-dark rounded-2xl shrink-0">
              <Sparkles className="h-5 w-5 stroke-[2.5] animate-pulse-slow text-brand-gold-dark" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-brand-green">
                Pre-filled from Previous Consultation (#{previousAppointment?.id})
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Previous indications, prescribed medicines, dosages, and instructions have been pre-loaded for easy modification during this follow-up session.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setItems([]);
              setSelectedIndications([]);
              setConsultantJudgment('');
              setDosageInstructions('');
              setIsPrePopulatedFromPrevious(false);
              toast.success('Pre-filled draft cleared');
            }}
            className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all border border-rose-200 shrink-0 active:scale-95"
          >
            Clear Pre-filled Draft
          </button>
        </div>
      )}

      {/* Unsaved Local Draft Restoration Banner */}
      {hasLocalDraft && (
        <div className="lg:col-span-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border-2 border-amber-400/50 dark:border-amber-700/50 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0">
              <RotateCcw className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">Unsaved Local Draft Found</h4>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">You have unsaved field changes from a previous session stored safely on this device.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <button
              onClick={restoreLocalDraft}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restore Draft
            </button>
            <button
              onClick={discardLocalDraft}
              className="px-3 py-2 bg-transparent hover:bg-amber-200/50 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-semibold transition-all"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Left Column: Context */}
      <div className="space-y-6 lg:col-span-1">
        {/* Patient Profile */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
          <h3 className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-4">Patient Profile</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-brand-foreground/60 text-xs font-medium shrink-0">Patient Name</span>
              <div className="w-48 sm:w-56 flex items-center justify-end">
                <input
                  type="text"
                  placeholder="Patient Full Name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-1.5 text-right text-xs font-bold text-brand-green bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-brand-foreground/60 text-xs font-medium shrink-0">Age & Gender</span>
              <div className="w-48 sm:w-56 flex items-center justify-end gap-1.5">
                <input
                  type="number"
                  placeholder="Age"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-14 px-2 py-1.5 text-center text-xs font-semibold bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all shrink-0"
                />
                <span className="text-[11px] text-muted-foreground font-medium shrink-0">yrs</span>
                <div className="relative flex-1 min-w-0">
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full pl-2.5 pr-7 py-1.5 text-xs font-semibold bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all appearance-none cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-brand-foreground/60 text-xs font-medium shrink-0">Height (cm)</span>
              <div className="w-48 sm:w-56 flex items-center justify-end gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 170"
                  value={patientHeight}
                  onChange={(e) => setPatientHeight(e.target.value)}
                  className="w-full px-3 py-1.5 text-right text-xs font-semibold bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all"
                />
                <span className="text-[11px] text-muted-foreground font-medium w-10 text-right shrink-0">cm</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-brand-foreground/60 text-xs font-medium shrink-0">Weight (kg)</span>
              <div className="w-48 sm:w-56 flex items-center justify-end gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 65"
                  value={patientWeight}
                  onChange={(e) => setPatientWeight(e.target.value)}
                  className="w-full px-3 py-1.5 text-right text-xs font-semibold bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all"
                />
                <span className="text-[11px] text-muted-foreground font-medium w-10 text-right shrink-0">kg</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-brand-foreground/60 text-xs font-medium shrink-0">Body Temp</span>
                <div className="w-48 sm:w-56 flex items-center justify-end gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 98.6"
                    value={patientBodyTemperature}
                    onChange={(e) => setPatientBodyTemperature(e.target.value)}
                    className={`w-full px-3 py-1.5 text-right text-xs font-bold bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all ${
                      tempStatus ? tempStatus.inputBorder : 'border-border focus:border-brand-green'
                    }`}
                  />
                  <span className="text-[11px] text-muted-foreground font-medium w-10 text-right shrink-0">°F</span>
                </div>
              </div>
              {tempStatus && (
                <div className="flex justify-end pr-11">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${tempStatus.badge}`}>
                    {tempStatus.label}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-brand-foreground/60 text-xs font-medium shrink-0">Blood Pressure</span>
                <div className="w-48 sm:w-56 flex items-center justify-end gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. 120/80"
                    value={patientBloodPressure}
                    onChange={(e) => setPatientBloodPressure(e.target.value)}
                    className={`w-full px-3 py-1.5 text-right text-xs font-bold bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all ${
                      bpStatus ? bpStatus.inputBorder : 'border-border focus:border-brand-green'
                    }`}
                  />
                  <span className="text-[11px] text-muted-foreground font-medium w-10 text-right shrink-0">mmHg</span>
                </div>
              </div>
              {bpStatus && (
                <div className="flex justify-end pr-11">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${bpStatus.badge}`}>
                    {bpStatus.label}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-brand-foreground/60 text-xs font-medium shrink-0">Daily Activity</span>
              <div className="w-48 sm:w-56 flex items-center justify-end">
                <div className="relative w-full">
                  <select
                    value={patientActivityLevel}
                    onChange={(e) => setPatientActivityLevel(e.target.value)}
                    className="w-full pl-2.5 pr-7 py-1.5 text-xs font-semibold bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all appearance-none truncate cursor-pointer"
                  >
                    <option value="Sedentary">Sedentary (Desk Job)</option>
                    <option value="Light">Lightly Active (1-3 d/wk)</option>
                    <option value="Moderate">Moderately Active (3-5 d/wk)</option>
                    <option value="Active">Very Active (6-7 d/wk)</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70 pointer-events-none" />
                </div>
              </div>
            </div>

            {bmi && (
              <div className="pt-2 border-t border-border mt-2 space-y-2">
                <div className="bg-brand-green/10 border border-brand-green/30 p-3 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-brand-green">BMI (Indian Standard)</span>
                    <span className="font-black text-brand-green text-sm">{bmi} <span className="text-[10px] font-medium">kg/m²</span></span>
                  </div>
                  
                  {bmiCategory && (
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${bmiCategoryBadge}`}>
                        {bmiCategory}
                      </span>
                    </div>
                  )}

                  {ayurvedicMetabolicTendency && (
                    <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200/50 flex items-center justify-between">
                      <span className="text-muted-foreground text-[10px]">Agni/Dhatu Indicator:</span>
                      <span className="font-extrabold">{ayurvedicMetabolicTendency}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    {bsa && (
                      <div className="bg-background/80 p-2 rounded-xl border border-border/60">
                        <div className="text-[10px] text-muted-foreground font-semibold">Body Surface Area (BSA)</div>
                        <div className="font-extrabold text-foreground">{bsa} m²</div>
                      </div>
                    )}
                    {ibw && (
                      <div className="bg-background/80 p-2 rounded-xl border border-border/60">
                        <div className="text-[10px] text-muted-foreground font-semibold">Ideal Body Weight</div>
                        <div className="font-extrabold text-foreground">{ibw} kg</div>
                      </div>
                    )}
                  </div>

                  {bmr && (
                    <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-brand-green/20">
                      <div className="bg-background/80 p-2 rounded-xl border border-border/60 text-center">
                        <div className="text-[9px] text-muted-foreground font-semibold">BMR (Basal)</div>
                        <div className="font-black text-brand-green text-xs">{bmr} <span className="text-[9px] font-normal">kcal</span></div>
                      </div>
                      <div className="bg-background/80 p-2 rounded-xl border border-border/60 text-center">
                        <div className="text-[9px] text-muted-foreground font-semibold">TDEE (Daily)</div>
                        <div className="font-black text-brand-green text-xs">{tdee} <span className="text-[9px] font-normal">kcal</span></div>
                      </div>
                      <div className="bg-brand-green/15 p-2 rounded-xl border border-brand-green/30 text-center">
                        <div className="text-[9px] text-brand-green font-bold">Pathya Target</div>
                        <div className="font-black text-brand-green text-xs">{calorieTarget} <span className="text-[9px] font-normal">kcal</span></div>
                      </div>
                    </div>
                  )}
                  {calorieTargetReason && (
                    <div className="text-[10px] text-muted-foreground italic text-center font-medium">
                      Pathya Recommendation: {calorieTargetReason}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-brand-foreground/60 text-xs font-semibold block">Ayurvedic Prakruti</label>
                <span className="text-[10px] text-muted-foreground font-medium">Select 1-2 doshas</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Vata', color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300' },
                  { name: 'Pitta', color: 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
                  { name: 'Kapha', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' }
                ].map(dosha => {
                  const active = selectedPrakruti.includes(dosha.name);
                  return (
                    <button
                      key={dosha.name}
                      type="button"
                      onClick={() => togglePrakrutiDosha(dosha.name)}
                      className={`py-1.5 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-between gap-1.5 cursor-pointer select-none ${
                        active
                          ? `${dosha.color} border-2 shadow-xs`
                          : 'bg-background border-border text-muted-foreground hover:border-brand-green/30'
                      }`}
                    >
                      <span>{dosha.name}</span>
                      <input 
                        type="checkbox"
                        checked={active}
                        onChange={() => {}}
                        className="h-3.5 w-3.5 rounded border-border text-brand-green accent-brand-green focus:ring-0 cursor-pointer pointer-events-none"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="pt-2 border-t border-border mt-2 space-y-3">
              <div>
                <label className="text-brand-foreground/60 text-xs font-semibold block mb-1">Chronic Diseases</label>
                <input
                  type="text"
                  placeholder="e.g. Diabetes, Hypertension"
                  value={chronicDiseases}
                  onChange={(e) => setChronicDiseases(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-medium bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-amber-700 dark:text-amber-400 placeholder:text-muted-foreground/50 transition-all"
                />
              </div>

              <div>
                <label className="text-brand-foreground/60 text-xs font-semibold block mb-1">Allergies</label>
                <input
                  type="text"
                  placeholder="e.g. Dust, Nuts, Penicillin"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-medium bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-rose-700 dark:text-rose-400 placeholder:text-muted-foreground/50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Information */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider">Consultation Information</h3>
          
          <div>
            <label className="text-xs font-semibold text-brand-foreground/60 block mb-1">Patient Concern / Reason for Visit</label>
            <textarea
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              rows={2}
              placeholder="Enter patient concern or reason for visit..."
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-foreground placeholder:text-muted-foreground/50 transition-all resize-y font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-foreground/60 block mb-1">Doctor Consultation Notes</label>
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              rows={3}
              placeholder="Add or edit doctor consultation notes here..."
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-foreground placeholder:text-muted-foreground/50 transition-all resize-y font-medium"
            />
          </div>
        </div>

        {/* Indications Selection */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider">Selected Indications</h3>
            <button
              onClick={() => setShowIndicationModal(true)}
              className="text-xs font-bold text-brand-green bg-brand-green-light/40 hover:bg-brand-green-light px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            {selectedIndications.length === 0 ? (
              <div className="text-sm text-brand-foreground/50 py-1 italic">No indications selected. Click Add to select.</div>
            ) : (
              selectedIndications.map(id => {
                const ind = allIndications.find((i: any) => i.id === id);
                if (!ind) return null;
                return (
                  <div key={id} className="flex items-center justify-between bg-brand-green/10 text-brand-green border border-brand-green/30 px-3.5 py-2.5 rounded-2xl text-xs font-bold shadow-xs hover:bg-brand-green/15 transition-all">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-green" />
                      <span>{ind.name}</span>
                    </div>
                    <button 
                      onClick={() => toggleIndication(id)} 
                      title="Remove indication"
                      className="p-1 text-brand-green/70 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4 stroke-[2.5]" />
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
        {/* AI Action Area - Theme Adaptive Card */}
        <div className="bg-card border-2 border-brand-green/30 rounded-3xl p-6 sm:p-8 shadow-md text-card-foreground relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
            <Sparkles className="h-32 w-32 text-brand-green" />
          </div>
          <div className="relative z-10 space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold-light border border-brand-gold/30 text-brand-gold-dark text-xs font-black uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-brand-gold-dark" />
              <span>AI-Powered Clinical Engine</span>
            </div>
            <h2 className="text-2xl font-black text-brand-green tracking-tight flex items-center gap-2">
              Ancient Intelligence Engine
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Generate AI-powered prescription suggestions based on patient profile, selected indications, and standard Ayurvedic protocols. The AI never prescribes; it only suggests.
            </p>
            <button
              onClick={handleGenerateAI}
              disabled={generating || selectedIndications.length === 0}
              className="mt-2 bg-brand-green text-white font-extrabold px-6 py-3 rounded-2xl hover:bg-brand-green/90 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 text-sm"
            >
              <Sparkles className="h-4 w-4 text-brand-gold" />
              {generating ? 'Engine Processing...' : 'Generate AI Suggestions'}
            </button>
          </div>
        </div>
        {/* Prescription Editor */}
        <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-4">
            <div>
              <h3 className="text-lg font-bold text-brand-green flex items-center gap-2">
                Prescription Editor
                <span className="text-xs font-semibold text-muted-foreground">({items.length} items)</span>
              </h3>
              <p className="text-xs text-muted-foreground">Add or modify medicines prescribed to the patient</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Highlighted Primary Add Medicine CTA Button */}
              <button 
                onClick={() => setShowPrepModal(true)} 
                title="Keyboard shortcut: Alt+A"
                className="relative group bg-gradient-to-r from-brand-green via-emerald-600 to-teal-600 hover:from-brand-green/90 hover:to-emerald-700 text-white text-sm font-black px-5 py-2.5 rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95 flex items-center gap-2 border border-emerald-400/40"
              >
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-gold"></span>
                </span>
                <Plus className="h-4 w-4 stroke-[3] transition-transform group-hover:rotate-90 duration-300" />
                <span>+ Add Medicine</span>
                <kbd className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-black/25 text-white/90 border border-white/30 rounded">Alt+A</kbd>
              </button>

              {appointment.prescription?.status === 'PRESCRIBED' ? (
                <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-1 rounded-xl font-bold uppercase tracking-wide">Finalized</span>
              ) : appointment.prescription ? (
                <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-1 rounded-xl font-bold uppercase tracking-wide">Draft</span>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-10 px-6 bg-brand-green-light/20 border-2 border-dashed border-brand-green/40 rounded-3xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto">
                  <Plus className="h-6 w-6 stroke-[2.5]" />
                </div>
                <h4 className="font-extrabold text-foreground text-base">No medicines added to prescription yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Click below to search clinical preparations, retail shop products, or add your own custom/external prescription.
                </p>
                <button 
                  onClick={() => setShowPrepModal(true)} 
                  title="Keyboard shortcut: Alt+A"
                  className="mt-2 bg-brand-green hover:bg-brand-green/90 text-white font-black text-sm px-6 py-3 rounded-2xl transition-all shadow-md inline-flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>+ Add Medicine Now</span>
                  <kbd className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-black/25 text-white/90 border border-white/30 rounded">Alt+A</kbd>
                </button>
              </div>
            ) : items.map((item, idx) => (
              <div key={idx} className="bg-brand-gold-light/20 border border-brand-gold/30 rounded-2xl p-4 flex gap-4 items-start relative group">
                <div className="flex-1 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-brand-green text-base">{item.preparationName}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        item.productId 
                          ? 'bg-brand-gold/25 text-brand-gold-dark border border-brand-gold/30'
                          : item.customMedicineId || item.customName
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300/40'
                          : 'bg-brand-green-light/40 text-brand-green'
                      }`}>
                        {item.productId ? 'Retail Product' : item.customMedicineId || item.customName ? 'Custom Medicine' : 'Clinical Preparation'}
                      </span>
                    </div>
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

            {items.length > 0 && (
              <div className="pt-2 flex justify-center">
                <button
                  onClick={() => setShowPrepModal(true)}
                  title="Keyboard shortcut: Alt+A"
                  className="w-full py-3 px-4 bg-brand-green/10 hover:bg-brand-green/20 border border-brand-green/40 rounded-2xl text-xs sm:text-sm font-extrabold text-brand-green flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-sm"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>+ Add Another Medicine</span>
                  <kbd className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-brand-green/15 text-brand-green border border-brand-green/30 rounded">Alt+A</kbd>
                </button>
              </div>
            )}
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

        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 bg-card/95 backdrop-blur-md border-t border-border/80 shadow-[0_-8px_30px_rgb(0_0_0_/_0.12)] transition-all py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left summary details & Auto-Save controls */}
          <div className="hidden md:flex items-center gap-3 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-green/10 text-brand-green font-bold border border-brand-green/20">
              <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
              <span>{items.length} {items.length === 1 ? 'Medicine' : 'Medicines'} in Prescription</span>
            </div>

            {/* Auto-Save Toggle Switch & Status Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-border/80">
              <button
                type="button"
                onClick={() => setAutoSaveEnabled(prev => !prev)}
                title={autoSaveEnabled ? "Auto-Save is ON (saving edits automatically)" : "Auto-Save is OFF"}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                  autoSaveEnabled 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' 
                    : 'bg-muted text-muted-foreground border-border'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${autoSaveEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                <span>Auto-Save {autoSaveEnabled ? 'ON' : 'OFF'}</span>
              </button>

              {/* Auto-Save Status Indicator */}
              {autoSaveEnabled && (
                <div className="text-[11px] font-semibold flex items-center gap-1.5">
                  {autoSaveStatus === 'SAVING' && (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Saving draft...
                    </span>
                  )}
                  {autoSaveStatus === 'SAVED' && (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3]" />
                      {lastSavedTime ? `Saved ${lastSavedTime}` : 'All changes saved'}
                    </span>
                  )}
                  {autoSaveStatus === 'DIRTY' && (
                    <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      Unsaved changes...
                    </span>
                  )}
                  {autoSaveStatus === 'OFFLINE_SAVED' && (
                    <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1" title="Changes saved locally to device cache">
                      <Cloud className="h-3.5 w-3.5 text-sky-500" />
                      Saved locally
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => savePrescription('DRAFT')}
              disabled={saving || items.length === 0}
              className="flex-1 md:w-52 px-6 py-2.5 sm:py-3 rounded-2xl border-2 border-brand-green/30 text-brand-green font-extrabold text-xs sm:text-sm hover:bg-brand-green hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-95"
            >
              <Save className="h-4.5 w-4.5 stroke-[2.5]" />
              <span>Save as Draft</span>
            </button>
            
            <button
              onClick={() => savePrescription('PRESCRIBED')}
              disabled={saving || items.length === 0}
              className="flex-1 md:w-52 px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-brand-green via-emerald-600 to-teal-700 hover:from-brand-green hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-brand-green/20 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 border-0"
            >
              <CheckCircle2 className="h-4.5 w-4.5 stroke-[2.5] text-brand-gold" />
              <span>Prescribe</span>
            </button>

            {appointment.prescription?.status === 'PRESCRIBED' && (
              <a
                href={`/prescriptions/print/${appointment.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 md:w-44 px-5 py-2.5 sm:py-3 rounded-2xl border-2 border-border text-brand-foreground font-extrabold text-xs sm:text-sm bg-card hover:bg-muted transition-all flex items-center justify-center gap-2 shadow-xs active:scale-95"
              >
                <Printer className="h-4.5 w-4.5 text-brand-green" />
                <span>Print</span>
              </a>
            )}
          </div>
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

      {/* Medicine Selection Modal */}
      {showPrepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowPrepModal(false)} />
          <div className="relative bg-card w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-brand-green">Add Medicine</h3>
              <button onClick={() => setShowPrepModal(false)} className="text-brand-foreground/50 hover:text-brand-foreground bg-muted hover:bg-muted/80 p-1.5 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Tabs */}
            <div className="flex border-b border-border shrink-0 px-2 sm:px-4">
              <button
                onClick={() => { setModalTab('PREPARATION'); setShowAddCustomForm(false); }}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                  modalTab === 'PREPARATION'
                    ? 'border-brand-green text-brand-green'
                    : 'border-transparent text-brand-foreground/55 hover:text-brand-foreground'
                }`}
              >
                Preparations ({allPreparations.length})
              </button>
              <button
                onClick={() => { setModalTab('PRODUCT'); setShowAddCustomForm(false); }}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                  modalTab === 'PRODUCT'
                    ? 'border-brand-green text-brand-green'
                    : 'border-transparent text-brand-foreground/55 hover:text-brand-foreground'
                }`}
              >
                Shop Products ({allProducts.length})
              </button>
              <button
                onClick={() => setModalTab('CUSTOM')}
                className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                  modalTab === 'CUSTOM'
                    ? 'border-brand-gold-dark text-brand-gold-dark'
                    : 'border-transparent text-brand-foreground/55 hover:text-brand-foreground'
                }`}
              >
                Custom / External ({customMedicines.length})
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-2 overflow-y-auto flex-1 space-y-2">
              {modalTab === 'PREPARATION' ? (
                <>
                  {/* Preparation Search Input */}
                  <div className="p-1 pb-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
                      <input
                        type="text"
                        placeholder="Search clinical preparations by name..."
                        autoFocus
                        value={prepSearch}
                        onChange={(e) => setPrepSearch(e.target.value)}
                        className="pl-9 bg-brand-gold-light/20 border border-border rounded-xl py-2.5 px-4 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 w-full"
                      />
                    </div>
                  </div>

                  {allPreparations
                    .filter((p: any) => p.name.toLowerCase().includes(prepSearch.toLowerCase()))
                    .slice(0, 50)
                    .map((prep: any) => {
                      const isSelected = items.some((i: any) => i.preparationId === prep.id);
                      return (
                        <button
                          key={`prep-${prep.id}`}
                          onClick={() => toggleManualItem('PREPARATION', prep)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-brand-green-light/30 text-brand-green font-bold'
                              : 'hover:bg-brand-gold-light/30 text-brand-foreground/80'
                          }`}
                        >
                          <div>
                            <p>{prep.name}</p>
                            <p className="text-[10px] text-brand-foreground/50 uppercase">{prep.type || 'Clinical preparation'}</p>
                          </div>
                          {isSelected ? (
                            <CheckCircle2 className="h-4 w-4 text-brand-green" />
                          ) : (
                            <Plus className="h-4 w-4 text-brand-green opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      );
                    })}
                </>
              ) : modalTab === 'PRODUCT' ? (
                <>
                  {/* Product Search Input */}
                  <div className="p-1 pb-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
                      <input
                        type="text"
                        placeholder="Search shop products by name or category..."
                        autoFocus
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-9 bg-brand-gold-light/20 border border-border rounded-xl py-2.5 px-4 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 w-full"
                      />
                    </div>
                  </div>

                  {allProducts
                    .filter((p: any) => p.name.toLowerCase().includes(productSearch.toLowerCase()) || (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase())))
                    .slice(0, 50)
                    .map((prod: any) => {
                      const isSelected = items.some((i: any) => i.productId === prod.id);
                      return (
                        <button
                          key={`prod-${prod.id}`}
                          onClick={() => toggleManualItem('PRODUCT', prod)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-brand-green-light/30 text-brand-green font-bold'
                              : 'hover:bg-brand-gold-light/30 text-brand-foreground/80'
                          }`}
                        >
                          <div>
                            <p>{prod.name}</p>
                            <p className="text-[10px] text-brand-gold-dark font-extrabold uppercase">{prod.category || 'Retail Product'}</p>
                          </div>
                          {isSelected ? (
                            <CheckCircle2 className="h-4 w-4 text-brand-green" />
                          ) : (
                            <Plus className="h-4 w-4 text-brand-green opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      );
                    })}
                </>
              ) : (
                /* CUSTOM MEDICINE TAB */
                <div className="space-y-3 p-1">
                  {!showAddCustomForm ? (
                    <>
                      <button
                        onClick={() => setShowAddCustomForm(true)}
                        className="w-full py-3 px-4 bg-brand-green/10 hover:bg-brand-green/20 border border-brand-green/30 rounded-xl text-xs font-bold text-brand-green flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create & Save New Custom / External Medicine</span>
                      </button>

                      {/* Custom Medicine Search Input */}
                      <div className="pt-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
                          <input
                            type="text"
                            placeholder="Search custom & external medicines..."
                            autoFocus
                            value={customSearch}
                            onChange={(e) => setCustomSearch(e.target.value)}
                            className="pl-9 bg-brand-green-light/20 border border-border rounded-xl py-2.5 px-4 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/25 w-full"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleCreateCustomMedicine} className="bg-brand-green-light/10 border border-brand-green/30 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider">Add Custom Medicine to Database</h4>
                        <button type="button" onClick={() => setShowAddCustomForm(false)} className="text-brand-foreground/40 hover:text-brand-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-brand-foreground/70 mb-1">Medicine Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mahasudarshan Kwath / Own Clinic Compound"
                          value={newCustom.name}
                          onChange={e => setNewCustom({ ...newCustom, name: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-brand-foreground/70 mb-1">Category / Type</label>
                          <select
                            value={newCustom.type}
                            onChange={e => setNewCustom({ ...newCustom, type: e.target.value })}
                            className="w-full bg-background border border-border rounded-xl px-2.5 py-2 text-xs focus:ring-2 focus:ring-brand-green outline-none"
                          >
                            <option value="Tablet">Tablet</option>
                            <option value="Syrup">Syrup</option>
                            <option value="Powder">Powder (Churna)</option>
                            <option value="Capsule">Capsule</option>
                            <option value="Oil">Oil / Taila</option>
                            <option value="Ointment">Ointment / Cream</option>
                            <option value="External">External Medicine</option>
                            <option value="Custom">Custom Compound</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-brand-foreground/70 mb-1">Brand / Source</label>
                          <input
                            type="text"
                            placeholder="e.g. Own Clinic / External Pharmacy"
                            value={newCustom.manufacturer}
                            onChange={e => setNewCustom({ ...newCustom, manufacturer: e.target.value })}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-green outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-brand-foreground/70 mb-1">Default Dosage</label>
                          <input
                            type="text"
                            placeholder="e.g. 1-0-1 or 10ml"
                            value={newCustom.dosage}
                            onChange={e => setNewCustom({ ...newCustom, dosage: e.target.value })}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-green outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-brand-foreground/70 mb-1">Instructions</label>
                          <input
                            type="text"
                            placeholder="e.g. After meals with warm water"
                            value={newCustom.instructions}
                            onChange={e => setNewCustom({ ...newCustom, instructions: e.target.value })}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-green outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          disabled={isSavingCustom}
                          className="flex-1 bg-brand-green text-white font-extrabold py-2.5 rounded-xl text-xs sm:text-sm hover:bg-brand-green/90 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          {isSavingCustom ? 'Saving to Database...' : 'Save & Add to Prescription'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddCustomForm(false)}
                          className="px-3 py-2 border border-border rounded-xl text-xs font-semibold text-brand-foreground/70 hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of Custom Medicines */}
                  {customMedicines
                    .filter((c: any) => c.name.toLowerCase().includes(customSearch.toLowerCase()) || (c.manufacturer && c.manufacturer.toLowerCase().includes(customSearch.toLowerCase())))
                    .map((customMed: any) => {
                      const isSelected = items.some((i: any) => i.customMedicineId === customMed.id);
                      return (
                        <div
                          key={`custom-${customMed.id}`}
                          onClick={() => toggleManualItem('CUSTOM', customMed)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between cursor-pointer group ${
                            isSelected
                              ? 'bg-brand-green-light/30 text-brand-green font-bold'
                              : 'hover:bg-brand-green-light/20 text-brand-foreground/80'
                          }`}
                        >
                          <div>
                            <p className="font-bold">{customMed.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-brand-foreground/60 mt-0.5">
                              <span className="bg-brand-green/10 text-brand-green px-1.5 py-0.5 rounded font-extrabold">{customMed.type || 'Custom'}</span>
                              {customMed.manufacturer && <span>• {customMed.manufacturer}</span>}
                              {customMed.dosage && <span>• Dosage: {customMed.dosage}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleDeleteCustomMedicine(customMed.id, e)}
                              title="Delete this custom medicine from your database"
                              className="p-1 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            {isSelected ? (
                              <CheckCircle2 className="h-4 w-4 text-brand-green" />
                            ) : (
                              <Plus className="h-4 w-4 text-brand-green opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {modalTab === 'PREPARATION' && allPreparations.filter((p: any) => p.name.toLowerCase().includes(prepSearch.toLowerCase())).length === 0 && (
                <div className="p-4 text-center text-sm text-brand-foreground/50 italic">No preparations found matching "{prepSearch}".</div>
              )}
              {modalTab === 'PRODUCT' && allProducts.filter((p: any) => p.name.toLowerCase().includes(productSearch.toLowerCase()) || (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase()))).length === 0 && (
                <div className="p-4 text-center text-sm text-brand-foreground/50 italic">No shop products found matching "{productSearch}".</div>
              )}
              {modalTab === 'CUSTOM' && customMedicines.filter((c: any) => c.name.toLowerCase().includes(customSearch.toLowerCase()) || (c.manufacturer && c.manufacturer.toLowerCase().includes(customSearch.toLowerCase()))).length === 0 && !showAddCustomForm && (
                <div className="p-4 text-center text-sm text-brand-foreground/50 italic">No custom medicines found matching "{customSearch}". Click above to create one.</div>
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
