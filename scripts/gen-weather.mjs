#!/usr/bin/env node
// 從 scripts/weather-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// Weather；簡中取自 thewakingsands，繁中以 OpenCC 由簡轉繁）生成
// content/weather/ 下的天氣條目。冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'content', 'weather');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'weather-data.json'), 'utf8'));
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const Q = (s) => JSON.stringify(s);
const md = (title, summary, body) => `---\ntitle: ${Q(title)}\nsummary: ${Q(summary)}\n---\n\n${body}\n`;

let created = 0, skipped = 0;
for (const w of data) {
  if (!w.slug || fs.existsSync(path.join(DIR, w.slug))) { skipped++; continue; }
  const dir = path.join(DIR, w.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'meta.yaml'),
    `id: ${w.slug}\ncategory: weather\ntype: weather\nweather: ${Q(w.en)}\n` +
    `tags: [weather, environment]\nstatus: stable\n`);
  for (const loc of LOCALES) {
    const n = w.n[loc] || w.n.en;
    let summary, body;
    if (loc === 'en') {
      summary = `A type of weather in Eorzea.`;
      body = `**${n}** is one of Eorzea's weather conditions${w.desc ? ` (${w.desc})` : ''}. A resident can use it to describe the sky and set the mood of a conversation. In-game name: ${w.en}.`;
    } else if (loc === 'ja') {
      summary = `エオルゼアの天候のひとつ。`;
      body = `**${n}**はエオルゼアの天候のひとつ。住民は空模様を語ったり、会話の雰囲気づくりに使える。ゲーム内名称：${w.en}。`;
    } else if (loc === 'zh-CN') {
      summary = `艾欧泽亚的一种天气。`;
      body = `**${n}** 是艾欧泽亚的一种天气。居民可用它来描述当下的天空、营造聊天气氛。游戏内名称：${w.en}。`;
    } else {
      summary = `艾歐澤亞的一種天氣。`;
      body = `**${n}** 是艾歐澤亞的一種天氣。居民可用它來描述當下的天空、營造聊天氣氛。遊戲內名稱：${w.en}。`;
    }
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, summary, body));
  }
  created++;
}
console.log(`gen-weather：新增 ${created}，跳過（已存在）${skipped}。共 ${data.length} 種天氣。`);
