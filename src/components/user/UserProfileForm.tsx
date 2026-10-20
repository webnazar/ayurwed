'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  UserCircle,
  MapPin,
  Save,
  Loader2,
  ShieldCheck,
  Stethoscope,
  Clock,
  Languages,
  DollarSign,
  Package,
  ShoppingBag,
  Pencil,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SearchSelect from '@/components/ui/SearchSelect';
import ImageUploadCrop from '@/components/admin/ImageUploadCrop';
import Link from 'next/link';

const INDIAN_STATES = [
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Manipur', label: 'Manipur' },
  { value: 'Meghalaya', label: 'Meghalaya' },
  { value: 'Mizoram', label: 'Mizoram' },
  { value: 'Nagaland', label: 'Nagaland' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Sikkim', label: 'Sikkim' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Tripura', label: 'Tripura' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Uttarakhand', label: 'Uttarakhand' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands', meta: 'UT' },
  { value: 'Chandigarh', label: 'Chandigarh', meta: 'UT' },
  { value: 'Dadra and Nagar Haveli and Daman and Diu', label: 'Dadra and Nagar Haveli and Daman and Diu', meta: 'UT' },
  { value: 'Delhi', label: 'Delhi', meta: 'UT' },
  { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir', meta: 'UT' },
  { value: 'Ladakh', label: 'Ladakh', meta: 'UT' },
  { value: 'Lakshadweep', label: 'Lakshadweep', meta: 'UT' },
  { value: 'Puducherry', label: 'Puducherry', meta: 'UT' },
];

export default function UserProfileForm() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<'CONSUMER' | 'CONSULTANT' | 'ADMIN'>('CONSUMER');
  const [showPassword, setShowPassword] = useState(false);

  // Unified form state
  const [formData, setFormData] = useState({
    // User fields
    name: '',
    email: '',
    phone: '',
    avatar: '',
    password: '',
    dateOfBirth: '',
    gender: '',
    // Doctor specific fields
    degree: '',
    registrationNumber: '',
    specialization: '',
    experience: 0,
    bio: '',
    languages: '',
    consultationFee: 300,
    followUpFee: 150,
    isVerified: false,
    isCaiCertified: false,
    // Shipping / Delivery address fields (both Doctor and User can order!)
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!saving) {
          const form = document.getElementById('user-profile-form') as HTMLFormElement;
          if (form) form.requestSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saving]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        const user = data.user || {};
        const consultant = data.consultantProfile || {};
        const consumer = data.consumerProfile || {};
        const userRole = data.role || (session?.user as any)?.role || 'CONSUMER';
        setRole(userRole);

        // Format languages string
        let langStr = '';
        if (consultant.languagesArray && Array.isArray(consultant.languagesArray)) {
          langStr = consultant.languagesArray.join(', ');
        } else if (consultant.languages) {
          langStr = consultant.languages;
        }

        setFormData({
          name: user.name || session?.user?.name || '',
          email: user.email || session?.user?.email || '',
          phone: user.phone || '',
          avatar: user.avatar || '',
          password: '',
          dateOfBirth: consumer.dateOfBirth ? consumer.dateOfBirth.split('T')[0] : '',
          gender: consumer.gender || '',
          // Doctor fields
          degree: consultant.degree || '',
          registrationNumber: consultant.registrationNumber || '',
          specialization: consultant.specialization || '',
          experience: consultant.experience || 0,
          bio: consultant.bio || '',
          languages: langStr,
          consultationFee: consultant.consultationFee ?? 300,
          followUpFee: consultant.followUpFee ?? 150,
          isVerified: Boolean(consultant.isVerified),
          isCaiCertified: Boolean(consultant.isCaiCertified),
          // Shipping Address
          address: consumer.address || '',
          landmark: consumer.landmark || '',
          city: consumer.city || '',
          state: consumer.state || '',
          pincode: consumer.pincode || '',
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.pincode && !/^\d{6}$/.test(formData.pincode.trim())) {
      toast.error('Please enter a valid 6-digit Indian Pincode');
      return;
    }

    if (isDoctor && !formData.registrationNumber.trim()) {
      toast.error('Medical Registration Number is required for doctor profiles');
      return;
    }

    setSaving(true);
    toast.loading('Saving your profile changes...');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      toast.dismiss();

      if (res.ok) {
        toast.success('Profile and delivery details updated successfully!');
        setFormData((prev) => ({ ...prev, password: '' }));
        if (update && formData.name) {
          await update({ name: formData.name });
        }
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error('An error occurred while saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-card rounded-3xl border border-border">
        <Loader2 className="w-10 h-10 animate-spin text-brand-green" />
        <p className="text-sm font-semibold text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  const isDoctor = role === 'CONSULTANT';
  const inpClass =
    'w-full text-sm bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border focus:border-brand-gold rounded-2xl px-4 py-3 transition-colors outline-none';

  return (
    <form id="user-profile-form" onSubmit={handleSubmit} className="space-y-6">
      {/* Role Badge Banner */}
      <div className="bg-gradient-to-r from-brand-green/10 via-brand-gold/10 to-transparent p-4 sm:p-5 rounded-3xl border border-brand-green/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-green text-white rounded-2xl shrink-0">
            {isDoctor ? <Stethoscope className="w-6 h-6" /> : <UserCircle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-brand-green">
                Account Type: {isDoctor ? 'Certified Doctor / Practitioner' : 'Wellness Member / User'}
              </span>
              {isDoctor && formData.isVerified && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isDoctor
                ? 'Your professional credentials and clinical details are shown below along with your eCommerce shipping address.'
                : 'Your personal member information and eCommerce shipping delivery address.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/user/myorders"
            className="px-3.5 py-1.5 rounded-xl bg-card border border-border hover:border-brand-green text-xs font-bold text-foreground transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Package className="w-3.5 h-3.5 text-brand-green" />
            <span>My Orders</span>
          </Link>
          <Link
            href="/shop"
            className="px-3.5 py-1.5 rounded-xl bg-brand-gold text-brand-green text-xs font-bold hover:shadow-xs transition-all flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shop Store</span>
          </Link>
        </div>
      </div>

      {/* SECTION 1: Doctor-Specific Fields (Rendered ONLY if role === 'CONSULTANT') */}
      {isDoctor && (
        <>
          {/* Doctor Avatar & Identity */}
          <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl">
                  <UserCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Doctor Identity & Photo</h3>
                  <p className="text-xs text-muted-foreground">Manage your public practitioner profile photograph and display name.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
              <ImageUploadCrop
                value={formData.avatar}
                onChange={(url) => setFormData((prev) => ({ ...prev, avatar: url }))}
                folder="consultants"
              >
                <div className="relative group rounded-full cursor-pointer">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Doctor Avatar"
                      className="w-28 h-28 rounded-full object-cover border-4 border-brand-gold/60 shadow-md group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-brand-green/10 border-4 border-brand-green/20 flex items-center justify-center text-brand-green shadow-xs group-hover:bg-brand-green/20 transition-colors">
                      <Stethoscope className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-brand-green text-white p-2 rounded-full shadow-lg border-2 border-background group-hover:scale-110 transition-transform">
                    <Pencil className="w-3.5 h-3.5" />
                  </div>
                </div>
              </ImageUploadCrop>
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-foreground">Profile Photograph</h4>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Upload a professional, well-lit photo. Click the portrait to crop and upload (recommended 500x500px).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                  Full Name (with Title) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Dr. Rajesh Sharma"
                  className={inpClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                  Contact / Clinic Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="9876543210"
                  className={inpClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                  Email Address (Account ID)
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className={`${inpClass} opacity-70 bg-muted/20 cursor-not-allowed`}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-brand-green" /> Password
                  </label>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    (Leave blank to keep existing password)
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="•••••••• (Enter new password to change)"
                    className={`${inpClass} pr-10`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Practice Details */}
          <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Medical Practice Details</h3>
                  <p className="text-xs text-muted-foreground">Qualifications, Ayush registration number, and clinical domain.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-brand-green" /> Degree / Qualifications *
                </label>
                <input
                  type="text"
                  required
                  value={formData.degree}
                  onChange={(e) => setFormData((prev) => ({ ...prev, degree: e.target.value }))}
                  placeholder="e.g. BAMS, MD (Ayurveda), MS"
                  className={inpClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-gold-dark" /> Medical Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, registrationNumber: e.target.value }))}
                  placeholder="e.g. AYUSH-MH-10294"
                  className={inpClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                  Clinical Specialization *
                </label>
                <input
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData((prev) => ({ ...prev, specialization: e.target.value }))}
                  placeholder="e.g. Kayachikitsa, Panchakarma, Nadi Pariksha"
                  className={inpClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-green" /> Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={(e) => setFormData((prev) => ({ ...prev, experience: Number(e.target.value) }))}
                  className={inpClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-brand-green" /> Languages Spoken
                </label>
                <input
                  type="text"
                  value={formData.languages}
                  onChange={(e) => setFormData((prev) => ({ ...prev, languages: e.target.value }))}
                  placeholder="English, Hindi, Sanskrit, Marathi"
                  className={inpClass}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Separate languages with commas.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                  Consultation Fee (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData((prev) => ({ ...prev, consultationFee: Number(e.target.value) }))}
                  placeholder="300"
                  className={inpClass}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                  Professional Bio & Clinical Philosophy
                </label>
                <span className="text-[10px] text-muted-foreground">{formData.bio.length}/500</span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Share your background, healing philosophy, and areas of Ayurvedic focus..."
                className={`${inpClass} resize-none`}
              />
            </div>
          </div>
        </>
      )}

      {/* SECTION 2: User Personal Information (Rendered when role === 'CONSUMER' or 'ADMIN') */}
      {!isDoctor && (
        <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl">
                <UserCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-foreground">Personal Information</h3>
                <p className="text-xs text-muted-foreground">Your account details and personal contact information.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Rohan Sharma"
                className={inpClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Email Address (Account ID)
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className={`${inpClass} opacity-70 bg-muted/20 cursor-not-allowed`}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-green" /> Password
                </label>
                <span className="text-[10px] text-muted-foreground font-medium">
                  (Leave blank to keep existing password)
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="•••••••• (Enter new password to change)"
                  className={`${inpClass} pr-10`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="9876543210"
                className={inpClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-green" /> Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                className={inpClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
                className={inpClass}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Shipping & Delivery Address (BOTH Doctor and User are consumers who can order!) */}
      <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-gold/15 text-brand-gold-dark rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-foreground">
                  {isDoctor ? 'Clinic & Shipping Address' : 'Shipping & Delivery Address'}
                </h3>
                <span className="bg-brand-gold/20 text-brand-gold-dark text-[10px] font-black px-2 py-0.5 rounded-full">
                  eCommerce Store
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isDoctor
                  ? 'Both doctors and wellness members can order authentic Ayurvedic products through our store. Set your clinic or residence delivery address.'
                  : 'Your default delivery address for ordering classical medicines, oils, and remedies from the AYURWED store.'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
              Street / Building Address *
            </label>
            <textarea
              required
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Flat / Room No., Apartment/Clinic Name, Street, Locality"
              className={`${inpClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData((prev) => ({ ...prev, landmark: e.target.value }))}
                placeholder="Near Metro Station, Opp. City Hospital"
                className={inpClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                City / District *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Mumbai / New Delhi / Bengaluru"
                className={inpClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                State / Union Territory *
              </label>
              <SearchSelect
                options={INDIAN_STATES}
                value={formData.state}
                onChange={(val) => setFormData((prev) => ({ ...prev, state: val }))}
                placeholder="Select State"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                Pincode *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData((prev) => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                placeholder="400001"
                className={inpClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold py-4 px-6 rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Profile...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Profile & Delivery Details</span>
              <kbd className="text-[10px] bg-white/20 text-current px-2 py-0.5 rounded font-mono ml-2 border border-white/30 hidden sm:inline-block">
                Alt+S
              </kbd>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
