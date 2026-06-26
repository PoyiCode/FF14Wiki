#!/usr/bin/env node
// 為既有的 fish 條目補上「可在哪些釣場釣到」的反向連結。
// 來源：scripts/fishing-spot-data.json（釣場 → 魚），在此反轉成 魚 → 釣場。
// 為每個 fish 條目：(1) 在 meta.yaml 補上 related（指向釣場），(2) 在各語 .md
// 追加「可在以下釣場釣到：…」。完成 world↔fish↔fishing-spots 的雙向圖。
// 冪等且只追加：meta 已有 related 或 .md 已含該行就跳過，絕不覆蓋既有內容。
import fs from 'node:fs';
import path from 'node:path';
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const LBL = { en: 'Caught at: ', ja: '釣れる場所：', 'zh-CN': '可在以下钓场钓到：', 'zh-TW': '可在以下釣場釣到：' };
const SEP = { en: ', ', ja: '、', 'zh-CN': '、', 'zh-TW': '、' };
const pick = (o, loc) => (o && (o[loc] || o.en)) || '';

const spots = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'fishing-spot-data.json'), 'utf8'));
const inv = new Map();
for (const sp of spots) {
  for (const f of sp.fish) {
    if (!f.linked) continue;
    if (!inv.has(f.slug)) inv.set(f.slug, []);
    inv.get(f.slug).push({ slug: sp.slug, n: sp.n });
  }
}
const base = path.join(process.cwd(), 'content', 'fish');
let metaUpd = 0, mdUpd = 0, already = 0, missing = 0;
for (const [slug, list] of inv) {
  const dir = path.join(base, slug);
  if (!fs.existsSync(dir)) { missing++; continue; }
  // dedup spots by slug
  const seen = new Set(); const uniq = [];
  for (const s of list) { if (!seen.has(s.slug)) { seen.add(s.slug); uniq.push(s); } }

  // 1) meta.yaml: add related if absent
  const metaFile = path.join(dir, 'meta.yaml');
  if (fs.existsSync(metaFile)) {
    let meta = fs.readFileSync(metaFile, 'utf8');
    if (!/^related:/m.test(meta)) {
      const rel = `related: [${uniq.map((s) => `fishing-spots/${s.slug}`).join(', ')}]\n`;
      if (/^tags:/m.test(meta)) meta = meta.replace(/^tags:/m, rel + 'tags:');
      else meta = meta.replace(/\n*$/, '') + '\n' + rel;
      fs.writeFileSync(metaFile, meta);
      metaUpd++;
    }
  }
  // 2) each locale .md: append caught-at line
  for (const loc of LOCALES) {
    const file = path.join(dir, `${loc}.md`);
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(LBL[loc])) { already++; continue; }
    const names = uniq.map((s) => pick(s.n, loc)).filter(Boolean);
    if (!names.length) continue;
    fs.writeFileSync(file, content.replace(/\n*$/, '') + '\n\n' + LBL[loc] + names.join(SEP[loc]) + '\n');
    mdUpd++;
  }
}
console.log(`enrich-fish-spots：更新 meta ${metaUpd}，補上釣場 ${mdUpd} 個檔，已存在跳過 ${already}，缺資料夾 ${missing}。`);
