import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.middleware';
import { DeliveryService } from '../services/delivery/delivery.service';
import { RiskService } from '../services/risk/risk.service';
import { RoutingService } from '../services/routing/routing.service';
import { ETAService } from '../services/eta/eta.service';
import { GeofencingService } from '../services/geofencing/geofencing.service';
import { ReassignmentService } from '../services/reassignment/reassignment.service';
import prisma from '../config/database';

const router = Router();
router.use(authMiddleware as any);

// GET /api/v1/deliveries
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const filter = req.query.status as string | undefined;
    const deliveries = await DeliveryService.getAgentDeliveries(req.agent!.id, filter);
    return res.json({ success: true, data: deliveries });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch deliveries' },
    });
  }
});

// GET /api/v1/deliveries/active
router.get('/active', async (req: AuthRequest, res: Response) => {
  try {
    const delivery = await DeliveryService.getActiveDelivery(req.agent!.id);
    return res.json({ success: true, data: delivery });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch active delivery' },
    });
  }
});

// GET /api/v1/deliveries/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const delivery = await DeliveryService.getDeliveryById(req.params.id, req.agent!.id);
    return res.json({ success: true, data: delivery });
  } catch (error: any) {
    if (error.message === 'DELIVERY_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Delivery not found' },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch delivery' },
    });
  }
});

