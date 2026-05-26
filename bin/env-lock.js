#!/usr/bin/env node

/**
 * env-lock CLI
 * The Ultimate Developer Secrets Swiss Army Knife
 */

import { program } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import init from '../src/core/init.js';
import run from '../src/core/run.js';
import doctor from '../src/core/doctor.js';

const banner = boxen(
  chalk.cyan.bold('🔐 ENV-LOCK') + '\n' +
  chalk.gray('The Ultimate Developer Secrets Swiss Army Knife'),
  {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    dimBorder: true
  }
);

program
  .name('env-lock')
  .description('Encrypt your environment. Never leak a secret.')
  .version('1.0.0')
  .usage('<command> [options]');

// init command
program
  .command('init')
  .description('Initialize a new encrypted environment')
  .option('-p, --preset <name>', 'Use a template preset (node-jwt-postgres, node-mongodb, etc.)')
  .option('-f, --force', 'Overwrite existing .env.enc')
  .action(async (options) => {
    console.log(banner);
    await init(options);
  });

// run command
program
  .command('run')
  .description('Decrypt environment and run a command')
  .argument('<command>', 'Command to run (e.g., "npm start", "node server.js")')
  .allowUnknownOption()
  .action(async (command, options, commandObj) => {
    const args = commandObj.args.slice(1);
    await run(command, args);
  });

// doctor command
program
  .command('doctor')
  .description('Check environment health and configuration')
  .action(async () => {
    console.log(banner);
    await doctor();
  });

// Parse CLI arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  console.log(banner);
  program.outputHelp();
}