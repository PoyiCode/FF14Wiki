#!/usr/bin/env node
// 從 scripts/ingredient-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// Item 表中 ItemUICategory=45「食材」；英/日原文，簡中取自 thewakingsands，
// 繁中以 OpenCC 由簡轉繁；只取風味敘述）生成 content/ingredients/。
// 冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'ingredients');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'ingredient-data.json'), 'utf8'));
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
    `id: ${idval}\ncategory: ingredients\ntype: ingredient\ningredient: ${Q(m.en)}\ntags: [ingredient, food, cooking]\nstatus: stable\n`);
  for (const loc of LOCALES) {
    const n = pick(m.n, loc);
    const desc = m.desc ? pick(m.desc, loc) : '';
    let s, lead;
    if (loc === 'en') { s = `A cooking ingredient.`;
      lead = `**${n}** is a foodstuff residents cook with and buy at market — a raw ingredient that goes into Eorzean dishes. In-game name: ${m.en}.`; }
    else if (loc === 'ja') { s = `料理の食材。`;
      lead = `**${n}**は住民が料理に使い、市場で買い求める食材。エオルゼアの料理に使われる素材。ゲーム内名称：${m.en}。`; }
    else if (loc === 'zh-CN') { s = `烹饪食材。`;
      lead = `**${n}** 是居民下厨会用、在市集采买的食材，是艾欧泽亚料理的原料。游戏内名称：${m.en}。`; }
    else { s = `烹飪食材。`;
      lead = `**${n}** 是居民下廚會用、在市集採買的食材，是艾歐澤亞料理的原料。遊戲內名稱：${m.en}。`; }
    const body = desc ? `${lead}\n\n${desc}` : lead;
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, body));
  }
  created++;
}
console.log(`gen-ingredients：新增 ${created}，跳過 ${skipped}。共 ${data.length} 種食材。`);
