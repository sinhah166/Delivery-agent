import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { config } from '../config';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', async (req, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Mobile number/Email and password are required' },
      });
    }

    const agent = await prisma.agent.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!agent) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
      });
    }

    const isValid = await bcrypt.compare(password, agent.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    // Update agent status to ONLINE
    await prisma.agent.update({
      where: { id: agent.id },
      data: { status: 'ONLINE' },
    });

    const token = jwt.sign(
      { id: agent.id, email: agent.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const { password: _, ...agentData } = agent;

    return res.json({
      success: true,
      data: { token, agent: { ...agentData, status: 'ONLINE' } },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Login failed' },
    });
  }
});

export default router;
