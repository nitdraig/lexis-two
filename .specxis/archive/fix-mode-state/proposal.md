# Proposal: fix-mode-state

## Goal
The active intensity changes only when the user explicitly changes it, on every host.

## Lazy Check
- Does this need to exist? Yes. The skill promises "Level persists until changed or session end", and today `/lexis status` or a compaction breaks that.
- Does stdlib, the framework, or an installed dep already cover it? Yes: `normalizeMode` already distinguishes intensities. The SessionStart payload should carry `source` (confirm per host in task 004).
- What is the absolute minimum? Write the flag only for explicit intensities, and skip the reset on resume and compact.

## Discovery source
- Path: N/A (bug fixes)

## Context
- Affected: `hooks/lexis-two-mode-tracker.js`, `hooks/lexis-two-activate.js`, statuslines, `.opencode/plugins/lexis-two.mjs`, `pi-extension/index.js`.
- Findings: B1-B9, S9 in [improvement-plan.md](../../improvement-plan.md).
- Supersedes `plans/002`, which wanted bare `/lexis` to write the default. The README documents bare `/lexis` as a status shortcut, so it must not write.

## Out of Scope (YAGNI)
- Per-session mode state. One flag file shared by concurrent sessions stays as a known limit.
- Accepting `review` as a default mode is left unchanged.

## Decisions
- D2: `/lexis review` does not persist. It runs once, like `/lexis plan`.

## Open Questions
- Confirm on real pi that `pi.commands` is absent. The fix is safe either way.
