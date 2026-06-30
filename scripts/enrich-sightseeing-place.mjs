#!/usr/bin/env node
// 建立 sightseeing（觀光景點）↔ world（所在地）的雙向關聯。觀光條目原本只有 place
// 字串（如 "Northern Thanalan"），不含可遍歷的連結。本腳本依 place 名稱對應到既有
// world 條目，補上：
//   - 正向：景點 → world（所在地），.md 加「所在地：…」。
//   - 反向：world 條目 → 其轄下景點，.md 加「可觀光景點：…」。
// 讓 agent 能規劃「去某地看哪些景」「這個景點在哪、怎麼去」。
// 冪等且只追加：related 以尾端 id 去重並偏好限定式；.md 已含該行就跳過，不覆蓋內容。
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const root = process.cwd();
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const SS = path.join(root, 'content', 'sightseeing');
const W = path.join(root, 'content', 'world');
const PLBL = { en: 'Location: ', ja: '所在地：', 'zh-CN': '所在地：', 'zh-TW': '所在地：' };
const VLBL = { en: 'Vistas here: ', ja: 'この地の観光スポット：', 'zh-CN': '可观光景点：', 'zh-TW': '可觀光景點：' };
const SEP = { en: ', ', ja: '、', 'zh-CN': '、', 'zh-TW': '、' };

const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const slugVariants = (n) => [slugify(n), slugify(String(n).replace(/['’]/g, ''))];
const worldSlugs = new Set(fs.readdirSync(W).filter((d) => fs.existsSync(path.join(W, d, 'meta.yaml'))));
const findWorld = (name) => (name ? slugVariants(name).find((s) => worldSlugs.has(s)) || null : null);

function addRelated(metaFile, refs) {
  if (!fs.existsSync(metaFile) || !refs.length) return;
  let meta = fs.readFileSync(metaFile, 'utf8');
  const m = meta.match(/^related:\s*\[([^\]]*)\]/m);
  const existing = m ? m[1].split(',').map((s) => s.trim()).filter(Boolean) : [];
  const tail = (s) => (s.includes('/') ? s.slice(s.indexOf('/') + 1) : s);
  const byTail = new Map();
  for (const s of [...existing, ...refs]) {
    const t = tail(s), cur = byTail.get(t);
    if (!cur || (s.includes('/') && !cur.includes('/'))) byTail.set(t, s);
  }
  const merged = [...byTail.values()];
  if (merged.length === existing.length && merged.every((v, i) => v === existing[i])) return;
  const line = `related: [${merged.join(', ')}]`;
  if (m) meta = meta.replace(/^related:\s*\[[^\]]*\]/m, line);
  else if (/^tags:/m.test(meta)) meta = meta.replace(/^tags:/m, line + '\ntags:');
  else meta = meta.replace(/\n*$/, '') + '\n' + line + '\n';
  fs.writeFileSync(metaFile, meta);
}
const title = (cat, slug, loc) => {
  const f = path.join(root, 'content', cat, slug, `${loc}.md`);
  if (!fs.existsSync(f)) return '';
  const m = fs.readFileSync(f, 'utf8').match(/^title:\s*"?(.*?)"?\s*$/m);
  return m ? m[1] : '';
};
function appendBody(cat, slug, loc, label, names) {
  if (!names.length) return false;
  const f = path.join(root, 'content', cat, slug, `${loc}.md`);
  if (!fs.existsSync(f)) return false;
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes(label)) return false;
  fs.writeFileSync(f, content.replace(/\n*$/, '') + '\n\n' + label + names.join(SEP[loc]) + '\n');
  return true;
}

const vistasByZone = new Map();
let ssMeta = 0, ssBody = 0;
for (const d of fs.readdirSync(SS)) {
  const mp = path.join(SS, d, 'meta.yaml');
  if (!fs.existsSync(mp)) continue;
  let m; try { m = yaml.load(fs.readFileSync(mp, 'utf8')) || {}; } catch { continue; }
  const w = findWorld(m.place);
  if (!w) continue;
  if (!vistasByZone.has(w)) vistasByZone.set(w, []);
  vistasByZone.get(w).push(d);
  // 正向：景點 → 所在地
  addRelated(mp, [`world/${w}`]); ssMeta++;
  for (const loc of LOCALES) {
    const t = title('world', w, loc);
    if (t && appendBody('sightseeing', d, loc, PLBL[loc], [t])) ssBody++;
  }
}
// 反向：world → 其景點
let wMeta = 0, wBody = 0;
for (const [w, vistas] of vistasByZone) {
  addRelated(path.join(W, w, 'meta.yaml'), vistas.map((v) => `sightseeing/${v}`)); wMeta++;
  for (const loc of LOCALES) {
    const names = vistas.map((v) => title('sightseeing', v, loc)).filter(Boolean);
    if (appendBody('world', w, loc, VLBL[loc], names)) wBody++;
  }
}
console.log(`enrich-sightseeing-place：景點更新 meta ${ssMeta}／body ${ssBody}，world 更新 meta ${wMeta}／body ${wBody}。`);
