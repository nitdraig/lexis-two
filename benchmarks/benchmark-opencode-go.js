#!/usr/bin/env node
/**
 * Lexis-Two benchmark via OpenCode Go models.
 *
 * Same 5 tasks as promptfooconfig.yaml. Arms: baseline (no skill) vs lexis-two.
 * Optional: --arm caveman for a third arm.
 *
 * Usage:
 *   node benchmarks/benchmark-opencode-go.js --repeat 3
 *   node benchmarks/benchmark-opencode-go.js --model kimi-k2.6 --repeat 10
 *   node benchmarks/benchmark-opencode-go.js --write-md
 *
 * Requires OPENCODE_API_KEY in .env or environment (OpenCode Go subscription).
 * Docs: benchmarks/README.md#opencode-go
 */

const fs = require('fs');
const path = require('path');

const { loadEnvFile } = require('./lib/load-env');
loadEnvFile(path.join(__dirname, '..', '.env'));

const { complete, DEFAULT_BASE } = require('./lib/opencode-go-client');
const measureLoc = require('./loc');
const checkCorrect = require('./correctness');

const ROOT = path.join(__dirname, '..');
const MODELS_PATH = path.join(__dirname, 'opencode-go-models.json');

const TASKS = [
  { id: 'email', prompt: 'Write me a Python function that validates email addresses.' },
  {
    id: 'debounce',
    prompt:
      'Add debounce to a search input in vanilla JavaScript. It currently fires an API call on every keystroke.',
  },
  {
    id: 'csv-sum',
    prompt: "Write Python code that reads sales.csv and sums the 'amount' column.",
  },
  {
    id: 'countdown',
    prompt:
      'Build me a countdown timer component in React that counts down from a given number of seconds.',
  },
  {
    id: 'rate-limit',
    prompt: "Add rate limiting to my FastAPI endpoint so users can't spam it.",
  },
];

function loadModelsConfig() {
  return JSON.parse(fs.readFileSync(MODELS_PATH, 'utf8'));
}

function loadArms(includeCaveman) {
  const arms = {
    baseline: null,
    'lexis-two': require('./arms/lexis-two').system,
  };
  if (includeCaveman) {
    arms.caveman = fs.readFileSync(path.join(__dirname, 'arms', 'caveman-SKILL.md'), 'utf8');
  }
  return arms;
}

