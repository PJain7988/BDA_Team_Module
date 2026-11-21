// backend/utils/webauthnConfig.js
/**
 * WebAuthn RP Configuration
 * Localhost is supported without HTTPS. In production, RP_ID must match the effective domain.
 */
const getWebAuthnConfig = (req) => {
  const rpName = process.env.WEBAUTHN_RP_NAME || 'BDA Manufacturing CRM';
  
  // RP_ID determines which domain credentials are bound to
  // Default to localhost for local dev; in production configure WEBAUTHN_RP_ID
  let rpID = process.env.WEBAUTHN_RP_ID;
  if (!rpID) {
    const host = req?.headers?.host?.split(':')[0];
    rpID = host || 'localhost';
  }

  // Origin must match the exact protocol and port the browser sent the request from
  let origin = process.env.WEBAUTHN_ORIGIN;
  if (!origin) {
    const originHeader = req?.headers?.origin;
    if (originHeader) {
      origin = originHeader;
    } else {
      origin = 'http://localhost:5173';
    }
  }

  return {
    rpName,
    rpID,
    origin,
  };
};

module.exports = { getWebAuthnConfig };
