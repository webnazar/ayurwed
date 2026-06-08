'use client';

import React, { useState } from 'react';
import { Star, Check, X, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

interface Profile {
  listingTier: string;
  isVerified: boolean;
}

export default function SubscriptionPlansClient({ profile }: { profile: Profile }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const currentTier = profile.listingTier || 'basic';

  const handleUpgradeClick = (planName: string) => {
    setSelectedPlan(planName);
    setShowModal(true);
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Free',
      description: 'Perfect for getting started on the platform.',
      features: [
        'List up to 10 products',
        'Standard search visibility',
        'Basic Manufacturer Profile',
        'Receive Enquiries',
      ],
      notIncluded: ['Premium Badge', 'Unlimited Products', 'Homepage Placement'],
      buttonText: currentTier === 'basic' ? 'Current Plan' : 'Downgrade',
      isCurrent: currentTier === 'basic',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '₹999/mo',
      description: 'Grow your business with enhanced visibility.',
      features: [
        'Unlimited product listings',
        'Priority search ranking',
        'Premium Manufacturer Badge',
        'Verified Status (Fast-track)',
        'Receive Enquiries',
      ],
      notIncluded: ['Homepage Placement'],
      buttonText: currentTier === 'premium' ? 'Current Plan' : 'Upgrade to Premium',
      isCurrent: currentTier === 'premium',
      highlight: true,
    },
    {
      id: 'featured',
      name: 'Featured',
      price: '₹2999/mo',
      description: 'Maximum exposure for top Ayurvedic brands.',
      features: [
        'Unlimited product listings',
        'Top of Search Results',
        'Featured Manufacturer Badge',
        'Homepage Placement',
        'Dedicated Support',
      ],
      notIncluded: [],
      buttonText: currentTier === 'featured' ? 'Current Plan' : 'Upgrade to Featured',
      isCurrent: currentTier === 'featured',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Current Status Banner */}
      <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-brand-foreground/50 uppercase tracking-wider mb-1">Current Status</h2>
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold text-brand-green capitalize">
              {currentTier} Plan
            </span>
            {profile.isVerified && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                <ShieldCheck className="h-3 w-3" /> VERIFIED
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-brand-foreground/60 max-w-sm">
          Upgrading your plan directly impacts your visibility on the platform, driving more enquiries and building brand trust.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`relative bg-white rounded-3xl border shadow-sm flex flex-col overflow-hidden ${
            plan.highlight ? 'border-brand-gold shadow-brand-gold/10 scale-[1.02]' : 'border-brand-green-border/10'
          }`}>
            {plan.highlight && (
              <div className="bg-brand-gold text-brand-green font-bold text-[10px] uppercase tracking-wider py-1.5 text-center">
                Most Popular
              </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-brand-green">{plan.name}</h3>
              <p className="text-xs text-brand-foreground/60 mt-2 min-h-[32px]">{plan.description}</p>
              <div className="my-6">
                <span className="text-3xl font-extrabold text-brand-green">{plan.price}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-brand-foreground/80">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-brand-foreground/40 opacity-70">
                    <X className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={plan.isCurrent}
                onClick={() => handleUpgradeClick(plan.name)}
                className={`w-full py-3 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                  plan.isCurrent
                    ? 'bg-brand-green-light/20 text-brand-foreground/50 cursor-not-allowed'
                    : plan.highlight
                      ? 'bg-brand-gold text-brand-green hover:bg-[#F2A83A]'
                      : 'bg-brand-green text-white hover:bg-brand-green/90'
                }`}
              >
                {plan.buttonText}
                {!plan.isCurrent && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-brand-foreground/40 hover:text-brand-foreground/80 transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-brand-gold-light/20 rounded-full flex items-center justify-center mb-4 border border-brand-gold">
                <Star className="h-8 w-8 text-brand-gold-dark" />
              </div>
              <h3 className="text-xl font-bold text-brand-green mb-2">Upgrade to {selectedPlan}</h3>
              <p className="text-sm text-brand-foreground/70 mb-6 leading-relaxed">
                You're making a great choice! To activate your <strong>{selectedPlan}</strong> plan, please contact our administrative team to arrange payment and finalize the upgrade.
              </p>
              
              <div className="w-full bg-brand-green-light/20 border border-brand-green-border/20 rounded-2xl p-4 mb-6">
                <p className="text-xs font-bold text-brand-foreground/60 uppercase tracking-wider mb-2">Contact Admin</p>
                <a href="mailto:admin@ayurwed.com" className="flex items-center justify-center gap-2 text-brand-green font-bold text-sm bg-white py-2 rounded-xl border border-brand-green-border/10 hover:border-brand-green/30 transition-colors">
                  <Mail className="h-4 w-4" /> admin@ayurwed.com
                </a>
              </div>

              <button onClick={() => setShowModal(false)} className="w-full py-3 rounded-full bg-brand-green text-white font-bold text-sm hover:bg-brand-green/90 transition-colors">
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
