#!/usr/bin/env node
/**
 * Sync aggregated benchmark data for the Astro site.
 *
 * Usage:
 *   node benchmarks/render-opencode-go-report.js
 *   node benchmarks/render-opencode-go-report.js benchmarks/results/opencode-go-2026-06-16.json
 */

const fs = require('fs');
const path = require('path');
const { aggregateOpencodeGo, findLatestJson } = require('./lib/aggregate-opencode-go.js');

const SITE_DATA = path.join(__dirname, '..', 'site', 'src', 'data', 'opencode-go-benchmark.json');

function main() {
  const input = process.argv[2] ? path.resolve(process.argv[2]) : findLatestJson();
  const data = JSON.parse(fs.readFileSync(input, 'utf8'));
  const chart = aggregateOpencodeGo(data);

  fs.mkdirSync(path.dirname(SITE_DATA), { recursive: true });
  fs.writeFileSync(SITE_DATA, `${JSON.stringify(chart, null, 2)}\n`, 'utf8');

  console.log(`Site data → ${SITE_DATA}`);
  console.log('Preview charts: npm run site:dev → http://localhost:4321/benchmarks/');
}

main();
