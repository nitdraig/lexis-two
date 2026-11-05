# Proposal: local-ai-first-class

## Goal

Make local/offline LLMs a first-class host for Lexis-Two by detecting them, applying a compressed, token-budget-aware ruleset, and documenting when each local model size can safely receive the full ruleset.

## Lazy Check

- Does this need to exist? Yes. Today the OpenCode plugin skips local models entirely, so users running Ollama/LM Studio get none of the Lexis guidance. The benchmark exists but only measures LOC/time, not whether the local model follows the ruleset.
- Could the requirement be met another way? Users could manually paste `SKILL.md` into every chat, but it is too long for small context windows and is not maintained per mode. Not enough.
- Does stdlib, the framework, or an installed dep already cover it? No new dependency. Node stdlib and the existing `normalizeMode`/`getLexisInstructions` hooks cover the logic.
- What is the absolute minimum? A `local` mode, a short `SKILL.local.md`, and a switch in the plugin that injects the short version instead of nothing. Everything else (benchmark, CLI, docs) follows from that.

## Discovery source

- Path: N/A (scoped feature, derived from the review in the prior turn)

## Context

- Affected: `.opencode/plugins/lexis-two.mjs`, `hooks/lexis-two-instructions.js`, `skills/lexis-two/SKILL.md` (or new `SKILL.local.md`), `benchmarks/benchmark-local.py`, `docs/setup.md`, `docs/commandcode.md`, `README.md`.
- Findings from review:
  - The plugin bails out on `lmstudio`, `ollama`, `local`, `127.0.0.1` without injecting any rules.
  - `skills/lexis-two/SKILL.md` is ~109 lines; combined with other skills it can exceed the effective context of 7B/8B local models.
  - `benchmarks/benchmark-local.py` only compares LOC and wall time, not rule adherence or test success.
  - There is no standalone way to use Lexis-Two with a local model outside of a supported host.

## Out of Scope (YAGNI)

- Adding a model-download or model-management CLI. We only wrap what the user already has (Ollama, LM Studio, OpenAI-compatible servers).
- Quantization, fine-tuning, or RAG for local models.
- Rewriting the core philosophy for local models; we only compress and gate it.
- Support for every possible local host; v1 covers Ollama, LM Studio, and generic `127.0.0.1` OpenAI-compatible endpoints.
- Auto-detection of context-window size by model name; v1 uses a conservative static budget.

## Decisions (replace the former open questions)

- No `SKILL.local.md`: the compact per-level blocks already in `hooks/lexis-two-instructions.js` (`LEVELS`) are sent to local models.
- No `local` mode: detection only decides how much text is sent; the level stays `lite|full|ultra|off`.
- Benchmark rule checks and the standalone CLI are out of this spec; adherence checks should reuse `/slopx`.
