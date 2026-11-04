'use strict';
// slopx rule registry and checks (pass: code, copy, look). The `desx/*` rows are listed here so
// `--list-rules` shows the whole picture, but they are implemented in scripts/desx-audit.js and
// reached through its detector (the `quality` pass).
//
// Every rule is one row: { id, name, pass, owner, category, severity, tier, description,
// suggestion, handoff }. `handoff` is the name of the Impeccable command that applies that kind of
// fix when Impeccable is installed; slopx never calls it.

const path = require('path');
const { lineStarts, lineOf, cssBlocks, declarations, colorOf, hslOf } = require('./desx-audit');

const CODE_EXT = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx']);
const HTML_LIKE_EXT = new Set(['.html', '.htm', '.vue', '.svelte', '.astro']);
const MARKUP_EXT = new Set([...HTML_LIKE_EXT, '.jsx', '.tsx']);
const STYLE_EXT = new Set(['.css', '.scss', '.sass', '.less']);
const I18N_DIRS = new Set(['i18n', 'locales', 'messages', 'lang']);

// ---------------------------------------------------------------------------
// File classification and context
// ---------------------------------------------------------------------------

function classify(rel, extensions = []) {
  const ext = path.extname(rel).toLowerCase();
  const extra = extensions.some((e) => rel.toLowerCase().endsWith(String(e.ext).toLowerCase()));
  const inI18nDir = rel.split('/').slice(0, -1).some((segment) => I18N_DIRS.has(segment));
  const i18n = inI18nDir && ['.json', '.js', '.mjs', '.ts'].includes(ext);
  const markup = MARKUP_EXT.has(ext) || extra;
  const style = STYLE_EXT.has(ext);
  return {
    ext,
    test: /(^|\/)(__tests__|tests?|fixtures)\//.test(rel) || /\.(test|spec)\.[a-z]+$/.test(rel),
    code: CODE_EXT.has(ext),
    markup,
    style,
    md: ext === '.md',
    i18n,
    uiText: markup || i18n, // phrase checks run here
    ui: markup || style, // look and quality passes run here
    cssCapable: style || HTML_LIKE_EXT.has(ext) || extra, // rule blocks can be read
    emojiScope: CODE_EXT.has(ext) || markup || style || ext === '.md' || i18n,
  };
}

