/* SECURITY.md — © Hardonia. MIT. */
# Security Policy
- Report vulnerabilities to security@hardonia.store (30-day private disclosure window).
- Secrets live in `.env.vault` (decrypted at runtime via `ENV_VAULT_PASS`).
- No PII or tokens in the repo; rotate any exposed keys immediately.
