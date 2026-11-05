# Taste
- Communicates in Spanish and expects responses in Spanish, but wants code, comments, and documentation in English; avoids emojis in output. Confidence: 0.9
- Expects post-implementation reports formatted as Hecho (1–3 bullets) / Verificar (1–2 lines) / Siguiente (one line or "ninguno"), then asks whether to register the work in Flowfolio. Confidence: 0.9
- Prefers to commit only when explicitly asked; runs `git add <paths>` separately from `git commit`, avoids `git commit -a`, writes checkpoint messages (`checkpoint: <what changed>`), never pushes, and ends commit messages with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Confidence: 0.9
- Values framework/host/agent agnosticism and portability (no lock-in) as a core product principle; wants this emphasized in site/docs copy. Confidence: 0.7
- Before publishing an update, bumps the version (package.json, lockfile, and plugin manifests) and updates READMEs/CHANGELOG first. Confidence: 0.8
- Expects user-facing docs for features/configuration; flags when a new feature lacks docs and wants a dedicated guide added and linked from README/CONTRIBUTING, plus mirrored on the website docs (English and Spanish). Confidence: 0.7
- When told "no toques nada, solo analiza y dame una review", honors the explicit no-edit constraint and only provides analysis/review without modifying files. Confidence: 0.9
- Wants Lexis-Two distributed as an agent-aware installer that detects the user's hosts/agents and runtime environment, then installs only what is strictly needed and safe to run. Confidence: 0.8
- Wants the installer to provide a terminal UI that is unique, differentiating, and innovative. Confidence: 0.9
