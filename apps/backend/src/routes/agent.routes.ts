import { Router, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest, authMiddleware } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware as any);

// GET /api/v1/agents/me
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.agent!.id },
      select: {
        id: true, name: true, phone: true, email: true, status: true,
        vehicleType: true, currentLatitude: true, currentLongitude: true,
        currentLoad: true, maxCapacity: true, rating: true,
        totalDeliveries: true, onTimeDeliveries: true,
        createdAt: true, updatedAt: true,
      },
    });

    return res.json({ success: true, data: agent });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch agent' },
    });
  }
});

// PATCH /api/v1/agents/me/status
router.patch('/me/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ['ONLINE', 'OFFLINE', 'BUSY', 'PAUSED', 'EMERGENCY'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid status' },
      });
    }

    const agent = await prisma.agent.update({
      where: { id: req.agent!.id },
      data: { status },
    });

    return res.json({ success: true, data: agent });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update status' },
    });
  }
});

// PATCH /api/v1/agents/me/location
router.patch('/me/location', async (req: AuthRequest, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    await prisma.agent.update({
      where: { id: req.agent!.id },
      data: { currentLatitude: latitude, currentLongitude: longitude },
    });

    return res.json({ success: true, data: { latitude, longitude } });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update location' },
    });
  }
});

// GET /api/v1/agents/me/performance
router.get('/me/performance', async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.agent!.id;

    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) throw new Error('Agent not found');

    const deliveries = await prisma.delivery.findMany({
      where: { agentId },
    });

    const completed = deliveries.filter(d => d.status === 'DELIVERED');
    const failed = deliveries.filter(d => ['FAILED', 'CANCELLED'].includes(d.status));
    const avgDeliveryTime = completed.length > 0
      ? Math.round(completed.reduce((sum, d) => sum + (d.actualDeliveryTime || 0), 0) / completed.length)
      : 0;

    return res.json({
      success: true,
      data: {
        totalDeliveries: agent.totalDeliveries,
        completedDeliveries: completed.length,
        onTimeDeliveries: agent.onTimeDeliveries,
        lateDeliveries: Math.max(0, completed.length - agent.onTimeDeliveries),
        failedDeliveries: failed.length,
        successRate: agent.totalDeliveries > 0
          ? Math.round((agent.onTimeDeliveries / agent.totalDeliveries) * 100)
          : 100,
        averageDeliveryTime: avgDeliveryTime,
        averagePickupTime: 4,
        rating: agent.rating,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch performance' },
    });
  }
});

export default router;
