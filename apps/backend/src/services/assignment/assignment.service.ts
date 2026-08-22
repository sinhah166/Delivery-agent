import prisma from '../../config/database';
import { config } from '../../config';

interface AssignmentCandidate {
  agentId: string;
  agentName: string;
  distance: number;
  estimatedTravelTime: number;
  currentLoad: number;
  maxCapacity: number;
  score: number;
  breakdown: Record<string, number>;
}

export class AssignmentService {
  // Calculate distance between two coordinates (Haversine)
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Find best agent for a delivery
  static async findBestAgent(vendorLat: number, vendorLon: number, priority: string, deadline: Date): Promise<AssignmentCandidate[]> {
    const agents = await prisma.agent.findMany({
      where: {
        status: 'ONLINE',
      },
    });

    if (agents.length === 0) return [];

    const weights = config.assignment;
    const candidates: AssignmentCandidate[] = [];

    for (const agent of agents) {
      // Skip agents at capacity
      if (agent.currentLoad >= agent.maxCapacity) continue;

      const distance = this.calculateDistance(
        agent.currentLatitude, agent.currentLongitude,
        vendorLat, vendorLon
      );

      // Estimate travel time (avg speed 20 km/h in city)
      const estimatedTravelTime = (distance / 20) * 60; // minutes

      // Time until deadline
      const timeUntilDeadline = (deadline.getTime() - Date.now()) / 60000; // minutes
      const slaRisk = timeUntilDeadline > 0
        ? Math.max(0, 1 - (timeUntilDeadline - estimatedTravelTime) / timeUntilDeadline)
        : 1;

      // Normalize factors (0-1, lower is better)
      const maxDistance = 10; // 10km max
      const distanceScore = Math.min(distance / maxDistance, 1);
      const travelTimeScore = Math.min(estimatedTravelTime / 60, 1); // 60 min max
      const workloadScore = agent.currentLoad / agent.maxCapacity;
      const capacityScore = agent.currentLoad >= agent.maxCapacity ? 1 : agent.currentLoad / agent.maxCapacity;

      // Priority multiplier (urgent gets extra SLA weight)
      const priorityMultiplier = priority === 'URGENT' ? 1.5 : priority === 'HIGH' ? 1.2 : 1;

      const score =
        travelTimeScore * weights.travelTimeWeight +
        distanceScore * weights.distanceWeight +
        workloadScore * weights.workloadWeight +
        (slaRisk * priorityMultiplier) * weights.slaRiskWeight +
        capacityScore * weights.capacityWeight;

      candidates.push({
        agentId: agent.id,
        agentName: agent.name,
        distance: Math.round(distance * 10) / 10,
        estimatedTravelTime: Math.round(estimatedTravelTime),
        currentLoad: agent.currentLoad,
        maxCapacity: agent.maxCapacity,
        score: Math.round(score * 100) / 100,
        breakdown: {
          travelTime: Math.round(travelTimeScore * 100),
          distance: Math.round(distanceScore * 100),
          workload: Math.round(workloadScore * 100),
          slaRisk: Math.round(slaRisk * 100),
          capacity: Math.round(capacityScore * 100),
        },
      });
    }

    // Sort by score (lower is better)
    candidates.sort((a, b) => a.score - b.score);

    return candidates;
  }

  // Auto-assign delivery to best agent
  static async autoAssign(orderId: string): Promise<AssignmentCandidate | null> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { vendor: true },
    });

    if (!order || !order.vendor) return null;

    const candidates = await this.findBestAgent(
      order.vendor.latitude,
      order.vendor.longitude,
      order.priority,
      new Date(order.deliveryDeadline)
    );

    if (candidates.length === 0) return null;

    const best = candidates[0];

    // Create delivery + OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await prisma.delivery.create({
      data: {
        orderId,
        agentId: best.agentId,
        status: 'ASSIGNED',
        otp,
        estimatedDeliveryTime: best.estimatedTravelTime + 10, // +10 min for pickup
        distanceRemaining: best.distance,
        riskScore: 0,
        riskLevel: 'SAFE',
      },
    });

    // Create assignment event
    await prisma.deliveryEvent.create({
      data: {
        deliveryId: (await prisma.delivery.findFirst({
          where: { orderId, agentId: best.agentId },
          orderBy: { createdAt: 'desc' },
        }))!.id,
        eventType: 'ASSIGNED',
        metadata: JSON.stringify({ score: best.score, breakdown: best.breakdown }),
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'ASSIGNED' },
    });

    return best;
  }
}
