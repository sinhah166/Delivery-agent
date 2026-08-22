import prisma from '../../config/database';
import { AssignmentService } from '../assignment/assignment.service';

interface ReassignmentCandidate {
  agentId: string;
  agentName: string;
  distance: number;
  eta: number;
  currentLoad: number;
  riskLevel: string;
}

export class ReassignmentService {
  static async findReplacementAgents(
    deliveryId: string,
    excludeAgentId: string
  ): Promise<ReassignmentCandidate[]> {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: { include: { vendor: true, customer: true } },
      },
    });

    if (!delivery || !delivery.order) return [];

    // Determine current destination based on status
    const isBeforePickup = ['ASSIGNED', 'ACCEPTED', 'GOING_TO_PICKUP'].includes(delivery.status);
    const destLat = isBeforePickup
      ? delivery.order.vendor?.latitude || 0
      : delivery.order.customer?.latitude || 0;
    const destLng = isBeforePickup
      ? delivery.order.vendor?.longitude || 0
      : delivery.order.customer?.longitude || 0;

    const agents = await prisma.agent.findMany({
      where: {
        status: 'ONLINE',
        id: { not: excludeAgentId },
      },
    });

    const candidates: ReassignmentCandidate[] = [];

    for (const agent of agents) {
      if (agent.currentLoad >= agent.maxCapacity) continue;

      const distance = AssignmentService.calculateDistance(
        agent.currentLatitude, agent.currentLongitude,
        destLat, destLng
      );

      const eta = Math.round((distance / 20) * 60);

      const deadline = new Date(delivery.order.deliveryDeadline);
      const buffer = (deadline.getTime() - Date.now()) / 60000 - eta;

      let riskLevel: string;
      if (buffer > 10) riskLevel = 'SAFE';
      else if (buffer > 0) riskLevel = 'AT_RISK';
      else riskLevel = 'HIGH_RISK';

      candidates.push({
        agentId: agent.id,
        agentName: agent.name,
        distance: Math.round(distance * 10) / 10,
        eta,
        currentLoad: agent.currentLoad,
        riskLevel,
      });
    }

    // Sort by distance
    candidates.sort((a, b) => a.distance - b.distance);
    return candidates;
  }

  static async reassignDelivery(deliveryId: string, currentAgentId: string, newAgentId: string) {
    // Update delivery
    const delivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        agentId: newAgentId,
        status: 'ASSIGNED',
        acceptedAt: null,
        pickupStartedAt: null,
      },
      include: {
        order: { include: { vendor: true, customer: true, items: true } },
      },
    });

    // Decrease old agent load, create event
    await prisma.agent.update({
      where: { id: currentAgentId },
      data: { currentLoad: { decrement: 1 } },
    });

    await prisma.deliveryEvent.create({
      data: {
        deliveryId,
        eventType: 'REASSIGNED',
        metadata: JSON.stringify({
          fromAgent: currentAgentId,
          toAgent: newAgentId,
          reason: 'Agent unavailable or delivery at risk',
        }),
      },
    });

    return delivery;
  }
}
