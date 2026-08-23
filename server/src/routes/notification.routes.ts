import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { retryFailedNotifications } from '../services/email.service.js';

const router = Router();

// List recent notification logs (useful for demo & admin inspections)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;
    const whereClause: any = {};
    if (status) whereClause.status = String(status);

    const logs = await prisma.notificationLog.findMany({
      where: whereClause,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Manual trigger retry queue
router.post('/retry', requireAuth, async (_req, res) => {
  try {
    const retriedCount = await retryFailedNotifications();
    return res.json({ success: true, message: `Retried ${retriedCount} queued notification(s).`, retriedCount });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
