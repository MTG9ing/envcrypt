/**
 * env-lock Audit Logger
 * Track all decrypt, rotate, and team events
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const AUDIT_DIR = '.env-lock';
const AUDIT_FILE = 'audit.log';

/**
 * Get audit log path
 * @returns {string}
 */
function getAuditPath() {
  return path.resolve(process.cwd(), AUDIT_DIR, AUDIT_FILE);
}

/**
 * Ensure audit directory exists
 */
function ensureAuditDir() {
  const dir = path.resolve(process.cwd(), AUDIT_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Log an audit event
 * @param {string} event - Event type (decrypt, rotate, join, export, init)
 * @param {Object} details - Additional event details
 * @param {boolean} success - Whether the operation succeeded
 * @param {string} error - Error message if failed
 */
export function logEvent(event, details = {}, success = true, error = null) {
  try {
    ensureAuditDir();

    const entry = {
      timestamp: new Date().toISOString(),
      event,
      user: os.userInfo().username,
      hostname: os.hostname(),
      project: details.project || null,
      success,
      error,
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version
    };

    const logLine = JSON.stringify(entry) + '\n';
    fs.appendFileSync(getAuditPath(), logLine);

  } catch {
    // Audit logging is best-effort, don't fail if logging fails
  }
}

/**
 * Read audit log
 * @param {number} limit - Maximum entries to read
 * @returns {Array} - Array of audit entries
 */
export function readAuditLog(limit = 100) {
  try {
    const auditPath = getAuditPath();
    if (!fs.existsSync(auditPath)) {
      return [];
    }

    const lines = fs.readFileSync(auditPath, 'utf-8')
      .split('\n')
      .filter(line => line.trim())
      .slice(-limit);

    return lines.map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

/**
 * Get last decrypt event
 * @returns {Object|null}
 */
export function getLastDecryptEvent() {
  const logs = readAuditLog(1000);
  const decryptEvents = logs.filter(log => log.event === 'decrypt');
  return decryptEvents.length > 0 ? decryptEvents[decryptEvents.length - 1] : null;
}

export default { logEvent, readAuditLog, getLastDecryptEvent };