# Lexis-Two benchmark — OpenCode Go (2026-06-16)

Provider: [OpenCode Go](https://opencode.ai/docs/go/).
Repeat: 3 per cell. Temperature: 1.

## Kimi K2.6 (`kimi-k2.6`)

Repeat: 3. Arms: baseline, lexis-two.

**Code LOC (median)**

| arm | email | debounce | csv-sum | countdown | rate-limit | TOTAL | correct |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 46 | 63 | 18 | 413 | 62 | 602 | 12/15 |
| lexis-two | 13 | 10 | 4 | 13 | 23 | 63 | 12/15 |

**lexis-two vs baseline (median total LOC):** 90% less code.

## DeepSeek V4 Pro (`deepseek-v4-pro`)

Repeat: 3. Arms: baseline, lexis-two.

**Code LOC (median)**

| arm | email | debounce | csv-sum | countdown | rate-limit | TOTAL | correct |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 36 | 61 | 25 | 113 | 53 | 288 | 14/15 |
| lexis-two | 9 | 12 | 4 | 12 | 20 | 57 | 13/15 |

**lexis-two vs baseline (median total LOC):** 80% less code.

## Qwen3.7 Max (`qwen3.7-max`)

Repeat: 3. Arms: baseline, lexis-two.

**Code LOC (median)**

| arm | email | debounce | csv-sum | countdown | rate-limit | TOTAL | correct |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 39 | 48 | 19 | 124 | 40 | 270 | 12/15 |
| lexis-two | 14 | 9 | 4 | 10 | 17 | 54 | 13/15 |

**lexis-two vs baseline (median total LOC):** 80% less code.

## MiniMax M3 (`minimax-m3`)

Repeat: 3. Arms: baseline, lexis-two.

**Code LOC (median)**

| arm | email | debounce | csv-sum | countdown | rate-limit | TOTAL | correct |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline | 55 | 66 | 33 | 112 | 59 | 325 | 11/15 |
| lexis-two | 9 | 10 | 4 | 18 | 15 | 56 | 15/15 |

**lexis-two vs baseline (median total LOC):** 83% less code.
