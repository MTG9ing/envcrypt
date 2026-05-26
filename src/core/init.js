/**
 * envcrypt Init Command
 * Interactive wizard for setting up encrypted environment
 */

import fs from 'node:fs';
import path from 'node:path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { encrypt } from '../crypto/cipher.js';
import { suggestPorts } from '../crypto/port.js';
import { generateSecrets } from '../crypto/secrets.js';

/**
 * Default presets for different project types
 */
const PRESETS = {
  'node-jwt-postgres': {
    name: 'Node.js + JWT + PostgreSQL',
    vars: [
      { name: 'JWT_SECRET', type: 'jwt', description: 'JWT signing secret' },
      { name: 'SESSION_SECRET', type: 'session', description: 'Session encryption secret' },
      { name: 'DB_HOST', type: 'static', value: 'localhost', description: 'Database host' },
      { name: 'DB_PORT', type: 'port', portType: 'database', description: 'Database port' },
      { name: 'DB_NAME', type: 'input', default: 'myapp', description: 'Database name' },
      { name: 'DB_USER', type: 'input', default: 'postgres', description: 'Database user' },
      { name: 'DB_PASSWORD', type: 'password', description: 'Database password' },
      { name: 'API_PORT', type: 'port', portType: 'api', description: 'API server port' }
    ]
  },
  'node-mongodb': {
    name: 'Node.js + MongoDB',
    vars: [
      { name: 'JWT_SECRET', type: 'jwt', description: 'JWT signing secret' },
      { name: 'MONGODB_URI', type: 'input', default: 'mongodb://localhost:27017/myapp', description: 'MongoDB connection URI' },
      { name: 'API_PORT', type: 'port', portType: 'api', description: 'API server port' },
      { name: 'REDIS_URL', type: 'input', default: 'redis://localhost:6379', description: 'Redis connection URL' }
    ]
  },
  'python-django': {
    name: 'Python Django',
    vars: [
      { name: 'SECRET_KEY', type: 'jwt', description: 'Django secret key' },
      { name: 'DATABASE_URL', type: 'input', default: 'postgres://localhost:5432/myapp', description: 'Database URL' },
      { name: 'DEBUG', type: 'confirm', default: false, description: 'Debug mode' },
      { name: 'ALLOWED_HOSTS', type: 'input', default: 'localhost,127.0.0.1', description: 'Allowed hosts' }
    ]
  },
  'go-standard': {
    name: 'Go Standard',
    vars: [
      { name: 'JWT_SECRET', type: 'jwt', description: 'JWT signing secret' },
      { name: 'DB_DSN', type: 'input', default: 'host=localhost port=5432 dbname=myapp', description: 'Database DSN' },
      { name: 'API_PORT', type: 'port', portType: 'api', description: 'API server port' },
      { name: 'LOG_LEVEL', type: 'list', choices: ['debug', 'info', 'warn', 'error'], default: 'info', description: 'Log level' }
    ]
  },
  'vanilla-js': {
    name: 'Vanilla JavaScript',
    vars: [
      { name: 'API_KEY', type: 'api_key', description: 'API key' },
      { name: 'API_PORT', type: 'port', portType: 'api', description: 'Server port' }
    ]
  }
};

/**
 * Main init function
 * @param {Object} options - CLI options
 */
