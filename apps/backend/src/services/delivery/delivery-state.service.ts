// ============================================
// Delivery State Machine — Backend Enforced
// ============================================

const VALID_TRANSITIONS: Record<string, string[]> = {
  ASSIGNED: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['GOING_TO_PICKUP', 'CANCELLED'],
  GOING_TO_PICKUP: ['ARRIVED_AT_PICKUP', 'CANCELLED'],
  ARRIVED_AT_PICKUP: ['PICKUP_VERIFICATION', 'CANCELLED'],
  PICKUP_VERIFICATION: ['PICKED_UP', 'FAILED'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['ARRIVED_AT_CUSTOMER', 'FAILED'],
  ARRIVED_AT_CUSTOMER: ['DELIVERY_VERIFICATION'],
  DELIVERY_VERIFICATION: ['DELIVERED', 'FAILED'],
  DELIVERED: [],
  FAILED: [],
  CANCELLED: [],
};

export class DeliveryStateService {
  static isValidTransition(currentStatus: string, newStatus: string): boolean {
    const allowed = VALID_TRANSITIONS[currentStatus];
    if (!allowed) return false;
    return allowed.includes(newStatus);
  }

  static getNextStates(currentStatus: string): string[] {
    return VALID_TRANSITIONS[currentStatus] || [];
  }

  static validateTransition(currentStatus: string, newStatus: string): void {
    if (!this.isValidTransition(currentStatus, newStatus)) {
      const error = new Error('INVALID_STATE_TRANSITION');
      (error as any).details = {
        currentStatus,
        attemptedStatus: newStatus,
        allowedTransitions: this.getNextStates(currentStatus),
      };
      throw error;
    }
  }

  static isTerminalState(status: string): boolean {
    return ['DELIVERED', 'FAILED', 'CANCELLED'].includes(status);
  }

  static isActiveState(status: string): boolean {
    return !this.isTerminalState(status) && status !== 'ASSIGNED';
  }
}
