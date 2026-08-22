import prisma from '../../config/database';
import { AssignmentService } from '../assignment/assignment.service';

interface RiskAssessment {
  riskScore: number;
  riskLevel: string;
  reasons: string[];
  recommendedAction: string | null;
}

export class RiskService {
  static async assessDeliveryRisk(
    deliveryId: string,
    trafficMultiplier: number = 1.0
  ): Promise<RiskAssessment> {
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: { include: { vendor: true, customer: true } },
        agent: true,
      },
    });

    if (!delivery || !delivery.order || !delivery.agent) {
      return { riskScore: 0, riskLevel: 'SAFE', reasons: [], recommendedAction: null };
    }

    let riskScore = 0;
    const reasons: string[] = [];

    // 1. ETA vs Deadline
    const now = new Date();
    const deadline = new Date(delivery.order.deliveryDeadline);
    const minutesRemaining = (deadline.getTime() - now.getTime()) / 60000;

    if (minutesRemaining < 0) {
      riskScore += 40;
      reasons.push('Delivery deadline has passed');
    } else if (minutesRemaining < 5) {
      riskScore += 30;
      reasons.push(`Only ${Math.round(minutesRemaining)} minutes remaining before SLA breach`);
    } else if (minutesRemaining < 15) {
      riskScore += 15;
      reasons.push(`${Math.round(minutesRemaining)} minutes remaining before deadline`);
    }

    // 2. Traffic impact
    if (trafficMultiplier > 1.5) {
      riskScore += 20;
      reasons.push('Heavy traffic detected on route');
    } else if (trafficMultiplier > 1.2) {
      riskScore += 10;
      reasons.push('Moderate traffic on route');
    }

    // 3. Agent workload
    if (delivery.agent.currentLoad >= delivery.agent.maxCapacity) {
      riskScore += 15;
      reasons.push('Agent at maximum delivery capacity');
    } else if (delivery.agent.currentLoad > delivery.agent.maxCapacity * 0.7) {
      riskScore += 8;
      reasons.push('Agent workload is high');
    }

    // 4. Distance remaining
    const destLat = delivery.status.includes('PICKUP')
      ? delivery.order.vendor?.latitude || 0
      : delivery.order.customer?.latitude || 0;
    const destLng = delivery.status.includes('PICKUP')
      ? delivery.order.vendor?.longitude || 0
      : delivery.order.customer?.longitude || 0;

    const distance = AssignmentService.calculateDistance(
      delivery.agent.currentLatitude,
      delivery.agent.currentLongitude,
      destLat,
      destLng
    );

    if (distance > 5) {
      riskScore += 12;
      reasons.push(`Agent is ${distance.toFixed(1)} km from destination`);
    }

    // 5. Priority escalation
    if (delivery.order.priority === 'URGENT') {
      riskScore += 10;
      reasons.push('Urgent priority delivery');
    } else if (delivery.order.priority === 'HIGH') {
      riskScore += 5;
    }

    // Clamp 0-100
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Determine level
    let riskLevel: string;
    if (riskScore <= 30) riskLevel = 'SAFE';
    else if (riskScore <= 60) riskLevel = 'AT_RISK';
    else if (riskScore <= 80) riskLevel = 'HIGH_RISK';
    else riskLevel = 'CRITICAL';

    // Recommended action
    let recommendedAction: string | null = null;
    if (riskLevel === 'CRITICAL') {
      recommendedAction = 'Consider reassigning delivery to a closer agent';
    } else if (riskLevel === 'HIGH_RISK') {
      recommendedAction = 'Switch to alternative route to save time';
    } else if (riskLevel === 'AT_RISK') {
      recommendedAction = 'Monitor delivery closely';
    }

    // Update delivery risk
    await prisma.delivery.update({
      where: { id: deliveryId },
      data: { riskScore, riskLevel, distanceRemaining: Math.round(distance * 10) / 10 },
    });

    return { riskScore, riskLevel, reasons, recommendedAction };
  }

  static getRiskColor(level: string): string {
    switch (level) {
      case 'SAFE': return '#22c55e';
      case 'AT_RISK': return '#f59e0b';
      case 'HIGH_RISK': return '#f97316';
      case 'CRITICAL': return '#ef4444';
      default: return '#6b7280';
    }
  }
}