// added: Set of 1-based line numbers, or null when every line counts (new file, --all).
function makeContext(rel, rawText, added, kinds) {
  const text = rawText.replace(/\r\n?/g, '\n');
  const lines = text.split('\n');
  const starts = lineStarts(text);
  const isAdded = (n) => added === null || added.has(n);
  let blocks;
  let codeLines;
  return {
    rel,
    text,
    lines,
    starts,
    kinds,
    isAdded,
    get blocks() {
      blocks = blocks || (kinds.cssCapable ? cssBlocks(text).filter((b) => b.body.trim()) : []);
      return blocks;
    },
    lineAtOffset: (offset) => lineOf(starts, offset),
    eachAdded(fn) {
      for (let i = 0; i < lines.length; i += 1) if (isAdded(i + 1)) fn(lines[i], i + 1);
    },
    // Lines of a markup file that hold code, not user-facing text: <style>, <script>, Astro frontmatter.
    isCodeLine(n) {
      if (!codeLines) {
        codeLines = new Set();
        if (HTML_LIKE_EXT.has(kinds.ext)) {
          const mark = (from, to) => {
            for (let line = lineOf(starts, from); line <= lineOf(starts, to - 1); line += 1) codeLines.add(line);
          };
          for (const m of text.matchAll(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi)) mark(m.index, m.index + m[0].length);
          const front = text.match(/^---\n[\s\S]*?\n---(?:\n|$)/);
          if (front) mark(0, front[0].length);
        }
      }
      return codeLines.has(n);
    },
    // Added lines that are text, for the phrase rules.
    eachTextLine(fn) {
      this.eachAdded((line, n) => {
        if (!this.isCodeLine(n)) fn(line, n);
      });
    },
  };
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

// Text of the comment on this line, or null.
function commentOf(line) {
  const m =
    line.match(/(?:^|[^:\\"'`])\/\/(.*)$/) || line.match(/\/\*(.*?)(?:\*\/|$)/) || line.match(/^\s*\*\s?(.*)$/);
  return m ? m[1] : null;
}

function phraseRule(regex) {
  return (ctx) => {
    const out = [];
    ctx.eachTextLine((line, n) => {
      const m = line.match(regex);
      if (m) out.push({ line: n, ignoreValue: m[0].trim().slice(0, 60) });
    });
    return out;
  };
}

function classTokens(attr) {
  return attr.split(/\s+/).filter(Boolean);
}

function* classStrings(ctx) {
  const re = /class(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/g;
  let m;
  while ((m = re.exec(ctx.text))) yield { value: m[1] ?? m[2] ?? m[3], line: ctx.lineAtOffset(m.index) };
}

// ---------------------------------------------------------------------------
// Code pass
// ---------------------------------------------------------------------------

const MARKER_WORDS = /\b(?:TODO|FIXME|XXX|HACK)\b/;
const PLACEHOLDER_CODE = /rest of (?:the )?(?:code|file|implementation|function)|implementation (?:goes )?here|your code here|\.\.\. ?(?:existing|previous) code/i;

function checkMarker(ctx) {
  const out = [];
  ctx.eachAdded((line, n) => {
    const comment = commentOf(line);
    if ((comment !== null && MARKER_WORDS.test(comment)) || PLACEHOLDER_CODE.test(line)) out.push({ line: n });
  });
  return out;
}

function checkDebugLeftover(ctx) {
  if (ctx.kinds.test) return [];
  const out = [];
  const isCli = ctx.lines[0].startsWith('#!') || /(^|\/)(bin|scripts)\//.test(ctx.rel);
  const otherConsole = ctx.lines.some((l, i) => !ctx.isAdded(i + 1) && /\bconsole\.[a-z]+\(/.test(l));
  ctx.eachAdded((line, n) => {
    if (/^\s*debugger\s*;?\s*$/.test(line)) out.push({ line: n });
    else if (!isCli && !otherConsole && /\bconsole\.(?:log|debug)\(/.test(line)) out.push({ line: n });
  });
  return out;
}

const CODE_LIKE = /^(?:const|let|var|function|class|import|export|return|if|else|for|while|switch|await|throw|try|catch)\b|[;{}]\s*$|^\w+(?:\.\w+)+\(.*\)\s*;?$|^\w+\s*=\s*[^=].*$|^[)}\]]/;
const DIRECTIVE_COMMENT = /^\s*(?:lexis:|eslint|prettier|istanbul|@ts-|slopx-)/;

function checkCommentedOutCode(ctx) {
  const out = [];
  let run = [];
  const flush = () => {
    if (run.length >= 2 && ctx.isAdded(run[0])) out.push({ line: run[0] });
    run = [];
  };
  ctx.lines.forEach((line, i) => {
    const m = line.match(/^\s*\/\/(.*)$/);
    const text = m ? m[1].trim() : null;
    if (text !== null && !DIRECTIVE_COMMENT.test(m[1]) && CODE_LIKE.test(text)) run.push(i + 1);
    else flush();
  });
  flush();
  return out;
}

function checkCompatCruft(ctx) {
  const out = [];
  ctx.eachAdded((line, n) => {
    const comment = commentOf(line);
    if (comment !== null && /^\s*(?:removed|previously)\b/i.test(comment)) out.push({ line: n });
    else if (/\b[A-Za-z]\w*_old\b/.test(line)) out.push({ line: n, severity: 'advisory' });
  });
  return out;
}

const EMPTY_CATCH = /catch\s*(?:\([^)]*\))?\s*\{\s*\}|\.catch\(\s*\(?\s*\w*\s*\)?\s*=>\s*\{\s*\}\s*\)/g;

function checkEmptyCatch(ctx) {
  const out = [];
  let m;
  EMPTY_CATCH.lastIndex = 0;
  while ((m = EMPTY_CATCH.exec(ctx.text))) {
    const line = ctx.lineAtOffset(m.index);
    if (ctx.isAdded(line)) out.push({ line });
  }
  return out;
}

const STOP_WORDS = new Set(['the', 'a', 'an', 'to', 'of', 'for', 'and', 'is', 'this', 'that', 'we', 'it']);
const words = (text) =>
  text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

function checkNarratingComment(ctx) {
  const out = [];
  ctx.lines.forEach((line, i) => {
    const m = line.match(/^\s*\/\/\s*([A-Za-z][A-Za-z0-9 ]{2,40})$/);
    const next = ctx.lines[i + 1];
    if (!m || !next || /^\s*(?:\/\/|\/\*|\*|$)/.test(next) || !ctx.isAdded(i + 1)) return;
    const comment = words(m[1]).filter((w) => !STOP_WORDS.has(w));
    const code = new Set(words(next));
    if (comment.length >= 1 && comment.length <= 6 && comment.every((w) => code.has(w))) out.push({ line: i + 1 });
  });
  return out;
}

// ---------------------------------------------------------------------------
// Copy pass
// ---------------------------------------------------------------------------

const EMOJI = /\p{Emoji_Presentation}|.\uFE0F/u;

function checkEmoji(ctx) {
  if (ctx.kinds.test) return [];
  const out = [];
  ctx.eachAdded((line, n) => {
    const m = line.match(EMOJI);
    if (m) out.push({ line: n, ignoreValue: m[0] });
  });
  return out;
}

const PLACEHOLDER_TEXT = /lorem ipsum|your text here|click here|description goes here|texto aqu[ií]|haz clic aqu[ií]|descripci[oó]n aqu[ií]|inserta (?:tu )?texto/i;
const STOCK_VOCABULARY = /(?<![\w-])(?:seamless(?:ly)?|robust(?:ness)?|elevates?|elevated|empower(?:s|ed|ing)?|pivotal|tapestry|delve[sd]?|underscores?)(?![\w-])|unlock the power|get started today|it(?:'s| is) worth noting|desbloquea el poder|eleva tu|empieza hoy mismo|vale la pena (?:destacar|mencionar|se[nñ]alar)|sin fisuras/i;
const GENERIC_CLAIM = /\b(?:world-class|best-in-class|cutting-edge|state-of-the-art|next-generation|next-gen|game-changing|revolutionary|industry-leading|blazing[- ]fast)\b|de clase mundial|de vanguardia|de [uú]ltima generaci[oó]n|revolucionari[oa]|ultrarr[aá]pid[oa]|l[ií]der del sector/i;
const FILLER_FRAMING = /\b(?:in today's|gone are the days|whether you're|let's dive in|in summary|in conclusion|moreover|furthermore)\b|ya pasaron los d[ií]as|sumerj[aá]monos|en resumen|en conclusi[oó]n|en el mundo actual/i;
const FORCED_CONTRAST = /\bnot (?:just|only|merely) [^,.;:!?]{1,60}[,\u2014-]+\s*(?:it's|it is|but)\b|\bless about\b[^.]{1,60}\bmore about\b|\bno es (?:solo|s[oó]lo|simplemente) [^,.;:!?]{1,60},?\s*(?:es|sino)\b/i;
const GENERIC_ERROR = /["'`>]\s*(?:Something went wrong|An error occurred|Algo sali[oó] mal|Ocurri[oó] un error)\.?\s*["'`<]/i;
const GENERIC_LABEL = /(?:["'`]|>)\s*(?:Submit|OK|Yes|No|Learn more|Welcome|Click here|Enviar|Aceptar|S[ií]|M[aá]s informaci[oó]n|Bienvenid[oa])\s*(?:["'`]|<)/;
const UNSUPPORTED_CLAIM = /\b(?:John Doe|Jane Doe|Acme(?: Inc\.?| Corp\.?)?|Foo ?Bar)\b|\b\d+x (?:faster|better|more)\b|\b99\.9+% ?(?:uptime|available)|\b\d{1,3}(?:,\d{3})+\+? (?:users|customers|developers|teams)\b|\b\d{1,3}(?:[.,]\d{3})+\+? (?:usuarios|clientes|equipos)\b|\btrusted by \d/i;

function checkEmDash(ctx) {
  const out = [];
  ctx.eachTextLine((line, n) => {
    const dashes = (line.match(/\u2014/g) || []).length;
    if (dashes >= 2 || / -- /.test(line)) out.push({ line: n });
  });
  return out;
}

function checkExclamationRun(ctx) {
  const out = [];
  ctx.eachTextLine((line, n) => {
    if (/[A-Za-z\u00C0-\u024F)\]]\s*!{2,}/.test(line)) out.push({ line: n });
  });
  return out;
}

function checkRepeatedText(ctx) {
  const out = [];
  const re = />\s*([^<>{}\n]{1,60}?)\s*</g;
  let previous = null;
  let m;
  while ((m = re.exec(ctx.text))) {
    const text = m[1].trim().toLowerCase();
    const openTag = ctx.text.slice(ctx.text.lastIndexOf('<', m.index) + 1, m.index).match(/^\/?([a-z][\w-]*)/i);
    const tag = openTag ? openTag[1].toLowerCase() : '';
    const line = ctx.lineAtOffset(m.index);
    // Only two text nodes in a row (a heading echoed by its paragraph, a label next to its twin).
    // Lists, table cells and code legitimately repeat, so they are skipped.
    const listy = ['td', 'th', 'li', 'option', 'code', 'kbd', 'pre'].includes(tag);
    const close = previous && m.index - previous.end < 200;
    if (!listy && !ctx.isCodeLine(line) && close && previous.text === text && text.length >= 6 && /\p{L}{3}/u.test(text) && ctx.isAdded(line)) {
      out.push({ line, ignoreValue: text.slice(0, 40) });
    }
    previous = listy ? null : { text, end: m.index };
  }
  return out;
}

// Markdown prose, only with --prose: skips fenced code, inline code and links.
function proseLines(ctx) {
  const out = [];
  let fenced = false;
  ctx.lines.forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced || !ctx.isAdded(i + 1)) return;
    out.push({ n: i + 1, text: line.replace(/`[^`]*`/g, '').replace(/\]\([^)]*\)/g, ']') });
  });
  return out;
}

function proseCheck(regexOrFn) {
  return (ctx) =>
    proseLines(ctx)
      .filter(({ text }) => (typeof regexOrFn === 'function' ? regexOrFn(text) : regexOrFn.test(text)))
      .map(({ n }) => ({ line: n }));
}

// ---------------------------------------------------------------------------
// Look pass
// ---------------------------------------------------------------------------

const CARD_SELECTOR = /card|alert|callout|panel|tile|notice|toast|banner|message|note|box|item/i;
const px = (value) => {
  const m = String(value).match(/(-?\d*\.?\d+)px/);
  return m ? Number(m[1]) : null;
};

// Splits a box-shadow list into parts and reads their offsets and blur.
function shadowParts(value) {
  return value
    .split(/,(?![^(]*\))/)
    .map((part) => {
      const bare = part.replace(/#[0-9a-f]{3,8}\b/gi, '').replace(/(?:rgba?|hsla?)\([^)]*\)/gi, '');
      const nums = (bare.match(/-?\d*\.?\d+(?:px)?/g) || []).map((n) => parseFloat(n));
      return { part, x: nums[0] || 0, y: nums[1] || 0, blur: nums[2] || 0 };
    });
}

function eachDecl(ctx, fn) {
  for (const block of ctx.blocks) {
    const decls = declarations(block.body);
    for (const d of decls) fn(d, block, decls, ctx.lineAtOffset(block.offset + d.index));
  }
}

function checkSideTab(ctx) {
  const out = [];
  eachDecl(ctx, (d, block, _decls, line) => {
    if (!/^border-(?:left|right|inline-start|inline-end)$/.test(d.prop) || block.inline) return;
    const width = px(d.value);
    if (width !== null && width > 1 && /solid|double/.test(d.value) && !/transparent|none/.test(d.value) && CARD_SELECTOR.test(block.selector)) {
      out.push({ line });
    }
  });
  return out;
}

function checkGradientText(ctx) {
  const out = [];
  for (const block of ctx.blocks) {
    const decls = declarations(block.body);
    const clip = decls.find((d) => /^(?:-webkit-)?background-clip$/.test(d.prop) && /^text/.test(d.value));
    const gradient = decls.some((d) => /^background(?:-image)?$/.test(d.prop) && /gradient\(/.test(d.value));
    if (clip && gradient) out.push({ line: ctx.lineAtOffset(block.offset + clip.index) });
  }
  for (const { value, line } of classStrings(ctx)) {
    const tokens = classTokens(value);
    if (tokens.includes('bg-clip-text') && tokens.some((t) => t.startsWith('bg-gradient-'))) out.push({ line });
  }
  return out;
}

function checkHardOffsetShadow(ctx) {
  const out = [];
  eachDecl(ctx, (d, _block, _decls, line) => {
    if (d.prop === 'box-shadow' && shadowParts(d.value).some((s) => Math.abs(s.x) >= 2 && Math.abs(s.y) >= 2 && s.blur === 0)) {
      out.push({ line });
    }
  });
  return out;
}

function checkBounceEasing(ctx) {
  const out = [];
  const cubic = /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/g;
  let m;
  while ((m = cubic.exec(ctx.text))) {
    const [y1, y2] = [Number(m[2]), Number(m[4])];
    if (y1 > 1 || y1 < 0 || y2 > 1 || y2 < 0) out.push({ line: ctx.lineAtOffset(m.index) });
  }
  const named = /(?:animation|transition)[^;{}\n]*\b(?:bounce|elastic)\b|animate-bounce/gi;
  while ((m = named.exec(ctx.text))) out.push({ line: ctx.lineAtOffset(m.index) });
  return out;
}

function checkEyebrow(ctx) {
  const out = [];
  const re = /<(\w+)\b[^>]*class(?:Name)?\s*=\s*["'][^"']*\b(?:eyebrow|kicker|overline)\b[^"']*["'][^>]*>[\s\S]{0,200}?<\/\1>\s*<h[1-4]\b/g;
  let m;
  while ((m = re.exec(ctx.text))) out.push({ line: ctx.lineAtOffset(m.index) });
  return out;
}

const PLACEHOLDER_HOST = /via\.placeholder\.com|placehold\.co|placeholder\.com|dummyimage\.com|picsum\.photos|lorempixel\.com|placekitten\.com|placeimg\.com|source\.unsplash\.com/i;

function checkPlaceholderImage(ctx) {
  const out = [];
  const img = /<img\b[^>]*>/gi;
  let m;
  while ((m = img.exec(ctx.text))) {
    if (/\bsrc\s*=\s*(?:""|''|"#"|'#')/.test(m[0])) out.push({ line: ctx.lineAtOffset(m.index) });
  }
  ctx.eachAdded((line, n) => {
    if (PLACEHOLDER_HOST.test(line)) out.push({ line: n });
  });
  return out;
}

function checkGhostCard(ctx) {
  const out = [];
  for (const block of ctx.blocks) {
    const decls = declarations(block.body);
    const hairline = decls.some((d) => /^border(?:-width)?$/.test(d.prop) && px(d.value) === 1);
    const shadow = decls.find((d) => d.prop === 'box-shadow' && shadowParts(d.value).some((s) => s.blur >= 24));
    if (hairline && shadow) out.push({ line: ctx.lineAtOffset(block.offset + shadow.index) });
  }
  return out;
}

function checkExtremeRadius(ctx) {
  const out = [];
  eachDecl(ctx, (d, block, _decls, line) => {
    if (d.prop !== 'border-radius' || !CARD_SELECTOR.test(block.selector)) return;
    const rem = d.value.match(/^(\d*\.?\d+)rem/);
    const size = px(d.value) ?? (rem ? Number(rem[1]) * 16 : null);
    if (size !== null && size >= 24 && size < 500) out.push({ line });
  });
  return out;
}

function checkBorderAccentRounded(ctx) {
  const out = [];
  for (const block of ctx.blocks) {
    const decls = declarations(block.body);
    const border = decls.find((d) => d.prop === 'border' && (px(d.value) ?? 0) >= 3 && /solid/.test(d.value) && colorOf(d.value));
    const radius = decls.find((d) => d.prop === 'border-radius' && (px(d.value) ?? 0) >= 4);
    if (border && radius) out.push({ line: ctx.lineAtOffset(block.offset + border.index) });
  }
  return out;
}

function checkGlassEverywhere(ctx) {
  const lines = [];
  eachDecl(ctx, (d, _block, _decls, line) => {
    if (/^(?:-webkit-)?backdrop-filter$/.test(d.prop) && /blur\(/.test(d.value)) lines.push(line);
  });
  return lines.length >= 3 ? [{ line: lines[2] }] : [];
}

function checkStripeGradient(ctx) {
  const out = [];
  eachDecl(ctx, (d, _block, _decls, line) => {
    if (/repeating-(?:linear|radial|conic)-gradient\(/.test(d.value)) out.push({ line });
  });
  return out;
}

function checkGlowShadow(ctx) {
  const out = [];
  eachDecl(ctx, (d, _block, _decls, line) => {
    if (d.prop !== 'box-shadow') return;
    const glow = shadowParts(d.value).some((s) => {
      const color = colorOf(s.part);
      return s.x === 0 && s.y === 0 && s.blur >= 16 && color && hslOf(color.rgb).s >= 0.35;
    });
    if (glow) out.push({ line });
  });
  return out;
}

function checkAiPalette(ctx) {
  const out = [];
  eachDecl(ctx, (d, _block, _decls, line) => {
    if (!/gradient\(/.test(d.value)) return;
    const hues = [...d.value.matchAll(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi)]
      .map((m) => colorOf(m[0]))
      .filter(Boolean)
      .map((c) => hslOf(c.rgb))
      .filter((c) => c.s >= 0.3)
      .map((c) => c.h);
    if (hues.some((h) => h >= 255 && h <= 300) && hues.some((h) => h >= 180 && h < 255)) out.push({ line });
  });
  for (const { value, line } of classStrings(ctx)) {
    if (/\bfrom-(?:purple|violet|indigo|fuchsia)-\d+/.test(value) && /\bto-(?:blue|cyan|sky|indigo)-\d+/.test(value)) out.push({ line });
  }
  return out;
}

function checkOverusedFont(ctx) {
  const out = [];
  eachDecl(ctx, (d, _block, _decls, line) => {
    if (d.prop !== 'font-family') return;
    const first = d.value.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
    if (/^(?:inter|inter var|inter variable|geist|geist sans)$/.test(first)) out.push({ line, ignoreValue: first.split(' ')[0].replace(/^./, (c) => c.toUpperCase()) });
  });
  return out;
}

function checkMarqueeBlink(ctx) {
  const out = [];
  const re = /<(?:marquee|blink)\b|@keyframes\s+(?:marquee|blink|ticker)\b|animation[^;{}\n]*\b(?:marquee|blink)\b[^;{}\n]*infinite/gi;
  let m;
  while ((m = re.exec(ctx.text))) out.push({ line: ctx.lineAtOffset(m.index) });
  return out;
}

function checkNumberedLabel(ctx) {
  const out = [];
  const re = /<(span|div|p)\b[^>]*>\s*0?\d{1,2}\.?\s*<\/\1>\s*<h[1-4]\b/g;
  let m;
  while ((m = re.exec(ctx.text))) out.push({ line: ctx.lineAtOffset(m.index) });
  return out;
}

function checkPulsingDot(ctx) {
  const out = [];
  eachDecl(ctx, (d, block, _decls, line) => {
    if (/^animation/.test(d.prop) && /pulse/.test(d.value) && /infinite/.test(d.value) && /dot|status|indicator|live|badge/i.test(block.selector)) out.push({ line });
  });
  return out;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const RULES = [];

function def(id, severity, tier, description, suggestion, handoff, applies, check, extra = {}) {
  const [prefix, name] = id.split('/');
  RULES.push({
    id,
    name,
    pass: prefix === 'desx' ? 'quality' : prefix === 'slopx' ? 'code' : prefix,
    owner: prefix === 'desx' ? 'desx' : 'slopx',
    category: prefix === 'desx' ? 'quality' : 'slop',
    severity,
    tier,
    description,
    suggestion,
    handoff,
    applies,
    check,
    ...extra,
  });
}

const isCode = (k) => k.code;
const isPhrase = (k) => k.uiText && !k.test;
const isLook = (k) => k.ui && !k.test;
const isMarkup = (k) => k.markup && !k.test;
const proseOnly = (k, o) => k.md && o.prose;

// code
def('code/marker', 'warning', 'immediate', 'Work marker or placeholder left in the code (TODO-style words, "rest of the code")', 'Finish it or delete it; open an issue for real follow-ups', null, isCode, checkMarker);
def('code/debug-leftover', 'warning', 'immediate', 'Debug call left in the code (debugger, console.log in a file that does not log)', 'Remove it, or use the logger the project already has', null, isCode, checkDebugLeftover);
def('code/commented-out-code', 'warning', 'deferred', 'Two or more consecutive comment lines that read as code', 'Delete the dead code; git keeps the history', null, isCode, checkCommentedOutCode);
def('code/compat-cruft', 'warning', 'deferred', 'Backward-compatibility residue ("// removed ...", "// previously ...", names ending in _old)', 'Delete the leftover; do not keep markers for code that is gone', null, isCode, checkCompatCruft);
def('code/empty-catch', 'warning', 'immediate', 'Empty catch block with no comment', 'Handle the error, or say in a comment why ignoring it is safe', null, isCode, checkEmptyCatch);
def('code/narrating-comment', 'advisory', 'deferred', 'Comment that only restates the next line', 'Delete it, or explain why instead of what', null, isCode, checkNarratingComment, { tier2: true });
// copy
def('copy/emoji', 'warning', 'immediate', 'Emoji in code, markup or text', 'Remove it; use an icon from the project icon set if one is needed', 'clarify', (k) => k.emojiScope && !k.test, checkEmoji);
def('copy/placeholder-text', 'warning', 'immediate', 'Placeholder text left in the UI ("Lorem ipsum", "Your text here", "Click here")', 'Write the real text for this spot', 'clarify', isPhrase, phraseRule(PLACEHOLDER_TEXT));
def('copy/stock-vocabulary', 'advisory', 'deferred', 'Stock marketing vocabulary (seamless, robust, elevate, empower, ...)', 'Say what it does in plain words, with a concrete fact', 'clarify', isPhrase, phraseRule(STOCK_VOCABULARY));
def('copy/generic-claim', 'advisory', 'deferred', 'Generic claim that promises value without saying what the product does', 'Replace it with something specific and checkable', 'clarify', isPhrase, phraseRule(GENERIC_CLAIM));
def('copy/filler-framing', 'advisory', 'deferred', 'Filler opener, closer or transition ("in today\'s", "in summary", "moreover")', 'Start with the point; cut the framing', 'clarify', isPhrase, phraseRule(FILLER_FRAMING));
def('copy/forced-contrast', 'advisory', 'deferred', 'Forced contrast ("not just X, it\'s Y")', 'State the positive claim directly', 'clarify', isPhrase, phraseRule(FORCED_CONTRAST));
def('copy/em-dash-overuse', 'advisory', 'deferred', 'Two or more em dashes (or a double hyphen used as a dash) in one string', 'Use a comma, colon or period', 'clarify', isPhrase, checkEmDash);
def('copy/generic-label', 'advisory', 'deferred', 'Generic label ("Submit", "OK", "Learn more", "Welcome")', 'Name the action and its object ("Save changes", "Delete project")', 'clarify', isPhrase, phraseRule(GENERIC_LABEL));
def('copy/generic-error', 'advisory', 'deferred', 'Error message with no cause or next step', 'Say what failed, why if known, and how to recover', 'clarify', isPhrase, phraseRule(GENERIC_ERROR));
def('copy/unsupported-claim', 'advisory', 'deferred', 'Invented data: placeholder people or companies, unsourced figures', 'Use real, sourced data or remove the claim', 'clarify', isPhrase, phraseRule(UNSUPPORTED_CLAIM));
def('copy/repeated-text', 'advisory', 'deferred', 'The same text appears twice inside one container', 'Say it once', 'clarify', isPhrase, checkRepeatedText, { tier2: true });
def('copy/exclamation-run', 'advisory', 'deferred', 'Run of exclamation marks in a string', 'Use one at most, or none', 'clarify', isPhrase, checkExclamationRun, { tier2: true });
def('copy/theater', 'advisory', 'deferred', 'Dismissing something as "<word> theater" instead of explaining', 'Explain what is wrong with it', 'clarify', isPhrase, phraseRule(/\b[a-z]+ theater\b/i), { tier2: true });
def('copy/prose-vocabulary', 'advisory', 'deferred', 'Stock vocabulary or generic claim in Markdown prose (--prose)', 'Use a plain, specific word', 'clarify', proseOnly, proseCheck((t) => STOCK_VOCABULARY.test(t) || GENERIC_CLAIM.test(t)), { tier2: true, optIn: '--prose' });
def('copy/prose-framing', 'advisory', 'deferred', 'Filler opener, closer or transition in Markdown prose (--prose)', 'Start with the point', 'clarify', proseOnly, proseCheck(FILLER_FRAMING), { tier2: true, optIn: '--prose' });
def('copy/prose-contrast', 'advisory', 'deferred', 'Forced contrast in Markdown prose (--prose)', 'State the positive claim', 'clarify', proseOnly, proseCheck(FORCED_CONTRAST), { tier2: true, optIn: '--prose' });
def('copy/prose-dash', 'advisory', 'deferred', 'Em dash or double hyphen used as a dash in Markdown prose (--prose)', 'Use a comma, colon or period', 'clarify', proseOnly, proseCheck((t) => /\u2014| -- /.test(t)), { tier2: true, optIn: '--prose' });
// look
def('look/side-tab', 'advisory', 'immediate', 'Thick colored border on one side of a card (the "alert" stripe)', 'Drop the stripe; separate with spacing or a full border', 'distill', isLook, checkSideTab);
def('look/gradient-text', 'advisory', 'immediate', 'Gradient text', 'Use weight or size for emphasis', 'typeset', isLook, checkGradientText);
def('look/hard-offset-shadow', 'advisory', 'immediate', 'Hard offset shadow with no blur', 'Use a soft elevation token, or none', 'distill', isLook, checkHardOffsetShadow);
def('look/bounce-easing', 'advisory', 'deferred', 'Bounce or elastic easing', 'Use a standard ease-out curve for routine motion', 'quieter', isLook, checkBounceEasing);
def('look/eyebrow', 'advisory', 'deferred', 'Small label above a heading (eyebrow, kicker, overline)', 'Delete the label and let the heading carry the weight', 'typeset', isMarkup, checkEyebrow);
def('look/placeholder-image', 'warning', 'immediate', 'Image with an empty source or a placeholder service', 'Use the real image, or remove the element', 'polish', isLook, checkPlaceholderImage);
def('look/ghost-card', 'advisory', 'deferred', 'Hairline border together with a wide soft shadow', 'Pick one way to define the edge', 'distill', isLook, checkGhostCard, { tier2: true });
def('look/extreme-radius', 'advisory', 'deferred', 'Very large corner radius on a card', 'Keep card radii in the project scale; reserve pills for small controls', 'distill', isLook, checkExtremeRadius, { tier2: true });
def('look/border-accent-rounded', 'advisory', 'deferred', 'Thick colored border on a rounded element', 'Thin the border or drop the color', 'distill', isLook, checkBorderAccentRounded, { tier2: true });
def('look/glass-everywhere', 'advisory', 'deferred', 'Backdrop blur used in three or more rules of one file', 'Keep blur for the layering problem it solves', 'quieter', isLook, checkGlassEverywhere, { tier2: true });
def('look/stripe-gradient', 'advisory', 'deferred', 'Repeating-gradient stripes as decoration', 'Remove it or use a real texture asset', 'distill', isLook, checkStripeGradient, { tier2: true });
def('look/glow-shadow', 'advisory', 'deferred', 'Colored glow shadow', 'Use a neutral elevation shadow', 'quieter', isLook, checkGlowShadow, { tier2: true });
def('look/ai-palette', 'advisory', 'deferred', 'Purple-to-blue gradient', 'Derive the palette from the brand, not from the default', 'colorize', isLook, checkAiPalette, { tier2: true });
def('look/overused-font', 'advisory', 'deferred', 'Default display font (Inter, Geist) as the first family', 'Choose a typeface for the product, or waive it if it is the brand font', 'typeset', isLook, checkOverusedFont, { tier2: true });
def('look/marquee-blink', 'advisory', 'deferred', 'Marquee or blinking decoration', 'Remove the motion or give it a pause control', 'quieter', isLook, checkMarqueeBlink, { tier2: true });
def('look/numbered-label', 'advisory', 'deferred', 'Bare 01, 02, 03 label before a heading', 'Drop the number unless the order matters', 'typeset', isMarkup, checkNumberedLabel, { tier2: true });
def('look/pulsing-dot', 'advisory', 'deferred', 'Infinite pulsing status dot', 'Animate only when the state changes', 'quieter', isLook, checkPulsingDot, { tier2: true });
// quality (implemented in scripts/desx-audit.js)
const quality = (id, severity, tier, description, suggestion, handoff, extra) => def(id, severity, tier, description, suggestion, handoff, null, null, extra);
quality('desx/contrast', 'warning', 'immediate', 'Text color against its background is below the WCAG ratio', 'Use a pair with at least 4.5:1 for body text, 3:1 for large text', 'colorize');
quality('desx/heading-skip', 'warning', 'deferred', 'Heading levels skipped', 'Do not skip levels; insert the missing rank', 'typeset');
quality('desx/nested-cards', 'warning', 'deferred', 'Card, panel or tile inside another one', 'Flatten: one surface, not card-in-card', 'layout');
quality('desx/button-states', 'warning', 'deferred', 'Enabled and disabled buttons look the same', 'Give the disabled state its own visual', 'polish');
quality('desx/spacing-scale', 'advisory', 'deferred', 'Spacing off the inferred 4px scale', 'Snap to the project spacing scale', 'layout');
quality('desx/radius-scale', 'advisory', 'deferred', 'Border radius off the inferred scale', 'Reuse the project radius tokens', 'polish');
quality('desx/type-sizes', 'advisory', 'deferred', 'More than four font sizes in one file', 'Cap a view at three or four sizes from the type scale', 'typeset');
quality('desx/missing-alt', 'warning', 'immediate', 'Image without an alt attribute', 'Describe the image, or use alt="" if it is decorative', 'polish');
quality('desx/crushed-tracking', 'advisory', 'immediate', 'Letter spacing tighter than -0.04em', 'Loosen the tracking', 'typeset');
quality('desx/gray-on-color', 'warning', 'deferred', 'Neutral gray text on a colored background', 'Tint the text toward the background hue, or use white or black', 'colorize');
quality('desx/tiny-text', 'advisory', 'deferred', 'Text of 11px or smaller', 'Use 12px or larger for interface text', 'typeset', { tier2: true });
quality('desx/tight-line-height', 'advisory', 'deferred', 'Line height under 1.2 on running text', 'Use 1.4 to 1.6 for body text', 'typeset', { tier2: true });
quality('desx/justified-text', 'advisory', 'deferred', 'Justified text', 'Use left alignment', 'typeset', { tier2: true });
quality('desx/all-caps-body', 'advisory', 'deferred', 'Running text in all caps', 'Keep uppercase for short labels', 'typeset', { tier2: true });
quality('desx/wide-body-tracking', 'advisory', 'deferred', 'Letter spacing above 0.1em on running text', 'Keep wide tracking for short labels', 'typeset', { tier2: true });
// meta
def('slopx/waiver-without-reason', 'warning', 'immediate', 'slopx-disable comment with no reason', 'Add ": <reason>" after the rule ids', null, null, null);

const BY_ID = new Map(RULES.map((r) => [r.id, r]));

// Serializable view of a rule row (no functions).
const publicRule = ({ applies, check, ...row }) => row;

module.exports = {
  RULES,
  BY_ID,
  publicRule,
  classify,
  makeContext,
  commentOf,
};
