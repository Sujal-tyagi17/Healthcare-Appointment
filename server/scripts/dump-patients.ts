import { prisma } from '../src/db.js';

async function main() {
  const patients = await prisma.user.findMany({
    where: { role: 'PATIENT' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      patientAppointments: {
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
          symptoms: true,
          doctor: {
            select: {
              name: true,
              email: true,
              doctorProfile: {
                select: {
                  specialization: true,
                  roomNumber: true,
                  consultationFee: true
                }
              }
            }
          },
          preVisitSummary: {
            select: {
              urgencyLevel: true,
              chiefComplaint: true,
              suggestedQuestions: true
            }
          },
          postVisitSummary: {
            select: {
              patientFriendlySummary: true,
              clinicalNotes: true,
              followUpSteps: true,
              prescriptionJson: true
            }
          }
        }
      },
      medicationReminders: {
        select: {
          id: true,
          medicineName: true,
          dosage: true,
          frequency: true,
          reminderTimes: true,
          instructions: true,
          startDate: true,
          endDate: true,
          isActive: true
        }
      }
    }
  });

  console.log(JSON.stringify(patients, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
