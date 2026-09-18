export default {
  meta: {
    title: "Lexis-Two — La IA hace el trabajo. Vos decidís lo que importa.",
    description:
      "Un framework portable con humano en el loop para agentes de código. Definí la intención, dejá que los agentes planifiquen/construyan/revisen, y aprobá cada giro crítico.",
  },
  nav: {
    docs: "Docs",
    benchmarks: "Benchmarks",
    github: "GitHub",
    skipLink: "Saltar al contenido",
  },
  home: {
    hero: {
      eyebrow: "Framework de agentes con humano en el loop",
      title: "La IA hace el trabajo. <em>Vos decidís lo que importa.</em>",
      copy:
        "Lexis-Two es un framework abierto para flujos de agentes donde la IA planifica, construye y revisa — mientras el humano conserva el control de las decisiones críticas.",
      ctaExplore: "Explorar el loop",
      ctaGitHub: "Ver en GitHub",
      meta: "Open source · Portable · Controlado por humanos",
      install: "npx @draig/lexis-two install",
      workflow: {
        humanTop: { label: "HUMANO / INTENCIÓN", desc: "Definís el objetivo y los límites." },
        discover: { label: "01 / DESCUBRIR", desc: "Entender el problema." },
        plan: { label: "02 / PLANIFICAR", desc: "Definir la solución más chica." },
        build: { label: "03 / CONSTRUIR", desc: "El agente ejecuta una porción." },
        review: { label: "04 / REVISAR", desc: "Chequear contra la intención." },
        humanBottom: { label: "05 / CHECKPOINT HUMANO", desc: "Aprobás, modificás o rechazás — y sigue." },
        status: "LOOP DE AGENTE / ESPERA DECISIÓN HUMANA",
        statusNote: "↻ vuelve a 01 en la próxima vuelta",
      },
    },
    banner: {
      flag: "NUEVO",
      title: "Llegaron los perfiles de stack",
      copy: "Las convenciones ahora viven en perfiles de stacks/, detectados según la tarea — adiós a las reglas de un solo stack.",
      dismiss: "Cerrar banner",
    },
    problem: {
      eyebrow: "El problema",
      title: "Autónomo no tiene por qué ser sin supervisión.",
      copy:
        "Los agentes ya pueden planificar, escribir, revisar y operar herramientas. La pregunta no es si pueden actuar solos, sino en qué punto del sistema tiene que entrar el criterio humano.",
      withoutTitle: "SIN UN LOOP CONTROLADO",
      withoutFlow: ["Humano", "Prompt", "Agente", "Resultado"],
      withTitle: "CON LEXIS-TWO",
      withFlow: ["Intención", "Loop de agentes", "Checkpoint humano", "Resultado"],
    },
    thesis: {
      eyebrow: "El principio",
      title: "Los humanos no necesitan supervisar cada paso. <span>Necesitan ser dueños de los importantes.</span>",
    },
    loop: {
      eyebrow: "El loop de Lexis-Two",
      title: "Un flujo diseñado alrededor de decisiones.",
      copy: "Estructura el trabajo de los agentes en etapas explícitas, para que el sistema sepa qué hacer, qué revisar y cuándo involucrar a un humano.",
      modeHuman: "Con gate humano",
      modeAuto: "Lote autónomo",
      steps: [
        { num: "01", title: "Descubrir", desc: "Entender el problema antes de escribir código.", tag: "/discx" },
        { num: "02", title: "Especificar", desc: "Definir la solución mínima válida.", tag: "/specx plan" },
        { num: "03", title: "Construir", desc: "El agente ejecuta una tarea y se detiene.", tag: "/specx implement" },
        { num: "04", title: "Revisar", desc: "Chequear la implementación contra la intención.", tag: "/lexis review" },
      ],
      stepsAuto: [
        { num: "01", title: "Descubrir", desc: "Igual: define el MVP antes de especificar.", tag: "/discx" },
        { num: "02", title: "Especificar", desc: "Genera spec y tareas sin pausa intermedia.", tag: "/specx plan" },
        { num: "03", title: "Construir todo", desc: "Ejecuta la lista completa de una corrida, acotado por Discovery.", tag: "sin pausa" },
        { num: "04", title: "Revisar al final", desc: "Una sola revisión sobre todo el lote antes de cerrar.", tag: "/lexis audit" },
      ],
      gateLabel: "espera tu OK",
      noPauseLabel: "sin pausa",
    },
    checkpoint: {
      eyebrow: "Checkpoint humano",
      title: "El agente sabe cuándo parar.",
      copy:
        "No todas las acciones necesitan aprobación. Las decisiones críticas, sí. Acá el humano pasa de supervisor a quien decide.",
      cardTitle: "AGENTE / IMPLEMENTACIÓN",
      statusPaused: "EN PAUSA",
      statusResuming: "RETOMANDO",
      statusModify: "REQUIERE AJUSTE",
      statusWaiting: "ESPERANDO AL HUMANO",
      prompt: "Encontré dos enfoques válidos para esta feature.",
      optionA: { label: "OPCIÓN A", desc: "Usar la API nativa de la plataforma. Sin dependencia nueva. Implementación más chica." },
      optionB: { label: "OPCIÓN B", desc: "Agregar una librería de modales. Menos código propio, pero suma una dependencia." },
      recommendation: "Recomendación:",
      approve: "Aprobar",
      modify: "Modificar",
      ask: "Preguntarle al agente",
      result: "Decisión registrada. El agente retoma…",
    },
    agents: {
      eyebrow: "Arquitectura de agentes",
      title: "Un loop. Varios agentes especializados.",
      copy:
        "Separá responsabilidades sin perder un flujo compartido. Cada rol tiene permisos explícitos — los auditores son de solo lectura por diseño.",
      control: { label: "CONTROL", name: "HUMANO / LOOP" },
      roles: [
        { name: "lexis-one", perm: "write", desc: "Implementa, edita, corre bash dentro del gate." },
        { name: "lexis-review", perm: "read", desc: "Evalúa cambios contra la spec. Nunca edita." },
        { name: "ui-architect", perm: "read", desc: "Asesora sobre diseño. No implementa." },
        { name: "refactor-agent", perm: "write", desc: "Reestructuración a gran escala, dentro de una tarea acotada." },
        { name: "security-auditor", perm: "read", desc: "Corre auditorías. Reporta, no corrige." },
        { name: "design-auditor", perm: "read", desc: "Detecta desliz visual de IA genérica. Solo puede escribir DESIGN-AUDIT.md." },
      ],
      permWrite: "escribe",
      permRead: "solo lectura",
    },
    principles: {
      eyebrow: "Principios de ingeniería",
      title: "Los agentes necesitan límites, no más prompts.",
      copy: "Lexis-Two inclina el loop hacia soluciones más simples, chicas y mantenibles.",
      items: [
        { code: "YAGNI", title: "Construí lo necesario.", desc: "No metas funcionalidad antes de que haya una necesidad concreta." },
        { code: "KISS", title: "Preferí el camino simple.", desc: "Usá capacidades nativas antes que sumar una abstracción." },
        { code: "DRY", title: "Una sola fuente de verdad.", desc: "Evitá conocimiento duplicado e implementaciones paralelas." },
        { code: "SOLID", title: "Límites explícitos.", desc: "Responsabilidades claras, interfaces mantenibles." },
      ],
    },
    ladder: {
      eyebrow: "Escalera de decisión",
      title: "Antes de sumar código, preguntar si el código debe existir.",
      steps: [
        { code: "YAGNI", desc: "¿Necesita existir?" },
        { code: "Plataforma", desc: "¿La plataforma ya lo resuelve?" },
        { code: "Dependencia existente", desc: "¿El proyecto ya lo provee?" },
        { code: "Código mínimo", desc: "¿Cuál es la implementación más chica que funciona?" },
      ],
    },
    example: {
      eyebrow: "Prueba en el loop",
      title: "El agente no solo escribe código. Lo cuestiona.",
      copy: "Una decisión representativa: usar una capacidad nativa del navegador en vez de sumar una abstracción.",
      withoutTitle: "SIN LEXIS",
      withoutLines: "74 líneas",
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
      withTitle: "CON LEXIS",
      withLines: "24 líneas",
      withCode: `// lexis: <dialog> nativo — focus trap
// y backdrop ya incluidos
<dialog ref={dialogRef}>
  <h2>Confirmar borrado</h2>
  <form method="dialog">
    <button value="cancel">Cancelar</button>
    <button value="confirm">Borrar</button>
  </form>
</dialog>`,
      note: "El agente eligió la plataforma antes que la librería — sin que nadie se lo pidiera vuelta a vuelta.",
      copyLabel: "Copiar",
      copiedLabel: "Copiado",
    },
    hosts: {
      eyebrow: "Portable por diseño",
      title: "Usá el agente que ya tenés.",
      copy: "Lexis-Two no reemplaza al agente que usás hoy. Le da una forma compartida de trabajar.",
      items: ["OpenCode", "Claude Code", "Cursor", "Codex", "Gemini CLI", "Copilot"],
    },
    agnostic: {
      eyebrow: "Agnóstico por diseño",
      title: "La misma filosofía. Tu stack, tu host, tu agente.",
      copy: "Lexis-Two no te ata a un framework, a un editor ni a un orquestador. El core queda universal; lo específico se detecta por tarea y por host.",
      cards: [
        { tag: "Stack", title: "Agnóstico de stack", desc: "La filosofía vive en AGENTS.md. Las convenciones viven en stacks/<id>.md y se detectan desde los archivos de la tarea — Node/TS shipped, Python/Go/Rust/Astro planificados." },
        { tag: "Host", title: "Agnóstico de host", desc: "Un catálogo skills/ y adaptadores delgados para OpenCode, Claude Code, Cursor, Codex, Gemini CLI, Copilot, pi y AGENTS.md plano." },
        { tag: "Agente", title: "Agnóstico de agente", desc: "Un ruleset portable, no un lock-in de producto. Cualquier agente que lea instrucciones puede seguir el loop sin un orquestador privado." },
      ],
    },
    benchmarks: {
      eyebrow: "Con números, no solo promesas",
      title: "Lo que cambia cuando el loop tiene disciplina.",
      copy: "Benchmark OpenCode Go, mediana de LOC en 5 tareas de código, 3 corridas por celda.",
      items: [
        { value: "−68%", label: "reducción de LOC vs baseline" },
        { value: "9", label: "casos antes/después documentados — Next.js, Express, FastAPI" },
        { value: "9", label: "hosts con soporte completo" },
      ],
      foot: "Resultados de una corrida — específicos por modelo y tarea, no una promesa universal.",
    },
    vision: {
      eyebrow: "La dirección",
      title: "De reglas a orquestación.",
      copy: "Lexis-Two es la base portable de hoy. La dirección de largo plazo es una capa de orquestación programable para flujos humano + agente.",
      cards: [
        { tag: "HOY", title: "Lexis-Two", desc: "Principios, skills, comandos, adaptadores y loop de agentes estructurado." },
        { tag: "PRÓXIMO", title: "Lexis-Core", desc: "Orquestación, estado, coordinación de agentes, contexto compartido y checkpoints humanos configurables." },
        { tag: "VISIÓN", title: "Sistemas de agentes", desc: "Una capa programable para flujos inteligentes que saben cuándo actuar y cuándo preguntar." },
      ],
      futureTitle: "¿Y si el agente pudiera trabajar hasta que se necesite tu criterio?",
      futureCopy: "El objetivo no es la autonomía máxima. Es autonomía útil, con control humano explícito en los momentos que importan.",
    },
    commandsExplained: {
      eyebrow: "Comandos explicados",
      title: "/lexis, /specx y /desx no son lo mismo.",
      copy: "Cada comando controla una capa distinta del flujo.",
      items: [
        { command: "/lexis", name: "Intensidad", desc: "Cambia qué tan agresivamente el ruleset frena al agente. Para trabajo diario lean, refactors o apagar reglas." },
        { command: "/specx", name: "Specs", desc: "Ciclo dirigido por specs para features de 3+ archivos: propuesta, plan, implementar una tarea por vez, revisar, cerrar." },
        { command: "/desx", name: "Diseño", desc: "Auditoría de diseño de solo lectura después de UI. Detecta slop visual y deriva de tokens, y aplica fixes fuera del loop de specs." },
      ],
    },
    install: {
      eyebrow: "Empezá",
      title: "Arrancá con el agente que ya usás.",
      command: "npx @draig/lexis-two install",
      copy: "Copiar",
      copied: "Copiado",
      chips: ["OpenCode", "Claude Code", "Cursor", "Codex", "Gemini CLI", "Copilot", "AGENTS.md"],
    },
    finalCta: {
      eyebrow: "Lexis-Two",
      title: "Dejá que el agente trabaje. Guardate la decisión.",
      ctaStart: "Empezar",
      ctaGitHub: "Explorar en GitHub",
    },
  },
  hosts: {
    title: "Funciona donde programas",
    subtitle:
      "Funciona en el agente que ya usás. Adaptadores delgados. Un catálogo skills/ — los hosts se mantienen tontos.",
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
      "Loop de tres pasos: /discx (producto), /specx (specs), /lexis (intensidad). /desx es una pasada de diseño después de UI, no una cuarta fase.",
    guideLink: "Docs completos",
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
      { name: "/lexis audit (o /lexis a)", desc: "Escanea todo el repositorio en busca de código muerto, dependencias innecesarias o abstracciones prematuras — consciente del stack cuando existe un perfil." },
      { name: "/lexis debt (o /lexis d)", desc: "Cosecha y prioriza todos los comentarios // lexis: del código en un ledger de deuda técnica." },
      { name: "/lexis security (o /lexis s)", desc: "Realiza una auditoría de seguridad enfocada. Usa el audit del stack si existe perfil; si no, checks genéricos." },
      { name: "/lexis help (o /lexis h)", desc: "Despliega la tarjeta de referencia rápida con los comandos públicos y niveles." },
      { name: "/discx <slug>", desc: "Discovery: MVP, prioridades, mapa y 06-post-mvp.md. Sin código de producto. Alias: /discovery." },
      { name: "/desx audit", desc: "Auditoría de diseño de solo lectura: slop visual y deriva de tokens. Solo escribe DESIGN-AUDIT.md. Alias: /desx." },
      { name: "/desx apply", desc: "El implementador aplica DESIGN-AUDIT.md (P0 y luego P1). No es design-auditor." },
      { name: "/specx", desc: "Alias corto de /specxis — el mismo ciclo de Spec-Driven Development." },
      { name: "/specxis status", desc: "Monitorea el estado, progreso de tareas y deuda técnica de las especificaciones activas. Alias: /specx." },
      { name: "/specxis new <slug>", desc: "Crea proposal.md con lazy check. Productos vagos sin 01-mvp.md se mandan a /discx primero." },
      { name: "/specxis plan <slug>", desc: "Genera los archivos spec.md (MUST/SHOULD/MAY) y tasks.md a partir de la propuesta." },
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
    title: "Agregá un stack",
    subtitle: "¿Ecosistema nuevo? Sumá un archivo de perfil y una fila de detección — sin framework nuevo.",
    cards: [
      { title: "1. stacks/<id>.md", desc: "Copiá <code>stacks/_template.md</code> y completá detección, herramientas y convenciones." },
      { title: "2. Tabla de detección", desc: "Sumá una fila a <code>AGENTS.md</code> para que los agentes sepan cuándo cargar el perfil." },
      { title: "3. npm test", desc: "Vuelve a sincronizar las cuatro copias de reglas y detecta drift." },
    ],
  },
  stacks: {
    title: "Perfiles de stack",
    subtitle: "La filosofía sigue agnóstica; las convenciones viven en stacks/<id>.md y se detectan por tarea.",
    items: [
      { name: "node-ts", desc: "Shipped — Next.js, Express, MongoDB, PostgreSQL, TypeScript estricto" },
      { name: "js-astro", desc: "Planificado — se detecta, nunca se simula como Next" },
      { name: "python", desc: "Planificado — se detecta desde pyproject.toml / requirements.txt" },
      { name: "go", desc: "Planificado — se detecta desde go.mod" },
      { name: "rust", desc: "Planificado — se detecta desde Cargo.toml" },
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
    tagline: "Un framework con humano en el loop para agentes de código.",
    license: "Licencia MIT",
    forked: "Forked de ponytail por DietrichGebert. Ecosistema Lexis por nitdraig.",
    productTitle: "Producto",
    devTitle: "Devs",
    projectTitle: "Proyecto",
    home: "Inicio",
    docs: "Docs",
    benchmarks: "Benchmarks",
    github: "GitHub",
    source: "Código fuente",
    issues: "Issues",
    discussions: "Discussions",
    excelsoUrl: "https://excelso.xyz",
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
  docs: {
    title: "Documentación",
    subtitle:
      "Qué hace cada comando, cuándo usarlo y un ejemplo para copiar. Loop de tres pasos más una pasada de diseño después de UI.",
    summary:
      "Loop: /discx define este MVP y la siguiente etapa, /specx lo convierte en spec y tareas, /lexis mantiene al agente lean. Después de UI, /desx es una pasada de diseño al costado del loop — no una fase de Specxis. Bugs: salta Discovery, usa /lexis plan.",
    availability:
      "Disponibles en los hosts con adaptador de comandos: OpenCode, Gemini CLI, pi, Claude Code y GitHub Copilot.",
    toc: ["Niveles de intensidad", "Comandos /lexis", "El ciclo /discx", "El ciclo /specx", "La pasada /desx"],
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
      "Siete verbos públicos. plan ya aclara, ancla en fuentes, compara y recorre escenarios.",
    colCommand: "Comando",
    colWhat: "Que hace",
    colExample: "Ejemplo",
    items: [
      { name: "/lexis plan", desc: "Plan tecnico antes de codigo: escalera perezosa mas aclarar (max 3 preguntas), repo/docs, propuesto vs lazy, feliz/borde/fallo. Un slice entregable.", example: "/lexis plan agregar exportacion CSV a la pagina de ordenes" },
      { name: "/lexis review", desc: "Analiza los cambios recientes de git buscando sobre-ingeniería, código muerto y stdlib reinventada -- usalo antes de cada commit o PR.", example: "/lexis r" },
      { name: "/lexis audit", desc: "Auditoría de solo lectura de todo el repositorio: dependencias sin usar, features especulativas, boilerplate redundante.", example: "/lexis a" },
      { name: "/lexis debt", desc: "Recolecta cada comentario // lexis: del código en un registro de deuda priorizado.", example: "/lexis d" },
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
      { name: "/specx new <slug>", desc: "Crea .specxis/active/<slug>/proposal.md. Puerta blanda: si la idea es un producto vago y falta docs/discovery/<slug>/01-mvp.md, sugiere /discx primero.", example: "/specx new csv-export" },
      { name: "/specx plan <slug>", desc: "Convierte la propuesta en spec.md (MUST / SHOULD / MAY) y tasks.md -- máximo 10 tareas, cada una mapeada a un solo archivo o función.", example: "/specx plan csv-export" },
      { name: "/specx implement <slug>", desc: "Implementa exactamente una tarea pendiente por corrida, siguiendo los MUST de spec.md y las reglas de tu AGENTS.md.", example: "/specx implement csv-export" },
      { name: "/specx review <slug>", desc: "Evaluación de solo lectura contra la spec; los hallazgos (severidad, ubicación, problema, fix) se escriben en review.md.", example: "/specx review csv-export" },
      { name: "/specx close <slug>", desc: "Verifica que todas las tareas estén hechas y no queden hallazgos Critical/High, archiva la spec y lleva los comentarios // lexis: al registro de deuda.", example: "/specx close csv-export" },
      { name: "/specx debt", desc: "Sincroniza cada comentario // lexis: del codigo con .specxis/debt.md mediante un script Node portable.", example: "/specx debt" },
    ],
    desxTitle: "La pasada /desx",
    desxSubtitle:
      "Al costado del loop, como security-auditor. Después de UI: detectar slop y luego aplicar. No es una fase de Specxis.",
    desxItems: [
      { name: "/desx audit", desc: "design-auditor. Detector sin modelo y pulido opcional. Solo escribe DESIGN-AUDIT.md.", example: "/desx audit" },
      { name: "/desx apply", desc: "El implementador aplica P0 y luego P1, tilda solo lo resuelto y vuelve a correr el detector.", example: "/desx apply" },
    ],
    sddHint:
      "Loop: /discx para producto vago y escala; /specx para coordinación de 3+ archivos; /lexis para intensidad. Después de UI, /desx es una pasada de diseño. Salta Discovery en bugs y cambios de un archivo.",
    backHome: "Volver al inicio",
  },
} as const;
