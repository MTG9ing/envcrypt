/**
 * envcrypt Run Command
 * Decrypt environment, inject into child process, auto-cleanup
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import { decrypt } from '../crypto/cipher.js';
import { secureWipe, clearEnvVars } from '../crypto/memory.js';

/**
 * Run a command with decrypted environment variables
 * @param {string} command - Command to run
 * @param {string[]} args - Arguments for the command
 */
export default async function run(command, args = []) {
  const envEncPath = path.resolve(process.cwd(), '.env.enc');

  // Check if .env.enc exists
  if (!fs.existsSync(envEncPath)) {
    console.error(chalk.red('❌ .env.enc not found. Run "envcrypt init" first.'));
    process.exit(1);
  }

  // Read encrypted file
  const spinner = ora('Decrypting environment...').start();
  const payload = fs.readFileSync(envEncPath);

  // Get password
  let password = process.env.ENVCRYPT_PASSWORD;

  if (!password) {
    spinner.stop();
    const { createInterface } = await import('node:readline');
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    password = await new Promise((resolve) => {
      rl.question(chalk.cyan('Enter envcrypt password: '), (answer) => {
        rl.close();
        resolve(answer);
      });
    });
    spinner.start('Decrypting environment...');
  }

  try {
    // Decrypt
    const envVars = await decrypt(payload, password);
    spinner.succeed(chalk.green('Environment decrypted'));

    // Wipe password from memory
    if (password !== process.env.ENVCRYPT_PASSWORD) {
      secureWipe(Buffer.from(password));
    }

    // Merge with existing environment
    const childEnv = {
      ...process.env,
      ...envVars,
      ENVCRYPT_ACTIVE: 'true'
    };

    // Determine shell command
    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'cmd.exe' : '/bin/sh';
    const shellFlag = isWindows ? '/c' : '-c';

    // Build command string
    const fullCommand = args.length > 0
      ? `${command} ${args.join(' ')}`
      : command;

    console.log(chalk.cyan(`\n▶ Running: ${fullCommand}\n`));

    // Spawn child process with decrypted environment
    const child = spawn(shell, [shellFlag, fullCommand], {
      env: childEnv,
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Handle child process exit
    child.on('exit', (code) => {
      // Cleanup: clear env vars from parent process
      clearEnvVars();
      for (const key of Object.keys(envVars)) {
        delete process.env[key];
      }

      console.log(chalk.gray(`\n✓ Process exited with code ${code}`));
      process.exit(code || 0);
    });

    child.on('error', (error) => {
      console.error(chalk.red(`\n❌ Failed to run command: ${error.message}`));
      clearEnvVars();
      process.exit(1);
    });

  } catch (error) {
    spinner.fail(chalk.red(`Decryption failed: ${error.message}`));
    process.exit(1);
  }
}