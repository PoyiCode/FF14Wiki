#!/usr/bin/env node
// 從 scripts/dye-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// Stain 表，即染料；英/日原文，簡中取自 thewakingsands，繁中以 OpenCC
// 由簡轉繁，並保留官方 RGB 色碼）生成 content/dyes/。冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'dyes');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'dye-data.json'), 'utf8'));
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const Q = (s) => JSON.stringify(s);
const md = (t, s, b) => `---\ntitle: ${Q(t)}\nsummary: ${Q(s)}\n---\n\n${b}\n`;
let created = 0, skipped = 0;
for (const m of data) {
  if (!m.slug || fs.existsSync(path.join(DIR, m.slug))) { skipped++; continue; }
  const dir = path.join(DIR, m.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'meta.yaml'),
    `id: ${m.slug}\ncategory: dyes\ntype: dye\ndye: ${Q(m.en)}\ncolor: ${Q(m.hex)}\nmetallic: ${m.metallic}\ntags: [dye, color]\nstatus: stable\n`);
  for (const loc of LOCALES) {
    const n = m.n[loc] || m.n.en;
    const metal = m.metallic;
    let s, b;
    if (loc === 'en') { s = `A dye colour (${m.hex}).`;
      b = `**${n}** is a dye${metal ? ' with a metallic sheen' : ''} used to tint gear and glamours. Its colour is roughly ${m.hex}. A resident might dye an outfit this shade or mention it when chatting about fashion. In-game name: ${m.en}.`; }
    else if (loc === 'ja') { s = `カララント（染料）の色（${m.hex}）。`;
      b = `**${n}**は装備やミラプリを染めるカララント（染料）${metal ? '（メタリックな光沢あり）' : ''}。色はおおよそ ${m.hex}。住民が装いをこの色に染めたり、ファッションの話題で口にしたりする。ゲーム内名称：${m.en}。`; }
    else if (loc === 'zh-CN') { s = `染料颜色（${m.hex}）。`;
      b = `**${n}** 是为装备与幻化上色的染料${metal ? '（带金属光泽）' : ''}，颜色大约是 ${m.hex}。居民可能把穿搭染成这个色，或在聊时尚时提起。游戏内名称：${m.en}。`; }
    else { s = `染料顏色（${m.hex}）。`;
      b = `**${n}** 是為裝備與幻化上色的染料${metal ? '（帶金屬光澤）' : ''}，顏色大約是 ${m.hex}。居民可能把穿搭染成這個色，或在聊時尚時提起。遊戲內名稱：${m.en}。`; }
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, b));
  }
  created++;
}
console.log(`gen-dyes：新增 ${created}，跳過 ${skipped}。共 ${data.length} 種染料。`);
