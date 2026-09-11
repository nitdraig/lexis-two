export default {
  meta: {
    title: "Lexis-Two -- La forma simple de obtener el mejor código.",
    description:
      "Los agentes de código sobreconstruyen. Un ruleset portable que los encauza: probar la feature, preferir la plataforma, shippear el mínimo.",
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
      "Los agentes de código sobreconstruyen. Lexis-Two es un ruleset portable que los obliga a probar que la feature hace falta, preferir la plataforma y shippear el mínimo. /discx qué construir, /specx cómo shippearlo, /lexis qué tan lean quedarse.",
    aside:
      "Después de UI, /desx atrapa UI genérica de agente — una pasada de diseño al costado del loop, no una cuarta fase. Bugs: salta Discovery, usa /lexis plan.",
    benchmark:
      "Haz benchmarks con tus modelos OpenCode Go, luego publica resultados --",
    benchmarkLink: "OpenCode Go harness",
    benchmarkCode: "npm run benchmark:opencode-go",
    ctaGitHub: "Star en GitHub",
    ctaInstall: "Instalar",
    ctaGuide: "Guía de uso",
    ctaDocs: "Docs completas de portabilidad",
    ctaBenchmark: "Ver benchmarks",
  },
  philosophy: {
    title: "Disciplina de ingeniería",
    subtitle:
      "El mejor código es el que no se escribe. La simplicidad es método: defaults escépticos y límites mantenibles — no minimalismo ingenioso.",
    principles: [
      {
        name: "YAGNI",
        desc: "Cuestiona cada feature y abstracción antes de shippear. La escalera de abajo es el filtro.",
      },
      {
        name: "KISS",
        desc: "Stdlib, APIs de plataforma y one-liners aburridos ganan a dependencias nuevas.",
      },
      {
        name: "DRY",
        desc: "Un catálogo skills/. Los hosts enrutan comandos -- no bifurcan comportamiento.",
      },
      {
        name: "SOLID",
        desc: "Límites claros en módulos y servicios. Sin abstracciones que nadie pidió.",
      },
    ],
    ladderTitle: "La escalera de decisión",
    ladderSubtitle:
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
      "Esta es la escalera de decisión en código. Diálogo de confirmación. De <a href=\"https://github.com/nitdraig/lexis-two/tree/main/examples/nextjs/01-modal-library\">examples/nextjs/01-modal-library</a>.",
    without: "Sin Lexis-Two",
    with: "Con Lexis-Two",
    withoutFoot: "Portal, overlay, bloqueo de scroll y Escape para un si/no.",
    withFoot: "74 lineas → 24. &lt;dialog&gt; nativo trae focus trap y backdrop.",
    copy: "Copiar",
    copied: "Copiado",
  },
  hosts: {
    title: "Funciona donde programas",
    subtitle:
      "Funciona en el agente que ya usas. Adaptadores delgados. Un catálogo skills/ — los hosts se mantienen tontos.",
    headHost: "Host",
    headLevel: "Nivel",
    headEntry: "Punto de entrada",
    rows: [
      { host: "OpenCode", level: "full", entry: ".opencode/plugins/lexis-two.mjs" },
      { host: "Claude Code", level: "full", entry: ".claude-plugin/ + hooks/" },
      { host: "GitHub Copilot (plugin)", level: "full", entry: ".github/plugin/plugin.json" },
      { host: "Gemini CLI", level: "full", entry: "gemini-extension.json" },
      { host: "pi", level: "full", entry: "pi-extension/" },
      { host: "Codex", level: "full", entry: ".codex-plugin/ + AGENTS.md" },
      { host: "Cursor", level: "full", entry: ".cursor/rules/ + .cursor/skills/" },
      { host: "Windsurf / Cline / Kiro", level: "rules", entry: "lexis-two.md en la carpeta rules del host" },
      { host: "Cualquier agente", level: "rules", entry: "AGENTS.md o skills/*/SKILL.md" },
    ],
    levelFull: "Completo",
    levelSoon: "Próximamente",
    levelRules: "Reglas",
  },
  commands: {
    title: "Slash commands",
    subtitle:
      "Loop de tres pasos: /discx (producto), /specx (specs), /lexis (intensidad). /desx es una pasada de diseño después de UI, no una cuarta fase. Referencia completa — empezá por la guía si es tu primera vez.",
    guideLink: "Guía de uso completa",
    filterAll: "Todos",
    filterLexis: "Código",
    filterDiscovery: "Producto",
    filterSpecxis: "Specs",
    filterDesx: "Diseño",
    results: "{count} comandos",
    items: [
      { name: "/lexis status", desc: "Muestra el estado actual del plugin, nivel de intensidad activo y configuración por defecto." },
      { name: "/lexis <lite|full|ultra|off>", desc: "Cambia el nivel de intensidad de las reglas de pereza inteligente para el agente de IA." },
      { name: "/lexis plan (o /lexis p)", desc: "Plan perezoso antes de codear: jerarquía más aclarar, fuentes, comparar y escenarios. Un slice vertical." },
      { name: "/lexis review (o /lexis r)", desc: "Revisa los cambios recientes en git (diff) para detectar sobreingeniería y sugerir simplificaciones." },
      { name: "/lexis audit (o /lexis a)", desc: "Escanea todo el repositorio en busca de código muerto, dependencias innecesarias o abstracciones prematuras." },
      { name: "/lexis debt (o /lexis d)", desc: "Cosecha y prioriza todos los comentarios // lexis: del código en un ledger de deuda técnica." },
      { name: "/lexis security (o /lexis s)", desc: "Realiza una auditoría de seguridad enfocada en vulnerabilidades del stack (Node.js/Next.js/MongoDB)." },
      { name: "/lexis help (o /lexis h)", desc: "Despliega la tarjeta de referencia rápida con los comandos públicos y niveles." },
      { name: "/discx <slug>", desc: "Discovery: MVP, prioridades, mapa y 06-post-mvp.md. Sin código de producto. Escala después con un slug nuevo alimentado por el post-MVP. Alias: /discovery." },
      { name: "/desx audit", desc: "Auditoría de diseño de solo lectura: slop visual y deriva de tokens. Solo escribe DESIGN-AUDIT.md. Alias: /desx." },
      { name: "/desx apply", desc: "El implementador aplica DESIGN-AUDIT.md (P0 y luego P1). No es design-auditor." },
      { name: "/specx", desc: "Alias corto de /specxis — el mismo ciclo de Spec-Driven Development." },
      { name: "/specxis status", desc: "Monitorea el estado, progreso de tareas y deuda técnica de las especificaciones activas. Alias: /specx." },
      { name: "/specxis new <slug>", desc: "Crea proposal.md con lazy check. Puerta blanda: productos vagos sin 01-mvp.md se mandan a /discx (bypass: sin discovery)." },
      { name: "/specxis plan <slug>", desc: "Genera los archivos spec.md (MUST/SHOULD/MAY) y tasks.md (lista de tareas técnicas) a partir de la propuesta." },
      { name: "/specxis implement <slug>", desc: "Guía al agente para implementar la siguiente tarea pendiente, una por una, de forma controlada." },
      { name: "/specxis review <slug>", desc: "Evalúa la implementación actual contra los requisitos de la especificación y las reglas de AGENTS.md." },
      { name: "/specxis close <slug>", desc: "Archiva la especificación completada y consolida sus comentarios // lexis: en el ledger de deuda técnica." },
      { name: "/specxis debt", desc: "Sincroniza todos los comentarios // lexis: del código de forma portable en .specxis/debt.md." },
    ],
  },
  install: {
    title: "Instalar",
    subtitle:
      "Un comando para hosts de reglas — o configura plugins manualmente.",
    tabNpx: "npx install",
    tabOpencode: "OpenCode",
    tabOpencodeNpm: "OpenCode (npm)",
    tabCursor: "Cursor",
    tabClone: "Clonar",
    npxHint: "Detecta Cursor, Windsurf, Cline, Kiro, OpenCode y AGENTS.md. Se puede re-ejecutar sin riesgo.",
  },
  adapt: {
    title: "Adapta tu stack",
    subtitle: "Node/TS tiene la cobertura más profunda hoy; otros ecosistemas se suman. Tres archivos para tocar — sin framework nuevo.",
    cards: [
      { title: "1. AGENTS.md", desc: "Reemplaza los shortcuts del stack (Python stdlib, Rust crates, Go stdlib). Ejecuta node scripts/check-rule-copies.js." },
      { title: "2. skills/", desc: "Apunta los comandos de auditoría a tus herramientas -- cargo audit, pip-audit, golangci-lint." },
      { title: "3. commands/", desc: "Actualiza las descripciones TOML y de OpenCode si cambia el comportamiento de un skill." },
    ],
  },
  stacks: {
    title: "Stacks enfocados",
    subtitle: "La cobertura más profunda hoy es TypeScript / Node.js. Otros ecosistemas se suman de a poco.",
    items: [
      { name: "TypeScript / Node.js", desc: "Next.js, React, Express, Fastify, tipos estrictos" },
      { name: "MongoDB / Mongoose", desc: "Schemas, índices, agregacion, transacciones" },
      { name: "Tailwind CSS", desc: "Utility-first, modo oscuro, responsivo" },
      { name: "Python", desc: "FastAPI, Django, dataclasses, type hints" },
      { name: "PostgreSQL / Prisma", desc: "Relaciones, migraciones, prevención de N+1" },
      { name: "Redis", desc: "Caché, sesiones, rate limiting, pub/sub" },
    ],
  },
  suggested: {
    title: "Proyectos relacionados",
    subtitle: "Repos complementarios -- benchmarks, patrones tempranos y extensiones por host.",
    items: [
      {
        name: "ponytail",
        url: "https://github.com/DietrichGebert/ponytail",
        desc: "Harness de benchmarks y patrones tempranos de escalera de decisión sobre los que crece este ecosistema (MIT).",
      },
      { name: "my-cursor-skills", url: "https://github.com/nitdraig/my-cursor-skills", desc: "Colección de skills de Cursor para revisar features complementarias." },
    ],
  },
  ecosystem: {
    title: "Ecosistema",
    subtitle:
      "Lexis-Two es el paquete portable público -- principios, skills y adaptadores. Lexis-One es orquestación privada. Lexis-Core es futuro.",
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
    disclaimer:
      "Resultados de una corrida OpenCode Go (5 tareas, 3 repeticiones por celda). Dependen del modelo y la tarea — no son claims universales.",
  },
  excelsoOpen: {
    title: "Excelso Open",
    description: "Este proyecto forma parte de Excelso Open, nuestra rama de código abierto enfocada en la comunidad, impulsando tecnología colaborativa y proyectos de impacto social.",
    linkText: "Visita excelso.xyz",
    url: "https://excelso.xyz",
  },
  guide: {
    title: "Cómo usar las herramientas",
    subtitle:
      "Qué hace cada comando, cuándo usarlo y un ejemplo para copiar. Loop de tres pasos más una pasada de diseño después de UI.",
    summary:
      "Loop: /discx define este MVP y la siguiente etapa, /specx lo convierte en spec y tareas, /lexis mantiene al agente lean. Después de UI, /desx es una pasada de diseño al costado del loop — no una fase de Specxis. Bugs: salta Discovery, usa /lexis plan.",
    availability:
      "Disponibles en los hosts con adaptador de comandos: OpenCode, Gemini CLI, pi, Claude Code y GitHub Copilot.",
    levelsTitle: "Niveles de intensidad",
    levelsSubtitle:
      "/lexis <modo> cambia la agresividad con la que las reglas frenan a tu agente. El nivel activo se inyecta en cada system prompt hasta que lo cambies.",
    colLevel: "Nivel",
    colWhen: "Usalo para",
    levels: [
      { name: "lite", when: "Specs estrictas e innegociables", desc: "Construye exactamente lo pedido y luego sugiere una alternativa más perezosa en una línea." },
      { name: "full", when: "Trabajo diario (por defecto)", desc: "Aplica la escalera de decisión: YAGNI, stdlib, plataforma nativa, dependencias ya instaladas, una línea, build minimo." },
      { name: "ultra", when: "Sprints de refactor y limpieza", desc: "YAGNI extremista: cuestiona requisitos, borra codigo primero y prefiere one-liners." },
      { name: "off", when: "Sesiones sin reglas", desc: "Desactiva por completo las reglas Lexis hasta que vuelvas a activarlas." },
    ],
    workflowTitle: "Comandos /lexis",
    workflowSubtitle:
      "Siete verbos públicos. plan ya aclara, ancla en fuentes, compara y recorre escenarios. Los nombres v1.2 siguen enrutados.",
    colCommand: "Comando",
    colWhat: "Que hace",
    colExample: "Ejemplo",
    items: [
      { name: "/lexis plan", desc: "Plan tecnico antes de codigo: escalera perezosa mas aclarar (max 3 preguntas), repo/docs, propuesto vs lazy, feliz/borde/fallo. Un slice entregable.", example: "/lexis plan agregar exportacion CSV a la pagina de ordenes" },
      { name: "/lexis review", desc: "Analiza los cambios recientes de git buscando sobre-ingeniería, código muerto y stdlib reinventada -- usalo antes de cada commit o PR.", example: "/lexis r" },
      { name: "/lexis audit", desc: "Auditoría de solo lectura de todo el repositorio: dependencias sin usar, features especulativas, boilerplate redundante.", example: "/lexis a" },
      { name: "/lexis debt", desc: "Recolecta cada comentario // lexis: del código en un registro de deuda priorizado (inmediata / próximo sprint / backlog / permanente).", example: "/lexis d" },
      { name: "/lexis security", desc: "Auditoria de seguridad enfocada en tu stack: inyección, XSS, middleware faltante, secretos hardcodeados, inputs sin validar.", example: "/lexis s" },
      { name: "/lexis help", desc: "Referencia rapida: comandos publicos, niveles y configuracion.", example: "/lexis h" },
    ],
    discoveryTitle: "El ciclo /discx",
    discoverySubtitle:
      "Enmarque de producto antes de Specxis. Los docs viven en docs/discovery/<slug>/. Cuando este ciclo se shippea, corre /discx de nuevo con el next-slug de 06-post-mvp.md.",
    discoveryItems: [
      { name: "/discx <slug>", desc: "Primer ciclo: B1–B8, llena 00–06 (MVP + post-MVP). Sin código de producto. Alias: /discovery.", example: "/discx family-shared-expenses" },
      { name: "/discx <next-slug>", desc: "Ciclo de escala: no pisa la carpeta anterior. Siembra 01-mvp.md desde el 06-post-mvp.md previo y escribe un post-MVP nuevo.", example: "/discx family-settlements" },
    ],
    specxisTitle: "El ciclo /specx",
    specxisSubtitle:
      "Desarrollo dirigido por specs para features que tocan 3+ archivos. Comando corto /specx (completo /specxis). La spec vive en .specxis/active/<slug>/ como Markdown plano.",
    specxisItems: [
      { name: "/specx new <slug>", desc: "Crea .specxis/active/<slug>/proposal.md. Puerta blanda: si la idea es un producto vago y falta docs/discovery/<slug>/01-mvp.md, sugiere /discx primero (bypass: sin discovery)." },
      { name: "/specx plan <slug>", desc: "Convierte la propuesta en spec.md (MUST / SHOULD / MAY) y tasks.md -- máximo 10 tareas, cada una mapeada a un solo archivo o función. Prefiere 02-priorities.md si hay Discovery." },
      { name: "/specx implement <slug>", desc: "Implementa exactamente una tarea pendiente por corrida, siguiendo los MUST de spec.md y las reglas de tu AGENTS.md. Control total, sin sorpresas." },
      { name: "/specx review <slug>", desc: "Evaluación de solo lectura contra la spec; los hallazgos (severidad, ubicación, problema, fix) se escriben en review.md." },
      { name: "/specx close <slug>", desc: "Verifica que todas las tareas estén hechas y no queden hallazgos Critical/High, archiva la spec y lleva los comentarios // lexis: al registro de deuda." },
      { name: "/specx debt", desc: "Sincroniza cada comentario // lexis: del codigo con .specxis/debt.md mediante un script Node portable." },
    ],
    desxTitle: "La pasada /desx",
    desxSubtitle:
      "Al costado del loop, como security-auditor. Después de UI: detectar slop y luego aplicar. No es una fase de Specxis.",
    desxItems: [
      { name: "/desx audit", desc: "design-auditor. Detector sin modelo y pulido opcional. Solo escribe DESIGN-AUDIT.md.", example: "/desx audit" },
      { name: "/desx apply", desc: "El implementador aplica P0 y luego P1, tilda solo lo resuelto y vuelve a correr el detector.", example: "/desx apply" },
    ],
    sddHint:
      "Loop: /discx para producto vago y escala; /specx para coordinación de 3+ archivos; /lexis para intensidad. Después de UI, /desx es una pasada de diseño. Salta Discovery en bugs y cambios de un archivo. Más en DISCOVERY.md, docs/specxis.md y DESX.md.",
    backHome: "Volver al inicio",
  },
} as const;
