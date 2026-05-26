# ENV-LOCK PROJECT CONTEXT
# =======================
# Last Updated: 2026-05-26
# Purpose: Preserve the vision, plan, and architecture of env-lock
# Status: PHASE 1 & 2 COMPLETE — Ready for npm publish

# -----------------------------------------------------------------------------
# PROJECT IDENTITY
# -----------------------------------------------------------------------------
NAME:        env-lock
TAGLINE:     "The Ultimate Developer Secrets Swiss Army Knife"
FORMAT:      CLI Tool & Cryptographic Core Security Module
LICENSE:     MIT
VERSION:     1.0.0
STATUS:      MVP Complete — Core + Security phases implemented

# -----------------------------------------------------------------------------
# CORE PROBLEM SOLVED
# -----------------------------------------------------------------------------
- Developers store secrets in plaintext .env files
- .env files get accidentally committed to git
- Secrets leak when laptops are stolen or repos are exposed
- Manual secret generation is weak (changeme123, password123)
- Port conflicts waste developer time
- Team secret sharing is insecure (Slack, email)

# -----------------------------------------------------------------------------
# CORE SOLUTION
# -----------------------------------------------------------------------------
1. INTERACTIVE SETUP (env-lock init)
   - Guides user through environment configuration
   - Auto-generates high-entropy cryptographic strings
   - Detects active local processes for safe port suggestions
   - Bundles everything into encrypted .env.enc

2. RUNTIME DECRYPTION
   - One-line code snippet decrypts .env.enc into memory
   - Secrets never saved as plaintext on disk
   - Auto-cleanup when process exits

3. TEAM SHARING (Phase 3 — PLANNED)
   - Asymmetric encryption for team key distribution
   - One-time bootstrap tokens for new members
   - .env.enc is safe to commit to version control

# -----------------------------------------------------------------------------
# IMPLEMENTATION STATUS
# -----------------------------------------------------------------------------

PHASE 1: CORE FOUNDATION — ✅ COMPLETE
----------------------------------------
1.  env-lock init              ✅ Interactive wizard for first-time setup
2.  Auto-generated secrets      ✅ Crypto-secure random strings (JWT, sessions, API keys)
3.  Port detection              ✅ Scan active processes, suggest safe unblocked ports
4.  AES-256-GCM encryption      ✅ Encrypt all variables into .env.enc binary payload
5.  Runtime decryption snippet  ✅ One-liner to decrypt into application memory
6.  env-lock run <cmd>          ✅ Decrypt, inject into child process, auto-cleanup on exit

PHASE 2: SECURITY HARDENING — ✅ COMPLETE
------------------------------------------
7.  Password-derived key (Argon2id)  ✅ User master password -> encryption key
8.  Memory lock (mlock)              ⚠️ Detected availability, graceful fallback
9.  Auto-shred memory                ✅ Explicit buffer overwrite after use
10. Tamper-evident HMAC              ✅ Integrity check on .env.enc header
11. Audit logging                    ✅ .env-lock/audit.log tracks decrypt events
12. Pre-commit hook                  ✅ Block plaintext .env commits

PHASE 3: TEAM & COLLABORATION — 📝 PLANNED
-------------------------------------------
13. Asymmetric key sharing      📝 Placeholder module created
14. env-lock join <token>       📝 Placeholder module created
15. Secret versioning           📝 Placeholder module created
16. Secret diffing              📝 Placeholder module created
17. Hot rotation                📝 Placeholder module created

PHASE 4: DEVELOPER EXPERIENCE — ✅ COMPLETE
--------------------------------------------
18. Template presets            ✅ 5 presets: node-jwt-postgres, node-mongodb, python-django, go-standard, vanilla-js
19. Shell autocompletion        📝 Planned for v1.1
20. env-lock doctor             ✅ Health check environment setup
21. Framework-aware snippets    ✅ 4 snippets: express-js, express-ts, fastify-js, vanilla-js
22. .env-lock/config.json sync  ✅ Auto-generated on init

PHASE 5: INTEGRATIONS & EXPORT — 📝 PLANNED
--------------------------------------------
23. Cloud vault export          📝 Placeholder modules created (AWS, 1Password, Vault)
24. GitHub Action               📝 Planned for v1.2
25. Bliss CLI auto-injection    📝 Optional integration, not required

