#!/usr/bin/env node
// 從 scripts/furniture-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// HousingFurniture → Item，即室內家具；英/日原文，簡中取自 thewakingsands，
// 繁中以 OpenCC 由簡轉繁；只取風味敘述）生成 content/furniture/。
// 冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'furniture');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'furniture-data.json'), 'utf8'));
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const Q = (s) => JSON.stringify(s);
const md = (t, s, b) => `---\ntitle: ${Q(t)}\nsummary: ${Q(s)}\n---\n\n${b}\n`;
const pick = (o, loc) => (o && (o[loc] || o.en)) || '';
let created = 0, skipped = 0;
for (const m of data) {
  if (!m.slug || fs.existsSync(path.join(DIR, m.slug))) { skipped++; continue; }
  const dir = path.join(DIR, m.slug);
  fs.mkdirSync(dir, { recursive: true });
  // 純數字 slug（少數未英譯的活動海報，名稱被 slug 化後只剩年份）需加引號，
  // 否則 YAML 會把 id 解析成數字，與資料夾名（字串）不一致。
  const idval = /^\d+$/.test(m.slug) ? Q(m.slug) : m.slug;
  fs.writeFileSync(path.join(dir, 'meta.yaml'),
    `id: ${idval}\ncategory: furniture\ntype: furnishing\nfurnishing: ${Q(m.en)}\ntags: [furniture, housing]\nstatus: stable\n`);
  for (const loc of LOCALES) {
    const n = pick(m.n, loc);
    const desc = m.desc ? pick(m.desc, loc) : '';
    let s, lead;
    if (loc === 'en') { s = `A piece of furniture.`;
      lead = `**${n}** is a furnishing residents place to decorate their homes. In-game name: ${m.en}.`; }
    else if (loc === 'ja') { s = `家具・調度品。`;
      lead = `**${n}**は住民が家を飾るために置く家具・調度品。ゲーム内名称：${m.en}。`; }
    else if (loc === 'zh-CN') { s = `家具摆设。`;
      lead = `**${n}** 是居民用来布置房屋的家具摆设。游戏内名称：${m.en}。`; }
    else { s = `家具擺設。`;
      lead = `**${n}** 是居民用來布置房屋的家具擺設。遊戲內名稱：${m.en}。`; }
    const body = desc ? `${lead}\n\n${desc}` : lead;
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, body));
  }
  created++;
}
console.log(`gen-furniture：新增 ${created}，跳過 ${skipped}。共 ${data.length} 件家具。`);
