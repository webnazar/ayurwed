'use client';

import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, CheckCircle2, Loader2, Sparkles, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactFormClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitted(true);
      toast.success('Your message has been sent successfully!');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
      
      {/* Contact Channels (Only Email & Mobile No - No Address) */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between h-full space-y-6">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-gold/15 text-brand-gold-dark px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="h-3.5 w-3.5" /> Get In Touch
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-green">
                We&apos;re Here to Help
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                Have questions about our Ayurvedic products, doctor listings, CAI Academy certification, or clinical software? Reach out to our team directly.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              
              {/* Email Channel */}
              <a 
                href="mailto:support@ayurwed.com"
                className="flex items-start gap-4 p-4 rounded-2xl bg-[#fdf6e3] dark:bg-background border border-brand-green/15 hover:border-brand-green transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0 group-hover:bg-brand-green group-hover:text-white transition-colors">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Support</p>
                  <p className="text-sm sm:text-base font-extrabold text-brand-green truncate group-hover:text-brand-gold-dark transition-colors">
                    support@ayurwed.com
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Prompt response within 24 business hours</p>
                </div>
              </a>

              {/* Mobile / Phone Channel */}
              <a 
                href="tel:+919271711722"
                className="flex items-start gap-4 p-4 rounded-2xl bg-[#fdf6e3] dark:bg-background border border-brand-green/15 hover:border-brand-green transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0 group-hover:bg-brand-green group-hover:text-white transition-colors">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mobile / Calling</p>
                  <p className="text-sm sm:text-base font-extrabold text-brand-green group-hover:text-brand-gold-dark transition-colors">
                    +91 9271711722
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Direct phone assistance</p>
                </div>
              </a>

              {/* WhatsApp Channel */}
              <a 
                href="https://wa.me/919271711722?text=Hello%20AYURWED,%20I%20would%20like%20to%20get%20in%20touch."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 hover:border-[#25D366] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#128C7E]">Instant WhatsApp Chat</p>
                  <p className="text-sm sm:text-base font-extrabold text-[#075E54]">
                    +91 9271711722
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Quick responses on WhatsApp</p>
                </div>
              </a>

            </div>
          </div>

          {/* Operating Hours Note */}
          <div className="pt-4 border-t border-border flex items-center gap-2.5 text-xs text-muted-foreground font-medium mt-auto">
            <Clock className="h-4 w-4 text-brand-gold shrink-0" />
            <span>Support Hours: Monday to Saturday, 9:00 AM – 7:00 PM IST</span>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="lg:col-span-7 flex flex-col">
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm h-full flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-brand-green">Send Us a Message</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Leave your inquiry below and we will get back to you promptly.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center space-y-4 animate-in fade-in zoom-in-95 my-auto">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-black text-emerald-900 dark:text-emerald-200">Thank You! Message Received</h4>
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300/80 max-w-md mx-auto">
                We have received your message. Our support team will review your inquiry and get in touch with you shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="btn-green px-6 py-2.5 rounded-full text-xs font-bold shadow transition-all"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-green transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-green transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-green transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Your Message / Inquiry <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we assist you? Tell us about your enquiry or question..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-green transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-gold py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Your Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}
