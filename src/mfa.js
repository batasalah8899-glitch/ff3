const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generateMFASecret = (userEmail, appName = 'FastFlow ERP') => {
  const secret = speakeasy.generateSecret({
    name: `${appName} (${userEmail})`,
    length: 32,
  });
  return { secret: secret.base32, otpauth_url: secret.otpauth_url };
};

const generateQRCode = async (otpauth_url) => {
  return await QRCode.toDataURL(otpauth_url);
};

const verifyMFAToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret, encoding: 'base32', token, window: 2,
  });
};

const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
  }
  return codes;
};

module.exports = { generateMFASecret, generateQRCode, verifyMFAToken, generateBackupCodes };