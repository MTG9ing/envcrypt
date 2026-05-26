# envcrypt Publish Guide
# ======================
# Follow these steps to publish envcrypt to npm and GitHub

# -----------------------------------------------------------------------------
# STEP 1: CREATE GITHUB REPOSITORY
# -----------------------------------------------------------------------------

1. Go to https://github.com/new
2. Repository name: envcrypt
3. Description: The Ultimate Developer Secrets Swiss Army Knife
4. Visibility: Public
5. ✅ Initialize with README (we'll replace it)
6. ✅ Add .gitignore (Node template)
7. ✅ Choose a license (MIT)
8. Click "Create repository"

# -----------------------------------------------------------------------------
# STEP 2: PUSH LOCAL CODE TO GITHUB
# -----------------------------------------------------------------------------

# In your terminal, navigate to the envcrypt project folder:
cd /path/to/envcrypt

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "feat: initial release v1.0.0

- AES-256-GCM encryption with Argon2id key derivation
- Interactive init wizard with 5 framework presets
- Smart port detection and suggestions
- Cryptographically secure secret generation
- Runtime decryption with memory-safe cleanup
- envcrypt run command for secure execution
- envcrypt doctor health checks
- Audit logging and pre-commit hooks
- 4 framework-aware code snippets"

# Rename branch to main
git branch -M main

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/envcrypt.git

# Push
git push -u origin main

# -----------------------------------------------------------------------------
# STEP 3: SETUP NPM ACCOUNT & TOKEN
# -----------------------------------------------------------------------------

1. Go to https://www.npmjs.com/ and create an account (if you don't have one)
2. Enable 2FA on your npm account (required for publishing)
3. Go to Account → Access Tokens
4. Click "Generate New Token"
5. Select "Granular Access Token"
6. Permissions:
   - Packages and Scopes: Read and write
   - Select packages: envcrypt
7. ⚠️ Check "Bypass 2FA" (needed for CI publishing)
8. Copy the token (you won't see it again!)

# -----------------------------------------------------------------------------
# STEP 4: ADD NPM TOKEN TO GITHUB SECRETS
# -----------------------------------------------------------------------------

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: NPM_TOKEN
4. Value: Paste your npm granular access token
5. Click "Add secret"

# -----------------------------------------------------------------------------
# STEP 5: FIRST MANUAL PUBLISH (Required before Trusted Publishing)
# -----------------------------------------------------------------------------

# Login to npm
npm login

# Verify you're logged in
npm whoami

# Dry run to check what will be published
npm publish --dry-run

# Publish (first version must be manual)
npm publish --access public

# Verify it published
npm view envcrypt

# -----------------------------------------------------------------------------
# STEP 6: SETUP TRUSTED PUBLISHING (Optional but Recommended)
# -----------------------------------------------------------------------------

# After first manual publish, go to npmjs.com:
# 1. Visit https://www.npmjs.com/package/envcrypt
# 2. Click "Settings" tab
# 3. Scroll to "Trusted Publishers"
# 4. Click "GitHub Actions"
# 5. Fill in:
#    - GitHub Organization: YOUR_USERNAME
#    - Repository: envcrypt
#    - Workflow: publish.yml
# 6. Click "Link"
# 7. Go to "Publishing access" → Set to "Require 2FA"
# 8. Now delete the NPM_TOKEN secret from GitHub (no longer needed!)
# 9. Update .github/workflows/publish.yml to remove always-auth

# -----------------------------------------------------------------------------
# STEP 7: CREATE A RELEASE
# -----------------------------------------------------------------------------

# Tag a new version
npm version patch   # or minor, or major

# Push the tag
git push origin main --tags

# GitHub Actions will automatically:
# 1. Run tests
# 2. Verify package contents
# 3. Publish to npm with provenance

# Or create a release manually:
# 1. Go to https://github.com/YOUR_USERNAME/envcrypt/releases/new
# 2. Choose tag: v1.0.0
# 3. Title: envcrypt v1.0.0
# 4. Description: Copy from CHANGELOG
# 5. Click "Publish release"

# -----------------------------------------------------------------------------
# STEP 8: VERIFY EVERYTHING
# -----------------------------------------------------------------------------

# Check npm
npm view envcrypt

# Install globally and test
npm install -g envcrypt
envcrypt --version
envcrypt doctor

# Check GitHub Actions
# Go to https://github.com/YOUR_USERNAME/envcrypt/actions
# Verify CI passes and publish workflow succeeded

# -----------------------------------------------------------------------------
# TROUBLESHOOTING
# -----------------------------------------------------------------------------

# Issue: "npm ERR! 403 Forbidden"
# Fix: Make sure you used --access public for scoped packages
#      Or check if package name is already taken

# Issue: "npm ERR! 401 Unauthorized"
# Fix: Run npm login again, or check if token expired

# Issue: "Invalid npm token" in CI
# Fix: Classic tokens were revoked in 2026. Use Granular Access Tokens.

# Issue: GitHub Actions publish fails
# Fix: Check that NPM_TOKEN secret is set correctly
#      Or verify Trusted Publishing is configured properly

# -----------------------------------------------------------------------------
# MAINTENANCE
# -----------------------------------------------------------------------------

# Update dependencies
npm update
npm audit fix

# Publish patch version (bug fixes)
npm version patch && git push origin main --tags

# Publish minor version (new features)
npm version minor && git push origin main --tags

# Publish major version (breaking changes)
npm version major && git push origin main --tags

# Deprecate old version (if needed)
npm deprecate envcrypt@1.0.0 "Critical security fix in v1.0.1"

# -----------------------------------------------------------------------------
# END OF PUBLISH GUIDE
# -----------------------------------------------------------------------------