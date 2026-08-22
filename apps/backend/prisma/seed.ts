import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.deliveryEvent.deleteMany();
  await prisma.deliveryException.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.agent.deleteMany();

  const hashedPassword = await bcrypt.hash('demo123', 10);

  // ---- Agents ----
  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        name: 'Alex Kumar', phone: '+91-9876543210', email: 'alex@railquick.com',
        password: hashedPassword, status: 'ONLINE', vehicleType: 'BIKE',
        currentLatitude: 28.6280, currentLongitude: 77.2190,
        currentLoad: 1, maxCapacity: 5, rating: 4.8, totalDeliveries: 156, onTimeDeliveries: 147,
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Rahul Singh', phone: '+91-9876543211', email: 'rahul@railquick.com',
        password: hashedPassword, status: 'ONLINE', vehicleType: 'SCOOTER',
        currentLatitude: 28.6350, currentLongitude: 77.2250,
        currentLoad: 2, maxCapacity: 4, rating: 4.6, totalDeliveries: 98, onTimeDeliveries: 89,
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Priya Sharma', phone: '+91-9876543212', email: 'priya@railquick.com',
        password: hashedPassword, status: 'ONLINE', vehicleType: 'BIKE',
        currentLatitude: 28.6100, currentLongitude: 77.2300,
        currentLoad: 0, maxCapacity: 5, rating: 4.9, totalDeliveries: 210, onTimeDeliveries: 205,
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Aman Gupta', phone: '+91-9876543213', email: 'aman@railquick.com',
        password: hashedPassword, status: 'OFFLINE', vehicleType: 'CAR',
        currentLatitude: 28.6200, currentLongitude: 77.2100,
        currentLoad: 0, maxCapacity: 8, rating: 4.5, totalDeliveries: 72, onTimeDeliveries: 65,
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Karan Patel', phone: '+91-9876543214', email: 'karan@railquick.com',
        password: hashedPassword, status: 'ONLINE', vehicleType: 'BIKE',
        currentLatitude: 28.6400, currentLongitude: 77.2150,
        currentLoad: 3, maxCapacity: 5, rating: 4.7, totalDeliveries: 134, onTimeDeliveries: 126,
      },
    }),
  ]);

  // ---- Vendors ----
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        name: 'Sharma General Store', phone: '+91-11-2345678',
        address: 'Shop 12, Connaught Place, New Delhi', latitude: 28.6315, longitude: 77.2167,
        status: 'OPEN', averagePickupTime: 4,
      },
    }),
    prisma.vendor.create({
      data: {
        name: 'City Mart', phone: '+91-11-3456789',
        address: '45 Karol Bagh, New Delhi', latitude: 28.6519, longitude: 77.1905,
        status: 'OPEN', averagePickupTime: 6,
      },
    }),
    prisma.vendor.create({
      data: {
        name: 'Quick Supplies', phone: '+91-11-4567890',
        address: '78 Lajpat Nagar, New Delhi', latitude: 28.5700, longitude: 77.2400,
        status: 'OPEN', averagePickupTime: 3,
      },
    }),
    prisma.vendor.create({
      data: {
        name: 'Daily Needs Store', phone: '+91-11-5678901',
        address: '23 Sarojini Nagar, New Delhi', latitude: 28.5750, longitude: 77.2000,
        status: 'OPEN', averagePickupTime: 5,
      },
    }),
  ]);

  // ---- Customers ----
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Aman Sharma', phone: '+91-9812345670',
        address: 'B-12, Sector 70, Noida', latitude: 28.5800, longitude: 77.3150,
        deliveryInstructions: 'Ring the bell twice',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Neha Verma', phone: '+91-9812345671',
        address: 'A-45, Vasant Kunj, New Delhi', latitude: 28.5200, longitude: 77.1600,
        deliveryInstructions: 'Leave at door if not available',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Rajesh Khanna', phone: '+91-9812345672',
        address: '15 Defence Colony, New Delhi', latitude: 28.5730, longitude: 77.2300,
        deliveryInstructions: null,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Sonia Mehra', phone: '+91-9812345673',
        address: 'C-78, Greater Kailash, New Delhi', latitude: 28.5480, longitude: 77.2430,
        deliveryInstructions: 'Call before arriving',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Vikram Joshi', phone: '+91-9812345674',
        address: '3rd Floor, Hauz Khas Village', latitude: 28.5494, longitude: 77.2001,
        deliveryInstructions: 'Use the side entrance',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Anita Roy', phone: '+91-9812345675',
        address: '22 Nehru Place, New Delhi', latitude: 28.5494, longitude: 77.2530,
        deliveryInstructions: null,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Deepak Nair', phone: '+91-9812345676',
        address: '9 Janpath, New Delhi', latitude: 28.6200, longitude: 77.2190,
        deliveryInstructions: 'Guard will collect',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Pooja Singh', phone: '+91-9812345677',
        address: 'D-5, Dwarka Sector 12', latitude: 28.5900, longitude: 77.0500,
        deliveryInstructions: null,
      },
    }),
  ]);

  const now = new Date();
  const addMinutes = (mins: number) => new Date(now.getTime() + mins * 60000);

  // ---- Orders & Deliveries ----

  // Order 1: Assigned to Alex (ASSIGNED — pending accept)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'RQ1024',
      customerId: customers[0].id, vendorId: vendors[0].id,
      priority: 'NORMAL', status: 'ASSIGNED',
      pickupDeadline: addMinutes(30), deliveryDeadline: addMinutes(60),
      pnr: '8932746192', trainNumber: '12951', trainName: 'MUMBAI RAJDHANI', coach: 'B2', seat: '45', stationCode: 'NDLS',
      items: {
        create: [
          { name: 'Phone Charger', quantity: 1, sku: 'CHG-001' },
          { name: 'Water Bottle', quantity: 2, sku: 'WTR-002' },
          { name: 'Tissue Pack', quantity: 1, sku: 'TSS-003' },
        ],
      },
    },
  });

  const delivery1 = await prisma.delivery.create({
    data: {
      orderId: order1.id, agentId: agents[0].id,
      status: 'ASSIGNED', otp: '4827',
      estimatedDeliveryTime: 22, distanceRemaining: 5.2,
      riskScore: 10, riskLevel: 'SAFE',
      events: {
        create: [
          { eventType: 'ASSIGNED', metadata: JSON.stringify({ auto: true }) },
        ],
      },
    },
  });

  // Order 2: In transit to customer (Alex's active delivery)
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'RQ123456',
      customerId: customers[6].id, vendorId: vendors[0].id,
      priority: 'HIGH', status: 'IN_PROGRESS',
      pickupDeadline: addMinutes(-20), deliveryDeadline: addMinutes(15),
      pnr: '2728199271', trainNumber: '12926', trainName: 'NZM BDTS SF EXP', coach: 'B2', seat: '45', stationCode: 'MTJ',
      items: {
        create: [
          { name: 'Notebook Set', quantity: 3, sku: 'NTB-010' },
          { name: 'Pen Pack', quantity: 1, sku: 'PEN-011' },
        ],
      },
    },
  });

  await prisma.delivery.create({
    data: {
      orderId: order2.id, agentId: agents[0].id,
      status: 'IN_TRANSIT', otp: '7391',
      acceptedAt: addMinutes(-25),
      pickupStartedAt: addMinutes(-22),
      pickedUpAt: addMinutes(-15),
      deliveryStartedAt: addMinutes(-14),
      estimatedDeliveryTime: 14, distanceRemaining: 3.2,
      riskScore: 25, riskLevel: 'SAFE',
      events: {
        create: [
          { eventType: 'ASSIGNED', createdAt: addMinutes(-30) },
          { eventType: 'ACCEPTED', createdAt: addMinutes(-25) },
          { eventType: 'ROUTE_STARTED', createdAt: addMinutes(-22), metadata: JSON.stringify({ phase: 'pickup' }) },
          { eventType: 'ARRIVED_PICKUP', createdAt: addMinutes(-17) },
          { eventType: 'PICKUP_VERIFIED', createdAt: addMinutes(-16) },
          { eventType: 'PACKAGE_COLLECTED', createdAt: addMinutes(-15) },
          { eventType: 'ROUTE_STARTED', createdAt: addMinutes(-14), metadata: JSON.stringify({ phase: 'delivery' }) },
        ],
      },
    },
  });

  // Order 3: Completed delivery (Rahul)
  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'RQ1015',
      customerId: customers[2].id, vendorId: vendors[2].id,
      priority: 'NORMAL', status: 'COMPLETED',
      pickupDeadline: addMinutes(-120), deliveryDeadline: addMinutes(-60),
      pnr: '4589210342', trainNumber: '12004', trainName: 'LKO SHTBDI', coach: 'C4', seat: '12', stationCode: 'LKO',
      items: {
        create: [
          { name: 'First Aid Kit', quantity: 1, sku: 'FAK-020' },
        ],
      },
    },
  });

  await prisma.delivery.create({
    data: {
      orderId: order3.id, agentId: agents[1].id,
      status: 'DELIVERED', otp: '5612',
      acceptedAt: addMinutes(-130),
      pickedUpAt: addMinutes(-115),
      deliveryStartedAt: addMinutes(-114),
      arrivedAt: addMinutes(-75),
      deliveredAt: addMinutes(-74),
      actualDeliveryTime: 18,
      riskScore: 0, riskLevel: 'SAFE',
      events: {
        create: [
          { eventType: 'ASSIGNED', createdAt: addMinutes(-135) },
          { eventType: 'ACCEPTED', createdAt: addMinutes(-130) },
          { eventType: 'ARRIVED_PICKUP', createdAt: addMinutes(-118) },
          { eventType: 'PACKAGE_COLLECTED', createdAt: addMinutes(-115) },
          { eventType: 'ROUTE_STARTED', createdAt: addMinutes(-114) },
          { eventType: 'ARRIVED_CUSTOMER', createdAt: addMinutes(-75) },
          { eventType: 'OTP_VERIFIED', createdAt: addMinutes(-74) },
          { eventType: 'DELIVERED', createdAt: addMinutes(-74) },
        ],
      },
    },
  });

  // Order 4: Assigned to Rahul (active)
  const order4 = await prisma.order.create({
    data: {
      orderNumber: 'RQ1025',
      customerId: customers[3].id, vendorId: vendors[1].id,
      priority: 'URGENT', status: 'ASSIGNED',
      pickupDeadline: addMinutes(15), deliveryDeadline: addMinutes(35),
      pnr: '2109847365', trainNumber: '12423', trainName: 'RAJDHANI EXP', coach: 'A1', seat: '10', stationCode: 'CNB',
      items: {
        create: [
          { name: 'Medicines Pack', quantity: 1, sku: 'MED-030' },
          { name: 'Bandages', quantity: 2, sku: 'BND-031' },
        ],
      },
    },
  });

  await prisma.delivery.create({
    data: {
      orderId: order4.id, agentId: agents[1].id,
      status: 'ASSIGNED', otp: '8934',
      estimatedDeliveryTime: 28, distanceRemaining: 8.5,
      riskScore: 45, riskLevel: 'AT_RISK',
      events: {
        create: [
          { eventType: 'ASSIGNED', metadata: JSON.stringify({ auto: true, priority: 'URGENT' }) },
        ],
      },
    },
  });

  // Order 5: Priya — at pickup
  const order5 = await prisma.order.create({
    data: {
      orderNumber: 'RQ1022',
      customerId: customers[4].id, vendorId: vendors[3].id,
      priority: 'HIGH', status: 'IN_PROGRESS',
      pickupDeadline: addMinutes(10), deliveryDeadline: addMinutes(40),
      pnr: '3294875102', trainNumber: '12313', trainName: 'RAJDHANI EXP', coach: 'B5', seat: '72', stationCode: 'NDLS',
      items: {
        create: [
          { name: 'Grocery Bundle', quantity: 1, sku: 'GRC-040' },
          { name: 'Cooking Oil 1L', quantity: 1, sku: 'OIL-041' },
          { name: 'Rice 5kg', quantity: 1, sku: 'RCE-042' },
        ],
      },
    },
  });

  await prisma.delivery.create({
    data: {
      orderId: order5.id, agentId: agents[2].id,
      status: 'ARRIVED_AT_PICKUP', otp: '2156',
      acceptedAt: addMinutes(-10),
      pickupStartedAt: addMinutes(-8),
      estimatedDeliveryTime: 30, distanceRemaining: 4.8,
      riskScore: 20, riskLevel: 'SAFE',
      events: {
        create: [
          { eventType: 'ASSIGNED', createdAt: addMinutes(-15) },
          { eventType: 'ACCEPTED', createdAt: addMinutes(-10) },
          { eventType: 'ROUTE_STARTED', createdAt: addMinutes(-8) },
          { eventType: 'ARRIVED_PICKUP', createdAt: addMinutes(-1) },
        ],
      },
    },
  });

  // Order 6: Failed delivery (Karan)
  const order6 = await prisma.order.create({
    data: {
      orderNumber: 'RQ1010',
      customerId: customers[1].id, vendorId: vendors[2].id,
      priority: 'NORMAL', status: 'CANCELLED',
      pickupDeadline: addMinutes(-180), deliveryDeadline: addMinutes(-120),
      pnr: '9081726354', trainNumber: '12011', trainName: 'KALKA SHTBDI', coach: 'C2', seat: '33', stationCode: 'CDG',
      items: {
        create: [
          { name: 'Electronics Kit', quantity: 1, sku: 'ELK-050' },
        ],
      },
    },
  });

  await prisma.delivery.create({
    data: {
      orderId: order6.id, agentId: agents[4].id,
      status: 'FAILED', otp: '3478',
      acceptedAt: addMinutes(-190),
      pickedUpAt: addMinutes(-175),
      deliveryStartedAt: addMinutes(-174),
      riskScore: 85, riskLevel: 'CRITICAL',
      events: {
        create: [
          { eventType: 'ASSIGNED', createdAt: addMinutes(-195) },
          { eventType: 'ACCEPTED', createdAt: addMinutes(-190) },
          { eventType: 'PACKAGE_COLLECTED', createdAt: addMinutes(-175) },
          { eventType: 'ROUTE_STARTED', createdAt: addMinutes(-174) },
          { eventType: 'RISK_DETECTED', createdAt: addMinutes(-140), metadata: JSON.stringify({ reason: 'Customer unavailable' }) },
          { eventType: 'FAILED', createdAt: addMinutes(-130), metadata: JSON.stringify({ reason: 'CUSTOMER_UNAVAILABLE' }) },
        ],
      },
    },
  });

  // Order 7: Karan — going to pickup
  const order7 = await prisma.order.create({
    data: {
      orderNumber: 'RQ1026',
      customerId: customers[5].id, vendorId: vendors[0].id,
      priority: 'NORMAL', status: 'IN_PROGRESS',
      pickupDeadline: addMinutes(20), deliveryDeadline: addMinutes(50),
      pnr: '5647382910', trainNumber: '12229', trainName: 'LUCKNOW MAIL', coach: 'S4', seat: '21', stationCode: 'LKO',
      items: {
        create: [
          { name: 'Stationery Set', quantity: 2, sku: 'STN-060' },
          { name: 'Printer Paper', quantity: 1, sku: 'PPR-061' },
        ],
      },
    },
  });

  await prisma.delivery.create({
    data: {
      orderId: order7.id, agentId: agents[4].id,
      status: 'GOING_TO_PICKUP', otp: '6743',
      acceptedAt: addMinutes(-5),
      pickupStartedAt: addMinutes(-4),
      estimatedDeliveryTime: 35, distanceRemaining: 6.1,
      riskScore: 15, riskLevel: 'SAFE',
      events: {
        create: [
          { eventType: 'ASSIGNED', createdAt: addMinutes(-8) },
          { eventType: 'ACCEPTED', createdAt: addMinutes(-5) },
          { eventType: 'ROUTE_STARTED', createdAt: addMinutes(-4), metadata: JSON.stringify({ phase: 'pickup' }) },
        ],
      },
    },
  });

  console.log('✅ Seed completed!');
  console.log('');
  console.log('📋 Demo Credentials:');
  console.log('   Email: alex@railquick.com');
  console.log('   Password: demo123');
  console.log('');
  console.log('   Other agents: rahul@, priya@, aman@, karan@ (all @railquick.com)');
  console.log('   All passwords: demo123');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
