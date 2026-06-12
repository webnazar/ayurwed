import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, Globe, Mail, Phone, CheckCircle2, Award, MapPin, Truck, ArrowLeft, Leaf, ChevronRight, Sparkles } from 'lucide-react';
import EnquiryForm from '@/components/manufacturer/EnquiryForm';
import { Metadata } from 'next';

export const revalidate = 0;

interface ManufacturerProfilePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ManufacturerProfilePageProps): Promise<Metadata> {
  const mfr = await db.manufacturerProfile.findUnique({ where: { slug: params.slug } });
  if (!mfr) return { title: 'Manufacturer Not Found | AYURWED' };
  return {
    title: `${mfr.companyName} | AYURWED`,
    description: mfr.description.slice(0, 160),
  };
}

export default async function ManufacturerProfilePage({ params }: ManufacturerProfilePageProps) {
  const mfr = await db.manufacturerProfile.findUnique({
    where: { slug: params.slug },
    include: {
      user: { select: { name: true, email: true } },
      products: {
        where: { isActive: true },
        orderBy: [{ isFeatured: 'desc' }, { isSponsored: 'desc' }, { createdAt: 'desc' }],
        include: { category: { select: { name: true } } },
      },
    },
  });

  if (!mfr) notFound();

  const certifications = Array.isArray(mfr.certifications) ? (mfr.certifications as string[]) : [];
  const address = mfr.address as any;
  const distributorInfo = mfr.distributorInfo as any;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-brand-foreground/60">
        <Link href="/" className="hover:text-brand-green">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/manufacturers" className="hover:text-brand-green">Manufacturers</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-brand-green font-semibold">{mfr.companyName}</span>
      </div>

      <Link href="/manufacturers" className="inline-flex items-center gap-2 text-sm font-bold text-brand-green hover:text-brand-gold transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Manufacturers
      </Link>

      {/* Hero */}
      <div className="dashboard-header-card">
        <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="h-20 w-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-2 flex-grow">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold">{mfr.companyName}</h1>
              {mfr.isVerified && (
                <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> AYUSH Verified
                </span>
              )}
              {mfr.isFeatured && (
                <span className="bg-brand-gold/20 border border-brand-gold/30 text-brand-gold text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Featured
                </span>
              )}
            </div>
            <p className="text-sm text-brand-green-light max-w-2xl">{mfr.description}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="bg-white/10 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider">
              {mfr.listingTier}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column — Info */}
        <div className="lg:col-span-1 space-y-6">

          {/* Contact Details */}
          <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-4">
            <h2 className="font-extrabold text-brand-green text-base border-b border-brand-green-light pb-3">Contact Details</h2>
            <div className="space-y-3 text-sm">
              {mfr.website && (
                <a href={mfr.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-brand-foreground/70 hover:text-brand-green transition-colors">
                  <Globe className="h-4 w-4 text-brand-green flex-shrink-0" />
                  <span className="truncate">{mfr.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              {mfr.contactEmail && (
                <a href={`mailto:${mfr.contactEmail}`}
                  className="flex items-center gap-2.5 text-brand-foreground/70 hover:text-brand-green transition-colors">
                  <Mail className="h-4 w-4 text-brand-green flex-shrink-0" />
                  <span>{mfr.contactEmail}</span>
                </a>
              )}
              {mfr.contactPhone && (
                <a href={`tel:${mfr.contactPhone}`}
                  className="flex items-center gap-2.5 text-brand-foreground/70 hover:text-brand-green transition-colors">
                  <Phone className="h-4 w-4 text-brand-green flex-shrink-0" />
                  <span>{mfr.contactPhone}</span>
                </a>
              )}
              {address && (
                <div className="flex items-start gap-2.5 text-brand-foreground/70">
                  <MapPin className="h-4 w-4 text-brand-green flex-shrink-0 mt-0.5" />
                  <span className="text-xs leading-relaxed">
                    {[address.line1, address.city, address.state, address.pincode].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-4">
              <h2 className="font-extrabold text-brand-green text-base border-b border-brand-green-light pb-3 flex items-center gap-2">
                <Award className="h-4 w-4" /> Certifications
              </h2>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Distributor Information */}
          {distributorInfo && (
            <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-4">
              <h2 className="font-extrabold text-brand-green text-base border-b border-brand-green-light pb-3 flex items-center gap-2">
                <Truck className="h-4 w-4" /> Distributor Information
              </h2>
              <div className="text-sm text-brand-foreground/70 space-y-2">
                {distributorInfo.description && <p>{distributorInfo.description}</p>}
                {distributorInfo.regions && (
                  <p><span className="font-semibold text-brand-green">Regions: </span>{distributorInfo.regions}</p>
                )}
                {distributorInfo.contact && (
                  <p><span className="font-semibold text-brand-green">Distributor Contact: </span>{distributorInfo.contact}</p>
                )}
              </div>
            </div>
          )}

          {/* Enquiry Form */}
          <div className="bg-brand-gold-light/50 rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-4">
            <h2 className="font-extrabold text-brand-green text-base border-b border-brand-green-light pb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" /> Send Enquiry
            </h2>
            <EnquiryForm manufacturerId={mfr.id} companyName={mfr.companyName} />
          </div>
        </div>

        {/* Right Column — Products */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-6">
            <h2 className="font-extrabold text-brand-green text-base border-b border-brand-green-light pb-3 flex items-center gap-2">
              <Leaf className="h-4 w-4" /> Product Catalog
              <span className="ml-auto text-xs font-medium text-brand-foreground/50">{mfr.products.length} preparation{mfr.products.length !== 1 ? 's' : ''}</span>
            </h2>

            {mfr.products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mfr.products.map((product) => {
                  const thumbnail = Array.isArray(product.images) ? (product.images as string[])[0] : null;
                  return (
                    <Link key={product.id} href={`/preparations/${product.slug}`}
                      className="flex items-start gap-4 p-4 rounded-2xl border border-brand-green-border/10 hover:border-brand-gold/30 hover:shadow-md transition-all duration-200 group bg-brand-gold-light/20">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0">
                        {thumbnail ? (
                          <Image src={thumbnail} alt={product.name} fill className="object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Leaf className="h-6 w-6 text-brand-green-light" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0 space-y-1">
                        <span className="text-[9px] font-bold text-brand-gold-dark uppercase tracking-wider">{product.category?.name}</span>
                        <h3 className="text-sm font-bold text-brand-green group-hover:text-brand-gold transition-colors line-clamp-2">{product.name}</h3>
                        {(product as any).mrp && (
                          <p className="text-[10px] text-brand-foreground/50">MRP ₹{Number((product as any).mrp).toFixed(0)}</p>
                        )}
                        {(product.isSponsored || product.isFeatured) && (
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            product.isSponsored ? 'bg-brand-gold/20 text-brand-gold-dark' : 'bg-brand-green-light text-brand-green'
                          }`}>
                            {product.isSponsored ? 'Sponsored' : 'Featured'}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <Leaf className="h-10 w-10 text-brand-foreground/30 mx-auto" />
                <p className="text-sm text-brand-foreground/60">No products listed yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
