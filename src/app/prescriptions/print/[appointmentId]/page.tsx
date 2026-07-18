import React from 'react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import PrintPrescriptionClient from '@/components/prescriptions/PrintPrescriptionClient';

export const revalidate = 0;

export async function generateMetadata(props: { params: Promise<{ appointmentId: string }> }): Promise<Metadata> {
  const params = await props.params;
  return {
    title: `AYURWED — Ancient Intelligence • App ID ${params.appointmentId}`,
  };
}

export default async function PrintPrescriptionPage(props: { params: Promise<{ appointmentId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const appointmentId = parseInt(params.appointmentId);
  if (isNaN(appointmentId)) {
    return notFound();
  }

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      user: true,
      consultant: {
        include: {
          user: true
        }
      },
      prescription: {
        include: {
          items: {
            include: {
              preparation: true,
              product: true
            }
          },
          indications: true
        }
      }
    }
  });

  if (!appointment || !appointment.prescription) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-md text-center space-y-4 shadow-sm">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-slate-900">No Prescription Found</h1>
          <p className="text-sm text-slate-600">
            A prescription has not been drafted for this consultation yet.
          </p>
        </div>
      </div>
    );
  }

  // Permission Checks:
  // 1. ADMIN - Can print any prescription
  // 2. CONSULTANT - Can only edit or print their own prescriptions
  // 3. CONSUMER - Can print their own prescriptions only
  let isAllowed = false;
  const userRole = session.user.role;

  if (userRole === 'ADMIN') {
    isAllowed = true;
  } else if (userRole === 'CONSULTANT') {
    const consultantProfile = await db.consultantProfile.findUnique({
      where: { userId: Number(session.user.id) }
    });
    if (consultantProfile && appointment.consultantId === consultantProfile.id) {
      isAllowed = true;
    }
  } else if (userRole === 'CONSUMER') {
    if (appointment.userId === Number(session.user.id)) {
      isAllowed = true;
    }
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-md text-center space-y-4 shadow-sm">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-sm text-slate-600">
            You do not have permission to view or print this prescription.
          </p>
        </div>
      </div>
    );
  }

  const doctor = appointment.consultant;
  const patient = appointment;
  const prescription = appointment.prescription;

  const rawDoctorName = doctor.user?.name || '';
  const doctorName = rawDoctorName.toLowerCase().startsWith('dr') ? rawDoctorName : `Dr. ${rawDoctorName}`;

  return (
    <div className="prescription-print-container min-h-screen bg-slate-50 print:bg-white text-slate-900 flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Force page & parent containers to be solid white */
          html, body, main, #__next, .prescription-print-container, .prescription-sheet {
            background-color: white !important;
            background: white !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          /* Neutralize intermediate wrapper backgrounds to transparent */
          div, section, header, footer, table {
            background-color: transparent !important;
            box-shadow: none !important;
          }
          /* Preserve subtle container tints in print */
          .bg-slate-50\\/60, .bg-\\[\\#045829\\]\\/5 {
            background-color: rgba(4, 88, 41, 0.04) !important;
          }
          .bg-white\\/60 {
            background-color: rgba(255, 255, 255, 0.6) !important;
          }
          .bg-\\[\\#f0b836\\]\\/5 {
            background-color: rgba(240, 184, 54, 0.05) !important;
          }
          /* Remove borders, margins, shadows on main A4 sheet container */
          .prescription-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 24px 32px !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}} />
      {/* Client Print Action Header */}
      <PrintPrescriptionClient />

      {/* Main A4 sheet container */}
      <div className="flex-1 py-4 px-2 print:p-0 flex justify-center">
        <div className="prescription-sheet w-full max-w-[800px] min-h-[1123px] bg-white border border-slate-200 print:border-none p-8 print:p-0 rounded-3xl print:rounded-none shadow-md print:shadow-none flex flex-col justify-between relative overflow-hidden">
          
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] select-none z-0">
            <img src="/ayurwed.webp" alt="Watermark" className="w-[350px] h-[350px] object-contain" />
          </div>

          {/* Header */}
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center border-b-2 border-[#045829]/20 pb-4">
              <div className="flex flex-col items-center space-y-1">
                <img src="/ayurwed-logo-2.webp" alt="Ayurwed Logo" className="h-10 object-contain" />
                <p className="text-[8px] text-[#045829] font-bold uppercase tracking-[0.25em] mt-0.5">Ancient Intelligence</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-[#045829]/10 text-[#045829] border border-[#045829]/30 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
                  {prescription.status}
                </span>
                <p className="text-xs text-slate-500 font-medium">Rx ID: <span className="font-bold text-slate-900">#RX-{prescription.id}</span></p>
                <p className="text-xs text-slate-500 font-medium">Date: <span className="font-bold text-slate-900">{new Date(prescription.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
              </div>
            </div>

            {/* Doctor & Clinic details */}
            <div className="grid grid-cols-2 gap-4 bg-[#045829]/5 p-3.5 rounded-2xl border border-[#045829]/10">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#045829]">{doctorName}</p>
                <p className="text-[10px] text-[#f0b836] font-extrabold uppercase tracking-wider">{doctor.specialization}</p>
                <p className="text-[10px] text-slate-600 font-medium">{doctor.degree || 'Ayurveda Consultant'}</p>
              </div>
              <div className="space-y-0.5 text-right text-[10px]">
                <p className="font-bold text-[#045829]">Ayurwed Wellness Circle</p>
                <p className="text-slate-600">Experience: <span className="font-bold text-slate-900">{doctor.experience} Years</span></p>
                <p className="text-slate-600">Appt ID: <span className="font-bold text-slate-900">#{appointment.id}</span></p>
              </div>
            </div>

            {/* Patient details */}
            <div className="border border-slate-200 rounded-2xl p-3.5 space-y-3 bg-white/60">
              <h3 className="text-[10px] font-bold uppercase text-[#045829] tracking-wider border-b border-slate-100 pb-1">Patient Information</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-800">
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase font-bold mb-0.5">Name</span>
                  <span className="font-bold text-slate-900">{patient.patientName || appointment.user.name}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase font-bold mb-0.5">Age / Gender</span>
                  <span className="font-semibold text-slate-900">{prescription.patientAge || patient.patientAge || '?'} yrs / {prescription.patientGender || patient.patientGender || '?'}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-500 uppercase font-bold mb-0.5">Weight</span>
                  <span className="font-semibold text-slate-900">{prescription.patientWeight ? `${Number(prescription.patientWeight).toFixed(0)} kg` : '? kg'}</span>
                </div>
                {patient.patientPhone && (
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase font-bold mb-0.5">Phone</span>
                    <span className="font-semibold text-slate-900">{patient.patientPhone}</span>
                  </div>
                )}
              </div>

              {/* History details */}
              {(patient.chronicDiseases || patient.allergies) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                  {patient.chronicDiseases && (
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase font-bold mb-0.5">Chronic Conditions</span>
                      <span className="font-medium text-amber-800">{patient.chronicDiseases}</span>
                    </div>
                  )}
                  {patient.allergies && (
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase font-bold mb-0.5">Known Allergies</span>
                      <span className="font-medium text-rose-800">{patient.allergies}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Indications & Diagnosis */}
            {prescription.consultantJudgment && (
              <div className="space-y-1">
                <h3 className="text-[10px] font-bold uppercase text-[#045829] tracking-wider border-b border-slate-100 pb-1">Clinical Judgment & Diagnosis</h3>
                <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed p-3 border border-slate-100 rounded-2xl italic">
                  "{prescription.consultantJudgment}"
                </p>
              </div>
            )}

            {/* Prescribed Medicines Table */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold uppercase text-[#045829] tracking-wider">Prescribed Medicines</h3>
              </div>
              <div className="overflow-hidden border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-[#045829]/5 border-b border-slate-200">
                      <th className="py-1.5 px-2.5 font-bold text-[#045829] uppercase tracking-wider w-[35%]">Medicine / Product</th>
                      <th className="py-1.5 px-2.5 font-bold text-[#045829] uppercase tracking-wider">Dosage</th>
                      <th className="py-1.5 px-2.5 font-bold text-[#045829] uppercase tracking-wider">Frequency</th>
                      <th className="py-1.5 px-2.5 font-bold text-[#045829] uppercase tracking-wider">Duration</th>
                      <th className="py-1.5 px-2.5 font-bold text-[#045829] uppercase tracking-wider">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-transparent">
                    {prescription.items?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-1.5 px-2.5 font-bold text-[#045829]">{item.preparation?.name || item.product?.name}</td>
                        <td className="py-1.5 px-2.5 font-medium text-slate-900">{item.dosage}</td>
                        <td className="py-1.5 px-2.5 font-medium text-slate-900">{item.frequency}</td>
                        <td className="py-1.5 px-2.5 font-medium text-slate-900">{item.duration}</td>
                        <td className="py-1.5 px-2.5 text-slate-600">{item.instructions || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* General advice & Follow-up */}
            {(prescription.dosageInstructions || prescription.followUpAdvice) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {prescription.dosageInstructions ? (
                  <div className={`${prescription.followUpAdvice ? 'md:col-span-2' : 'md:col-span-3'} space-y-1`}>
                    <h3 className="text-[10px] font-bold uppercase text-[#045829] tracking-wider border-b border-slate-100 pb-1">General Diet & Lifestyle Instructions</h3>
                    <p className="text-xs text-slate-800 leading-relaxed p-3 border border-slate-200 rounded-2xl whitespace-pre-line bg-[#f0b836]/5">
                      {prescription.dosageInstructions}
                    </p>
                  </div>
                ) : null}
                {prescription.followUpAdvice ? (
                  <div className={`${prescription.dosageInstructions ? 'md:col-span-1' : 'md:col-span-3'} space-y-1`}>
                    <h3 className="text-[10px] font-bold uppercase text-[#045829] tracking-wider border-b border-slate-100 pb-1">Recommended Follow-up</h3>
                    <div className="p-3 border border-[#045829]/20 rounded-2xl bg-[#045829]/5 text-center flex flex-col justify-center items-center min-h-[70px]">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Schedule next visit</span>
                      <span className="text-xs font-extrabold text-[#045829] mt-1">In {prescription.followUpAdvice}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Footer of sheet / signature block */}
          <div className="space-y-4 mt-6 relative z-10">
            <div className="border-t border-slate-200 pt-4 flex justify-between items-end">
              <div className="text-[9px] text-slate-500">
                <p className="font-semibold text-[#045829]">Ayurwed Ancient Intelligence Prescription Engine</p>
                <p>Generated electronically. Valid without physical signature.</p>
                <p className="mt-1 text-slate-400">Email: <span className="font-medium text-[#045829]">support@ayurwed.com</span></p>
              </div>
              <div className="text-center w-48 space-y-2">
                <div className="border-b border-slate-300 h-6" />
                <div>
                  <p className="text-xs font-bold text-slate-900">{doctorName}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Registered Practitioner</p>
                  {doctor.user?.phone && (
                    <p className="text-[9px] text-slate-400 mt-0.5">Mob: {doctor.user.phone}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="text-center border-t border-slate-100 pt-2">
              <span className="text-[10px] font-bold tracking-widest text-[#045829]">
                https://www.ayurwed.com
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
