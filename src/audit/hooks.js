/**
 * env-lock Git Hooks
 * Pre-commit hook to prevent plaintext .env commits
 */

import fs from 'node:fs';
import path from 'node:path';

const HOOK_SCRIPT = `#!/bin/sh
# env-lock pre-commit hook
# Prevents committing plaintext .env files

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

for FILE in $STAGED_FILES; do
  case "$FILE" in
    .env|.env.local|.env.*.local|.env.development|.env.production|.env.staging)
      echo "❌ ERROR: Attempting to commit plaintext .env file: $FILE"
      echo "   Run 'env-lock init' to encrypt your environment variables."
      echo "   Only .env.enc should be committed."
      exit 1
      ;;
  esac
done

exit 0
`;

const HOOK_PATH = '.git/hooks/pre-commit';

/**
 * Install pre-commit hook
 * @returns {boolean} - Whether installation succeeded
 */
export function installPreCommitHook() {
  try {
    const hookPath = path.resolve(process.cwd(), HOOK_PATH);
    const gitDir = path.resolve(process.cwd(), '.git');

    if (!fs.existsSync(gitDir)) {
      console.log('⚠ No .git directory found. Skipping pre-commit hook installation.');
      return false;
    }

    // Check if hook already exists
    if (fs.existsSync(hookPath)) {
      const existing = fs.readFileSync(hookPath, 'utf-8');
      if (existing.includes('env-lock')) {
        console.log('✓ env-lock pre-commit hook already installed.');
        return true;
      }

      // Append to existing hook
      fs.appendFileSync(hookPath, '\n' + HOOK_SCRIPT);
      fs.chmodSync(hookPath, 0o755);
      console.log('✓ env-lock pre-commit hook appended to existing hook.');
      return true;
    }

    // Create new hook
    fs.writeFileSync(hookPath, HOOK_SCRIPT);
    fs.chmodSync(hookPath, 0o755);
    console.log('✓ env-lock pre-commit hook installed.');
    return true;

  } catch (error) {
    console.error(`❌ Failed to install pre-commit hook: ${error.message}`);
    return false;
  }
}

/**
 * Remove pre-commit hook
 * @returns {boolean}
 */
export function removePreCommitHook() {
  try {
    const hookPath = path.resolve(process.cwd(), HOOK_PATH);

    if (!fs.existsSync(hookPath)) {
      return false;
    }

    const content = fs.readFileSync(hookPath, 'utf-8');
    if (!content.includes('env-lock')) {
      return false;
    }

    // If hook only contains env-lock, remove it entirely
    const lines = content.split('\n');
    const envLockStart = lines.findIndex(line => line.includes('env-lock pre-commit hook'));
    
    if (envLockStart === 0) {
      // env-lock is the only content
      fs.unlinkSync(hookPath);
    } else {
      // Remove env-lock section from mixed hook
      const newContent = lines.slice(0, envLockStart).join('\n');
      fs.writeFileSync(hookPath, newContent);
    }

    console.log('✓ env-lock pre-commit hook removed.');
    return true;

  } catch (error) {
    console.error(`❌ Failed to remove pre-commit hook: ${error.message}`);
    return false;
  }
}

export default { installPreCommitHook, removePreCommitHook };