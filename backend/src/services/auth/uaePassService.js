import axios from 'axios';
import jwt from 'jsonwebtoken';
import { prisma } from '../../server.js';

const UAE_PASS_CONFIG = {
  clientId: process.env.UAE_PASS_CLIENT_ID,
  clientSecret: process.env.UAE_PASS_CLIENT_SECRET,
  redirectUri: process.env.UAE_PASS_REDIRECT_URI,
  authUrl: process.env.UAE_PASS_ENV === 'production'
    ? 'https://id.uaepass.ae/idshub/authorize'
    : 'https://stg-id.uaepass.ae/idshub/authorize',
  tokenUrl: process.env.UAE_PASS_ENV === 'production'
    ? 'https://id.uaepass.ae/idshub/token'
    : 'https://stg-id.uaepass.ae/idshub/token',
  userInfoUrl: process.env.UAE_PASS_ENV === 'production'
    ? 'https://id.uaepass.ae/idshub/userinfo'
    : 'https://stg-id.uaepass.ae/idshub/userinfo',
  scope: 'openid profile email phone',
};

export async function getAuthorizationUrl(state) {
  const params = new URLSearchParams({
    client_id: UAE_PASS_CONFIG.clientId,
    redirect_uri: UAE_PASS_CONFIG.redirectUri,
    response_type: 'code',
    scope: UAE_PASS_CONFIG.scope,
    state: state,
    acr_values: 'urn:safelayer:tws:policies:authentication:level:low',
  });

  return `${UAE_PASS_CONFIG.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(code) {
  try {
    const response = await axios.post(
      UAE_PASS_CONFIG.tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: UAE_PASS_CONFIG.redirectUri,
        client_id: UAE_PASS_CONFIG.clientId,
        client_secret: UAE_PASS_CONFIG.clientSecret,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Token exchange failed: ${error.response?.data?.error_description || error.message}`);
  }
}

export async function getUserInfo(accessToken) {
  try {
    const response = await axios.get(UAE_PASS_CONFIG.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch user info: ${error.message}`);
  }
}

export async function findOrCreateUser(uaePassProfile, accessToken) {
  const {
    sub: uaePassId,
    email,
    phone_number: phoneNumber,
    name: fullName,
  } = uaePassProfile;

  // Find existing user
  let user = await prisma.user.findUnique({
    where: { uaePassId },
  });

  if (!user) {
    // Create new user
    user = await prisma.user.create({
      data: {
        uaePassId,
        email: email || null,
        phoneNumber: phoneNumber || null,
        fullName: fullName || null,
        emailVerified: !!email,
        phoneVerified: !!phoneNumber,
        oauthProviders: {
          create: {
            provider: 'uae_pass',
            providerUserId: uaePassId,
            accessToken: accessToken,
            expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
          },
        },
        settings: {
          create: {},
        },
      },
    });
  } else {
    // Update existing user's UAE Pass token
    await prisma.oAuthProvider.upsert({
      where: {
        provider_providerUserId: {
          provider: 'uae_pass',
          providerUserId: uaePassId,
        },
      },
      update: {
        accessToken: accessToken,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      },
      create: {
        userId: user.id,
        provider: 'uae_pass',
        providerUserId: uaePassId,
        accessToken: accessToken,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      },
    });

    // Update last login
    user = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
  }

  return user;
}

export function generateJWT(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    uaePassId: user.uaePassId,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });

  return { accessToken, refreshToken };
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}
