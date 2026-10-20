import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const revalidate = 0;

export default async function PurgeExecutePage(props: { searchParams?: Promise<{ key?: string }> }) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const session = await getServerSession(authOptions);
  const isAdmin = session && (session.user as any).role === 'ADMIN';

  if (!isAdmin) {
    redirect('/admin/login?callbackUrl=/admin/symptoms/purge-now');
  }

  // Prevent accidental database wipe in production
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <h1 className="text-xl font-bold text-red-600">Database Purge Disabled in Production</h1>
        <p className="text-sm text-muted-foreground">
          Database wiping operations are disabled in production mode to protect catalog and customer data.
        </p>
      </div>
    );
  }

  // Perform purge safely on the database
  try {
    await db.$executeRawUnsafe(`DELETE FROM _IndicationToProduct`);
  } catch (e) {}

  try {
    await db.$executeRawUnsafe(`DELETE FROM _SymptomToProduct`);
  } catch (e) {}

  try {
    await db.$executeRawUnsafe(`DELETE FROM _SymptomToIndication`);
  } catch (e) {}

  try {
    await db.$executeRawUnsafe(`DELETE FROM _ProductToProtocol`);
  } catch (e) {}

  try {
    await db.$executeRawUnsafe(`DELETE FROM prescription_items WHERE productId IS NOT NULL`);
  } catch (e) {}

  try {
    await db.$executeRawUnsafe(`DELETE FROM shop_order_items`);
  } catch (e) {}

  try {
    await db.$executeRawUnsafe(`DELETE FROM order_items`);
  } catch (e) {}

  try {
    await db.$executeRawUnsafe(`DELETE FROM reviews`);
  } catch (e) {}

  try {
    await db.$executeRawUnsafe(`DELETE FROM shop_reviews`);
  } catch (e) {}

  try {
    await db.$executeRawUnsafe(`DELETE FROM enquiries WHERE productId IS NOT NULL`);
  } catch (e) {}

  const delProducts = await db.product.deleteMany({});

  try {
    await db.$executeRawUnsafe(`DELETE FROM _IndicationToPrescription`);
  } catch (e) {}

  try {
    await db.protocol.deleteMany({});
  } catch (e) {}

  const delIndications = await db.indication.deleteMany({});

  let delSymptoms = 0;
  try {
    if ((db as any).symptom) {
      const s = await (db as any).symptom.deleteMany({});
      delSymptoms = s.count;
    }
  } catch (e) {}

  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
        Products & Symptoms Cleared!
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Successfully removed <strong>{delProducts.count} products</strong> and <strong>{delIndications.count + delSymptoms} symptoms</strong> from the database. The catalog and symptom masters are now completely clean.
      </p>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/admin/symptoms"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2"
        >
          <span>Go to Symptoms & Import CSV</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/admin/products"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-card border border-border hover:bg-muted font-bold text-xs transition-colors"
        >
          View Products (Empty)
        </Link>
      </div>
    </div>
  );
}
