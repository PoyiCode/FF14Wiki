#!/usr/bin/env node
// 從 scripts/beasttribe-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// BeastTribe；簡中取自 thewakingsands，已去除「：友好部隊」後綴只留種族短名，
// 繁中以 OpenCC 由簡轉繁）生成 content/lore/ 下的蠻族條目。冪等：已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';

const LORE = path.join(process.cwd(), 'content', 'lore');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'beasttribe-data.json'), 'utf8'));
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const Q = (s) => JSON.stringify(s);
const md = (title, summary, body) => `---\ntitle: ${Q(title)}\nsummary: ${Q(summary)}\n---\n\n${body}\n`;

let created = 0, skipped = 0;
for (const b of data) {
  if (!b.slug || fs.existsSync(path.join(LORE, b.slug))) { skipped++; continue; }
  const dir = path.join(LORE, b.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'meta.yaml'),
    `id: ${b.slug}\ncategory: lore\ntype: beast-tribe\nbeast_tribe: ${Q(b.en)}\n` +
    `tags: [beast-tribe, people]\nstatus: stable\n`);
  for (const loc of LOCALES) {
    const n = b.n[loc] || b.n.en;
    let summary, body;
    if (loc === 'en') {
      summary = `One of the beastfolk tribes of the world.`;
      body = `**${n}** are one of the world's beastfolk tribes — non-Hyur peoples a resident may encounter in particular regions, and might mention in conversation. In-game name: ${b.en}.`;
    } else if (loc === 'ja') {
      summary = `世界の蛮族（異種族）のひとつ。`;
      body = `**${n}**は世界の蛮族のひとつ。特定の地域で出会う異種族で、住民は旅先で見かけたり話題にしたりする。ゲーム内名称：${b.en}。`;
    } else if (loc === 'zh-CN') {
      summary = `世界的一支蛮族（异种族）。`;
      body = `**${n}** 是世界的一支蛮族——在特定地区会遇到的异种族，居民旅途中可能见到、闲聊时也可能提及。游戏内名称：${b.en}。`;
    } else {
      summary = `世界的一支蠻族（異種族）。`;
      body = `**${n}** 是世界的一支蠻族——在特定地區會遇到的異種族，居民旅途中可能見到、閒聊時也可能提及。遊戲內名稱：${b.en}。`;
    }
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, summary, body));
  }
  created++;
}
console.log(`gen-beasttribes：新增 ${created}，跳過（已存在）${skipped}。共 ${data.length} 支蠻族。`);
