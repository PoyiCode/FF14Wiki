#!/usr/bin/env node
// 從 scripts/currency-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// Item 表中 ItemUICategory=100「貨幣」；英/日原文，簡中取自 thewakingsands，
// 繁中以 OpenCC 由簡轉繁；只取說明敘述）生成 content/currency/。
// 冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'currency');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'currency-data.json'), 'utf8'));
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
    `id: ${idval}\ncategory: currency\ntype: currency\ncurrency: ${Q(m.en)}\ntags: [currency, economy]\nstatus: stable\n`);
  for (const loc of LOCALES) {
    const n = pick(m.n, loc);
    const desc = m.desc ? pick(m.desc, loc) : '';
    let s, lead;
    if (loc === 'en') { s = `A currency of Eorzea.`;
      lead = `**${n}** is a currency or token used in Eorzea — something a resident earns and spends. In-game name: ${m.en}.`; }
    else if (loc === 'ja') { s = `エオルゼアの通貨。`;
      lead = `**${n}**はエオルゼアで使われる通貨・トークン。住民が稼いで使うもの。ゲーム内名称：${m.en}。`; }
    else if (loc === 'zh-CN') { s = `艾欧泽亚的货币。`;
      lead = `**${n}** 是艾欧泽亚通用的货币或代币，居民赚取与花用的东西。游戏内名称：${m.en}。`; }
    else { s = `艾歐澤亞的貨幣。`;
      lead = `**${n}** 是艾歐澤亞通用的貨幣或代幣，居民賺取與花用的東西。遊戲內名稱：${m.en}。`; }
    const body = desc ? `${lead}\n\n${desc}` : lead;
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, body));
  }
  created++;
}
console.log(`gen-currency：新增 ${created}，跳過 ${skipped}。共 ${data.length} 種貨幣。`);
