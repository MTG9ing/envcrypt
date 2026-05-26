/**
 * envcrypt Port Detection Module
 * Find available, unblocked network ports
 */

import { createServer } from 'node:net';
import { execSync } from 'node:child_process';

/**
 * Check if a port is available by trying to bind to it
 * @param {number} port - Port number to check
 * @param {string} host - Host to bind to (default: '127.0.0.1')
 * @returns {Promise<boolean>} - True if port is available
 */
export async function isPortAvailable(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const server = createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port, host);
  });
}

/**
 * Find the next available port starting from a given port
 * @param {number} startPort - Port to start searching from
 * @param {string} host - Host to check
 * @param {number} maxAttempts - Maximum ports to check
 * @returns {Promise<number|null>} - Available port or null if none found
 */
export async function findAvailablePort(startPort, host = '127.0.0.1', maxAttempts = 100) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (await isPortAvailable(port, host)) {
      return port;
    }
  }
  return null;
}

/**
 * Get list of actively used ports on the system
 * Uses platform-specific commands
 * @returns {number[]} - Array of used port numbers
 */
export function getUsedPorts() {
  const usedPorts = new Set();

  try {
    if (process.platform === 'linux') {
      // Read /proc/net/tcp for listening ports
      const tcpData = execSync('cat /proc/net/tcp 2>/dev/null || echo ""', { encoding: 'utf-8' });
      const tcp6Data = execSync('cat /proc/net/tcp6 2>/dev/null || echo ""', { encoding: 'utf-8' });

      for (const line of (tcpData + tcp6Data).split('\n')) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4 && parts[3] === '0A') { // 0A = LISTEN state
          const localAddress = parts[1];
          const portHex = localAddress.split(':')[1];
          if (portHex) {
            const port = parseInt(portHex, 16);
            if (port > 1023) { // Exclude well-known ports
              usedPorts.add(port);
            }
          }
        }
      }
    } else if (process.platform === 'darwin') {
      // macOS: use lsof
      const output = execSync('lsof -iTCP -sTCP:LISTEN -P -n 2>/dev/null || echo ""', { encoding: 'utf-8' });
      for (const line of output.split('\n')) {
        const match = line.match(/:(\d+)\s+/);
        if (match) {
          const port = parseInt(match[1], 10);
          if (port > 1023) {
            usedPorts.add(port);
          }
        }
      }
    } else if (process.platform === 'win32') {
      // Windows: use netstat
      const output = execSync('netstat -ano | findstr LISTENING 2>nul || echo ""', { encoding: 'utf-8', shell: true });
      for (const line of output.split('\n')) {
        const match = line.match(/:(\d+)\s+/);
        if (match) {
          const port = parseInt(match[1], 10);
          if (port > 1023) {
            usedPorts.add(port);
          }
        }
      }
    }
  } catch {
    // Fallback: if system commands fail, return empty set
  }

  return Array.from(usedPorts).sort((a, b) => a - b);
}

/**
 * Suggest ports for common services
 * @param {string} serviceType - Type of service (api, database, cache, etc.)
 * @returns {Promise<{suggested: number, alternatives: number[]}>}
 */
export async function suggestPorts(serviceType = 'api') {
  const portRanges = {
    api: { start: 3000, end: 3999, default: 3000 },
    database: { start: 5432, end: 5439, default: 5432 },
    mongodb: { start: 27017, end: 27019, default: 27017 },
    redis: { start: 6379, end: 6380, default: 6379 },
    rabbitmq: { start: 5672, end: 5673, default: 5672 },
    kafka: { start: 9092, end: 9093, default: 9092 }
  };

  const range = portRanges[serviceType] || portRanges.api;
  const usedPorts = getUsedPorts();

  // Find first available in range
  let suggested = null;
  const alternatives = [];

  for (let port = range.start; port <= range.end; port++) {
    if (!usedPorts.includes(port)) {
      if (suggested === null) {
        suggested = port;
      } else if (alternatives.length < 3) {
        alternatives.push(port);
      }
    }
  }

  // If no ports in preferred range, search wider
  if (suggested === null) {
    suggested = await findAvailablePort(range.default);
    for (let i = 1; i <= 3 && suggested; i++) {
      const alt = await findAvailablePort(suggested + i);
      if (alt) alternatives.push(alt);
    }
  }

  return {
    suggested: suggested || range.default,
    alternatives,
    usedPorts: usedPorts.filter(p => p >= range.start && p <= range.end)
  };
}

export default { isPortAvailable, findAvailablePort, getUsedPorts, suggestPorts };
