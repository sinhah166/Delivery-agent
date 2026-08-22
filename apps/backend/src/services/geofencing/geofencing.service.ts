import { AssignmentService } from '../assignment/assignment.service';
import { config } from '../../config';

interface GeofenceResult {
  distanceMeters: number;
  isNear: boolean;
  isArrived: boolean;
  label: string;
}

export class GeofencingService {
  static checkProximity(
    agentLat: number,
    agentLng: number,
    targetLat: number,
    targetLng: number,
    type: 'pickup' | 'customer'
  ): GeofenceResult {
    const distanceKm = AssignmentService.calculateDistance(
      agentLat, agentLng, targetLat, targetLng
    );
    const distanceMeters = Math.round(distanceKm * 1000);

    const thresholds = type === 'pickup'
      ? { near: config.geofence.pickupNear, arrived: config.geofence.pickupArrived }
      : { near: config.geofence.customerNear, arrived: config.geofence.customerArrived };

    const isNear = distanceMeters <= thresholds.near;
    const isArrived = distanceMeters <= thresholds.arrived;

    let label = '';
    if (isArrived) {
      label = type === 'pickup' ? 'You have arrived at the pickup location' : 'You have arrived at the customer location';
    } else if (isNear) {
      label = type === 'pickup' ? `You are ${distanceMeters}m from the pickup` : `You are ${distanceMeters}m from the customer`;
    }

    return { distanceMeters, isNear, isArrived, label };
  }
}
