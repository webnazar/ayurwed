import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import AipeDashboardClient from '@/components/consultant/AipeDashboardClient';

export default async function AipeDashboardPage(props: { params: Promise<{ appointmentId: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'CONSULTANT') {
    redirect('/login');
  }

  const appointmentId = parseInt(params.appointmentId);
  if (isNaN(appointmentId)) {
    redirect('/consultant/appointments');
  }

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      user: true,
      prescription: {
        include: {
          items: true,
          indications: true
        }
      }
    }
  });

  if (!appointment || appointment.consultantId !== (await getConsultantId(Number(session.user.id)))) {
    redirect('/consultant/appointments');
  }

  // Convert Decimals to numbers for Client Component compatibility
  const safeAppointment = {
    ...appointment,
    fee: Number(appointment.fee),
    prescription: appointment.prescription ? {
      ...appointment.prescription,
      patientWeight: appointment.prescription.patientWeight ? Number(appointment.prescription.patientWeight) : null
    } : null
  };

  const indications = await db.indication.findMany({
    where: { isActive: true },
    select: { id: true, name: true }
  });

  const preparations = await db.preparation.findMany({
    where: { isActive: true },
    select: { id: true, name: true, type: true }
  });

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-brand-green">Ancient Intelligence Prescription Platform</h1>
        <div className="text-sm text-brand-foreground/60 font-medium">
          Appointment #{safeAppointment.id}
        </div>
      </div>
      
      <AipeDashboardClient 
        appointment={safeAppointment} 
        allIndications={indications} 
        allPreparations={preparations}
      />
    </div>
  );
}

async function getConsultantId(userId: number) {
  const profile = await db.consultantProfile.findUnique({
    where: { userId }
  });
  return profile?.id || -1;
}
