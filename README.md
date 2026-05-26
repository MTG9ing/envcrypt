<div align="center">

<!-- ASCII Banner -->
<pre style="background: transparent; border: none;">
╔═════════════════════════════════════════════════════════════════════════════════╗
║                                                                                 ║
║     ███████╗███╗   ██╗██╗   ██╗      ██████╗██████╗ ██╗   ██╗██████╗ ████████╗  ║
║     ██╔════╝████╗  ██║██║   ██║     ██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝  ║
║     █████╗  ██╔██╗ ██║██║   ██║     ██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║     ║
║     ██╔══╝  ██║╚██╗██║╚██╗ ██╔╝     ██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║     ║
║     ███████╗██║ ╚████║ ╚████╔╝      ╚██████╗██║  ██║   ██║   ██║        ██║     ║
║     ╚══════╝╚═╝  ╚═══╝  ╚═══╝        ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ╚═╝     ║
║                                                                                 ║
║                    The Ultimate Developer Secrets Swiss Army Knife              ║
╚═════════════════════════════════════════════════════════════════════════════════╝
</pre>

<!-- Badges -->
<p>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-≥18.0.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"></a>
  <a href="#"><img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/Security-AES--256--GCM-brightgreen?style=flat-square&logo=shield" alt="Security"></a>
  <a href="#"><img src="https://img.shields.io/badge/CLI-Interactive-blue?style=flat-square&logo=windowsterminal" alt="CLI"></a>
</p>

<p><strong>🔐 Never commit a <code>.env</code> file again. Never leak a secret.</strong></p>

</div>

---

## What is envcrypt?

**envcrypt** is a CLI tool that eliminates plaintext `.env` files from your development workflow. It interactively generates secrets, detects safe ports, encrypts everything into a single `.env.enc` file, and provides one-line runtime decryption straight into your application's memory.

**No plaintext on disk. No accidental commits. No leaked secrets.**

---

## ✨ Features

### Core

- 🎲 **Auto-generated secrets** — Cryptographically secure random strings for JWT, sessions, API keys
- 🔍 **Smart port detection** — Scans active processes, suggests completely safe, unblocked ports
- 🔐 **AES-256-GCM encryption** — Military-grade encryption for your environment variables
- ⚡ **One-line runtime decryption** — Decrypt `.env.enc` straight into memory, never touch disk
- 🚀 **`envcrypt run`** — Decrypt, inject, execute, auto-cleanup

### Security Hardening

- 🛡️ **Argon2id key derivation** — Your password becomes the encryption key, never stored
- 🔒 **Memory lock (mlock)** — Prevents secrets from swapping to disk
- 🧹 **Auto-shred memory** — Explicit buffer overwrite after use
- ✅ **Tamper-evident HMAC** — Detects any modification of `.env.enc`
- 📋 **Audit logging** — Every decrypt event tracked
- 🚫 **Pre-commit hook** — Blocks plaintext `.env` commits automatically

### Team & Collaboration

- 👥 **Asymmetric key sharing** — Share `.env.enc` safely via public key encryption
- 🔗 **One-time bootstrap tokens** — `envcrypt join <token>` for new team members
- 📜 **Secret versioning** — Track what changed, when, and who changed it
- 🔄 **Hot rotation** — Swap secrets in running processes without downtime

### Developer Experience

- 📦 **Template presets** — `envcrypt init --preset node-jwt-postgres`
- 🖥️ **Shell autocompletion** — Tab-complete everything
- 🩺 **`envcrypt doctor`** — Health check your environment setup
- 🧩 **Framework-aware snippets** — Auto-generate decryption code for your stack

### Integrations

- ☁️ **Cloud vault export** — AWS Secrets Manager, 1Password, HashiCorp Vault
- 🔄 **GitHub Action** — Decrypt in CI with repository secrets

---

## 🚀 Quick Start

### Installation

```bash
npm install -g envcrypt
```

### Initialize a new environment

```bash
$ envcrypt init

🔐 envcrypt initialization
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

? Project name: my-awesome-api
? Framework: Express.js
? Generate JWT secret? Yes
? Generate session secret? Yes
? Database port (detected free: 5433): 5433
? API port (detected free: 3001): 3001

✓ Generated cryptographically secure secrets
✓ Detected safe ports: 5433, 3001
✓ Encrypted 8 variables into .env.enc
✓ Generated runtime decryption snippet

🎉 Your environment is locked. Run with: envcrypt run npm start
```

### Use in your code

```javascript
// At the very top of your entry file
import { decryptToEnv } from "envcrypt";
await decryptToEnv();

// Now process.env has everything, never touched disk as plaintext
import jwt from "jsonwebtoken";
const token = jwt.sign(payload, process.env.JWT_SECRET);
```

