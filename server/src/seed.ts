import bcrypt from 'bcryptjs';
import { prisma } from './db.js';

async function main() {
  console.log('🌱 Starting Healthcare platform database seed...');

  // Clear existing records
  await prisma.notificationLog.deleteMany();
  await prisma.medicationReminder.deleteMany();
  await prisma.postVisitSummary.deleteMany();
  await prisma.preVisitSummary.deleteMany();
  await prisma.slotHold.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorLeave.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);
  const doctorPasswordHash = await bcrypt.hash('doctor123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Clinic Administrator',
      email: 'admin@carepulse.com',
      password: adminPasswordHash,
      role: 'ADMIN',
      phone: '+1 (555) 010-0001'
    }
  });
  console.log(`✅ Created Admin: ${admin.email}`);

  // 2. Create Doctors
  const doctorsData = [
    {
      name: 'Dr. Sarah Jenkins',
      email: 'dr.sarah@carepulse.com',
      specialization: 'Cardiology',
      bio: 'Board-certified cardiologist specializing in preventive cardiology, hypertension, and coronary artery disease management with over 14 years of clinical experience.',
      slotDurationMinutes: 30,
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      consultationFee: 75.0,
      roomNumber: 'Suite 201 (Cardiology Wing)',
      phone: '+1 (555) 010-1001'
    },
    {
      name: 'Dr. Marcus Chen',
      email: 'dr.marcus@carepulse.com',
      specialization: 'Dermatology',
      bio: 'Specialist in clinical and aesthetic dermatology, focusing on acne management, eczema, psoriasis, and early skin lesion detection.',
      slotDurationMinutes: 20,
      workingHoursStart: '09:00',
      workingHoursEnd: '16:00',
      consultationFee: 60.0,
      roomNumber: 'Suite 105 (Dermatology Clinic)',
      phone: '+1 (555) 010-1002'
    },
    {
      name: 'Dr. Emily Rodriguez',
      email: 'dr.emily@carepulse.com',
      specialization: 'Neurology',
      bio: 'Fellowship-trained neurologist with expertise in chronic migraines, peripheral neuropathy, cognitive disorders, and sleep disturbances.',
      slotDurationMinutes: 45,
      workingHoursStart: '10:00',
      workingHoursEnd: '18:00',
      consultationFee: 90.0,
      roomNumber: 'Suite 310 (Neuroscience Center)',
      phone: '+1 (555) 010-1003'
    },
    {
      name: 'Dr. Alex Thompson',
      email: 'dr.alex@carepulse.com',
      specialization: 'General Medicine',
      bio: 'Primary care physician committed to comprehensive health assessments, chronic disease management, and preventative wellness screenings.',
      slotDurationMinutes: 30,
      workingHoursStart: '08:30',
      workingHoursEnd: '16:30',
      consultationFee: 50.0,
      roomNumber: 'Room 102 (Family Practice)',
      phone: '+1 (555) 010-1004'
    },
    {
      name: 'Dr. Priya Patel',
      email: 'dr.priya@carepulse.com',
      specialization: 'Pediatrics',
      bio: 'Dedicated pediatrician providing gentle and compassionate care from newborn health checks to adolescent developmental screenings.',
      slotDurationMinutes: 30,
      workingHoursStart: '09:00',
      workingHoursEnd: '15:00',
      consultationFee: 55.0,
      roomNumber: 'Suite 108 (Pediatrics Wing)',
      phone: '+1 (555) 010-1005'
    }
  ];

  const createdDoctors = [];
  for (const doc of doctorsData) {
    const user = await prisma.user.create({
      data: {
        name: doc.name,
        email: doc.email,
        password: doctorPasswordHash,
        role: 'DOCTOR',
        phone: doc.phone,
        doctorProfile: {
          create: {
            specialization: doc.specialization,
            bio: doc.bio,
            slotDurationMinutes: doc.slotDurationMinutes,
            workingHoursStart: doc.workingHoursStart,
            workingHoursEnd: doc.workingHoursEnd,
            consultationFee: doc.consultationFee,
            roomNumber: doc.roomNumber
          }
        }
      },
      include: { doctorProfile: true }
    });
    createdDoctors.push(user);
    console.log(`✅ Created Doctor: ${user.name} (${doc.specialization})`);
  }

  // 3. Create Patients
  const patient1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: passwordHash,
      role: 'PATIENT',
      phone: '+1 (555) 902-1234'
    }
  });

  const patient2 = await prisma.user.create({
    data: {
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: passwordHash,
      role: 'PATIENT',
      phone: '+1 (555) 902-5678'
    }
  });
  console.log(`✅ Created Patients: ${patient1.name}, ${patient2.name}`);

  // 4. Create Sample Past Completed Appointment with AI Pre and Post Summaries
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const completedApt = await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      doctorId: createdDoctors[0].id, // Dr. Sarah Jenkins (Cardiology)
      date: todayStr,
      startTime: '09:00',
      endTime: '09:30',
      status: 'COMPLETED',
      symptoms: 'Experiencing recurrent palpitations during evening workouts, slight chest tightness when climbing stairs, and occasional dizziness.'
    }
  });

  await prisma.preVisitSummary.create({
    data: {
      appointmentId: completedApt.id,
      urgencyLevel: 'MEDIUM',
      chiefComplaint: 'Recurrent exertional palpitations and mild chest tightness with stairs.',
      suggestedQuestions: JSON.stringify([
        'How long do the palpitations typically last and do they resolve with rest?',
        'Have you noticed any shortness of breath, lightheadedness, or swelling in your ankles?',
        'Do you consume high amounts of caffeine, pre-workout supplements, or energy drinks?'
      ]),
      rawResponse: 'Seeded AI analysis'
    }
  });

  const prescriptions = [
    {
      medicineName: 'Metoprolol Tartrate',
      dosage: '25mg',
      frequency: 'Twice daily',
      durationDays: 14,
      instructions: 'Take 1 tablet in the morning and 1 in the evening with food.',
      reminderTimes: ['09:00', '21:00']
    },
    {
      medicineName: 'CoQ10 Heart Support',
      dosage: '100mg',
      frequency: 'Once daily',
      durationDays: 30,
      instructions: 'Take with lunch.',
      reminderTimes: ['13:00']
    }
  ];

  await prisma.postVisitSummary.create({
    data: {
      appointmentId: completedApt.id,
      clinicalNotes: 'ECG demonstrates normal sinus rhythm with occasional benign PVCs. Blood pressure elevated at 138/88 mmHg. Commenced low-dose beta-blocker to stabilize rate. Holter monitor scheduled for next week.',
      prescriptionJson: JSON.stringify(prescriptions),
      patientFriendlySummary: 'Your heart examination showed mild irregular beats during physical exertion, which are common and treatable. We have prescribed a gentle heart medication (Metoprolol) to keep your pulse steady and relieve chest tightness. Please monitor your blood pressure daily.',
      followUpSteps: '1. Take Metoprolol twice daily with meals.\n2. Avoid intense cardio workouts and high caffeine for 1 week.\n3. Wear the 24-hour Holter monitor when picked up on Friday.\n4. Return for follow-up in 2 weeks.'
    }
  });

  // Create active medication reminders
  for (const rx of prescriptions) {
    await prisma.medicationReminder.create({
      data: {
        appointmentId: completedApt.id,
        patientId: patient1.id,
        medicineName: rx.medicineName,
        dosage: rx.dosage,
        frequency: rx.frequency,
        reminderTimes: JSON.stringify(rx.reminderTimes),
        instructions: rx.instructions,
        startDate: todayStr,
        endDate: new Date(Date.now() + rx.durationDays * 86400000).toISOString().split('T')[0],
        isActive: true
      }
    });
  }

  // 5. Create Sample Upcoming Booked Appointment for Alice
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const upcomingApt = await prisma.appointment.create({
    data: {
      patientId: patient2.id,
      doctorId: createdDoctors[1].id, // Dr. Marcus Chen (Dermatology)
      date: tomorrow,
      startTime: '10:00',
      endTime: '10:20',
      status: 'BOOKED',
      symptoms: 'Persistent dry, itchy rash across both inner elbows for the past 3 weeks. OTC hydrocortisone gives temporary relief only.'
    }
  });

  await prisma.preVisitSummary.create({
    data: {
      appointmentId: upcomingApt.id,
      urgencyLevel: 'LOW',
      chiefComplaint: 'Subacute erythematous pruritic rash on flexural elbows refractory to OTC steroids.',
      suggestedQuestions: JSON.stringify([
        'Have you switched soaps, detergents, cosmetics, or clothing fabrics recently?',
        'Does the itching intensify at night or after hot showers?',
        'Do you have a personal or family history of atopic eczema, asthma, or seasonal allergies?'
      ]),
      rawResponse: 'Seeded AI analysis'
    }
  });

  console.log('🎉 Database seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('👑 Admin:   admin@carepulse.com    / admin123');
  console.log('🩺 Doctor:  dr.sarah@carepulse.com / doctor123');
  console.log('🩺 Doctor:  dr.marcus@carepulse.com/ doctor123');
  console.log('👤 Patient: john@example.com       / password123');
  console.log('👤 Patient: alice@example.com      / password123');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
