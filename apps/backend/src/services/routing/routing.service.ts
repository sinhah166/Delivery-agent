import { AssignmentService } from '../assignment/assignment.service';

interface RoutePoint {
  lat: number;
  lng: number;
}

interface RouteResult {
  distance: number;
  estimatedDuration: number;
  route: RoutePoint[];
  alternativeRoutes: Array<{
    distance: number;
    estimatedDuration: number;
    route: RoutePoint[];
  }>;
  recommendedRouteIndex: number;
}

// Routing provider interface — allows swapping real map APIs later
export interface RoutingProvider {
  getRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
  ): Promise<RouteResult>;
}

// Mock routing provider for demo
export class MockRoutingProvider implements RoutingProvider {
  async getRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
  ): Promise<RouteResult> {
    const distance = AssignmentService.calculateDistance(
      origin.lat, origin.lng,
      destination.lat, destination.lng
    );

    // Generate realistic route points (interpolation between origin and destination)
    const numPoints = Math.max(5, Math.ceil(distance * 3));
    const route = this.generateRoutePoints(origin, destination, numPoints);
    const altRoute = this.generateRoutePoints(origin, destination, numPoints + 3, 0.003);

    const speed = 18 + Math.random() * 8; // 18-26 km/h
    const estimatedDuration = Math.round((distance / speed) * 60);

    const altDistance = distance * (1.1 + Math.random() * 0.2);
    const altSpeed = 14 + Math.random() * 6;
    const altDuration = Math.round((altDistance / altSpeed) * 60);

    return {
      distance: Math.round(distance * 10) / 10,
      estimatedDuration,
      route,
      alternativeRoutes: [{
        distance: Math.round(altDistance * 10) / 10,
        estimatedDuration: altDuration,
        route: altRoute,
      }],
      recommendedRouteIndex: 0,
    };
  }

  private generateRoutePoints(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    numPoints: number,
    deviation: number = 0.001
  ): RoutePoint[] {
    const points: RoutePoint[] = [origin];

    for (let i = 1; i < numPoints - 1; i++) {
      const t = i / (numPoints - 1);
      const lat = origin.lat + (destination.lat - origin.lat) * t + (Math.random() - 0.5) * deviation;
      const lng = origin.lng + (destination.lng - origin.lng) * t + (Math.random() - 0.5) * deviation;
      points.push({ lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000 });
    }

    points.push(destination);
    return points;
  }
}

export class RoutingService {
  private static provider: RoutingProvider = new MockRoutingProvider();

  static setProvider(provider: RoutingProvider) {
    this.provider = provider;
  }

  static async getRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
  ): Promise<RouteResult> {
    return this.provider.getRoute(origin, destination);
  }
}
