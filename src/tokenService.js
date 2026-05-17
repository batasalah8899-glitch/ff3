const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'fastflow-erp',
  });
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

const saveRefreshToken = async (userId, refreshToken, deviceId, ipAddress) => {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
  await prisma.session.create({
    data: {
      userId, token: refreshToken,
      deviceId: deviceId || 'unknown',
      ipAddress: ipAddress || 'unknown',
      expiresAt, isActive: true,
    },
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const revokeAllSessions = async (userId) => {
  await prisma.session.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });
};

const cleanExpiredSessions = async () => {
  await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
};

module.exports = {
  generateAccessToken, generateRefreshToken,
  saveRefreshToken, verifyAccessToken,
  revokeAllSessions, cleanExpiredSessions,
};