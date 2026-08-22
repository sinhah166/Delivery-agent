import prisma from '../../config/database';
import { DeliveryStateService } from './delivery-state.service';

export class DeliveryService {
  // Get all deliveries for an agent
  static async getAgentDeliveries(agentId: string, statusFilter?: string) {
    const where: any = { agentId };
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'active') {
        where.status = { in: ['ACCEPTED', 'GOING_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'PICKUP_VERIFICATION', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_CUSTOMER', 'DELIVERY_VERIFICATION'] };
      } else if (statusFilter === 'pending') {
        where.status = 'ASSIGNED';
      } else if (statusFilter === 'completed') {
        where.status = 'DELIVERED';
      } else if (statusFilter === 'failed') {
        where.status = { in: ['FAILED', 'CANCELLED'] };
      } else {
        where.status = statusFilter;
      }
    }

    return prisma.delivery.findMany({
      where,
      include: {
        order: {
          include: {
            customer: true,
            vendor: true,
            items: true,
          },
        },
        events: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get single delivery with full details
  static async getDeliveryById(deliveryId: string, agentId: string) {
    const delivery = await prisma.delivery.findFirst({
      where: { id: deliveryId, agentId },
      include: {
        order: {
          include: {
            customer: true,
            vendor: true,
            items: true,
          },
        },
        events: { orderBy: { createdAt: 'asc' } },
        exceptions: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!delivery) {
      throw new Error('DELIVERY_NOT_FOUND');
    }

    return delivery;
  }

  // Transition delivery to a new state
  static async transitionDelivery(
    deliveryId: string,
    agentId: string,
    newStatus: string,
    eventType: string,
    metadata?: Record<string, unknown>,
    location?: { latitude: number; longitude: number }
  ) {
    const delivery = await prisma.delivery.findFirst({
      where: { id: deliveryId, agentId },
    });

    if (!delivery) {
      throw new Error('DELIVERY_NOT_FOUND');
    }

    // Enforce state machine
    DeliveryStateService.validateTransition(delivery.status, newStatus);

    // Update timestamps based on new status
    const timestamps: Record<string, any> = {};
    const now = new Date();

    switch (newStatus) {
      case 'ACCEPTED':
        timestamps.acceptedAt = now;
        break;
      case 'GOING_TO_PICKUP':
        timestamps.pickupStartedAt = now;
        break;
      case 'PICKED_UP':
        timestamps.pickedUpAt = now;
        break;
      case 'IN_TRANSIT':
        timestamps.deliveryStartedAt = now;
        break;
      case 'ARRIVED_AT_CUSTOMER':
        timestamps.arrivedAt = now;
        break;
      case 'DELIVERED':
        timestamps.deliveredAt = now;
        if (delivery.assignedAt) {
          timestamps.actualDeliveryTime = Math.round(
            (now.getTime() - new Date(delivery.assignedAt).getTime()) / 60000
          );
        }
        break;
    }

    // Update delivery + create event in transaction
    const [updatedDelivery] = await prisma.$transaction([
      prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          status: newStatus,
          ...timestamps,
        },
        include: {
          order: {
            include: { customer: true, vendor: true, items: true },
          },
          events: { orderBy: { createdAt: 'asc' } },
        },
      }),
      prisma.deliveryEvent.create({
        data: {
          deliveryId,
          eventType,
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      }),
    ]);

    // Update agent load on completion/failure
    if (['DELIVERED', 'FAILED', 'CANCELLED'].includes(newStatus)) {
      await prisma.agent.update({
        where: { id: agentId },
        data: {
          currentLoad: { decrement: 1 },
          ...(newStatus === 'DELIVERED' ? {
            totalDeliveries: { increment: 1 },
            onTimeDeliveries: { increment: 1 },
          } : {}),
        },
      });

      // Also update order status
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: newStatus === 'DELIVERED' ? 'COMPLETED' : 'CANCELLED' },
      });
    }

    // Accept increases agent load
    if (newStatus === 'ACCEPTED') {
      await prisma.agent.update({
        where: { id: agentId },
        data: { currentLoad: { increment: 1 } },
      });
    }

    return updatedDelivery;
  }

  // Generate OTP for delivery verification
  static async generateOTP(deliveryId: string) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await prisma.delivery.update({
      where: { id: deliveryId },
      data: { otp },
    });
    return otp;
  }

  // Verify OTP
  static async verifyOTP(deliveryId: string, agentId: string, otp: string) {
    const delivery = await prisma.delivery.findFirst({
      where: { id: deliveryId, agentId },
    });

    if (!delivery) throw new Error('DELIVERY_NOT_FOUND');
    if (!delivery.otp) throw new Error('OTP_NOT_GENERATED');
    if (delivery.otp !== otp) throw new Error('INVALID_OTP');

    return true;
  }

  // Get active delivery for agent (current one they're working on)
  static async getActiveDelivery(agentId: string) {
    return prisma.delivery.findFirst({
      where: {
        agentId,
        status: {
          in: ['ACCEPTED', 'GOING_TO_PICKUP', 'ARRIVED_AT_PICKUP', 'PICKUP_VERIFICATION', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_CUSTOMER', 'DELIVERY_VERIFICATION'],
        },
      },
      include: {
        order: {
          include: { customer: true, vendor: true, items: true },
        },
        events: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