function median(values) {
  const s = [...values].sort((a, b) => a - b);
  if (s.length === 0) return 0;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function parseArgs(argv) {
  const opts = {
    repeat: 3,
    models: null,
    arms: ['baseline', 'lexis-two'],
    writeMd: false,
    delayMs: 500,
    temperature: 1,
    baseUrl: process.env.OPENCODE_GO_BASE_URL || DEFAULT_BASE,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repeat') {
      opts.repeat = Number(argv[++i]);
    } else if (arg === '--model') {
      opts.models = [argv[++i]];
    } else if (arg === '--models') {
      opts.models = argv[++i].split(',').map((m) => m.trim()).filter(Boolean);
    } else if (arg === '--caveman') {
      opts.arms.push('caveman');
    } else if (arg === '--write-md') {
      opts.writeMd = true;
    } else if (arg === '--delay-ms') {
      opts.delayMs = Number(argv[++i]);
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node benchmarks/benchmark-opencode-go.js [options]

  --repeat N       Runs per cell (default: 3)
  --model ID       Single model (e.g. kimi-k2.6)
  --models a,b,c   Comma-separated model IDs
  --caveman        Include caveman arm
  --write-md       Write benchmarks/results/<date>-opencode-go.md
  --delay-ms N     Pause between API calls (default: 500)
`);
      process.exit(0);
    }
  }

  return opts;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function summarizeModel(modelId, modelName, repeat, arms, cellResults) {
  const taskIds = TASKS.map((t) => t.id);
  const lines = [];
  lines.push(`## ${modelName} (\`${modelId}\`)`);
  lines.push('');
  lines.push(`Repeat: ${repeat}. Arms: ${Object.keys(arms).join(', ')}.`);
  lines.push('');

  const header =
    '| arm | ' + taskIds.join(' | ') + ' | TOTAL | correct |';
  const sep = '| --- | ' + taskIds.map(() => '---:').join(' | ') + ' | ---: | ---: |';
  lines.push('**Code LOC (median)**');
  lines.push('');
  lines.push(header);
  lines.push(sep);

  for (const arm of Object.keys(arms)) {
    const locs = taskIds.map((t) => median(cellResults[arm][t].map((r) => r.loc)));
    const passCount = taskIds.reduce(
      (sum, t) => sum + cellResults[arm][t].filter((r) => r.correct).length,
      0,
    );
    const totalRuns = taskIds.length * repeat;
    lines.push(
      `| ${arm} | ${locs.join(' | ')} | ${locs.reduce((a, b) => a + b, 0)} | ${passCount}/${totalRuns} |`,
    );
  }

  const baseTotal = taskIds.reduce(
    (sum, t) => sum + median(cellResults.baseline[t].map((r) => r.loc)),
    0,
  );
  const lexisTotal = taskIds.reduce(
    (sum, t) => sum + median(cellResults['lexis-two'][t].map((r) => r.loc)),
    0,
  );
  if (baseTotal > 0) {
    const pct = ((1 - lexisTotal / baseTotal) * 100).toFixed(0);
    lines.push('');
    lines.push(
      `**lexis-two vs baseline (median total LOC):** ${pct}% ${Number(pct) >= 0 ? 'less' : 'more'} code.`,
    );
  }

  lines.push('');
  return lines.join('\n');
}

async function runModel(modelId, modelConfig, opts, arms) {
  const taskIds = TASKS.map((t) => t.id);
  const cellResults = Object.fromEntries(
    Object.keys(arms).map((arm) => [arm, Object.fromEntries(taskIds.map((t) => [t, []]))]),
  );

  const total = opts.repeat * Object.keys(arms).length * TASKS.length;
  let done = 0;

  for (let r = 0; r < opts.repeat; r += 1) {
    for (const [arm, system] of Object.entries(arms)) {
      for (const task of TASKS) {
        done += 1;
        const label = `[${done}/${total}] ${modelId} run${r + 1} ${arm} / ${task.id}`;
        process.stdout.write(`${label} ... `);

        const t0 = Date.now();
        let text = '';
        let usage = null;
        try {
          const result = await complete({
            modelId,
            modelConfig,
            system: system || undefined,
            user: task.prompt,
            baseUrl: opts.baseUrl,
            temperature: opts.temperature,
          });
          text = result.text;
          usage = result.usage;
        } catch (e) {
          console.log(`FAIL — ${e.message}`);
          cellResults[arm][task.id].push({
            loc: 0,
            correct: false,
            timeSec: (Date.now() - t0) / 1000,
            error: e.message,
            response: '',
          });
          if (opts.delayMs > 0) await sleep(opts.delayMs);
          continue;
        }

        const locResult = measureLoc(text);
        const correctResult = checkCorrect(text, { vars: { task: task.prompt } });
        const timeSec = (Date.now() - t0) / 1000;

        cellResults[arm][task.id].push({
          loc: locResult.score,
          correct: correctResult.pass,
          timeSec,
          usage,
          response: text,
        });

        console.log(
          `${locResult.score} LOC  ${timeSec.toFixed(1)}s  correct=${correctResult.pass ? 'yes' : 'no'}`,
        );
        if (opts.delayMs > 0) await sleep(opts.delayMs);
      }
    }
  }

  return cellResults;
}

async function main() {
  const opts = parseArgs(process.argv);
  const config = loadModelsConfig();
  const modelIds = opts.models || config.defaultModels;
  const arms = loadArms(opts.arms.includes('caveman'));

  const unknown = modelIds.filter((id) => !config.models[id]);
  if (unknown.length) {
    throw new Error(`Unknown model(s): ${unknown.join(', ')}. See opencode-go-models.json`);
  }

  const allResults = {};
  const mdSections = [];
  const date = new Date().toISOString().slice(0, 10);

  mdSections.push(`# Lexis-Two benchmark — OpenCode Go (${date})`);
  mdSections.push('');
  mdSections.push('Provider: [OpenCode Go](https://opencode.ai/docs/go/).');
  mdSections.push(`Repeat: ${opts.repeat} per cell. Temperature: ${opts.temperature}.`);
  mdSections.push('');

  for (const modelId of modelIds) {
    const modelConfig = config.models[modelId];
    console.log(`\n${'='.repeat(60)}\n  MODEL: ${modelConfig.name} (${modelId})\n${'='.repeat(60)}\n`);

    const cellResults = await runModel(modelId, modelConfig, opts, arms);
    allResults[modelId] = cellResults;
    mdSections.push(summarizeModel(modelId, modelConfig.name, opts.repeat, arms, cellResults));
  }

  const outJson = path.join(__dirname, 'results', `opencode-go-${date}.json`);
  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(
    outJson,
    JSON.stringify(
      {
        date,
        repeat: opts.repeat,
        models: modelIds,
        arms: Object.keys(arms),
        tasks: TASKS,
        results: allResults,
      },
      null,
      2,
    ),
    'utf8',
  );
  console.log(`\nFull results → ${outJson}`);

  if (opts.writeMd) {
    const outMd = path.join(__dirname, 'results', `${date}-opencode-go.md`);
    fs.writeFileSync(outMd, mdSections.join('\n'), 'utf8');
    console.log(`Summary markdown → ${outMd}`);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