# -----------------------------------------------------------------------------
# FILE STRUCTURE
# -----------------------------------------------------------------------------
env-lock/
├── bin/
│   └── env-lock.js          ✅ CLI entry point (Commander.js)
├── src/
│   ├── index.js             ✅ Main exports
│   ├── crypto/              ✅ All implemented
│   │   ├── cipher.js        ✅ AES-256-GCM + Argon2id encryption/decryption
│   │   ├── kdf.js           📝 Extracted into cipher.js (inline)
│   │   ├── memory.js        ✅ Secure memory management
│   │   ├── port.js          ✅ Port detection & suggestions
│   │   └── secrets.js       ✅ Cryptographically secure secret generation
│   ├── core/                ✅ All implemented
│   │   ├── init.js          ✅ Interactive wizard with presets
│   │   ├── run.js           ✅ Decrypt + execute + cleanup
│   │   ├── doctor.js        ✅ Health checks
│   │   └── rotate.js        📝 Placeholder for v1.1
│   ├── team/                📝 Placeholders for v1.1
│   │   ├── keys.js          📝 RSA key pair management
│   │   ├── tokens.js        📝 Bootstrap token generation
│   │   └── versioning.js    📝 Secret version control
│   ├── templates/           ✅ All implemented
│   │   ├── presets/         ✅ 5 JSON presets
│   │   └── snippets/        ✅ 4 runtime code snippets
│   ├── audit/               ✅ All implemented
│   │   ├── logger.js        ✅ JSON Lines audit trail
│   │   └── hooks.js         ✅ Git pre-commit hook installer
│   └── integrations/        📝 Placeholders for v1.2
│       ├── aws.js           📝 AWS Secrets Manager
│       ├── onepassword.js   📝 1Password
│       └── vault.js         📝 HashiCorp Vault
├── tests/                   📝 Placeholder files
│   ├── crypto.test.js
│   └── core.test.js
├── docs/                    ✅ Created
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   └── API.md
├── README.md                ✅ Complete with banner
├── CONTEXT.md               ✅ This file
├── package.json             ✅ Configured for npm publish
└── .gitignore               ✅ Standard Node.js ignore

# -----------------------------------------------------------------------------
# TECH STACK
# -----------------------------------------------------------------------------
RUNTIME:     Node.js >= 18.0.0
LANGUAGE:    JavaScript (ES Modules)
CRYPTO:      Node.js crypto module (AES-256-GCM, HMAC-SHA256)
KDF:         Argon2id via argon2 npm package
CLI:         Commander.js + Inquirer.js + Chalk + Ora + Boxen
TESTING:     Vitest (configured, tests pending)
LINTING:     ESLint + Prettier (configured)

# -----------------------------------------------------------------------------
# ENCRYPTION PROTOCOL
# -----------------------------------------------------------------------------
ALGORITHM:        AES-256-GCM
KEY_SIZE:         256 bits (32 bytes)
IV_SIZE:          96 bits (12 bytes) - recommended for GCM
TAG_SIZE:         128 bits (16 bytes)
KDF:              Argon2id
  - Memory:       64 MB
  - Iterations:   3
  - Parallelism:  4
  - Salt length:  16 bytes
HMAC:             SHA-256 (for tamper detection on header)

ENCRYPTED FILE FORMAT (.env.enc):
  [4 bytes]   Magic: "ENVL" (0x454E564C)
  [1 byte]    Version: 0x01
  [32 bytes]  HMAC-SHA256 of header
  [16 bytes]  Argon2id salt
  [12 bytes]  AES-GCM IV
  [N bytes]   Ciphertext (encrypted env vars as JSON)
  [16 bytes]  AES-GCM auth tag

# -----------------------------------------------------------------------------
# PUBLISH CHECKLIST
# -----------------------------------------------------------------------------
[✅] Fix syntax errors
[✅] Fix ESM imports (require → import)
[✅] Update package.json with correct metadata
[✅] Write comprehensive README.md
[✅] Write CONTEXT.md
[📝] Add test coverage (minimum for npm credibility)
[📝] Create GitHub repository
[📝] Add GitHub Actions CI
[📝] Publish to npm registry
[📝] Create release tags

# -----------------------------------------------------------------------------
# NPM PUBLISH STEPS
# -----------------------------------------------------------------------------
1. npm login
2. npm version 1.0.0
3. npm publish --access public
4. Verify: npm view env-lock

# -----------------------------------------------------------------------------
# GITHUB SETUP STEPS
# -----------------------------------------------------------------------------
1. Create repo: github.com/new → env-lock
2. git init
3. git add .
4. git commit -m "feat: initial release v1.0.0"
5. git branch -M main
6. git remote add origin https://github.com/YOUR_USERNAME/env-lock.git
7. git push -u origin main
8. Create release: github.com/YOUR_USERNAME/env-lock/releases/new
9. Tag: v1.0.0

# -----------------------------------------------------------------------------
# KNOWN ISSUES & LIMITATIONS
# -----------------------------------------------------------------------------
- mlock requires root/CAP_IPC_LOCK on Linux (graceful fallback implemented)
- Windows port detection uses netstat (less reliable than /proc/net/tcp)
- Team features not yet implemented (Phase 3)
- Cloud integrations not yet implemented (Phase 5)
- No test coverage yet (placeholder files only)

# -----------------------------------------------------------------------------
# FUTURE ROADMAP
# -----------------------------------------------------------------------------
v1.1 — Team Features
  - Asymmetric key sharing
  - Bootstrap tokens (env-lock join)
  - Secret versioning & diffing
  - Hot rotation
  - Shell autocompletion

v1.2 — Integrations
  - AWS Secrets Manager export
  - 1Password export
  - HashiCorp Vault export
  - GitHub Action
  - Docker image

v2.0 — Advanced
  - Hardware key support (YubiKey)
  - Time-locked secrets
  - Geofenced decryption
  - VS Code extension
  - GUI version (Electron)

# -----------------------------------------------------------------------------
# END OF CONTEXT
# -----------------------------------------------------------------------------
