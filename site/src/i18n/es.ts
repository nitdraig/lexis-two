export default {
  meta: {
    title: "Lexis-Two -- La forma simple de obtener el mejor código.",
    description:
      "Reglas, skills y slash commands portables para agentes de IA. La forma simple de obtener el mejor código. Con el menor uso de tokens.",
  },
  nav: {
    philosophy: "Filosofía",
    example: "Ejemplo",
    hosts: "Hosts",
    commands: "Comandos",
    install: "Instalar",
    benchmarks: "Benchmarks",
    github: "GitHub",
    skipLink: "Saltar al contenido",
  },
  hero: {
    badge: "LEXIS-TWO",
    title: "La forma simple de obtener el mejor código.",
    tagline:
      "Reglas, skills y slash commands portables para agentes de IA. La forma simple de obtener el mejor código. Con el menor uso de tokens.",
    benchmark:
      "Haz benchmarks con tus modelos OpenCode Go, luego publica resultados --",
    benchmarkLink: "OpenCode Go harness",
    benchmarkCode: "npm run benchmark:opencode-go",
    ctaGitHub: "Star en GitHub",
    ctaInstall: "Clonar e instalar",
    ctaDocs: "Docs completas de portabilidad",
    ctaBenchmark: "Ver benchmarks",
  },
  philosophy: {
    title: "La escalera",
    subtitle:
      "Antes de escribir código, detente en el primer escalón que sostenga.",
    rungs: [
      "Esto necesita existir? (YAGNI)",
      "¿La biblioteca estándar ya hace esto?",
      "¿Una feature nativa de la plataforma lo resuelve?",
      "¿Una dependencia ya instalada lo resuelve?",
      "¿Puede ser una sola línea?",
      "Solo entonces: escribe el mínimo código que funcione.",
    ],
  },
  example: {
    title: "Un ejemplo",
    subtitle:
      "Ordenar un arreglo. De examples/sorting.md en el repo.",
    without: "Sin Lexis-Two",
    with: "Con Lexis-Two",
    withoutFoot: "Quicksort hecho a mano. Tarea de la escuela.",
    withFoot: "24 líneas -> 1. Todo runtime trae un sort optimizado por pros.",
    copy: "Copiar",
    copied: "Copiado",
  },
  hosts: {
    title: "Funciona donde programas",
    subtitle:
      "Adaptadores delgados. Una fuente de skills. skills/ es el nucleo.",
    headHost: "Host",
    headLevel: "Nivel",
    headEntry: "Punto de entrada",
    rows: [
      { host: "OpenCode", level: "full", entry: ".opencode/plugins/lexis-two.mjs" },
      { host: "Claude Code", level: "soon", entry: ".claude-plugin/ + hooks/ (v0.3)" },
      { host: "GitHub Copilot (plugin)", level: "soon", entry: ".github/plugin/plugin.json (v0.3)" },
      { host: "Gemini CLI", level: "full", entry: "gemini-extension.json" },
      { host: "pi", level: "full", entry: "pi-extension/" },
      { host: "Codex", level: "full", entry: ".codex-plugin/ + AGENTS.md" },
      { host: "Cursor", level: "rules", entry: ".cursor/rules/lexis-two.mdc" },
      { host: "Windsurf / Cline / Kiro", level: "rules", entry: "lexis-two.md en la carpeta rules del host" },
      { host: "Cualquier agente", level: "rules", entry: "AGENTS.md o skills/*/SKILL.md" },
    ],
    levelFull: "Completo",
    levelSoon: "Proximamente",
    levelRules: "Reglas",
  },
  commands: {
    title: "Slash commands",
    subtitle:
      "En hosts con adaptadores de comandos hoy: OpenCode, Gemini CLI y pi. Claude Code y Copilot plugin llegan en v0.3.",
    items: [
      { name: "/lexis-two", desc: "Modo: lite, full, ultra, off" },
      { name: "/lexis-two-review", desc: "Revisar el diff por over-engineering" },
      { name: "/lexis-two-audit", desc: "Auditoria completa del repo -- que borrar" },
      { name: "/lexis-two-debt", desc: "Cosechar comentarios // lexis:" },
      { name: "/lexis-two-plan", desc: "Planificar antes de escribir código" },
      { name: "/lexis-two-security", desc: "Auditoria de seguridad (default Node/TS)" },
      { name: "/lexis-two-help", desc: "Tarjeta de referencia rapida" },
    ],
  },
  install: {
    title: "Instalar",
    subtitle:
      "Clona una vez. Apunta tu host a los archivos del adaptador.",
    tabOpencode: "OpenCode",
    tabCursor: "Cursor",
    tabClone: "Clonar",
  },
  adapt: {
    title: "Adapta a cualquier stack",
    subtitle: "Tres archivos para tocar. No se necesita un nuevo framework.",
    cards: [
      { title: "1. AGENTS.md", desc: "Reemplaza los shortcuts del stack (Python stdlib, Rust crates, Go stdlib). Ejecuta node scripts/check-rule-copies.js." },
      { title: "2. skills/", desc: "Apunta los comandos de auditoría a tus herramientas -- cargo audit, pip-audit, golangci-lint." },
      { title: "3. commands/", desc: "Actualiza las descripciones TOML y de OpenCode si cambia el comportamiento de un skill." },
    ],
  },
  stacks: {
    title: "Stacks enfocados",
    subtitle: "Patrones optimizados para los stacks de producción mas comunes.",
    items: [
      { name: "TypeScript / Node.js", desc: "Next.js, React, Express, Fastify, tipos estrictos" },
      { name: "MongoDB / Mongoose", desc: "Schemas, índices, agregacion, transacciones" },
      { name: "Tailwind CSS", desc: "Utility-first, modo oscuro, responsivo" },
      { name: "Python", desc: "FastAPI, Django, dataclasses, type hints" },
      { name: "PostgreSQL / Prisma", desc: "Relaciones, migraciones, prevención de N+1" },
      { name: "Redis", desc: "Cacheo, sesiones, rate limiting, pub/sub" },
    ],
  },
  suggested: {
    title: "Proyectos relacionados",
    subtitle: "Del cual se forked y vale la pena revisar ideas complementarias.",
    items: [
      { name: "ponytail", url: "https://github.com/DietrichGebert/ponytail", desc: "Proyecto base del cual lexis-two fue forked y extendido." },
      { name: "my-cursor-skills", url: "https://github.com/nitdraig/my-cursor-skills", desc: "Colección de skills de Cursor para revisar features complementarias." },
    ],
  },
  ecosystem: {
    title: "Ecosistema",
    subtitle:
      "Lexis-Two es el paquete público portable. Lexis-One es privado. Lexis-Zero es el futuro.",
  },
  footer: {
    license: "Licencia MIT",
    forked: "Forked de ponytail por DietrichGebert. Ecosistema Lexis por",
    built: "Construido con OpenCode y Cursor.",
  },
  benchmarks: {
    title: "Benchmark OpenCode Go",
    subtitle: "baseline vs lexis-two — LOC mediana en 5 tareas de código.",
    backHome: "Inicio",
    methodology: "Metodología",
    runDate: "Fecha",
    runsPerCell: "ejecuciones por celda",
    source: "fuente",
    totalLoc: "LOC total (mediana, 5 tareas)",
    reduction: "Reducción de LOC vs baseline",
    time: "Tiempo total (mediana en segundos)",
    byTask: "LOC por tarea — brazo lexis-two",
    summary: "Tabla resumen",
    colModel: "Modelo",
    colBaseline: "LOC baseline",
    colLexis: "LOC Lexis-Two",
    colReduction: "Reducción",
    colCorrect: "Correctas (lexis)",
    regenerate: "Regenerar:",
  },
} as const;
