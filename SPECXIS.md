# Specxis — Spec-Driven Development for Lexis

Specxis is the lightweight SDD (Spec-Driven Development) layer built into Lexis-Two.
It persists agreements between developer and AI agent as Markdown files in the repository, ensuring that context, architectural decisions, and requirements survive across chat resets, model switches, and multi-day sessions.

The core Lexis philosophy still applies: **the best code is the code never written**. Specxis ensures that even when a feature is complex enough to warrant formal planning, the resulting specifications are kept as lean and minimal as possible.

---

## When to Use Specxis

Do not use Specxis for everything. SDD introduces a small overhead that only pays off when complexity is high.

| Use Specxis? | Scenario | Examples |
| :---: | :--- | :--- |
| **YES** | Features touching 3+ files | Adding a new multi-step checkout flow, refactoring the auth system. |
| **YES** | UX + Backend coordination | Building a real-time notification panel with database persistence. |
| **YES** | Ambiguous requirements | Implementing a feature where the business logic is not yet fully defined. |
| **NO** | Bug fixes with clear causes | Fixing a null-pointer exception, correcting a typo, adjusting a CSS class. |
| **NO** | Style or naming changes | Renaming a variable across the codebase, updating a color scheme. |
| **NO** | Adding tests to existing code | Writing unit tests for an already stable utility function. |

---

## How It Works (The Lifecycle)

Specxis operates as a state machine managed via the unified `/specxis` command. Each phase transition is recorded in the `.specxis/` folder.

```
┌──────────────┐      /specxis plan      ┌───────────┐      /specxis implement      ┌─────────────────┐
│ proposal.md  │ ───────────────────────▶│  spec.md  │ ────────────────────────────▶│ task-by-task    │
│ (Lazy Check) │                         │  tasks.md │                              │ implementation  │
└──────────────┘                         └───────────┘                              └─────────────────┘
       ▲                                                                                     │
       │ /specxis new                                                                        │
       │                                                                                     ▼
┌──────────────┐      /specxis close     ┌───────────┐       /specxis review        ┌─────────────────┐
│  Archived    │◀────────────────────────│  debt.md  │◀─────────────────────────────│    review.md    │
│  Spec Folder │                         │  Ledger   │                              │  (Compliance)   │
└──────────────┘                         └───────────┘                              └─────────────────┘
```

### Phase 1: Proposal & Lazy Check (`/specxis new <slug>`)
Creates a new feature folder under `.specxis/active/[slug]/` and generates a `proposal.md` file.
* **The Lazy Check:** Before designing anything, the agent and developer must answer:
  1. *Does this feature need to exist?* Could the requirement be met another way?
  2. *Does stdlib, the framework, or an installed dependency already cover it?*
  3. *What is the absolute minimum that satisfies the requirement?*
* **Outcome:** A clear, high-level goal, context, and explicit "Out of Scope" (YAGNI) boundaries.

### Phase 2: Planning (`/specxis plan <slug>`)
Reads the agreed `proposal.md` and generates two files:
1. `spec.md`: Translates the proposal into strict **MUST** (non-negotiable), **SHOULD** (preferred, deviations require a `// lexis:` comment), and **MAY** (optional) requirements.
2. `tasks.md`: Breaks down the implementation into a technical checklist.
* **The Rule of 10:** A single specification can have a **maximum of 10 tasks**. If a feature requires more, it is too large and must be split into smaller, independent sub-specs. Each task must map to exactly one file or function.

### Phase 3: Controlled Implementation (`/specxis implement <slug>`)
The agent reads `tasks.md`, identifies the first unchecked task (`- [ ]`), implements it, and marks it as completed (`- [x]`).
* **One Task Per Run:** The agent implements **exactly one task per turn**. It must stop, report, and let the developer review or run tests before proceeding to the next task. This prevents the agent from drifting or writing massive, unchecked diffs.
* **Intentional Shortcuts:** If a shortcut or simplification is made during implementation, it must be marked in the code with a `// lexis:` comment and recorded in the "Lexis Tags Added" section of `tasks.md`.

### Phase 4: Quality Review (`/specxis review <slug>`)
Evaluates the current implementation against the requirements defined in `spec.md` and the strict coding standards of `AGENTS.md`.
* **Outcome:** Generates a `review.md` file listing findings categorized by severity (Critical, High, Medium, Low) with recommended fixes. No code is modified during this phase.

### Phase 5: Archiving & Debt Sync (`/specxis close <slug>`)
Once all tasks are checked and no Critical/High findings remain open, the feature is closed.
* **Outcome:** The folder is moved from `.specxis/active/` to `.specxis/archive/` (making it immutable). All `// lexis:` comments added during development are harvested and consolidated into the global `.specxis/debt.md` ledger.

---

## What to Keep in Mind (Best Practices)

### 1. The Spec is the Contract, the Code is the Proof
Once `spec.md` is agreed upon, the agent is legally bound to it. The agent **must not** implement speculative features, extra helpers, or unrequested abstractions. If it's not in the MUST/SHOULD requirements, it is YAGNI.

### 2. Never Bypass the "One Task Per Run" Rule
It is tempting to let the agent "finish the rest of the tasks" in a single turn. **Do not do this.** Implementing one task at a time ensures that:
* Linter errors are caught immediately.
* The developer can run unit tests on incremental changes.
* The agent's context window remains clean and focused on a single file/function.

### 3. Keep the Archive Out of Git (Optional)
Active specifications (`.specxis/active/`) should be committed to git so the team (and future agent sessions) can see what is currently in progress. However, once archived, specs are immutable. It is recommended to add `.specxis/archive/` to your `.gitignore` to keep your repository history clean.

### 4. Sincronización de Deuda Técnica (`/specxis debt`)
Specxis includes a highly portable Node.js script (`scripts/specxis-debt.js`) that scans your entire project for `// lexis:` comments. It automatically prioritizes them into a ledger:
* **Immediate:** Shortcuts causing active pain or blocking other features.
* **Next Sprint:** Shortcuts with a known ceiling approaching.
* **Backlog:** Naive heuristics or O(n²) scans that are fine for now but need monitoring.
* **Permanent:** Intentional design decisions that require no future action.

Run `/specxis debt` regularly to ensure your technical debt ledger is perfectly in sync with your codebase.
