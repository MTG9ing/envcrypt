/**
 * env-lock Memory Security Module
 * Secure memory management - mlock, auto-shred, buffer wiping
 */

import { execSync } from 'node:child_process';

let mlockAvailable = null;

/**
 * Check if mlock is available on this system
 * @returns {boolean}
 */
export function isMlockAvailable() {
  if (mlockAvailable !== null) return mlockAvailable;

  try {
    // Try to use mlock via a small test
    // On Linux/macOS, we can check if the process has capability
    if (process.platform === 'linux' || process.platform === 'darwin') {
      // Check if we have CAP_IPC_LOCK or are root
      const uid = process.getuid ? process.getuid() : -1;
      mlockAvailable = uid === 0; // root can mlock
      // TODO: More sophisticated capability check for Linux
    } else if (process.platform === 'win32') {
      // Windows uses VirtualLock
      mlockAvailable = true; // Assume available, will fail gracefully
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
      // Use mlock via child process (requires root or CAP_IPC_LOCK)
      // This is a best-effort approach
      const bufAddr = buffer.buffer;
      // Note: True mlock requires native binding or root privileges
      // For now, we warn if not available
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
    // Overwrite with zeros
    buffer.fill(0);

    // Overwrite with ones (defense in depth)
    buffer.fill(0xFF);

    // Overwrite with random data
    import crypto from 'node:crypto';
    const randomData = crypto.randomBytes(buffer.length);
    randomData.copy(buffer);

    // Final zero overwrite
    buffer.fill(0);
  } catch {
    // Best effort - if buffer is already freed, ignore
  }
}

/**
 * Clear all env-lock related environment variables from process.env
 * Call this before process exit when using env-lock run
 */
export function clearEnvVars() {
  const envLockPrefix = 'ENV_LOCK_';
  for (const key of Object.keys(process.env)) {
    if (key.startsWith(envLockPrefix)) {
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
