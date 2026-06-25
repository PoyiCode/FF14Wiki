#!/usr/bin/env node
// 從 scripts/instrument-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// Perform 表，即演奏樂器；英/日原文，簡中取自 thewakingsands，繁中以 OpenCC
// 由簡轉繁）生成 content/instruments/。冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'instruments');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'instrument-data.json'), 'utf8'));
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const Q = (s) => JSON.stringify(s);
const md = (t, s, b) => `---\ntitle: ${Q(t)}\nsummary: ${Q(s)}\n---\n\n${b}\n`;
const pick = (o, loc) => (o && (o[loc] || o.en)) || '';
let created = 0, skipped = 0;
for (const m of data) {
  if (!m.slug || fs.existsSync(path.join(DIR, m.slug))) { skipped++; continue; }
  const dir = path.join(DIR, m.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'meta.yaml'),
    `id: ${m.slug}\ncategory: instruments\ntype: instrument\ninstrument: ${Q(m.en)}\ntags: [instrument, music, performance]\nstatus: stable\n`);
  for (const loc of LOCALES) {
    const n = pick(m.n, loc);
    let s, b;
    if (loc === 'en') { s = `A performance instrument.`;
      b = `**${n}** is an instrument a resident can play in Performance mode — busking in the streets, jamming with friends, or playing a favourite tune. In-game name: ${m.en}.`; }
    else if (loc === 'ja') { s = `演奏で使う楽器。`;
      b = `**${n}**は住民が演奏（パフォーマンス）で使える楽器。街角で演奏したり、仲間と合奏したり、好きな曲を奏でたりする。ゲーム内名称：${m.en}。`; }
    else if (loc === 'zh-CN') { s = `演奏用的乐器。`;
      b = `**${n}** 是居民在演奏（Performance）时可用的乐器，可以在街头表演、与同伴合奏，或弹奏喜欢的曲子。游戏内名称：${m.en}。`; }
    else { s = `演奏用的樂器。`;
      b = `**${n}** 是居民在演奏（Performance）時可用的樂器，可以在街頭表演、與同伴合奏，或彈奏喜歡的曲子。遊戲內名稱：${m.en}。`; }
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, b));
  }
  created++;
}
console.log(`gen-instruments：新增 ${created}，跳過 ${skipped}。共 ${data.length} 件樂器。`);
