// ============================================
// RailQuick Delivery Agent — Shared Types
// ============================================

// ---- Agent ----
export enum AgentStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  BUSY = 'BUSY',
  PAUSED = 'PAUSED',
  EMERGENCY = 'EMERGENCY',
}

export enum VehicleType {
  BIKE = 'BIKE',
  SCOOTER = 'SCOOTER',
  CAR = 'CAR',
  VAN = 'VAN',
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: AgentStatus;
  vehicleType: VehicleType;
  currentLatitude: number;
  currentLongitude: number;
  currentLoad: number;
  maxCapacity: number;
  rating: number;
  totalDeliveries: number;
  onTimeDeliveries: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Vendor ----
export enum VendorStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  BUSY = 'BUSY',
  UNAVAILABLE = 'UNAVAILABLE',
}

export interface Vendor {
  id: string;
  name: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  status: VendorStatus;
  averagePickupTime: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Customer ----
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  deliveryInstructions: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---- Order ----
export enum OrderPriority {
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum OrderStatus {
  CREATED = 'CREATED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  vendorId: string;
  priority: OrderPriority;
  status: OrderStatus;
  pickupDeadline: string;
  deliveryDeadline: string;
  pnr: string | null;
  trainNumber: string | null;
  trainName: string | null;
  coach: string | null;
  seat: string | null;
  stationCode: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  vendor?: Vendor;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  name: string;
  quantity: number;
  sku: string;
}

// ---- Delivery ----
export enum DeliveryStatus {
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  GOING_TO_PICKUP = 'GOING_TO_PICKUP',
  ARRIVED_AT_PICKUP = 'ARRIVED_AT_PICKUP',
  PICKUP_VERIFICATION = 'PICKUP_VERIFICATION',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED_AT_CUSTOMER = 'ARRIVED_AT_CUSTOMER',
  DELIVERY_VERIFICATION = 'DELIVERY_VERIFICATION',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum RiskLevel {
  SAFE = 'SAFE',
  AT_RISK = 'AT_RISK',
  HIGH_RISK = 'HIGH_RISK',
  CRITICAL = 'CRITICAL',
}

export interface Delivery {
  id: string;
  orderId: string;
  agentId: string;
  status: DeliveryStatus;
  assignedAt: string;
  acceptedAt: string | null;
  pickupStartedAt: string | null;
  pickedUpAt: string | null;
  deliveryStartedAt: string | null;
  arrivedAt: string | null;
  deliveredAt: string | null;
  estimatedDeliveryTime: number | null;
  actualDeliveryTime: number | null;
  riskScore: number;
  riskLevel: RiskLevel;
  distanceRemaining: number | null;
  otp: string | null;
  order?: Order;
  agent?: Agent;
  events?: DeliveryEvent[];
}

// ---- Delivery Event ----
export enum DeliveryEventType {
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  ARRIVED_PICKUP = 'ARRIVED_PICKUP',
  PICKUP_VERIFIED = 'PICKUP_VERIFIED',
  PACKAGE_COLLECTED = 'PACKAGE_COLLECTED',
  ROUTE_STARTED = 'ROUTE_STARTED',
  ROUTE_CHANGED = 'ROUTE_CHANGED',
  RISK_DETECTED = 'RISK_DETECTED',
  REASSIGNED = 'REASSIGNED',
  ARRIVED_CUSTOMER = 'ARRIVED_CUSTOMER',
  OTP_VERIFIED = 'OTP_VERIFIED',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  EXCEPTION_REPORTED = 'EXCEPTION_REPORTED',
}

export interface DeliveryEvent {
  id: string;
  deliveryId: string;
  eventType: DeliveryEventType;
  latitude: number | null;
  longitude: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// ---- Risk ----
export interface RiskAssessment {
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  recommendedAction: string | null;
}

// ---- Route ----
export interface RouteInfo {
  distance: number;
  estimatedDuration: number;
  route: Array<{ lat: number; lng: number }>;
  alternativeRoutes: Array<{
    distance: number;
    estimatedDuration: number;
    route: Array<{ lat: number; lng: number }>;
  }>;
  recommendedRouteIndex: number;
}

// ---- ETA ----
export interface ETAInfo {
  etaMinutes: number;
  deadline: string;
  remainingBuffer: number;
  status: 'SAFE' | 'AT_RISK' | 'CRITICAL';
}

// ---- Exception ----
export enum ExceptionCategory {
  PICKUP = 'PICKUP',
  TRANSIT = 'TRANSIT',
  DELIVERY = 'DELIVERY',
}

export enum ExceptionType {
  // Pickup
  VENDOR_CLOSED = 'VENDOR_CLOSED',
  ITEM_UNAVAILABLE = 'ITEM_UNAVAILABLE',
  WRONG_ITEM = 'WRONG_ITEM',
  PACKAGE_DAMAGED = 'PACKAGE_DAMAGED',
  VENDOR_DELAY = 'VENDOR_DELAY',
  // Transit
  HEAVY_TRAFFIC = 'HEAVY_TRAFFIC',
  ROAD_BLOCKED = 'ROAD_BLOCKED',
  GPS_UNAVAILABLE = 'GPS_UNAVAILABLE',
  VEHICLE_ISSUE = 'VEHICLE_ISSUE',
  AGENT_OFFLINE = 'AGENT_OFFLINE',
  // Delivery
  CUSTOMER_UNAVAILABLE = 'CUSTOMER_UNAVAILABLE',
  CUSTOMER_UNREACHABLE = 'CUSTOMER_UNREACHABLE',
  WRONG_ADDRESS = 'WRONG_ADDRESS',
  LOCATION_INACCESSIBLE = 'LOCATION_INACCESSIBLE',
  CUSTOMER_REJECTED = 'CUSTOMER_REJECTED',
}

export enum ExceptionSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface DeliveryException {
  id: string;
  deliveryId: string;
  agentId: string;
  type: ExceptionType;
  category: ExceptionCategory;
  severity: ExceptionSeverity;
  latitude: number | null;
  longitude: number | null;
  recommendedAction: string;
  status: 'OPEN' | 'RESOLVED' | 'ESCALATED';
  createdAt: string;
}

// ---- Performance ----
export interface AgentPerformance {
  totalDeliveries: number;
  completedDeliveries: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  failedDeliveries: number;
  successRate: number;
  averageDeliveryTime: number;
  averagePickupTime: number;
}

// ---- API ----
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// ---- State Machine ----
export const VALID_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  [DeliveryStatus.ASSIGNED]: [DeliveryStatus.ACCEPTED, DeliveryStatus.CANCELLED],
  [DeliveryStatus.ACCEPTED]: [DeliveryStatus.GOING_TO_PICKUP, DeliveryStatus.CANCELLED],
  [DeliveryStatus.GOING_TO_PICKUP]: [DeliveryStatus.ARRIVED_AT_PICKUP, DeliveryStatus.CANCELLED],
  [DeliveryStatus.ARRIVED_AT_PICKUP]: [DeliveryStatus.PICKUP_VERIFICATION, DeliveryStatus.CANCELLED],
  [DeliveryStatus.PICKUP_VERIFICATION]: [DeliveryStatus.PICKED_UP, DeliveryStatus.FAILED],
  [DeliveryStatus.PICKED_UP]: [DeliveryStatus.IN_TRANSIT],
  [DeliveryStatus.IN_TRANSIT]: [DeliveryStatus.ARRIVED_AT_CUSTOMER, DeliveryStatus.FAILED],
  [DeliveryStatus.ARRIVED_AT_CUSTOMER]: [DeliveryStatus.DELIVERY_VERIFICATION],
  [DeliveryStatus.DELIVERY_VERIFICATION]: [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED],
  [DeliveryStatus.DELIVERED]: [],
  [DeliveryStatus.FAILED]: [],
  [DeliveryStatus.CANCELLED]: [],
};
