#!/usr/bin/env node
// 為 world 中的「地方（region）」條目補上其轄下「地區（zone）／聚落」清單。
// 來源：scripts/zone-data.json 與 settlement-data.json（zone → 所屬地方），反轉成
// 地方 → 地區。為地方條目補上「本地方的地區：…」與 related（指向各地區）。
// 冪等且只追加：related 自動合併去重，.md 已含該行就跳過，絕不覆蓋既有內容。
import fs from 'node:fs';
import path from 'node:path';
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const LBL = { en: 'Zones in this region: ', ja: 'この地方のエリア：', 'zh-CN': '本地方的地区：', 'zh-TW': '本地方的地區：' };
const SEP = { en: ', ', ja: '、', 'zh-CN': '、', 'zh-TW': '、' };

// 以「尾端 id」去重並偏好限定式 category/id（同 enrich-weather-geo），避免重跑時
// 裸式與限定式並存。
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
  if (merged.length === existing.length && merged.every((v, i) => v === existing[i])) return;
  const line = `related: [${merged.join(', ')}]`;
  if (m) meta = meta.replace(/^related:\s*\[[^\]]*\]/m, line);
  else if (/^tags:/m.test(meta)) meta = meta.replace(/^tags:/m, line + '\ntags:');
  else meta = meta.replace(/\n*$/, '') + '\n' + line + '\n';
  fs.writeFileSync(metaFile, meta);
}
function title(dir, loc) {
  const f = path.join(dir, `${loc}.md`);
  if (!fs.existsSync(f)) return '';
  const m = fs.readFileSync(f, 'utf8').match(/^title:\s*"?(.*?)"?\s*$/m);
  return m ? m[1] : '';
}

const root = process.cwd();
const worldDir = path.join(root, 'content', 'world');
const world = new Set(fs.readdirSync(worldDir));
const items = [
  ...JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'zone-data.json'), 'utf8')),
  ...JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'settlement-data.json'), 'utf8')),
];
const rev = new Map();
for (const it of items) {
  const r = it.regionSlug;
  if (r && world.has(r) && world.has(it.slug)) {
    if (!rev.has(r)) rev.set(r, []);
    rev.get(r).push(it.slug);
  }
}
let metaUpd = 0, bodyUpd = 0;
for (const [region, zones] of rev) {
  const dir = path.join(worldDir, region);
  if (!fs.existsSync(dir)) continue;
  const uniq = [...new Set(zones)];
  addRelated(path.join(dir, 'meta.yaml'), uniq.map((z) => `world/${z}`)); metaUpd++;
  for (const loc of LOCALES) {
    const names = uniq.map((z) => title(path.join(worldDir, z), loc)).filter(Boolean);
    const file = path.join(dir, `${loc}.md`);
    if (!names.length || !fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(LBL[loc])) continue;
    fs.writeFileSync(file, content.replace(/\n*$/, '') + '\n\n' + LBL[loc] + names.join(SEP[loc]) + '\n');
    bodyUpd++;
  }
}
console.log(`enrich-region-zones：地方更新 meta ${metaUpd}，補上地區清單 ${bodyUpd} 個檔。`);
