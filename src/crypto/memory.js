/**
 * envcrypt Memory Security Module
 * Secure memory management - mlock, auto-shred, buffer wiping
 */

import { execSync } from 'node:child_process';
import crypto from 'node:crypto';

let mlockAvailable = null;

/**
 * Check if mlock is available on this system
 * @returns {boolean}
 */
export function isMlockAvailable() {
  if (mlockAvailable !== null) return mlockAvailable;

  try {
    if (process.platform === 'linux' || process.platform === 'darwin') {
      const uid = process.getuid ? process.getuid() : -1;
      mlockAvailable = uid === 0;
    } else if (process.platform === 'win32') {
      mlockAvailable = true;
    }
  } catch {
    mlockAvailable = false;
  }

  return mlockAvailable;
}

/**
 * Attempt to lock memory pages to prevent swapping
 * @param {Buffer} buffer - Buffer to lock
 * @returns {boolean} - Whether lock succeeded
 */
export function lockMemory(buffer) {
  if (!isMlockAvailable()) {
    return false;
  }

  try {
    if (process.platform === 'linux' || process.platform === 'darwin') {
      return false;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Securely wipe a buffer by overwriting with zeros
 * @param {Buffer} buffer - Buffer to wipe
 */
export function secureWipe(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) return;

  try {
    buffer.fill(0);
    buffer.fill(0xFF);

    const randomData = crypto.randomBytes(buffer.length);
    randomData.copy(buffer);

    buffer.fill(0);
  } catch {
    // Best effort
  }
}

/**
 * Clear all envcrypt related environment variables from process.env
 */
export function clearEnvVars() {
  const envcryptPrefix = 'ENVCRYPT_';
  for (const key of Object.keys(process.env)) {
    if (key.startsWith(envcryptPrefix)) {
      delete process.env[key];
    }
  }
}

/**
 * Register cleanup handlers to wipe sensitive data on exit
 * @param {Buffer[]} buffers - Array of buffers to wipe on exit
 */
export function registerCleanup(buffers) {
  const cleanup = () => {
    for (const buffer of buffers) {
      secureWipe(buffer);
    }
    clearEnvVars();
  };

  process.on('exit', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });
}

export default { isMlockAvailable, lockMemory, secureWipe, clearEnvVars, registerCleanup };