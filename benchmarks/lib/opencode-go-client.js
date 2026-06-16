// OpenCode Go API client — OpenAI chat/completions + Anthropic /messages transports.
// Docs: https://opencode.ai/docs/go/#endpoints

const fs = require('fs');
const path = require('path');

const DEFAULT_BASE = 'https://opencode.ai/zen/go/v1';
const ENV_PATH = path.join(__dirname, '..', '..', '.env');

function getApiKey() {
  const key = (process.env.OPENCODE_API_KEY || process.env.OPENCODE_GO_API_KEY || '').trim();
  if (!key) {
    const hint = fs.existsSync(ENV_PATH)
      ? `OPENCODE_API_KEY is empty in ${ENV_PATH}. Paste your OpenCode Go key after the = sign.`
      : `Create ${ENV_PATH} from .env.example and set OPENCODE_API_KEY=your-key`;
    throw new Error(`Missing OPENCODE_API_KEY. ${hint}`);
  }
  return key;
}

async function readJsonResponse(res) {
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    const msg =
      body?.error?.message ||
      body?.message ||
      (typeof body?.error === 'string' ? body.error : null) ||
      text.slice(0, 500) ||
      res.statusText;
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }
  return body;
}

function extractOpenAiText(body) {
  return body?.choices?.[0]?.message?.content ?? '';
}

function extractAnthropicText(body) {
  const blocks = body?.content;
  if (!Array.isArray(blocks)) return '';
  return blocks
    .filter((b) => b?.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('');
}

function extractUsage(body, transport) {
  if (transport === 'openai-chat') {
    const u = body?.usage;
    if (!u) return null;
    return {
      inputTokens: u.prompt_tokens ?? 0,
      outputTokens: u.completion_tokens ?? 0,
    };
  }
  const u = body?.usage;
  if (!u) return null;
  return {
    inputTokens: u.input_tokens ?? 0,
    outputTokens: u.output_tokens ?? 0,
  };
}

async function chatOpenAi({ baseUrl, apiKey, model, system, user, maxTokens, temperature }) {
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: user });

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  const body = await readJsonResponse(res);
  return {
    text: extractOpenAiText(body),
    usage: extractUsage(body, 'openai-chat'),
    raw: body,
  };
}

async function chatAnthropic({ baseUrl, apiKey, model, system, user, maxTokens, temperature }) {
  const payload = {
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: user }],
  };
  if (system) payload.system = system;
  if (typeof temperature === 'number') payload.temperature = temperature;

  // lexis: Go /messages rejects Bearer — x-api-key only (qwen3.7-max, minimax-m3)
  const res = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(payload),
  });

  const body = await readJsonResponse(res);
  return {
    text: extractAnthropicText(body),
    usage: extractUsage(body, 'anthropic-messages'),
    raw: body,
  };
}

async function complete({
  modelId,
  modelConfig,
  system,
  user,
  baseUrl = DEFAULT_BASE,
  apiKey = getApiKey(),
  temperature = 1,
}) {
  const maxTokens = modelConfig.maxTokens ?? 8192;
  const args = { baseUrl, apiKey, model: modelId, system, user, maxTokens, temperature };

  if (modelConfig.transport === 'anthropic-messages') {
    return chatAnthropic(args);
  }
  if (modelConfig.transport === 'openai-chat') {
    return chatOpenAi(args);
  }
  throw new Error(`Unknown transport for ${modelId}: ${modelConfig.transport}`);
}

module.exports = {
  DEFAULT_BASE,
  getApiKey,
  complete,
};
