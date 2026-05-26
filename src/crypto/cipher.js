/**
 * envcrypt Crypto Module
 * AES-256-GCM encryption/decryption with Argon2id key derivation
 */

import crypto from 'node:crypto';
import argon2 from 'argon2';
import { secureWipe } from './memory.js';

const ALGORITHM = 'aes-256-gcm';
const KEY_SIZE = 32;        // 256 bits
const IV_SIZE = 12;         // 96 bits for GCM
const TAG_SIZE = 16;        // 128 bits auth tag
const SALT_SIZE = 16;       // 128 bits salt
const MAGIC = Buffer.from('ENVL');
const VERSION = 0x01;

/**
 * Derive encryption key from password using Argon2id
 * @param {string} password - User's master password
 * @param {Buffer} salt - Random salt
 * @returns {Promise<Buffer>} - 32-byte key
 */
export async function deriveKey(password, salt) {
  // Argon2id parameters (OWASP recommended minimum)
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,      // 64 MB
    timeCost: 3,            // 3 iterations
    parallelism: 4,         // 4 parallel threads
    salt: salt,
    hashLength: KEY_SIZE,
    raw: true
  });
  return Buffer.from(hash);
}

/**
 * Encrypt environment variables into .env.enc format
 * @param {Object} envVars - Key-value pairs of environment variables
 * @param {string} password - User's master password
 * @returns {Promise<Buffer>} - Encrypted binary payload
 */
export async function encrypt(envVars, password) {
  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_SIZE);
  const iv = crypto.randomBytes(IV_SIZE);

  // Derive key from password
  const key = await deriveKey(password, salt);

  try {
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Convert env vars to JSON and encrypt
    const plaintext = Buffer.from(JSON.stringify(envVars), 'utf-8');
    const ciphertext = Buffer.concat([
      cipher.update(plaintext),
      cipher.final()
    ]);

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Build header for HMAC
    const header = Buffer.concat([
      MAGIC,
      Buffer.from([VERSION]),
      salt,
      iv
    ]);

    // Compute HMAC of header for tamper detection
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(header);
    const hmacValue = hmac.digest();

    // Securely wipe key from memory
    secureWipe(key);

    // Assemble final payload:
    // [4 magic] [1 version] [32 hmac] [16 salt] [12 iv] [N ciphertext] [16 tag]
    return Buffer.concat([
      MAGIC,
      Buffer.from([VERSION]),
      hmacValue,
      salt,
      iv,
      ciphertext,
      authTag
    ]);

  } catch (error) {
    secureWipe(key);
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt .env.enc payload back to environment variables
 * @param {Buffer} payload - Encrypted binary data
 * @param {string} password - User's master password
 * @returns {Promise<Object>} - Decrypted key-value pairs
 */
export async function decrypt(payload, password) {
  // Validate minimum size
  const minSize = MAGIC.length + 1 + 32 + SALT_SIZE + IV_SIZE + 1 + TAG_SIZE;
  if (payload.length < minSize) {
    throw new Error('Invalid .env.enc file: too small');
  }

  // Parse header
  let offset = 0;
  const magic = payload.subarray(offset, offset + MAGIC.length);
  offset += MAGIC.length;

  // Verify magic bytes
  if (!magic.equals(MAGIC)) {
    throw new Error('Invalid .env.enc file: wrong magic bytes');
  }

  const version = payload[offset];
  offset += 1;

  if (version !== VERSION) {
    throw new Error(`Unsupported .env.enc version: ${version}`);
  }

  const hmacValue = payload.subarray(offset, offset + 32);
  offset += 32;

  const salt = payload.subarray(offset, offset + SALT_SIZE);
  offset += SALT_SIZE;

  const iv = payload.subarray(offset, offset + IV_SIZE);
  offset += IV_SIZE;

  const authTag = payload.subarray(payload.length - TAG_SIZE);
  const ciphertext = payload.subarray(offset, payload.length - TAG_SIZE);

  // Derive key from password
  const key = await deriveKey(password, salt);

  try {
    // Verify HMAC for tamper detection
    const header = Buffer.concat([magic, Buffer.from([version]), salt, iv]);
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(header);
    const computedHmac = hmac.digest();

    if (!crypto.timingSafeEqual(hmacValue, computedHmac)) {
      throw new Error('Tamper detected: .env.enc has been modified');
    }

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);

    // Parse JSON
    const envVars = JSON.parse(plaintext.toString('utf-8'));

    // Securely wipe sensitive data
    secureWipe(key);
    secureWipe(plaintext);

    return envVars;

  } catch (error) {
    secureWipe(key);
    if (error.message.includes('Tamper detected')) {
      throw error;
    }
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * One-line decrypt function for use in application code
 * Reads .env.enc from current directory and populates process.env
 * @param {Object} options - Options
 * @param {string} options.path - Path to .env.enc (default: './.env.enc')
 * @param {string} options.password - Password (if not provided, prompts interactively)
 */
export async function decryptToEnv(options = {}) {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { createInterface } = await import('node:readline');

  const envPath = options.path || path.resolve(process.cwd(), '.env.enc');

  if (!fs.existsSync(envPath)) {
    throw new Error(`.env.enc not found at ${envPath}. Run 'envcrypt init' first.`);
  }

  // Read encrypted file
  const payload = fs.readFileSync(envPath);

  // Get password
  let password = options.password;
  if (!password) {
    // Check for ENVCRYPT_PASSWORD environment variable
    password = process.env.ENVCRYPT_PASSWORD;
  }

  if (!password) {
    // Prompt for password
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    password = await new Promise((resolve) => {
      rl.question('Enter envcrypt password: ', (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  // Decrypt
  const envVars = await decrypt(payload, password);

  // Populate process.env
  for (const [key, value] of Object.entries(envVars)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }

  return envVars;
}

// Default export for simple require
export default { encrypt, decrypt, decryptToEnv };