// POST /api/v1/deliveries/:id/accept
router.post('/:id/accept', async (req: AuthRequest, res: Response) => {
  try {
    const delivery = await DeliveryService.transitionDelivery(
      req.params.id, req.agent!.id, 'ACCEPTED', 'ACCEPTED'
    );
    return res.json({ success: true, data: delivery });
  } catch (error: any) {
    if (error.message === 'INVALID_STATE_TRANSITION') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE_TRANSITION', message: 'Cannot accept this delivery in its current state' },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// POST /api/v1/deliveries/:id/start-pickup
router.post('/:id/start-pickup', async (req: AuthRequest, res: Response) => {
  try {
    const delivery = await DeliveryService.transitionDelivery(
      req.params.id, req.agent!.id, 'GOING_TO_PICKUP', 'ROUTE_STARTED',
      { phase: 'pickup' }
    );
    return res.json({ success: true, data: delivery });
  } catch (error: any) {
    if (error.message === 'INVALID_STATE_TRANSITION') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE_TRANSITION', message: 'Cannot start pickup from current state' },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// POST /api/v1/deliveries/:id/arrive-pickup
router.post('/:id/arrive-pickup', async (req: AuthRequest, res: Response) => {
  try {
    const delivery = await DeliveryService.transitionDelivery(
      req.params.id, req.agent!.id, 'ARRIVED_AT_PICKUP', 'ARRIVED_PICKUP',
      undefined, req.body.location
    );
    return res.json({ success: true, data: delivery });
  } catch (error: any) {
    if (error.message === 'INVALID_STATE_TRANSITION') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE_TRANSITION', message: 'Cannot mark arrival at pickup from current state' },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// POST /api/v1/deliveries/:id/verify-pickup
router.post('/:id/verify-pickup', async (req: AuthRequest, res: Response) => {
  try {
    const delivery = await DeliveryService.transitionDelivery(
      req.params.id, req.agent!.id, 'PICKUP_VERIFICATION', 'PICKUP_VERIFIED',
      { verification: req.body.verification }
    );
    return res.json({ success: true, data: delivery });
  } catch (error: any) {
    if (error.message === 'INVALID_STATE_TRANSITION') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE_TRANSITION', message: 'Cannot verify pickup from current state' },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// POST /api/v1/deliveries/:id/confirm-pickup
router.post('/:id/confirm-pickup', async (req: AuthRequest, res: Response) => {
  try {
    const delivery = await DeliveryService.transitionDelivery(
      req.params.id, req.agent!.id, 'PICKED_UP', 'PACKAGE_COLLECTED',
      { verification: req.body.verification }
    );
    return res.json({ success: true, data: delivery });
  } catch (error: any) {
    if (error.message === 'INVALID_STATE_TRANSITION') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE_TRANSITION', message: 'Cannot confirm pickup from current state' },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// POST /api/v1/deliveries/:id/start-delivery
router.post('/:id/start-delivery', async (req: AuthRequest, res: Response) => {
  try {
    const delivery = await DeliveryService.transitionDelivery(
      req.params.id, req.agent!.id, 'IN_TRANSIT', 'ROUTE_STARTED',
      { phase: 'delivery' }
    );
    return res.json({ success: true, data: delivery });
  } catch (error: any) {
    if (error.message === 'INVALID_STATE_TRANSITION') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE_TRANSITION', message: 'Cannot start delivery from current state' },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// POST /api/v1/deliveries/:id/arrive-customer
router.post('/:id/arrive-customer', async (req: AuthRequest, res: Response) => {
  try {
    const delivery = await DeliveryService.transitionDelivery(
      req.params.id, req.agent!.id, 'ARRIVED_AT_CUSTOMER', 'ARRIVED_CUSTOMER',
      undefined, req.body.location
    );
    return res.json({ success: true, data: delivery });
  } catch (error: any) {
    if (error.message === 'INVALID_STATE_TRANSITION') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE_TRANSITION', message: 'Cannot mark arrival at customer from current state' },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// POST /api/v1/deliveries/:id/verify-delivery
router.post('/:id/verify-delivery', async (req: AuthRequest, res: Response) => {
  try {
    const { otp } = req.body;

    // First verify OTP
    await DeliveryService.verifyOTP(req.params.id, req.agent!.id, otp);

    // Then transition to DELIVERY_VERIFICATION
    const delivery = await DeliveryService.transitionDelivery(
      req.params.id, req.agent!.id, 'DELIVERY_VERIFICATION', 'OTP_VERIFIED',
      { method: 'OTP' }
    );
    return res.json({ success: true, data: delivery });
  } catch (error: any) {
    if (error.message === 'INVALID_OTP') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_OTP', message: 'The OTP entered is incorrect' },
      });
    }
    if (error.message === 'INVALID_STATE_TRANSITION') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE_TRANSITION', message: 'Cannot verify delivery from current state' },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// POST /api/v1/deliveries/:id/complete
router.post('/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const delivery = await DeliveryService.transitionDelivery(
      req.params.id, req.agent!.id, 'DELIVERED', 'DELIVERED',
      undefined, req.body.location
    );
    return res.json({ success: true, data: delivery });
  } catch (error: any) {
    if (error.message === 'INVALID_STATE_TRANSITION') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE_TRANSITION', message: 'Delivery cannot be completed before customer verification' },
      });
    }
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message },
    });
  }
});

// POST /api/v1/deliveries/:id/exception
router.post('/:id/exception', async (req: AuthRequest, res: Response) => {
  try {
    const { type, category, severity, latitude, longitude, recommendedAction } = req.body;

    const exception = await prisma.deliveryException.create({
      data: {
        deliveryId: req.params.id,
        agentId: req.agent!.id,
        type,
        category,
        severity,
        latitude,
        longitude,
        recommendedAction: recommendedAction || 'Contact support',
      },
    });

    // Also create a delivery event
    await prisma.deliveryEvent.create({
      data: {
        deliveryId: req.params.id,
        eventType: 'EXCEPTION_REPORTED',
        latitude,
        longitude,
        metadata: JSON.stringify({ exceptionType: type, severity }),
      },
    });

    return res.json({ success: true, data: exception });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to report exception' },
    });
  }
});

// GET /api/v1/deliveries/:id/risk
router.get('/:id/risk', async (req: AuthRequest, res: Response) => {
  try {
    const trafficMultiplier = parseFloat(req.query.traffic as string) || 1.0;
    const risk = await RiskService.assessDeliveryRisk(req.params.id, trafficMultiplier);
    return res.json({ success: true, data: risk });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to assess risk' },
    });
  }
});

// GET /api/v1/deliveries/:id/route
router.get('/:id/route', async (req: AuthRequest, res: Response) => {
  try {
    const delivery = await prisma.delivery.findFirst({
      where: { id: req.params.id, agentId: req.agent!.id },
      include: {
        order: { include: { vendor: true, customer: true } },
        agent: true,
      },
    });

    if (!delivery || !delivery.order) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Delivery not found' },
      });
    }

    const isBeforePickup = ['ASSIGNED', 'ACCEPTED', 'GOING_TO_PICKUP'].includes(delivery.status);
    const destination = isBeforePickup
      ? { lat: delivery.order.vendor!.latitude, lng: delivery.order.vendor!.longitude }
      : { lat: delivery.order.customer!.latitude, lng: delivery.order.customer!.longitude };

    const route = await RoutingService.getRoute(
      { lat: delivery.agent!.currentLatitude, lng: delivery.agent!.currentLongitude },
      destination
    );

    // Also get ETA
    const eta = ETAService.calculate(
      delivery.agent!.currentLatitude,
      delivery.agent!.currentLongitude,
      destination.lat,
      destination.lng,
      new Date(delivery.order.deliveryDeadline)
    );

    return res.json({ success: true, data: { route, eta } });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate route' },
    });
  }
});

// POST /api/v1/deliveries/:id/reassign
router.post('/:id/reassign', async (req: AuthRequest, res: Response) => {
  try {
    const candidates = await ReassignmentService.findReplacementAgents(
      req.params.id, req.agent!.id
    );

    if (req.body.execute && req.body.newAgentId) {
      const result = await ReassignmentService.reassignDelivery(
        req.params.id, req.agent!.id, req.body.newAgentId
      );
      return res.json({ success: true, data: { delivery: result, candidates } });
    }

    return res.json({ success: true, data: { candidates } });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process reassignment' },
    });
  }
});

// POST /api/v1/deliveries/:id/simulate-traffic
router.post('/:id/simulate-traffic', async (req: AuthRequest, res: Response) => {
  try {
    const risk = await RiskService.assessDeliveryRisk(req.params.id, 2.0);

    const delivery = await prisma.delivery.findUnique({
      where: { id: req.params.id },
      include: { order: { include: { vendor: true, customer: true } }, agent: true },
    });

    if (!delivery?.agent || !delivery?.order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Delivery not found' } });
    }

    const isBeforePickup = ['ASSIGNED', 'ACCEPTED', 'GOING_TO_PICKUP'].includes(delivery.status);
    const dest = isBeforePickup
      ? { lat: delivery.order.vendor!.latitude, lng: delivery.order.vendor!.longitude }
      : { lat: delivery.order.customer!.latitude, lng: delivery.order.customer!.longitude };

    const route = await RoutingService.getRoute(
      { lat: delivery.agent.currentLatitude, lng: delivery.agent.currentLongitude },
      dest
    );

    const eta = ETAService.calculate(
      delivery.agent.currentLatitude, delivery.agent.currentLongitude,
      dest.lat, dest.lng,
      new Date(delivery.order.deliveryDeadline),
      2.0
    );

    // Record event
    await prisma.deliveryEvent.create({
      data: {
        deliveryId: req.params.id,
        eventType: 'RISK_DETECTED',
        metadata: JSON.stringify({ simulation: 'traffic', riskScore: risk.riskScore }),
      },
    });

    return res.json({
      success: true,
      data: {
        risk,
        route,
        eta,
        message: 'Traffic simulation applied: ETA recalculated, risk score updated, alternative route generated',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to simulate traffic' },
    });
  }
});

export default router;
