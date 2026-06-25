#!/usr/bin/env node
// 從 scripts/gardening-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// GardeningSeed → Item，即可栽種的作物／花草；已濾除非作物的元素水晶；英/日
// 原文，簡中取自 thewakingsands，繁中以 OpenCC 由簡轉繁；只取風味敘述）
// 生成 content/gardening/。冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'gardening');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'gardening-data.json'), 'utf8'));
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
    `id: ${idval}\ncategory: gardening\ntype: crop\ncrop: ${Q(m.en)}\ntags: [gardening, crop, plant]\nstatus: stable\n`);
  for (const loc of LOCALES) {
    const n = pick(m.n, loc);
    const desc = m.desc ? pick(m.desc, loc) : '';
    let s, lead;
    if (loc === 'en') { s = `A plant residents can grow.`;
      lead = `**${n}** is a crop a resident can grow in a garden plot or flowerpot at home, to harvest or simply to enjoy tending. In-game name: ${m.en}.`; }
    else if (loc === 'ja') { s = `栽培できる作物。`;
      lead = `**${n}**は住民が自宅の畑やフラワーポットで育てられる作物。収穫したり、世話そのものを楽しんだりする。ゲーム内名称：${m.en}。`; }
    else if (loc === 'zh-CN') { s = `可栽种的作物。`;
      lead = `**${n}** 是居民可以在自家庭院或花盆里栽种的作物，用来收成、或纯粹享受照料的乐趣。游戏内名称：${m.en}。`; }
    else { s = `可栽種的作物。`;
      lead = `**${n}** 是居民可以在自家庭院或花盆裡栽種的作物，用來收成、或純粹享受照料的樂趣。遊戲內名稱：${m.en}。`; }
    const body = desc ? `${lead}\n\n${desc}` : lead;
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, body));
  }
  created++;
}
console.log(`gen-gardening：新增 ${created}，跳過 ${skipped}。共 ${data.length} 種作物。`);
