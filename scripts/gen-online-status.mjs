#!/usr/bin/env node
// 從 scripts/online-status-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// OnlineStatus 表，即玩家線上狀態；英/日原文，簡中取自 thewakingsands，繁中以
// OpenCC 由簡轉繁）生成 content/online-status/。冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'online-status');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'online-status-data.json'), 'utf8'));
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
    `id: ${m.slug}\ncategory: online-status\ntype: online_status\nstatus_name: ${Q(m.en)}\ntags: [online-status, social]\nstatus: stable\n`);
  for (const loc of LOCALES) {
    const n = pick(m.n, loc);
    let s, b;
    if (loc === 'en') { s = `An online status marker.`;
      b = `**${n}** is an online status a player can display beside their name, signalling what they are doing or open to. A resident reads these to judge whether someone wants company, and can set its own. In-game label: ${m.en}.`; }
    else if (loc === 'ja') { s = `オンラインステータス。`;
      b = `**${n}**は名前の横に表示できるオンラインステータスで、今なにをしているか・どんな誘いを歓迎するかを示す。住民はこれを読んで相手の都合を察し、自分の状態も示せる。ゲーム内表記：${m.en}。`; }
    else if (loc === 'zh-CN') { s = `在线状态标记。`;
      b = `**${n}** 是玩家可显示在名字旁的在线状态，表明此刻在做什么、欢迎怎样的互动。居民借此判断对方是否想要陪伴，也能设定自己的状态。游戏内标记：${m.en}。`; }
    else { s = `線上狀態標記。`;
      b = `**${n}** 是玩家可顯示在名字旁的線上狀態，表明此刻在做什麼、歡迎怎樣的互動。居民藉此判斷對方是否想要陪伴，也能設定自己的狀態。遊戲內標記：${m.en}。`; }
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, b));
  }
  created++;
}
console.log(`gen-online-status：新增 ${created}，跳過 ${skipped}。共 ${data.length} 種線上狀態。`);
