# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-05-26

### Added
- Initial release of envcrypt
- AES-256-GCM encryption with Argon2id key derivation
- Interactive `envcrypt init` wizard with 5 framework presets
- Smart port detection and safe port suggestions
- Cryptographically secure secret generation (JWT, session, API key)
- Runtime decryption with `require('envcrypt').decrypt()`
- `envcrypt run <cmd>` for secure execution with auto-cleanup
- `envcrypt doctor` health check command
- Memory-safe buffer wiping and cleanup
- Tamper-evident HMAC on encrypted files
- Audit logging to `.envcrypt/audit.log`
- Git pre-commit hook to block plaintext `.env` commits
- 4 framework-aware runtime snippets (Express, Fastify, Vanilla)
- Cross-platform port detection (Linux, macOS, Windows)

### Security
- Military-grade AES-256-GCM encryption
- Argon2id password hashing (64MB, 3 iterations, 4 parallelism)
- Secure memory wiping with triple-pass overwrite
- Timing-safe HMAC comparison
- No plaintext secrets ever touch disk

## [Unreleased]

### Planned
- Team key sharing with asymmetric encryption
- One-time bootstrap tokens (`envcrypt join`)
- Secret versioning and diffing
- Hot secret rotation
- Shell autocompletion
- Cloud vault integrations (AWS, 1Password, HashiCorp Vault)
- GitHub Action for CI/CD