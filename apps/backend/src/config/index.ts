import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'railquick-dev-secret-key-2024',
  jwtExpiresIn: '24h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  mapProvider: process.env.MAP_PROVIDER || 'mock',
  mapApiKey: process.env.MAP_API_KEY || '',
  geofence: {
    pickupNear: 100,
    pickupArrived: 50,
    customerNear: 100,
    customerArrived: 50,
  },
  assignment: {
    travelTimeWeight: 0.30,
    distanceWeight: 0.20,
    workloadWeight: 0.20,
    slaRiskWeight: 0.20,
    capacityWeight: 0.10,
  },
  otpExpiryMinutes: 10,
};
