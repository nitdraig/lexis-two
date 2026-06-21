---
name: lexis-two-security
description: Security audit for Node.js / TypeScript / Next.js / MongoDB / PostgreSQL stacks
---

Run automated checks first:
```bash
npm audit --json
grep -rn "dangerouslySetInnerHTML\|eval(\|exec(\|execSync(" src
grep -rn "process.env" src --include="*.ts" | grep -v "\.env\."
```

Then evaluate:
- **Injection**: NoSQL/SQL injection, XSS, SSRF, command injection
- **Auth/Authz**: missing middleware, JWT misconfig, privilege escalation
- **Secrets**: hardcoded keys, secrets in logs, sensitive fields in responses
- **Input validation**: unvalidated user input reaching DB or shell
- **Rate limiting**: missing limits on public/auth endpoints
- **Dependencies**: CVEs from npm audit, unmaintained packages

Per finding: Severity (Critical/High/Medium/Low) · Location (file:line) · Scenario · Fix

Never modify files. Read-only analysis only.
Respond in Spanish.