export default async function init(options = {}) {
  console.log(chalk.cyan('\n🔐 envcrypt initialization'));
  console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  // Check if .env.enc already exists
  const envEncPath = path.resolve(process.cwd(), '.env.enc');
  if (fs.existsSync(envEncPath) && !options.force) {
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: chalk.yellow('.env.enc already exists. Overwrite?'),
      default: false
    }]);
    if (!overwrite) {
      console.log(chalk.gray('\nCancelled. Existing .env.enc preserved.'));
      return;
    }
  }

  // Step 1: Select preset or custom
  let preset = options.preset;
  if (!preset) {
    const { selectedPreset } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedPreset',
      message: 'Choose a project preset:',
      choices: [
        ...Object.entries(PRESETS).map(([key, value]) => ({
          name: `${value.name} (${key})`,
          value: key
        })),
        { name: 'Custom (configure manually)', value: 'custom' }
      ]
    }]);
    preset = selectedPreset;
  }

  // Step 2: Project name
  const { projectName } = await inquirer.prompt([{
    type: 'input',
    name: 'projectName',
    message: 'Project name:',
    default: path.basename(process.cwd())
  }]);

  // Step 3: Gather environment variables
  const envVars = { PROJECT_NAME: projectName };
  const secretDefs = [];

  if (preset !== 'custom' && PRESETS[preset]) {
    // Use preset
    console.log(chalk.gray(`\nUsing preset: ${PRESETS[preset].name}\n`));

    for (const def of PRESETS[preset].vars) {
      if (def.type === 'jwt' || def.type === 'session' || def.type === 'api_key') {
        const { generate } = await inquirer.prompt([{
          type: 'confirm',
          name: 'generate',
          message: `Generate ${def.description} (${def.name})?`,
          default: true
        }]);
        if (generate) {
          secretDefs.push({ name: def.name, type: def.type });
        }
      } else if (def.type === 'port') {
        const portInfo = await suggestPorts(def.portType);
        const { port } = await inquirer.prompt([{
          type: 'input',
          name: 'port',
          message: `${def.description} (detected free: ${portInfo.suggested}):`,
          default: portInfo.suggested.toString(),
          validate: (input) => {
            const num = parseInt(input, 10);
            if (isNaN(num) || num < 1024 || num > 65535) {
              return 'Please enter a valid port (1024-65535)';
            }
            return true;
          }
        }]);
        envVars[def.name] = port;
      } else if (def.type === 'static') {
        envVars[def.name] = def.value;
      } else if (def.type === 'confirm') {
        const { value } = await inquirer.prompt([{
          type: 'confirm',
          name: 'value',
          message: `${def.description} (${def.name})?`,
          default: def.default
        }]);
        envVars[def.name] = value ? 'true' : 'false';
      } else if (def.type === 'list') {
        const { value } = await inquirer.prompt([{
          type: 'list',
          name: 'value',
          message: `${def.description} (${def.name}):`,
          choices: def.choices,
          default: def.default
        }]);
        envVars[def.name] = value;
      } else {
        const { value } = await inquirer.prompt([{
          type: def.type === 'password' ? 'password' : 'input',
          name: 'value',
          message: `${def.description} (${def.name}):`,
          default: def.default || ''
        }]);
        envVars[def.name] = value;
      }
    }
  } else {
    // Custom mode
    console.log(chalk.gray('\nCustom configuration mode\n'));

    let addingVars = true;
    while (addingVars) {
      const { varName } = await inquirer.prompt([{
        type: 'input',
        name: 'varName',
        message: 'Environment variable name (or empty to finish):',
        validate: (input) => {
          if (input && !/^[A-Z_][A-Z0-9_]*$/.test(input)) {
            return 'Variable name must be UPPER_SNAKE_CASE';
          }
          return true;
        }
      }]);

      if (!varName) {
        addingVars = false;
        break;
      }

      const { varType } = await inquirer.prompt([{
        type: 'list',
        name: 'varType',
        message: `Type for ${varName}:`,
        choices: [
          { name: 'Secret (auto-generated)', value: 'secret' },
          { name: 'Port (auto-detect available)', value: 'port' },
          { name: 'Text input', value: 'text' },
          { name: 'Password (hidden input)', value: 'password' }
        ]
      }]);

      if (varType === 'secret') {
        const { secretType } = await inquirer.prompt([{
          type: 'list',
          name: 'secretType',
          message: 'Secret type:',
          choices: [
            { name: 'JWT Secret (64 bytes)', value: 'jwt' },
            { name: 'Session Secret (32 bytes)', value: 'session' },
            { name: 'API Key (32 bytes, URL-safe)', value: 'api_key' }
          ]
        }]);
        secretDefs.push({ name: varName, type: secretType });
      } else if (varType === 'port') {
        const portInfo = await suggestPorts('api');
        const { port } = await inquirer.prompt([{
          type: 'input',
          name: 'port',
          message: `Port for ${varName} (suggested: ${portInfo.suggested}):`,
          default: portInfo.suggested.toString()
        }]);
        envVars[varName] = port;
      } else if (varType === 'password') {
        const { value } = await inquirer.prompt([{
          type: 'password',
          name: 'value',
          message: `Value for ${varName}:`,
          mask: '*'
        }]);
        envVars[varName] = value;
      } else {
        const { value } = await inquirer.prompt([{
          type: 'input',
          name: 'value',
          message: `Value for ${varName}:`
        }]);
        envVars[varName] = value;
      }
    }
  }

  // Step 4: Generate secrets
  if (secretDefs.length > 0) {
    const spinner = ora('Generating cryptographically secure secrets...').start();
    const secrets = generateSecrets(secretDefs);
    Object.assign(envVars, secrets);
    spinner.succeed(chalk.green(`Generated ${secretDefs.length} secure secrets`));
  }

  // Step 5: Set password for encryption
  console.log(chalk.gray('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  const { password } = await inquirer.prompt([{
    type: 'password',
    name: 'password',
    message: 'Set a master password for .env.enc:',
    mask: '*',
    validate: (input) => {
      if (input.length < 8) {
        return 'Password must be at least 8 characters';
      }
      return true;
    }
  }, {
    type: 'password',
    name: 'passwordConfirm',
    message: 'Confirm master password:',
    mask: '*',
    validate: (input, answers) => {
      if (input !== answers.password) {
        return 'Passwords do not match';
      }
      return true;
    }
  }]);

  // Step 6: Encrypt and save
  const spinner = ora('Encrypting environment variables...').start();

  try {
    const encrypted = await encrypt(envVars, password);
    fs.writeFileSync(envEncPath, encrypted);

    // Create .envcrypt directory and config
    const envcryptDir = path.resolve(process.cwd(), '.envcrypt');
    if (!fs.existsSync(envcryptDir)) {
      fs.mkdirSync(envcryptDir, { recursive: true });
    }

    const config = {
      project: projectName,
      version: '1.0.0',
      preset: preset !== 'custom' ? preset : null,
      createdAt: new Date().toISOString(),
      variables: Object.keys(envVars).map(name => ({
        name,
        type: secretDefs.find(s => s.name === name) ? 'secret' : 'variable'
      }))
    };

    fs.writeFileSync(
      path.join(envcryptDir, 'config.json'),
      JSON.stringify(config, null, 2)
    );

    spinner.succeed(chalk.green('Encrypted environment saved to .env.enc'));

    // Step 7: Display summary and usage
    console.log(chalk.cyan('\n📋 Environment Summary'));
    console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(`Project: ${chalk.white(projectName)}`);
    console.log(`Variables: ${chalk.white(Object.keys(envVars).length)}`);
    console.log(`Secrets: ${chalk.white(secretDefs.length)}`);
    console.log(`File: ${chalk.white('.env.enc')}`);

    console.log(chalk.cyan('\n🚀 Usage'));
    console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.yellow('In your code:'));
    console.log(chalk.gray("require('envcrypt').decrypt();"));
    console.log(chalk.gray('// process.env is now populated'));
    console.log(chalk.yellow('\nRun your app:'));
    console.log(chalk.gray('envcrypt run npm start'));

    console.log(chalk.cyan('\n✅ Your environment is locked!'));
    console.log(chalk.gray('.env.enc is safe to commit. Never commit .env files.\n'));

  } catch (error) {
    spinner.fail(chalk.red(`Encryption failed: ${error.message}`));
    process.exit(1);
  }
}