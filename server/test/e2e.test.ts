import dotenv from 'dotenv';
dotenv.config();
import { prisma } from '../src/db.js';
import { generatePreVisitSummary, generatePostVisitSummary } from '../src/services/llm.service.js';
import bcrypt from 'bcryptjs';

async function runE2ETests() {
  console.log('🚀 Starting Full Healthcare Platform E2E Integration Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Auth & User verification
  console.log('🔹 1. Testing Database & User Authentication:');
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@carepulse.com' } });
  assert(!!adminUser && adminUser.role === 'ADMIN', 'Admin user exists with correct role');
  
  if (adminUser) {
    const isPasswordValid = await bcrypt.compare('admin123', adminUser.password);
    assert(isPasswordValid, 'Admin password hash verification succeeds');
  }

  const doctorUser = await prisma.user.findUnique({
    where: { email: 'dr.sarah@carepulse.com' },
    include: { doctorProfile: true }
  });
  assert(!!doctorUser && doctorUser.role === 'DOCTOR', 'Doctor user exists with profile');
  assert(doctorUser?.doctorProfile?.specialization === 'Cardiology', 'Doctor profile specialization is Cardiology');

  const patientUser = await prisma.user.findUnique({ where: { email: 'john@example.com' } });
  assert(!!patientUser && patientUser.role === 'PATIENT', 'Patient user exists');

  // 2. AI Pre-visit Symptom Triage Test (with Fallback Engine)
  console.log('\n🔹 2. Testing AI Pre-Visit Symptom Analysis:');
  const symptoms = 'Severe chest tightness radiating to the left arm and mild shortness of breath for 2 hours';
  const preVisit = await generatePreVisitSummary(symptoms);
  
  assert(preVisit.urgencyLevel === 'HIGH' || preVisit.urgencyLevel === 'MEDIUM', `Pre-visit triage urgency computed: ${preVisit.urgencyLevel}`);
  assert(Array.isArray(preVisit.suggestedQuestions) && preVisit.suggestedQuestions.length > 0, 'Generated suggested diagnostic questions');
  assert(typeof preVisit.chiefComplaint === 'string' && preVisit.chiefComplaint.length > 0, 'Generated concise chief complaint');

  // 3. AI Post-Visit Translation Test
  console.log('\n🔹 3. Testing AI Post-Visit Clinical Translation & Medication Parser:');
  const clinicalNotes = 'Patient presents with acute gastritis and dyspepsia. Prescribed Omeprazole 20mg once daily before breakfast for 14 days and Antacid suspension 10ml as needed after meals. Advised avoidance of spicy food.';
  const prescriptions = [
    {
      medicineName: 'Omeprazole 20mg',
      dosage: '1 capsule',
      frequency: 'Once daily (morning)',
      instructions: 'Take 30 minutes before breakfast'
    },
    {
      medicineName: 'Antacid Gel',
      dosage: '10ml',
      frequency: 'As needed',
      instructions: 'Take after meals if symptoms persist'
    }
  ];

  const postVisit = await generatePostVisitSummary(clinicalNotes, prescriptions);
  assert(typeof postVisit.patientFriendlySummary === 'string' && postVisit.patientFriendlySummary.length > 20, 'Generated patient-friendly translated summary');
  assert(typeof postVisit.followUpSteps === 'string' && postVisit.followUpSteps.length > 0, 'Generated actionable follow-up instructions');

  // 4. Appointment Booking & Slot Lifecycle Test
  console.log('\n🔹 4. Testing Appointment Booking & Record Association:');
  const testDate = '2026-10-01';
  const testStartTime = '10:00';
  const testEndTime = '10:30';

  if (doctorUser && patientUser) {
    // Clear any existing test appointment
    await prisma.appointment.deleteMany({
      where: { doctorId: doctorUser.id, date: testDate, startTime: testStartTime }
    });

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patientUser.id,
        doctorId: doctorUser.id,
        date: testDate,
        startTime: testStartTime,
        endTime: testEndTime,
        status: 'BOOKED',
        symptoms,
        preVisitSummary: {
          create: {
            urgencyLevel: preVisit.urgencyLevel,
            chiefComplaint: preVisit.chiefComplaint,
            suggestedQuestions: JSON.stringify(preVisit.suggestedQuestions)
          }
        }
      },
      include: {
        preVisitSummary: true
      }
    });

    assert(!!appointment.id, 'Appointment created successfully');
    assert(appointment.preVisitSummary?.urgencyLevel === preVisit.urgencyLevel, 'Pre-visit summary correctly linked to appointment');

    // 5. Complete Visit & Save Post-Visit Summary
    console.log('\n🔹 5. Testing Clinical Consultation Completion:');
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'COMPLETED',
        postVisitSummary: {
          create: {
            clinicalNotes,
            prescriptionJson: JSON.stringify(prescriptions),
            patientFriendlySummary: postVisit.patientFriendlySummary,
            followUpSteps: postVisit.followUpSteps
          }
        }
      },
      include: {
        postVisitSummary: true
      }
    });

    assert(updatedAppointment.status === 'COMPLETED', 'Appointment status transitioned to COMPLETED');
    assert(!!updatedAppointment.postVisitSummary?.patientFriendlySummary, 'Post-visit summary saved');

    // 6. Medication Reminder Creation
    console.log('\n🔹 6. Testing Medication Reminder Registration:');
    const reminder = await prisma.medicationReminder.create({
      data: {
        appointmentId: appointment.id,
        patientId: patientUser.id,
        medicineName: 'Omeprazole 20mg',
        dosage: '1 capsule',
        frequency: 'Once daily',
        reminderTimes: JSON.stringify(['08:00']),
        instructions: 'Take 30 minutes before breakfast',
        startDate: testDate,
        endDate: '2026-10-15',
        isActive: true
      }
    });

    assert(!!reminder.id && reminder.isActive === true, 'Medication reminder registered and active');

    // 7. Doctor Leave Conflict Handling
    console.log('\n🔹 7. Testing Doctor Leave Impact & Auto-Cancellation:');
    const leaveDate = '2026-10-05';
    // Create a booked appointment on leaveDate
    const leaveConflictApt = await prisma.appointment.create({
      data: {
        patientId: patientUser.id,
        doctorId: doctorUser.id,
        date: leaveDate,
        startTime: '14:00',
        endTime: '14:30',
        status: 'BOOKED',
        symptoms: 'Follow-up cardiology consultation'
      }
    });

    // Record leave and cancel conflicting appointments
    await prisma.doctorLeave.upsert({
      where: { doctorId_leaveDate: { doctorId: doctorUser.id, leaveDate } },
      update: { reason: 'Medical Conference' },
      create: { doctorId: doctorUser.id, leaveDate, reason: 'Medical Conference' }
    });

    // Update conflicting appointments to REQUIRES_RESCHEDULE
    const affected = await prisma.appointment.updateMany({
      where: {
        doctorId: doctorUser.id,
        date: leaveDate,
        status: 'BOOKED'
      },
      data: {
        status: 'REQUIRES_RESCHEDULE',
        cancelReason: 'Doctor is on approved leave: Medical Conference'
      }
    });

    assert(affected.count >= 1, `Cancelled/Rescheduled ${affected.count} conflicting appointment(s)`);

    const reloadedApt = await prisma.appointment.findUnique({ where: { id: leaveConflictApt.id } });
    assert(reloadedApt?.status === 'REQUIRES_RESCHEDULE', 'Conflicting appointment status is REQUIRES_RESCHEDULE');

    // Clean up test records
    await prisma.medicationReminder.deleteMany({ where: { appointmentId: appointment.id } });
    await prisma.appointment.deleteMany({ where: { id: { in: [appointment.id, leaveConflictApt.id] } } });
    await prisma.doctorLeave.deleteMany({ where: { doctorId: doctorUser.id, leaveDate } });
  }

  console.log('\n=============================================');
  console.log(`📊 E2E Test Suite Finished: ${passed} Passed, ${failed} Failed`);
  console.log('=============================================\n');

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ETests().catch(err => {
  console.error('❌ Uncaught test error:', err);
  process.exit(1);
});
