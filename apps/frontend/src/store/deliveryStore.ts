import { create } from 'zustand';

export interface DeliveryData {
  id: string;
  orderId: string;
  agentId: string;
  status: string;
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
  riskLevel: string;
  distanceRemaining: number | null;
  otp: string | null;
  order?: {
    id: string;
    orderNumber: string;
    priority: string;
    status: string;
    pickupDeadline: string;
    deliveryDeadline: string;
    customer?: { id: string; name: string; phone: string; address: string; latitude: number; longitude: number; deliveryInstructions: string | null; };
    vendor?: { id: string; name: string; phone: string; address: string; latitude: number; longitude: number; };
    items?: Array<{ id: string; name: string; quantity: number; sku: string; }>;
  };
  events?: Array<{ id: string; eventType: string; createdAt: string; metadata: string | null; }>;
}

interface DeliveryState {
  deliveries: DeliveryData[];
  activeDelivery: DeliveryData | null;
  selectedDelivery: DeliveryData | null;
  filter: string;
  trafficMultiplier: number;
  isOffline: boolean;
  setDeliveries: (deliveries: DeliveryData[]) => void;
  setActiveDelivery: (delivery: DeliveryData | null) => void;
  setSelectedDelivery: (delivery: DeliveryData | null) => void;
  setFilter: (filter: string) => void;
  setTrafficMultiplier: (multiplier: number) => void;
  setIsOffline: (offline: boolean) => void;
  updateDeliveryInList: (delivery: DeliveryData) => void;
}

export const useDeliveryStore = create<DeliveryState>((set) => ({
  deliveries: [],
  activeDelivery: null,
  selectedDelivery: null,
  filter: 'all',
  trafficMultiplier: 1.0,
  isOffline: false,
  setDeliveries: (deliveries) => set({ deliveries }),
  setActiveDelivery: (activeDelivery) => set({ activeDelivery }),
  setSelectedDelivery: (selectedDelivery) => set({ selectedDelivery }),
  setFilter: (filter) => set({ filter }),
  setTrafficMultiplier: (trafficMultiplier) => set({ trafficMultiplier }),
  setIsOffline: (isOffline) => set({ isOffline }),
  updateDeliveryInList: (delivery) => set((state) => ({
    deliveries: state.deliveries.map(d => d.id === delivery.id ? delivery : d),
    activeDelivery: state.activeDelivery?.id === delivery.id ? delivery : state.activeDelivery,
    selectedDelivery: state.selectedDelivery?.id === delivery.id ? delivery : state.selectedDelivery,
  })),
}));
