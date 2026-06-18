---
description: Security audit focused on Node.js / TypeScript / Next.js / MongoDB stack
---

Run a focused security audit on this codebase. Injection: NoSQL injection via MongoDB operators, command injection, XSS. Auth/Authz: missing middleware on protected routes, JWT misconfiguration, privilege escalation, missing rate limiting. Secrets: hardcoded keys, secrets logged, sensitive fields in API responses. Input Validation: unvalidated user input reaching DB or shell. Dependencies: known CVEs. Output format: Severity, Location, Scenario, Fix. Respond in Spanish. Never modify any files.
