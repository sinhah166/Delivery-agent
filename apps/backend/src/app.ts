import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import agentRoutes from './routes/agent.routes';
import deliveryRoutes from './routes/delivery.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();
const httpServer = createServer(app);

// Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/deliveries', deliveryRoutes);

// Error handler
app.use(errorMiddleware);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[WS] Agent connected: ${socket.id}`);

  socket.on('agent:join', (agentId: string) => {
    socket.join(`agent:${agentId}`);
    console.log(`[WS] Agent ${agentId} joined room`);
  });

  socket.on('agent:location', (data: { agentId: string; latitude: number; longitude: number }) => {
    io.to(`agent:${data.agentId}`).emit('agent:location-updated', data);
  });

  socket.on('disconnect', () => {
    console.log(`[WS] Agent disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Start server
httpServer.listen(config.port, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║   RailQuick Delivery Agent — Backend Server       ║
  ║   Port: ${config.port}                                   ║
  ║   Mode: Development                               ║
  ╚═══════════════════════════════════════════════════╝
  `);
});

export { app, io };
