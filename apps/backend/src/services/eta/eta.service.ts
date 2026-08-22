import { AssignmentService } from '../assignment/assignment.service';

interface ETAResult {
  etaMinutes: number;
  deadline: string;
  remainingBuffer: number;
  status: 'SAFE' | 'AT_RISK' | 'CRITICAL';
}

export class ETAService {
  static calculate(
    currentLat: number,
    currentLng: number,
    destinationLat: number,
    destinationLng: number,
    deadline: Date,
    trafficMultiplier: number = 1.0,
    pickupDelay: number = 0
  ): ETAResult {
    const distance = AssignmentService.calculateDistance(
      currentLat, currentLng, destinationLat, destinationLng
    );

    // Average city speed: 20 km/h, adjusted for traffic
    const speed = 20 / trafficMultiplier;
    const travelTime = (distance / speed) * 60; // minutes
    const etaMinutes = Math.round(travelTime + pickupDelay);

    const deadlineMs = deadline.getTime();
    const nowMs = Date.now();
    const deadlineMinutes = Math.round((deadlineMs - nowMs) / 60000);
    const remainingBuffer = deadlineMinutes - etaMinutes;

    let status: 'SAFE' | 'AT_RISK' | 'CRITICAL';
    if (remainingBuffer > 10) {
      status = 'SAFE';
    } else if (remainingBuffer > 0) {
      status = 'AT_RISK';
    } else {
      status = 'CRITICAL';
    }

    return {
      etaMinutes: Math.max(1, etaMinutes),
      deadline: deadline.toISOString(),
      remainingBuffer: Math.max(0, remainingBuffer),
      status,
    };
  }
}
