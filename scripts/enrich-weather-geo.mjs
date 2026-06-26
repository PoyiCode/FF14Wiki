#!/usr/bin/env node
// 建立 world（地區）↔ weather（天氣）的雙向氣候連結。
// 來源：scripts/zone-weather-data.json（由 TerritoryType.WeatherRate → WeatherRate
// → Weather 整理而成：每個地區可能出現的天氣與機率）。
// 正向：為 world 條目補上「這裡常見的天氣：…」與 related（指向 weather）。
// 反向：為 weather 條目補上「常見於：…」與 related（指向 world）。
// 冪等且只追加：related 自動合併去重，.md 已含該行就跳過，絕不覆蓋既有內容。
import fs from 'node:fs';
import path from 'node:path';
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const pick = (o, loc) => (o && (o[loc] || o.en)) || '';
const WLBL = { en: 'Common weather here: ', ja: 'ここでよく見られる天候：', 'zh-CN': '这里常见的天气：', 'zh-TW': '這裡常見的天氣：' };
const ZLBL = { en: 'Often seen in: ', ja: 'よく見られる地域：', 'zh-CN': '常见于：', 'zh-TW': '常見於：' };
const SEP = { en: ', ', ja: '、', 'zh-CN': '、', 'zh-TW': '、' };

// 以「尾端 id」（去掉 category/ 前綴後的部分）去重，並偏好限定式 category/id，
// 避免重跑時裸式與限定式並存、或重新引入跨分類歧義。
function addRelated(metaFile, slugs) {
  if (!fs.existsSync(metaFile) || !slugs.length) return;
  let meta = fs.readFileSync(metaFile, 'utf8');
  const m = meta.match(/^related:\s*\[([^\]]*)\]/m);
  const existing = m ? m[1].split(',').map((s) => s.trim()).filter(Boolean) : [];
  const tail = (s) => (s.includes('/') ? s.slice(s.indexOf('/') + 1) : s);
  const byTail = new Map();
  for (const s of [...existing, ...slugs]) {
    const t = tail(s), cur = byTail.get(t);
    if (!cur || (s.includes('/') && !cur.includes('/'))) byTail.set(t, s);
  }
  const merged = [...byTail.values()];
  if (merged.length === existing.length && merged.every((v, i) => v === existing[i])) return; // nothing new
  const line = `related: [${merged.join(', ')}]`;
  if (m) meta = meta.replace(/^related:\s*\[[^\]]*\]/m, line);
  else if (/^tags:/m.test(meta)) meta = meta.replace(/^tags:/m, line + '\ntags:');
  else meta = meta.replace(/\n*$/, '') + '\n' + line + '\n';
  fs.writeFileSync(metaFile, meta);
}
function appendBody(file, label, text) {
  if (!fs.existsSync(file)) return false;
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes(label)) return false;
  fs.writeFileSync(file, content.replace(/\n*$/, '') + '\n\n' + label + text + '\n');
  return true;
}
function title(dir, loc) {
  const f = path.join(dir, `${loc}.md`);
  if (!fs.existsSync(f)) return '';
  const m = fs.readFileSync(f, 'utf8').match(/^title:\s*"?(.*?)"?\s*$/m);
  return m ? m[1] : '';
}

const root = process.cwd();
const zw = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'zone-weather-data.json'), 'utf8'));
const worldDir = path.join(root, 'content', 'world');
const weatherDir = path.join(root, 'content', 'weather');

// forward: world <- weather
let fwdMeta = 0, fwdBody = 0;
const rev = new Map(); // weatherSlug -> [worldSlug]
for (const [zslug, weathers] of Object.entries(zw)) {
  const dir = path.join(worldDir, zslug);
  if (!fs.existsSync(dir)) continue;
  addRelated(path.join(dir, 'meta.yaml'), weathers.map((w) => `weather/${w.slug}`)); fwdMeta++;
  for (const loc of LOCALES) {
    const txt = weathers.map((w) => `${pick(w.n, loc)}（${w.rate}%）`).join(SEP[loc]);
    if (appendBody(path.join(dir, `${loc}.md`), WLBL[loc], txt)) fwdBody++;
  }
  for (const w of weathers) {
    if (!rev.has(w.slug)) rev.set(w.slug, []);
    rev.get(w.slug).push(zslug);
  }
}
// reverse: weather <- world
let revMeta = 0, revBody = 0;
for (const [wslug, zones] of rev) {
  const dir = path.join(weatherDir, wslug);
  if (!fs.existsSync(dir)) continue;
  const uniq = [...new Set(zones)];
  addRelated(path.join(dir, 'meta.yaml'), uniq.map((z) => `world/${z}`)); revMeta++;
  for (const loc of LOCALES) {
    const names = uniq.map((z) => title(path.join(worldDir, z), loc)).filter(Boolean);
    if (names.length && appendBody(path.join(dir, `${loc}.md`), ZLBL[loc], names.join(SEP[loc]))) revBody++;
  }
}
console.log(`enrich-weather-geo：world 更新 meta ${fwdMeta}／body ${fwdBody}，weather 更新 meta ${revMeta}／body ${revBody}。`);
