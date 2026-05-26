/**
 * envcrypt Doctor Command
 * Health check for environment setup
 */

import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';

/**
 * Run health checks
 */
export default async function doctor() {
  console.log(chalk.cyan('\n🩺 envcrypt Doctor'));
  console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  const checks = [];

  // Check 1: .env.enc exists
  const envEncPath = path.resolve(process.cwd(), '.env.enc');
  if (fs.existsSync(envEncPath)) {
    const stats = fs.statSync(envEncPath);
    checks.push({
      name: '.env.enc file',
      status: 'pass',
      detail: `Found (${(stats.size / 1024).toFixed(2)} KB)`
    });
  } else {
    checks.push({
      name: '.env.enc file',
      status: 'fail',
      detail: 'Not found. Run "envcrypt init"'
    });
  }

  // Check 2: .envcrypt/config.json exists
  const configPath = path.resolve(process.cwd(), '.envcrypt', 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      checks.push({
        name: 'Configuration',
        status: 'pass',
        detail: `Project: ${config.project}, Version: ${config.version}`
      });
    } catch {
      checks.push({
        name: 'Configuration',
        status: 'fail',
        detail: 'config.json is corrupted'
      });
    }
  } else {
    checks.push({
      name: 'Configuration',
      status: 'warn',
      detail: 'No config.json found'
    });
  }

  // Check 3: .gitignore includes .env
  const gitignorePath = path.resolve(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    if (gitignore.includes('.env') && !gitignore.includes('.env.enc')) {
      checks.push({
        name: '.gitignore',
        status: 'pass',
        detail: '.env ignored, .env.enc not ignored (correct)'
      });
    } else if (!gitignore.includes('.env')) {
      checks.push({
        name: '.gitignore',
        status: 'warn',
        detail: '.env not in .gitignore — plaintext secrets may be committed!'
      });
    } else {
      checks.push({
        name: '.gitignore',
        status: 'warn',
        detail: '.env.enc is in .gitignore — it is safe to commit encrypted files'
      });
    }
  } else {
    checks.push({
      name: '.gitignore',
      status: 'warn',
      detail: 'No .gitignore found'
    });
  }

  // Check 4: Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (majorVersion >= 18) {
    checks.push({
      name: 'Node.js version',
      status: 'pass',
      detail: `${nodeVersion} (>= 18.0.0)`
    });
  } else {
    checks.push({
      name: 'Node.js version',
      status: 'fail',
      detail: `${nodeVersion} (requires >= 18.0.0)`
    });
  }

  // Check 5: No plaintext .env files
  const envFiles = ['.env', '.env.local', '.env.development', '.env.production'];
  const foundEnvFiles = envFiles.filter(f => fs.existsSync(path.resolve(process.cwd(), f)));
  if (foundEnvFiles.length === 0) {
    checks.push({
      name: 'Plaintext .env files',
      status: 'pass',
      detail: 'None found'
    });
  } else {
    checks.push({
      name: 'Plaintext .env files',
      status: 'warn',
      detail: `Found: ${foundEnvFiles.join(', ')} — consider removing or encrypting`
    });
  }

  // Print results
  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  for (const check of checks) {
    let icon, color;
    if (check.status === 'pass') {
      icon = '✓';
      color = chalk.green;
      passCount++;
    } else if (check.status === 'warn') {
      icon = '⚠';
      color = chalk.yellow;
      warnCount++;
    } else {
      icon = '✗';
      color = chalk.red;
      failCount++;
    }

    console.log(`${color(icon)} ${check.name}`);
    console.log(chalk.gray(`  ${check.detail}\n`));
  }

  // Summary
  console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(
    chalk.green(`${passCount} passed`) +
    chalk.yellow(`  ${warnCount} warnings`) +
    chalk.red(`  ${failCount} failed`)
  );

  if (failCount > 0) {
    console.log(chalk.red('\n❌ Some checks failed. Please fix the issues above.'));
    process.exit(1);
  } else if (warnCount > 0) {
    console.log(chalk.yellow('\n⚠ Some warnings found. Review recommended.'));
  } else {
    console.log(chalk.green('\n✅ All checks passed! Your environment is secure.'));
  }
}