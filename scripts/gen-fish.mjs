#!/usr/bin/env node
// 從 scripts/fish-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// FishParameter（含魚類生態敘述）→ Item（魚名）；英/日原文，簡中取自
// thewakingsands，繁中以 OpenCC 由簡轉繁）生成 content/fish/。
// 冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'fish');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'fish-data.json'), 'utf8'));
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const Q = (s) => JSON.stringify(s);
const md = (t, s, b) => `---\ntitle: ${Q(t)}\nsummary: ${Q(s)}\n---\n\n${b}\n`;
const pick = (o, loc) => (o && (o[loc] || o.en)) || '';
let created = 0, skipped = 0;
for (const m of data) {
  if (!m.slug || fs.existsSync(path.join(DIR, m.slug))) { skipped++; continue; }
  const dir = path.join(DIR, m.slug);
  fs.mkdirSync(dir, { recursive: true });
  const idval = /^\d+$/.test(m.slug) ? Q(m.slug) : m.slug;
  fs.writeFileSync(path.join(dir, 'meta.yaml'),
    `id: ${idval}\ncategory: fish\ntype: fish\nfish: ${Q(m.en)}\ntags: [fish, fishing, nature]\nstatus: stable\n`);
  for (const loc of LOCALES) {
    const n = pick(m.n, loc);
    const desc = m.desc ? pick(m.desc, loc) : '';
    let s, lead;
    if (loc === 'en') { s = `A fish of Eorzea.`;
      lead = `**${n}** is a fish found in the waters of Eorzea — the kind of catch a resident might land while fishing or chat about by the water. In-game name: ${m.en}.`; }
    else if (loc === 'ja') { s = `エオルゼアの魚。`;
      lead = `**${n}**はエオルゼアの水域に棲む魚。住民が釣りで釣り上げたり、水辺で語ったりする一匹。ゲーム内名称：${m.en}。`; }
    else if (loc === 'zh-CN') { s = `艾欧泽亚的鱼类。`;
      lead = `**${n}** 是艾欧泽亚水域中的鱼，居民钓鱼时可能钓到、或在水边闲聊提起。游戏内名称：${m.en}。`; }
    else { s = `艾歐澤亞的魚類。`;
      lead = `**${n}** 是艾歐澤亞水域中的魚，居民釣魚時可能釣到、或在水邊閒聊提起。遊戲內名稱：${m.en}。`; }
    const body = desc ? `${lead}\n\n${desc}` : lead;
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, body));
  }
  created++;
}
console.log(`gen-fish：新增 ${created}，跳過 ${skipped}。共 ${data.length} 種魚。`);
