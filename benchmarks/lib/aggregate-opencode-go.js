const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, '..', 'results');

function median(values) {
  const s = [...values].sort((a, b) => a - b);
  if (s.length === 0) return 0;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function findLatestJson(resultsDir = RESULTS_DIR) {
  const files = fs
    .readdirSync(resultsDir)
    .filter((f) => f.startsWith('opencode-go-') && f.endsWith('.json'))
    .sort()
    .reverse();
  if (!files.length) {
    throw new Error(`No opencode-go-*.json in ${resultsDir}. Run benchmark first.`);
  }
  return path.join(resultsDir, files[0]);
}

function modelLabel(id) {
  return id
    .replace('deepseek-v4-pro', 'DeepSeek V4')
    .replace('qwen3.7-max', 'Qwen3.7 Max')
    .replace('minimax-m3', 'MiniMax M3')
    .replace('kimi-k2.6', 'Kimi K2.6');
}

function aggregateOpencodeGo(data) {
  const taskIds = data.tasks.map((t) => t.id);
  const arms = data.arms;
  const models = data.models;

  const chart = {
    source: `opencode-go-${data.date}.json`,
    date: data.date,
    repeat: data.repeat,
    models: [],
    tasks: taskIds,
    arms,
  };

  for (const modelId of models) {
    const modelConfig = data.results[modelId];
    const locByArmTask = {};
    const timeByArmTask = {};
    const correctByArm = {};

    for (const arm of arms) {
      locByArmTask[arm] = {};
      timeByArmTask[arm] = {};
      let pass = 0;
      let total = 0;

      for (const taskId of taskIds) {
        const runs = modelConfig[arm][taskId];
        locByArmTask[arm][taskId] = median(runs.map((r) => r.loc));
        timeByArmTask[arm][taskId] = median(runs.map((r) => r.timeSec));
        pass += runs.filter((r) => r.correct).length;
        total += runs.length;
      }

      correctByArm[arm] = { pass, total };
    }

    const baselineTotal = taskIds.reduce((s, t) => s + locByArmTask.baseline[t], 0);
    const lexisTotal = taskIds.reduce((s, t) => s + locByArmTask['lexis-two'][t], 0);
    const reductionPct =
      baselineTotal > 0 ? Math.round((1 - lexisTotal / baselineTotal) * 100) : 0;

    const baselineTime = taskIds.reduce((s, t) => s + timeByArmTask.baseline[t], 0);
    const lexisTime = taskIds.reduce((s, t) => s + timeByArmTask['lexis-two'][t], 0);

    chart.models.push({
      id: modelId,
      label: modelLabel(modelId),
      locByArmTask,
      timeByArmTask,
      correctByArm,
      totals: {
        baselineLoc: baselineTotal,
        lexisLoc: lexisTotal,
        reductionPct,
        baselineTimeSec: Math.round(baselineTime * 10) / 10,
        lexisTimeSec: Math.round(lexisTime * 10) / 10,
      },
    });
  }

  return chart;
}

module.exports = {
  aggregateOpencodeGo,
  findLatestJson,
  modelLabel,
  median,
  RESULTS_DIR,
};
