import * as uaePassService from '../services/uaePassService.js';
import { prisma } from '../../../server.js';
import crypto from 'crypto';

export async function uaePassLogin(req, res) {
  try {
    // Demo mode for local testing
    if (!process.env.UAE_PASS_CLIENT_ID || process.env.UAE_PASS_CLIENT_ID === 'demo_client_id') {
      const state = crypto.randomBytes(32).toString('hex');
      // Return a demo URL that goes to our callback with demo params
      const demoAuthUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/uaepass/callback?code=demo_code_${Date.now()}&state=${state}`;
      return res.json({
        authUrl: demoAuthUrl,
        state,
        demo: true
      });
    }

    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in session/redis if needed
    // For now, we'll send it to the client to pass back

    const authUrl = await uaePassService.getAuthorizationUrl(state);

    res.json({
      authUrl,
      state
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function uaePassCallback(req, res) {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Demo mode for local testing
    if (code.startsWith('demo_code_')) {
      // Create or get demo user
      const demoProfile = {
        sub: 'demo_uaepass_12345',
        email: 'demo@tali.app',
        phone_number: '+971501234567',
        name: 'Demo User',
      };

      const user = await uaePassService.findOrCreateUser(demoProfile, 'demo_access_token');
      const { accessToken, refreshToken } = uaePassService.generateJWT(user);

      return res.json({
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          preferredLanguage: user.preferredLanguage,
        }
      });
    }

    // TODO: Verify state for CSRF protection

    // Exchange code for token
    const tokenData = await uaePassService.exchangeCodeForToken(code);

    // Get user info
    const uaePassProfile = await uaePassService.getUserInfo(tokenData.access_token);

    // Find or create user
    const user = await uaePassService.findOrCreateUser(uaePassProfile, tokenData.access_token);

    // Generate JWT tokens
    const { accessToken, refreshToken } = uaePassService.generateJWT(user);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        preferredLanguage: user.preferredLanguage,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = uaePassService.verifyRefreshToken(refreshToken);

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid user' });
    }

    // Generate new tokens
    const tokens = uaePassService.generateJWT(user);

    res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}

export async function logout(req, res) {
  try {
    // TODO: Invalidate tokens (add to blacklist in Redis)
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
