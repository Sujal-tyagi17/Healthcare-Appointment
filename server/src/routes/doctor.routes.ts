import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Helper to generate time slots
function generateSlots(startTime: string, endTime: string, durationMinutes: number): { start: string; end: string }[] {
  const slots: { start: string; end: string }[] = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let currentMin = startH * 60 + startM;
  const endTotalMin = endH * 60 + endM;

  while (currentMin + durationMinutes <= endTotalMin) {
    const slotStartH = Math.floor(currentMin / 60);
    const slotStartM = currentMin % 60;
    const slotEndMin = currentMin + durationMinutes;
    const slotEndH = Math.floor(slotEndMin / 60);
    const slotEndM = slotEndMin % 60;

    const formatTime = (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    slots.push({
      start: formatTime(slotStartH, slotStartM),
      end: formatTime(slotEndH, slotEndM)
    });

    currentMin += durationMinutes;
  }

  return slots;
}

// 1. List all doctors with search and specialization filter
router.get('/', async (req, res) => {
  try {
    const { search, specialization } = req.query;

    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        doctorProfile: { isNot: null }
      },
      include: {
        doctorProfile: true,
        doctorLeaves: {
          select: { leaveDate: true, reason: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    let filtered = doctors;

    // Filter by specialization if not ALL
    if (specialization && String(specialization).trim().toUpperCase() !== 'ALL') {
      const specFilter = String(specialization).trim().toLowerCase();
      filtered = filtered.filter(doc => 
        doc.doctorProfile?.specialization?.toLowerCase() === specFilter
      );
    }

    // Case-insensitive search across name, specialization, bio, and room
    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      filtered = filtered.filter(doc => {
        const nameMatch = doc.name?.toLowerCase().includes(q);
        const specMatch = doc.doctorProfile?.specialization?.toLowerCase().includes(q);
        const bioMatch = doc.doctorProfile?.bio?.toLowerCase().includes(q);
        const roomMatch = doc.doctorProfile?.roomNumber?.toLowerCase().includes(q);
        return nameMatch || specMatch || bioMatch || roomMatch;
      });
    }

    const formatted = filtered.map(doc => ({
      id: doc.id,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      specialization: doc.doctorProfile?.specialization || 'General Medicine',
      bio: doc.doctorProfile?.bio,
      slotDurationMinutes: doc.doctorProfile?.slotDurationMinutes || 30,
      workingHoursStart: doc.doctorProfile?.workingHoursStart || '09:00',
      workingHoursEnd: doc.doctorProfile?.workingHoursEnd || '17:00',
      consultationFee: doc.doctorProfile?.consultationFee || 50,
      roomNumber: doc.doctorProfile?.roomNumber || 'Room 101',
      leaves: doc.doctorLeaves.map(l => l.leaveDate)
    }));

    return res.json({ success: true, doctors: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Get distinct specializations
router.get('/specializations', async (_req, res) => {
  try {
    const profiles = await prisma.doctorProfile.findMany({
      select: { specialization: true },
      distinct: ['specialization']
    });
    const list = profiles.map(p => p.specialization).filter(Boolean);
    return res.json({ success: true, specializations: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Get doctor schedule & available slots for a specific date
router.get('/:doctorId/availability', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter (YYYY-MM-DD) is required.' });
    }

    const dateStr = String(date);
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      include: { doctorProfile: true }
    });

    if (!doctor || !doctor.doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    // Check if doctor is on leave on this date
    const leave = await prisma.doctorLeave.findUnique({
      where: {
        doctorId_leaveDate: { doctorId, leaveDate: dateStr }
      }
    });

    if (leave) {
      return res.json({
        success: true,
        isOnLeave: true,
        leaveReason: leave.reason || 'Doctor is on approved leave.',
        slots: []
      });
    }

    const { workingHoursStart, workingHoursEnd, slotDurationMinutes } = doctor.doctorProfile;
    const allSlots = generateSlots(workingHoursStart, workingHoursEnd, slotDurationMinutes);

    // Fetch existing active bookings on that date
    const existingBookings = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: dateStr,
        status: { in: ['BOOKED', 'COMPLETED', 'REQUIRES_RESCHEDULE'] }
      },
      select: { startTime: true, endTime: true, status: true }
    });

    const bookedTimes = new Set(existingBookings.map(b => b.startTime));

    // Fetch active slot holds
    const activeHolds = await prisma.slotHold.findMany({
      where: {
        doctorId,
        date: dateStr,
        expiresAt: { gt: new Date() }
      },
      select: { startTime: true, holdToken: true, patientId: true }
    });

    const heldTimes = new Map(activeHolds.map(h => [h.startTime, h.patientId]));

    const computedSlots = allSlots.map(slot => {
      const isBooked = bookedTimes.has(slot.start);
      const isHeld = heldTimes.has(slot.start);
      return {
        startTime: slot.start,
        endTime: slot.end,
        isAvailable: !isBooked && !isHeld,
        isHeld: isHeld,
        status: isBooked ? 'BOOKED' : isHeld ? 'HELD' : 'AVAILABLE'
      };
    });

    return res.json({
      success: true,
      isOnLeave: false,
      date: dateStr,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialization: doctor.doctorProfile.specialization,
        roomNumber: doctor.doctorProfile.roomNumber,
        consultationFee: doctor.doctorProfile.consultationFee
      },
      slots: computedSlots
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
