---
name: lexis-two-security
description: Security audit. Runs the stack audit when a profile defines one; otherwise generic checks.
---

First, detect the stack profile for the task's files (see AGENTS.md "Stack profiles"): read `./stacks/<id>.md` when it matches.

- Profile `node-ts` (or the repo has `package.json`):
  ```bash
  npm audit --json
  grep -rn "dangerouslySetInnerHTML\|eval(\|exec(\|execSync(" .
  grep -rn "process.env" . --include="*.ts" --include="*.js" | grep -v "\.env\."
  ```
- No profile, or a planned profile without an audit command:
  Run generic checks only: hardcoded secrets/API keys; injection-ish patterns (eval, exec, dangerouslySetInnerHTML, shell interpolation); unvalidated user input reaching DB or shell; secrets/PII in logs or responses.
  Say clearly: "No stack audit tool for <ecosystem> yet — generic checks only (expected in v1)."

Then evaluate: Injection, Auth/Authz, Secrets, Input validation, Rate limiting, Dependencies (only when an audit tool ran).

Per finding: Severity (Critical/High/Medium/Low) · Location (file:line) · Scenario · Fix

Never modify files. Read-only analysis only.
Respond in Spanish.
