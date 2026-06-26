#!/usr/bin/env node
// 從 scripts/fishing-spot-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// FishingSpot → PlaceName（釣場名）＋ Item（該處可釣的魚）；英/日原文，簡中
// 取自 thewakingsands，繁中以 OpenCC 由簡轉繁；並對已存在的 world／fish 條目
// 建立 related 跨參照）生成 content/fishing-spots/。冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'fishing-spots');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'fishing-spot-data.json'), 'utf8'));
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const Q = (s) => JSON.stringify(s);
const md = (t, s, b) => `---\ntitle: ${Q(t)}\nsummary: ${Q(s)}\n---\n\n${b}\n`;
const pick = (o, loc) => (o && (o[loc] || o.en)) || '';
const LBL = {
  en: 'Fish you can catch here', ja: 'ここで釣れる魚',
  'zh-CN': '这里能钓到的鱼', 'zh-TW': '這裡能釣到的魚',
};
let created = 0, skipped = 0;
for (const m of data) {
  if (!m.slug || fs.existsSync(path.join(DIR, m.slug))) { skipped++; continue; }
  const dir = path.join(DIR, m.slug);
  fs.mkdirSync(dir, { recursive: true });
  // 限定式 related：地點連回同名地區（world），魚連到 fish，避免跨分類同名歧義。
  const related = [];
  if (m.placeLinked) related.push(`world/${m.slug}`);
  for (const f of m.fish) if (f.linked && !related.includes(`fish/${f.slug}`)) related.push(`fish/${f.slug}`);
  let meta = `id: ${m.slug}\ncategory: fishing-spots\ntype: fishing_spot\nfishing_spot: ${Q(m.en)}\nfish_count: ${m.fish.length}\n`;
  if (related.length) meta += `related: [${related.join(', ')}]\n`;
  meta += `tags: [fishing, spot, nature]\nstatus: stable\n`;
  fs.writeFileSync(path.join(dir, 'meta.yaml'), meta);
  for (const loc of LOCALES) {
    const n = pick(m.n, loc);
    const list = m.fish.map((f) => pick(f.n, loc)).filter(Boolean);
    let s, lead;
    if (loc === 'en') { s = `A fishing spot in Eorzea.`;
      lead = `**${n}** is a fishing hole in Eorzea where a resident can cast a line. In-game name: ${m.en}.`; }
    else if (loc === 'ja') { s = `エオルゼアの釣り場。`;
      lead = `**${n}**はエオルゼアの釣り場。住民が釣り糸を垂れる場所。ゲーム内名称：${m.en}。`; }
    else if (loc === 'zh-CN') { s = `艾欧泽亚的钓场。`;
      lead = `**${n}** 是艾欧泽亚的一处钓场，居民可以在这里垂钓。游戏内名称：${m.en}。`; }
    else { s = `艾歐澤亞的釣場。`;
      lead = `**${n}** 是艾歐澤亞的一處釣場，居民可以在這裡垂釣。遊戲內名稱：${m.en}。`; }
    const fishBlock = list.length ? `**${LBL[loc]}：**\n\n${list.map((x) => `- ${x}`).join('\n')}` : '';
    const body = [lead, fishBlock].filter(Boolean).join('\n\n');
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, body));
  }
  created++;
}
console.log(`gen-fishing-spots：新增 ${created}，跳過 ${skipped}。共 ${data.length} 個釣場。`);
