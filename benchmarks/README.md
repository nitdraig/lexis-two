# Benchmark

Five everyday tasks, **baseline vs lexis-two** (`skills/lexis-two/SKILL.md`). Code LOC from fenced blocks; correctness gate via `correctness.js`.

## OpenCode Go (recommended)

Uses the same models you run in OpenCode today. Default set in `opencode-go-models.json`:

| Model ID | Name | Transport |
| -------- | ---- | --------- |
| `kimi-k2.6` | Kimi K2.6 | OpenAI `/chat/completions` |
| `deepseek-v4-pro` | DeepSeek V4 Pro | OpenAI `/chat/completions` |
| `qwen3.7-max` | Qwen3.7 Max | Anthropic `/messages` |
| `minimax-m3` | MiniMax M3 | Anthropic `/messages` |

[OpenCode Go docs](https://opencode.ai/docs/go/) — subscribe, copy API key, `/connect` in TUI.

### Run

```bash
cp .env.example .env          # OPENCODE_API_KEY=...
node benchmarks/benchmark-opencode-go.js --repeat 3 --write-md
```

Single model:

```bash
node benchmarks/benchmark-opencode-go.js --model kimi-k2.6 --repeat 10 --write-md
```

Subset:

```bash
node benchmarks/benchmark-opencode-go.js --models kimi-k2.6,deepseek-v4-pro --repeat 5
```

Optional third arm:

```bash
node benchmarks/benchmark-opencode-go.js --caveman --repeat 3
```

Outputs:

- `benchmarks/results/opencode-go-YYYY-MM-DD.json` — full responses + usage
- `benchmarks/results/YYYY-MM-DD-opencode-go.md` — summary tables (with `--write-md`)
- `site/src/data/opencode-go-benchmark.json` — chart data for the Astro site (`npm run benchmark:report`)
- Live charts: `https://lexis-two.excelso.xyz/benchmarks/` (after `npm run site:build` + deploy)

**Publish site/README metrics only from a committed `results/*-opencode-go.md` for the lexis-two arm.**

### Adding models later (Gemini, Claude, OpenAI)

1. Add entry to `opencode-go-models.json` (or a new `providers/*.json` when you split harnesses).
2. Set `transport`: `openai-chat` or `anthropic-messages` per [Go endpoints](https://opencode.ai/docs/go/#endpoints).
3. Re-run and commit a new `results/` file.

---

## Legacy: Claude via promptfoo

Historical ponytail-arm results (2026-06-13) — **not Lexis-Two**. `arms/ponytail.js` now reads `skills/lexis-two/SKILL.md` until the promptfoo labels are renamed.

Requires `ANTHROPIC_API_KEY` and **Node.js ≥ 22.22.0**:

```bash
npx promptfoo@latest eval -c benchmarks/promptfooconfig.yaml --repeat 10
npx promptfoo@latest view
```

### Median results (10 runs, 2026-06-13) — ponytail arm only

| arm | Haiku LOC | Sonnet LOC | Opus LOC |
| --- | --------: | ---------: | -------: |
| baseline | 518 | 693 | 256 |
| caveman | 116 | 120 | 67 |
| ponytail | 39 | 44 | 51 |

Versus baseline, ponytail wrote **80-94% less code** in that run. Do not cite as Lexis-Two until re-run via `benchmark-opencode-go.js`.

---

## Local models (Ollama)

```bash
python benchmarks/benchmark-local.py --model llama3.2 --repeat 3
```

Arms: baseline, caveman, lexis-two.

---

## Tasks

Email validator, JS debounce, CSV sum, React countdown, FastAPI rate-limit (`promptfooconfig.yaml`).

## Metrics

| File | Metric | Behavior |
| ---- | ------ | -------- |
| `loc.js` | `loc` | Line count (measurement) |
| `correctness.js` | `correct` | Gate — broken one-liners fail |

### Prerequisites

- **OpenCode Go:** Node.js 18+, `OPENCODE_API_KEY`
- **promptfoo:** Node.js ≥ 22.22.0, `ANTHROPIC_API_KEY`, Python 3 for correctness checks
- **Ollama:** Python 3, local Ollama

## Notes

- Go usage limits apply ($12/5h etc.) — use `--delay-ms` and start with `--repeat 3`.
- `qwen3.7-max` and `minimax-m3` use Anthropic `/messages` with header **`x-api-key`** (not `Authorization: Bearer`).
- Real sessions inject the skill once (cached); benchmark re-sends the full skill each call — pessimistic on tokens.
