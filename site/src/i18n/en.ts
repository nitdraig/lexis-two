export default {
  meta: {
    title: "Lexis-Two — AI does the work. You keep the decision.",
    description:
      "A portable human-in-the-loop framework for coding agents. Define intent, let agents plan/build/review, and approve every critical turn.",
  },
  nav: {
    docs: "Docs",
    benchmarks: "Benchmarks",
    github: "GitHub",
    skipLink: "Skip to content",
  },
  home: {
    hero: {
      eyebrow: "Human-in-the-loop agent framework",
      title: "AI does the work. <em>You keep the decision.</em>",
      copy:
        "Lexis-Two is an open framework for agent workflows where AI plans, builds and reviews — while humans stay in control of the critical turns.",
      ctaExplore: "Explore the loop",
      ctaGitHub: "View on GitHub",
      meta: "Open source · Portable · Human-controlled",
      install: "npx @draig/lexis-two install",
      workflow: {
        humanTop: { label: "HUMAN / INTENT", desc: "Define the goal and constraints." },
        discover: { label: "01 / DISCOVER", desc: "Understand the problem." },
        plan: { label: "02 / PLAN", desc: "Define the smallest solution." },
        build: { label: "03 / BUILD", desc: "Agent executes one slice." },
        review: { label: "04 / REVIEW", desc: "Check against intent." },
        humanBottom: { label: "05 / HUMAN CHECKPOINT", desc: "Approve, modify or reject — then continue." },
        status: "AGENT WORKFLOW / READY FOR HUMAN DECISION",
        statusNote: "↻ back to 01 on the next turn",
      },
    },
    problem: {
      eyebrow: "The problem",
      title: "Autonomous doesn't have to mean unsupervised.",
      copy:
        "Agents can plan, write, review and operate tools. The question is not whether they can act alone, but where human judgment should enter the system.",
      withoutTitle: "WITHOUT A CONTROLLED LOOP",
      withoutFlow: ["Human", "Prompt", "Agent", "Output"],
      withTitle: "WITH LEXIS-TWO",
      withFlow: ["Intent", "Agent loop", "Human checkpoint", "Result"],
    },
    thesis: {
      eyebrow: "The principle",
      title: "Humans don't need to supervise every step. <span>They need to own the important ones.</span>",
    },
    loop: {
      eyebrow: "The Lexis loop",
      title: "A workflow designed around decisions.",
      copy: "Structure agent work into explicit stages so the system knows what to do, what to check and when to involve a human.",
      modeHuman: "With human gate",
      modeAuto: "Autonomous batch",
      steps: [
        { num: "01", title: "Discover", desc: "Understand the problem before writing code.", tag: "/discx" },
        { num: "02", title: "Plan", desc: "Define the smallest valid solution.", tag: "/specx plan" },
        { num: "03", title: "Build", desc: "Agent executes one task, then stops.", tag: "/specx implement" },
        { num: "04", title: "Review", desc: "Check implementation against intent.", tag: "/lexis review" },
      ],
      stepsAuto: [
        { num: "01", title: "Discover", desc: "Same: define the MVP before specifying.", tag: "/discx" },
        { num: "02", title: "Plan", desc: "Generate spec and tasks without intermediate pause.", tag: "/specx plan" },
        { num: "03", title: "Build all", desc: "Run the full task list in one pass, scoped by Discovery.", tag: "no pause" },
        { num: "04", title: "Review end", desc: "One review over the whole batch before closing.", tag: "/lexis audit" },
      ],
      gateLabel: "awaits your OK",
      noPauseLabel: "no pause",
    },
    checkpoint: {
      eyebrow: "Human checkpoint",
      title: "The agent knows when to stop.",
      copy:
        "Not every action needs approval. Critical decisions do. This is where the human moves from supervisor to decision-maker.",
      cardTitle: "AGENT / IMPLEMENTATION",
      statusPaused: "PAUSED",
      statusResuming: "RESUMING",
      statusModify: "MODIFICATION REQUIRED",
      statusWaiting: "WAITING FOR HUMAN",
      prompt: "I found two valid approaches for this feature.",
      optionA: { label: "OPTION A", desc: "Use the native platform API. No new dependency. Smaller implementation." },
      optionB: { label: "OPTION B", desc: "Add a modal library. Less implementation code, but introduces a dependency." },
      recommendation: "Recommendation:",
      approve: "Approve",
      modify: "Modify",
      ask: "Ask agent",
      result: "Decision recorded. Agent resuming…",
    },
    agents: {
      eyebrow: "Agent architecture",
      title: "One loop. Several specialized agents.",
      copy:
        "Separate responsibilities without losing a shared workflow. Each role has explicit permissions — auditors are read-only by design.",
      control: { label: "CONTROL", name: "HUMAN / LOOP" },
      roles: [
        { name: "lexis-one", perm: "write", desc: "Implements, edits, runs bash inside the gate." },
        { name: "lexis-review", perm: "read", desc: "Evaluates changes against the spec. Never edits." },
        { name: "ui-architect", perm: "read", desc: "Advises on design. Does not implement." },
        { name: "refactor-agent", perm: "write", desc: "Large-scale restructuring within a scoped task." },
        { name: "security-auditor", perm: "read", desc: "Runs audits. Reports, does not fix." },
        { name: "design-auditor", perm: "read", desc: "Detects generic AI UI drift. Only writes DESIGN-AUDIT.md." },
      ],
      permWrite: "writes",
      permRead: "read-only",
    },
    principles: {
      eyebrow: "Engineering principles",
      title: "Agents need constraints, not more prompts.",
      copy: "Lexis biases the loop toward simpler, smaller and more maintainable solutions.",
      items: [
        { code: "YAGNI", title: "Build what is needed.", desc: "Don't introduce functionality before there is a concrete need." },
        { code: "KISS", title: "Prefer the simple path.", desc: "Use native capabilities before adding an abstraction." },
        { code: "DRY", title: "One source of truth.", desc: "Avoid duplicated knowledge and parallel implementations." },
        { code: "SOLID", title: "Keep boundaries explicit.", desc: "Clear responsibilities, maintainable interfaces." },
      ],
    },
    ladder: {
      eyebrow: "Decision ladder",
      title: "Before adding code, ask whether the code should exist.",
      steps: [
        { code: "YAGNI", desc: "Does it need to exist at all?" },
        { code: "Platform", desc: "Can the platform already do it?" },
        { code: "Existing dependency", desc: "Can the project already provide it?" },
        { code: "Minimum code", desc: "What is the smallest implementation that works?" },
      ],
    },
    example: {
      eyebrow: "Proof in the loop",
      title: "The agent doesn't just write code. It questions the code.",
      copy: "A representative decision: use a native browser capability instead of adding an abstraction.",
      withoutTitle: "WITHOUT LEXIS",
      withoutLines: "74 lines",
      withoutCode: `function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";
    return () => { /* cleanup */ };
  }, [open]);
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div role="dialog">
        <h2>{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}`,
      withTitle: "WITH LEXIS",
      withLines: "24 lines",
      withCode: `// lexis: native <dialog> — focus trap
// and backdrop already included
<dialog ref={dialogRef}>
  <h2>Confirm deletion</h2>
  <form method="dialog">
    <button value="cancel">Cancel</button>
    <button value="confirm">Delete</button>
  </form>
</dialog>`,
      note: "The agent chose the platform before the library — without being asked every turn.",
      copyLabel: "Copy",
      copiedLabel: "Copied",
    },
    hosts: {
      eyebrow: "Portable by design",
      title: "Bring your own agent.",
      copy: "Lexis-Two doesn't replace the agent you already use. It gives it a shared way of working.",
      items: ["OpenCode", "Claude Code", "Cursor", "Codex", "Gemini CLI", "Copilot"],
    },
    benchmarks: {
      eyebrow: "With numbers, not just promises",
      title: "What changes when the loop has discipline.",
      copy: "OpenCode Go benchmark, median LOC across 5 coding tasks, 3 runs per cell.",
      items: [
        { value: "−68%", label: "LOC reduction vs baseline" },
        { value: "9", label: "documented before/after cases — Next.js, Express, FastAPI" },
        { value: "9", label: "hosts with full support" },
      ],
      foot: "Results from a single run — model- and task-specific, not a universal promise.",
    },
    vision: {
      eyebrow: "The direction",
      title: "From rules to orchestration.",
      copy: "Lexis-Two is the portable foundation. The longer-term direction is a programmable orchestration layer for human + agent workflows.",
      cards: [
        { tag: "TODAY", title: "Lexis-Two", desc: "Principles, skills, commands, adapters and structured agent workflows." },
        { tag: "NEXT", title: "Lexis-Core", desc: "Orchestration, state, agent coordination, shared context and configurable human checkpoints." },
        { tag: "VISION", title: "Agent systems", desc: "A programmable layer for intelligent workflows that know when to act and when to ask." },
      ],
      futureTitle: "What if agents could work until your judgment is needed?",
      futureCopy: "The goal is not maximum autonomy. It is useful autonomy with explicit human control at the right moments.",
    },
    commandsExplained: {
      eyebrow: "Commands explained",
      title: "/lexis, /specx and /desx are not the same thing.",
      copy: "Each command controls a different layer of the workflow.",
      items: [
        { command: "/lexis", name: "Intensity", desc: "Changes how aggressively the lazy ruleset gates the agent. Use it to keep daily work lean, during refactors, or to turn rules off." },
        { command: "/specx", name: "Specs", desc: "The spec-driven lifecycle for features that touch 3+ files: proposal, plan, implement one task at a time, review, close." },
        { command: "/desx", name: "Design", desc: "A read-only design audit after UI work. Detects visual slop and token drift, then applies fixes outside the spec loop." },
      ],
    },
    install: {
      eyebrow: "Get started",
      title: "Start with the agent you already use.",
      command: "npx @draig/lexis-two install",
      copy: "Copy",
      copied: "Copied",
      chips: ["OpenCode", "Claude Code", "Cursor", "Codex", "Gemini CLI", "Copilot", "AGENTS.md"],
    },
    finalCta: {
      eyebrow: "Lexis-Two",
      title: "Let the agent work. Keep the decision.",
      ctaStart: "Get started",
      ctaGitHub: "Explore on GitHub",
    },
  },
  hosts: {
    title: "Works where you code",
    subtitle:
      "Works in the agent you already use. Thin adapters. One skills/ catalog — hosts stay dumb.",
    headHost: "Host",
    headLevel: "Level",
    headEntry: "Entry point",
    rows: [
      { host: "OpenCode", level: "full", entry: ".opencode/plugins/lexis-two.mjs" },
      { host: "Claude Code", level: "full", entry: ".claude-plugin/ + hooks/" },
      { host: "GitHub Copilot (plugin)", level: "full", entry: ".github/plugin/plugin.json" },
      { host: "Gemini CLI", level: "full", entry: "gemini-extension.json" },
      { host: "pi", level: "full", entry: "pi-extension/" },
      { host: "Codex", level: "full", entry: ".codex-plugin/ + AGENTS.md" },
      { host: "Cursor", level: "full", entry: ".cursor/rules/ + .cursor/skills/" },
      { host: "Windsurf / Cline / Kiro", level: "rules", entry: "lexis-two.md in host rules folder" },
      { host: "Any agent", level: "rules", entry: "AGENTS.md or skills/*/SKILL.md" },
    ],
    levelFull: "Full",
    levelSoon: "Coming soon",
    levelRules: "Rules",
  },
  commands: {
    title: "Slash commands",
    subtitle:
      "Three-step loop: /discx (product), /specx (specs), /lexis (intensity). /desx is a design pass after UI, not a fourth phase.",
    guideLink: "Full docs",
    filterAll: "All",
    filterLexis: "Code",
    filterDiscovery: "Product",
    filterSpecxis: "Specs",
    filterDesx: "Design",
    results: "{count} commands",
    items: [
      { name: "/lexis status", desc: "Shows the current plugin status, active intensity level, and default configuration." },
      { name: "/lexis <lite|full|ultra|off>", desc: "Switches the intensity level of the smart-lazy ruleset for the AI agent." },
      { name: "/lexis plan (or /lexis p)", desc: "Lazy plan before code: hierarchy plus clarify, sources, compare, and scenarios. One vertical slice." },
      { name: "/lexis review (or /lexis r)", desc: "Reviews recent git changes (diff) to detect over-engineering and suggest simplifications." },
      { name: "/lexis audit (or /lexis a)", desc: "Audits the entire repository for dead code, unnecessary dependencies, or premature abstractions." },
      { name: "/lexis debt (or /lexis d)", desc: "Harvests and prioritizes all // lexis: comments across the codebase into a tracked debt ledger." },
      { name: "/lexis security (or /lexis s)", desc: "Runs a focused security audit targeting vulnerabilities in the stack (Node.js/Next.js/MongoDB)." },
      { name: "/lexis help (or /lexis h)", desc: "Displays the quick reference card with public commands and levels." },
      { name: "/discx <slug>", desc: "Discovery: MVP, priorities, map, and 06-post-mvp.md. No product code. Alias: /discovery." },
      { name: "/desx audit", desc: "Read-only design audit: visual slop and token drift. Writes DESIGN-AUDIT.md only. Alias: /desx." },
      { name: "/desx apply", desc: "Implementer applies DESIGN-AUDIT.md (P0 then P1). Not design-auditor." },
      { name: "/specx", desc: "Short alias for /specxis — same Spec-Driven Development lifecycle." },
      { name: "/specxis status", desc: "Monitors the status, task progress, and technical debt of active specifications. Alias: /specx." },
      { name: "/specxis new <slug>", desc: "Creates proposal.md with a lazy check. Soft gate: vague products without 01-mvp.md are pointed at /discx first." },
      { name: "/specxis plan <slug>", desc: "Generates spec.md (MUST/SHOULD/MAY) and tasks.md from the proposal." },
      { name: "/specxis implement <slug>", desc: "Guides the agent to implement the next unchecked task, one by one." },
      { name: "/specxis review <slug>", desc: "Evaluates the current implementation against the specification requirements and AGENTS.md rules." },
      { name: "/specxis close <slug>", desc: "Archives the completed spec and syncs its // lexis: comments to the technical debt ledger." },
      { name: "/specxis debt", desc: "Syncs all // lexis: comments across the codebase portably into .specxis/debt.md." },
    ],
  },
  install: {
    title: "Install",
    subtitle: "One command for rules-only hosts — or configure plugins manually.",
    tabNpx: "npx install",
    tabOpencode: "OpenCode",
    tabOpencodeNpm: "OpenCode (npm)",
    tabCursor: "Cursor",
    tabClone: "Clone",
    npxHint: "Detects Cursor, Windsurf, Cline, Kiro, OpenCode, and AGENTS.md. Safe to re-run.",
  },
  adapt: {
    title: "Adapt your stack",
    subtitle: "Node/TS ships the deepest coverage today; other ecosystems follow. Three files to touch — no new framework.",
    cards: [
      { title: "1. AGENTS.md", desc: "Replace stack shortcuts (Python stdlib, Rust crates, Go stdlib). Run node scripts/check-rule-copies.js." },
      { title: "2. skills/", desc: "Point audit commands at your tools -- cargo audit, pip-audit, golangci-lint." },
      { title: "3. commands/", desc: "Update TOML and OpenCode command descriptions if skill behavior changes." },
    ],
  },
  stacks: {
    title: "Focused stacks",
    subtitle: "Deepest coverage today is TypeScript / Node.js. Other ecosystems are added incrementally.",
    items: [
      { name: "TypeScript / Node.js", desc: "Next.js, React, Express, Fastify, strict types" },
      { name: "MongoDB / Mongoose", desc: "Schemas, indexes, aggregation, transactions" },
      { name: "Tailwind CSS", desc: "Utility-first, dark mode, responsive" },
      { name: "Python", desc: "FastAPI, Django, dataclasses, type hints" },
      { name: "PostgreSQL / Prisma", desc: "Relations, migrations, N+1 prevention" },
      { name: "Redis", desc: "Caching, sessions, rate limiting, pub/sub" },
    ],
  },
  suggested: {
    title: "Related projects",
    subtitle: "Complementary repos -- benchmarks, early patterns, and host-specific extensions.",
    items: [
      {
        name: "ponytail",
        url: "https://github.com/DietrichGebert/ponytail",
        desc: "Benchmark harness and early decision-ladder patterns this ecosystem builds on (MIT).",
      },
      { name: "my-cursor-skills", url: "https://github.com/nitdraig/my-cursor-skills", desc: "Cursor skills collection to review for complementary features." },
    ],
  },
  ecosystem: {
    title: "Ecosystem",
    subtitle:
      "Lexis-Two is the public portable package -- principles, skills, and adapters. Lexis-One is private orchestration. Lexis-Core is future.",
  },
  footer: {
    tagline: "A human-in-the-loop framework for coding agents.",
    license: "MIT License",
    forked: "Forked from ponytail by DietrichGebert. Lexis ecosystem by nitdraig.",
    productTitle: "Product",
    devTitle: "Developers",
    projectTitle: "Project",
    home: "Home",
    docs: "Docs",
    benchmarks: "Benchmarks",
    github: "GitHub",
    source: "Source code",
    issues: "Issues",
    discussions: "Discussions",
    excelsoUrl: "https://excelso.xyz",
  },
  benchmarks: {
    title: "OpenCode Go benchmark",
    subtitle: "baseline vs lexis-two — median LOC across 5 coding tasks.",
    backHome: "Home",
    methodology: "Methodology",
    runDate: "Run date",
    runsPerCell: "runs per cell",
    source: "source",
    totalLoc: "Total code LOC (median, 5 tasks)",
    reduction: "LOC reduction vs baseline",
    time: "Wall time (median total seconds)",
    byTask: "LOC by task — lexis-two arm",
    summary: "Summary table",
    colModel: "Model",
    colBaseline: "Baseline LOC",
    colLexis: "Lexis-Two LOC",
    colReduction: "Reduction",
    colCorrect: "Correct (lexis)",
    regenerate: "Regenerate:",
    disclaimer:
      "Results are from one OpenCode Go run (5 tasks, 3 repeats per cell). Model- and task-specific — not universal marketing claims.",
  },
  excelsoOpen: {
    title: "Excelso Open",
    description: "This project is proud to be part of Excelso Open, our open-source and community-focused branch, championing collaborative technology and social impact projects.",
    linkText: "Visit excelso.xyz",
    url: "https://excelso.xyz",
  },
  docs: {
    title: "Documentation",
    subtitle:
      "What each command does, when to use it, and a copy-paste example. Three-step loop plus a design pass after UI.",
    summary:
      "Loop: /discx defines this MVP and the next stage, /specx turns that into a spec and tasks, /lexis keeps the agent lean. After UI, /desx is a design pass beside the loop — not a Specxis phase. Bugs: skip Discovery, use /lexis plan.",
    availability:
      "Available on hosts with command adapters: OpenCode, Gemini CLI, pi, Claude Code, and GitHub Copilot.",
    toc: ["Intensity levels", "/lexis commands", "The /discx cycle", "The /specx lifecycle", "The /desx pass"],
    levelsTitle: "Intensity levels",
    levelsSubtitle:
      "/lexis <mode> switches how aggressively the ruleset gates your agent. The active level is injected into every system prompt until you switch again.",
    colLevel: "Level",
    colWhen: "Use it for",
    levels: [
      { name: "lite", when: "Strict, non-negotiable specs", desc: "Builds exactly what is asked, then suggests a lazier alternative in one line." },
      { name: "full", when: "Day-to-day work (default)", desc: "Enforces the decision ladder: YAGNI, stdlib, native platform, installed deps, one line, minimum build." },
      { name: "ultra", when: "Refactor and cleanup sprints", desc: "YAGNI extremist: challenges requirements, deletes code first, prefers one-liners." },
      { name: "off", when: "Raw sessions", desc: "Fully deactivates Lexis rules until you switch back." },
    ],
    workflowTitle: "/lexis commands",
    workflowSubtitle:
      "Seven public verbs. plan already clarifies, grounds in sources, compares, and walks scenarios.",
    colCommand: "Command",
    colWhat: "What it does",
    colExample: "Example",
    items: [
      { name: "/lexis plan", desc: "Technical plan before code: lazy ladder plus clarify (max 3 questions), repo/docs, proposed vs lazy, happy/edge/failure. One shippable slice.", example: "/lexis plan add CSV export to the orders page" },
      { name: "/lexis review", desc: "Analyzes recent git changes for over-engineering, dead code, and reinvented stdlib -- run it before every commit or PR.", example: "/lexis r" },
      { name: "/lexis audit", desc: "Read-only audit of the whole repository: unused dependencies, speculative features, redundant boilerplate.", example: "/lexis a" },
      { name: "/lexis debt", desc: "Collects every // lexis: comment in the codebase into a prioritized debt ledger.", example: "/lexis d" },
      { name: "/lexis security", desc: "Focused security audit for your stack: injection, XSS, missing middleware, hardcoded secrets, unvalidated inputs.", example: "/lexis s" },
      { name: "/lexis help", desc: "Quick reference: public commands, levels, and configuration.", example: "/lexis h" },
    ],
    discoveryTitle: "The /discx cycle",
    discoverySubtitle:
      "Product framing before Specxis. Docs live in docs/discovery/<slug>/. After this cycle ships, run /discx again with the next slug from 06-post-mvp.md.",
    discoveryItems: [
      { name: "/discx <slug>", desc: "First cycle: B1–B8, fill 00–06 (MVP + post-MVP next stage). No product code. Alias: /discovery.", example: "/discx family-shared-expenses" },
      { name: "/discx <next-slug>", desc: "Scale cycle: do not overwrite the previous folder. Seed 01-mvp.md from the prior 06-post-mvp.md, then write a new post-MVP.", example: "/discx family-settlements" },
    ],
    specxisTitle: "The /specx lifecycle",
    specxisSubtitle:
      "Spec-driven development for features that touch 3+ files. Short command /specx (full /specxis). The spec lives in .specxis/active/<slug>/ as plain Markdown.",
    specxisItems: [
      { name: "/specx new <slug>", desc: "Creates .specxis/active/<slug>/proposal.md. Soft gate: if the idea is a vague new product and docs/discovery/<slug>/01-mvp.md is missing, suggest /discx first.", example: "/specx new csv-export" },
      { name: "/specx plan <slug>", desc: "Turns the proposal into spec.md (MUST / SHOULD / MAY) and tasks.md -- max 10 tasks, each mapped to exactly one file or function.", example: "/specx plan csv-export" },
      { name: "/specx implement <slug>", desc: "Implements exactly one unchecked task per run, following spec.md MUSTs and your AGENTS.md rules.", example: "/specx implement csv-export" },
      { name: "/specx review <slug>", desc: "Read-only evaluation against the spec; findings (severity, location, issue, fix) are written to review.md.", example: "/specx review csv-export" },
      { name: "/specx close <slug>", desc: "Verifies all tasks are done and no Critical/High findings remain, archives the spec, and harvests // lexis: comments into the debt ledger.", example: "/specx close csv-export" },
      { name: "/specx debt", desc: "Syncs every // lexis: comment in the codebase with .specxis/debt.md via a portable Node script.", example: "/specx debt" },
    ],
    desxTitle: "The /desx pass",
    desxSubtitle:
      "Beside the loop, like security-auditor. After UI work: detect slop, then apply. Not a Specxis phase.",
    desxItems: [
      { name: "/desx audit", desc: "design-auditor. Detector without a model, then optional prose polish. Writes only DESIGN-AUDIT.md.", example: "/desx audit" },
      { name: "/desx apply", desc: "Implementer applies P0 then P1, ticks only fixed items, re-runs the detector.", example: "/desx apply" },
    ],
    sddHint:
      "Loop: /discx for vague products and scale; /specx for 3+ file coordination; /lexis for intensity. After UI, /desx is a design pass. Skip Discovery for bugs and one-file fixes.",
    backHome: "Back to home",
  },
} as const;
