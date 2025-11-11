import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        fullName: true,
        preferredLanguage: true,
        currency: true,
        timezone: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        lastLoginAt: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, preferredLanguage, currency, timezone } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        preferredLanguage,
        currency,
        timezone
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        preferredLanguage: true,
        currency: true,
        timezone: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const userId = req.user.userId;

    let settings = await prisma.userSettings.findUnique({
      where: { userId }
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId }
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: updates,
      create: {
        userId,
        ...updates
      }
    });

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
