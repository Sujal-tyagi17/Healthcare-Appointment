import { prisma } from '../src/db.js';

async function testConcurrency() {
  console.log('🧪 Starting Concurrency & Double-Booking Prevention Test...');

  // Find a doctor and a test patient
  const doctor = await prisma.user.findFirst({
    where: { role: 'DOCTOR' },
    include: { doctorProfile: true }
  });

  const patient1 = await prisma.user.findFirst({ where: { role: 'PATIENT', email: 'john@example.com' } });
  const patient2 = await prisma.user.findFirst({ where: { role: 'PATIENT', email: 'alice@example.com' } });

  if (!doctor || !patient1 || !patient2) {
    console.error('❌ Missing seeded data for test. Run seed first.');
    process.exit(1);
  }

  const testDate = '2026-09-15';
  const testStartTime = '11:00';
  const testEndTime = '11:30';

  // Clean any existing appointment on this slot
  await prisma.appointment.deleteMany({
    where: { doctorId: doctor.id, date: testDate, startTime: testStartTime }
  });

  console.log(`Simulating simultaneous booking attempts for Slot: ${testDate} at ${testStartTime} with Dr. ${doctor.name}`);

  const attemptBooking = async (patientId: string, patientName: string) => {
    try {
      return await prisma.$transaction(async (tx) => {
        // Atomic check inside transaction
        const existing = await tx.appointment.findFirst({
          where: {
            doctorId: doctor.id,
            date: testDate,
            startTime: testStartTime,
            status: { in: ['BOOKED', 'COMPLETED'] }
          }
        });

        if (existing) {
          throw new Error('SLOT_ALREADY_BOOKED');
        }

        const apt = await tx.appointment.create({
          data: {
            patientId,
            doctorId: doctor.id,
            date: testDate,
            startTime: testStartTime,
            endTime: testEndTime,
            symptoms: `Concurrent test request from ${patientName}`,
            status: 'BOOKED'
          }
        });

        return { success: true, patientName, aptId: apt.id };
      });
    } catch (err: any) {
      return { success: false, patientName, error: err.message };
    }
  };

  // Trigger both simultaneous bookings in parallel
  const results = await Promise.all([
    attemptBooking(patient1.id, patient1.name),
    attemptBooking(patient2.id, patient2.name)
  ]);

  console.log('\n--- Concurrent Test Results ---');
  console.log(JSON.stringify(results, null, 2));

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  if (successCount === 1 && failureCount === 1) {
    console.log('\n✅ TEST PASSED: Exactly one booking succeeded and the duplicate booking was safely rejected with conflict!');
  } else {
    console.error(`\n❌ TEST FAILED: Unexpected outcome. Success: ${successCount}, Failures: ${failureCount}`);
    process.exit(1);
  }

  // Cleanup test slot
  await prisma.appointment.deleteMany({
    where: { doctorId: doctor.id, date: testDate, startTime: testStartTime }
  });

  console.log('🧹 Cleaned up test appointment.');
  await prisma.$disconnect();
}

testConcurrency().catch(err => {
  console.error(err);
  process.exit(1);
});
