#!/usr/bin/env node
// 從 scripts/hairstyle-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// Item 表中「美容髮型」道具（Modern Aesthetics／ヘアカタログ／发型样式）；
// 英/日原文，簡中取自 thewakingsands，繁中以 OpenCC 由簡轉繁；已去除前綴只留
// 髮型名）生成 content/hairstyles/。冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'hairstyles');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'hairstyle-data.json'), 'utf8'));
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
    `id: ${idval}\ncategory: hairstyles\ntype: hairstyle\nhairstyle: ${Q(m.en)}\ntags: [hairstyle, appearance, fashion]\nstatus: stable\n`);
  for (const loc of LOCALES) {
    const n = pick(m.n, loc);
    const desc = m.desc ? pick(m.desc, loc) : '';
    let s, lead;
    if (loc === 'en') { s = `A hairstyle.`;
      lead = `**${n}** is a hairstyle a resident can wear — a way to change one's look and show off some personal style. In-game name: ${m.en}.`; }
    else if (loc === 'ja') { s = `髪型のスタイル。`;
      lead = `**${n}**は住民が選べる髪型。見た目を変え、自分らしいスタイルを見せる一つの方法。ゲーム内名称：${m.en}。`; }
    else if (loc === 'zh-CN') { s = `发型样式。`;
      lead = `**${n}** 是居民可以换上的发型，用来改变外貌、展现个人风格。游戏内名称：${m.en}。`; }
    else { s = `髮型樣式。`;
      lead = `**${n}** 是居民可以換上的髮型，用來改變外貌、展現個人風格。遊戲內名稱：${m.en}。`; }
    const body = desc ? `${lead}\n\n${desc}` : lead;
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, body));
  }
  created++;
}
console.log(`gen-hairstyles：新增 ${created}，跳過 ${skipped}。共 ${data.length} 種髮型。`);
