import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { serialize } from '@/lib/utils';
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

  const consultantId = await getConsultantId(Number(session.user.id));

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      user: {
        include: {
          consumerProfile: true
        }
      },
      prescription: {
        include: {
          items: {
            include: {
              preparation: true,
              product: true,
              customMedicine: true
            }
          },
          indications: true
        }
      }
    }
  });

  if (!appointment || appointment.consultantId !== consultantId) {
    redirect('/consultant/appointments');
  }

  // Convert Decimals & dates to plain objects for Client Component compatibility
  const safeAppointment = serialize({
    ...appointment,
    fee: appointment.fee ? Number(appointment.fee) : 0,
    patientHeight: appointment.patientHeight ? Number(appointment.patientHeight) : (appointment.user?.consumerProfile?.height ? Number(appointment.user.consumerProfile.height) : null),
    patientWeight: appointment.patientWeight ? Number(appointment.patientWeight) : (appointment.user?.consumerProfile?.weight ? Number(appointment.user.consumerProfile.weight) : null),
    patientBodyTemperature: appointment.patientBodyTemperature ? Number(appointment.patientBodyTemperature) : (appointment.user?.consumerProfile?.bodyTemperature ? Number(appointment.user.consumerProfile.bodyTemperature) : null),
    patientBloodPressure: appointment.patientBloodPressure || appointment.user?.consumerProfile?.bloodPressure || null,
    patientPrakruti: appointment.patientPrakruti || appointment.user?.consumerProfile?.prakruti || null,
    patientActivityLevel: appointment.patientActivityLevel || appointment.user?.consumerProfile?.activityLevel || null,
    user: appointment.user ? {
      ...appointment.user,
      consumerProfile: appointment.user.consumerProfile ? {
        ...appointment.user.consumerProfile,
        height: appointment.user.consumerProfile.height ? Number(appointment.user.consumerProfile.height) : null,
        weight: appointment.user.consumerProfile.weight ? Number(appointment.user.consumerProfile.weight) : null,
        bodyTemperature: appointment.user.consumerProfile.bodyTemperature ? Number(appointment.user.consumerProfile.bodyTemperature) : null,
        prakruti: appointment.user.consumerProfile.prakruti || null,
        activityLevel: appointment.user.consumerProfile.activityLevel || null,
      } : null
    } : null,
    prescription: appointment.prescription ? {
      ...appointment.prescription,
      patientHeight: appointment.prescription.patientHeight ? Number(appointment.prescription.patientHeight) : null,
      patientWeight: appointment.prescription.patientWeight ? Number(appointment.prescription.patientWeight) : null,
      patientBodyTemperature: appointment.prescription.patientBodyTemperature ? Number(appointment.prescription.patientBodyTemperature) : null,
      patientPrakruti: appointment.prescription.patientPrakruti || null,
      patientActivityLevel: appointment.prescription.patientActivityLevel || null,
    } : null
  });

  // Fetch previous completed appointment & prescription for this patient with this consultant
  const previousCompletedAppt = await db.appointment.findFirst({
    where: {
      userId: appointment.userId,
      consultantId: consultantId,
      status: 'COMPLETED',
      id: { not: appointmentId },
      prescription: { isNot: null }
    },
    orderBy: { scheduledAt: 'desc' },
    include: {
      prescription: {
        include: {
          items: {
            include: {
              preparation: true,
              product: true,
              customMedicine: true
            }
          },
          indications: true
        }
      }
    }
  });

  const safePreviousAppt = previousCompletedAppt ? serialize({
    id: previousCompletedAppt.id,
    scheduledAt: previousCompletedAppt.scheduledAt.toISOString(),
    prescription: previousCompletedAppt.prescription ? {
      ...previousCompletedAppt.prescription,
      items: previousCompletedAppt.prescription.items.map((i: any) => ({
        ...i,
        preparation: i.preparation ? { id: i.preparation.id, name: i.preparation.name } : null,
        product: i.product ? { id: i.product.id, name: i.product.name } : null,
        customMedicine: i.customMedicine ? { id: i.customMedicine.id, name: i.customMedicine.name } : null,
      })),
      indications: previousCompletedAppt.prescription.indications.map((ind: any) => ({
        id: ind.id,
        name: ind.name
      }))
    } : null
  }) : null;

  const indications = await db.indication.findMany({
    where: { isActive: true },
    select: { id: true, name: true }
  });

  const products = await db.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, category: true, type: true }
  });

  const customMedicines = await db.customMedicine.findMany({
    where: {
      OR: [
        { consultantId: consultantId },
        { consultantId: null }
      ],
      isActive: true
    },
    select: { id: true, name: true, type: true, dosage: true, instructions: true, manufacturer: true, composition: true }
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
        previousAppointment={safePreviousAppt}
        allIndications={indications} 
        allProducts={products}
        initialCustomMedicines={customMedicines}
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
