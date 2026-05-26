/**
 * envcrypt Secret Generation Module
 * Cryptographically secure random string generation
 */

import crypto from 'node:crypto';

/**
 * Generate a cryptographically secure random string
 * @param {number} length - Length in bytes (output will be hex = 2x length)
 * @returns {string} - Hex-encoded random string
 */
export function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a URL-safe base64 random string
 * @param {number} length - Length in bytes
 * @returns {string} - base64url-encoded random string
 */
export function generateApiKey(length = 32) {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Generate a password-like string with mixed characters
 * @param {number} length - Length of password
 * @returns {string} - Random password
 */
export function generatePassword(length = 16) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*-_=+';
  const bytes = crypto.randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }
  return password;
}

/**
 * Generate secrets based on type
 * @param {string} type - Type of secret (jwt, session, api_key, password)
 * @returns {string} - Generated secret
 */
export function generateSecretByType(type) {
  switch (type) {
    case 'jwt':
      return generateSecret(64);      // 512 bits
    case 'session':
      return generateSecret(32);      // 256 bits
    case 'api_key':
      return generateApiKey(32);      // 256 bits, URL-safe
    case 'password':
      return generatePassword(16);    // 16 chars
    case 'encryption_key':
      return generateSecret(32);      // 256 bits
    default:
      return generateSecret(32);
  }
}

/**
 * Generate all secrets for a preset configuration
 * @param {Object[]} secretDefs - Array of {name, type} objects
 * @returns {Object} - Object with secret names as keys
 */
export function generateSecrets(secretDefs) {
  const secrets = {};
  for (const def of secretDefs) {
    secrets[def.name] = generateSecretByType(def.type);
  }
  return secrets;
}

export default { generateSecret, generateApiKey, generatePassword, generateSecretByType, generateSecrets };