### Run your application

```bash
# Decrypts to memory, runs your app, wipes on exit
envcrypt run node server.js

# Or with npm scripts
envcrypt run npm start
envcrypt run npm run dev
```

---

## 📁 What Gets Created

```
your-project/
├── .env.enc              # ✅ Encrypted environment (safe to commit)
├── .envcrypt/            # envcrypt metadata (safe to commit)
│   ├── config.json       # Schema, team public keys
│   └── audit.log         # Decrypt events
├── .gitignore            # ❌ .env is automatically ignored
└── src/
    └── index.js          # Your app with one-line decrypt
```

**What you commit:**

- ✅ `.env.enc` — encrypted binary, useless without the key
- ✅ `.envcrypt/` — config and audit logs

**What never exists:**

- ❌ `.env` — plaintext secrets never touch disk
- ❌ `.env.example` — interactive init replaces this

---

## 🛡️ Security Model

| State                  | Protection                                        |
| ---------------------- | ------------------------------------------------- |
| **At rest**            | AES-256-GCM encryption with Argon2id-derived key  |
| **In transit**         | Not applicable (local tool)                       |
| **In memory**          | Decrypted only at runtime, mlock'd, auto-shredded |
| **On disk**            | No plaintext `.env` file ever exists              |
| **In version control** | `.env.enc` is encrypted, safe to commit           |

---

## 📚 Commands

| Command                 | Description                                   |
| ----------------------- | --------------------------------------------- |
| `envcrypt init`         | Interactive environment setup wizard          |
| `envcrypt run <cmd>`    | Decrypt, inject, execute, cleanup             |
| `envcrypt doctor`       | Health check environment setup                |
| `envcrypt rotate`       | Generate new secrets, hot-swap in memory      |
| `envcrypt join <token>` | Join team with one-time bootstrap token       |
| `envcrypt export`       | Export to cloud vault (AWS, 1Password, Vault) |
| `envcrypt version`      | Show version and encryption metadata          |

---

## 🤝 Team Workflow

```bash
# Lead developer initializes and shares
$ envcrypt init
$ envcrypt team add alice@company.com
$ envcrypt team add bob@company.com
$ git add .env.enc .envcrypt/
$ git commit -m "feat: locked environment"

# Teammate joins with one-time token
$ git clone repo
$ envcrypt join abc123-def456-ghi789
$ envcrypt run npm start
```

---

## 🔧 Configuration

```json
// .envcrypt/config.json
{
  "project": "my-awesome-api",
  "version": "1.0.0",
  "schema": {
    "JWT_SECRET": { "type": "secret", "length": 64 },
    "SESSION_SECRET": { "type": "secret", "length": 32 },
    "DB_PORT": { "type": "port", "default": 5432 },
    "API_PORT": { "type": "port", "default": 3000 }
  },
  "team": {
    "alice": "-----BEGIN PUBLIC KEY-----...",
    "bob": "-----BEGIN PUBLIC KEY-----..."
  }
}
```

---

## 🏗️ Architecture

```
envcrypt/
├── bin/
│   └── envcrypt.js          # CLI entry point
├── src/
│   ├── crypto/              # AES-256-GCM, Argon2id, HMAC, mlock
│   │   ├── cipher.js        # Encryption/decryption + Argon2id KDF
│   │   └── memory.js        # Secure memory management
│   ├── core/                # Main commands
│   │   ├── init.js          # Interactive wizard
│   │   ├── run.js           # Decrypt + execute
│   │   ├── doctor.js        # Health checks
│   │   └── rotate.js        # Secret rotation
│   ├── team/                # Collaboration
│   │   ├── keys.js          # Asymmetric key management
│   │   ├── tokens.js        # Bootstrap token generation
│   │   └── versioning.js    # Secret version control
│   ├── templates/           # Presets & snippets
│   │   ├── presets/         # Framework presets
│   │   └── snippets/        # Runtime decryption code
│   ├── audit/               # Logging & hooks
│   │   ├── logger.js        # Audit trail
│   │   └── hooks.js         # Git pre-commit hook
│   └── integrations/        # External services
│       ├── aws.js           # AWS Secrets Manager
│       ├── onepassword.js   # 1Password
│       └── vault.js         # HashiCorp Vault
└── tests/
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run crypto tests
npm test -- --grep crypto

# Run integration tests
npm test -- --grep integration
```

---

## 📄 License

MIT © envcrypt contributors

---

<div align="center">

**🔐 Lock your secrets. Free your mind.**

</div>
