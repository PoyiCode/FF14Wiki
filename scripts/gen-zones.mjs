#!/usr/bin/env node
// 從 scripts/zone-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// TerritoryType 表，篩 TerritoryIntendedUse=1 的露天野外地區 → PlaceName
// （地區名）＋ PlaceNameRegion（所屬地方）；英/日原文，簡中取自 thewakingsands，
// 繁中以 OpenCC 由簡轉繁；對已存在的地方建立 related）生成 content/world/ 下的
// 野外地區條目。冪等：資料夾已存在就跳過（不覆蓋既有傳送點／地方條目）。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'world');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'zone-data.json'), 'utf8'));
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const Q = (s) => JSON.stringify(s);
const md = (t, s, b) => `---\ntitle: ${Q(t)}\nsummary: ${Q(s)}\n---\n\n${b}\n`;
const pick = (o, loc) => (o && (o[loc] || o.en)) || '';
let created = 0, skipped = 0;
for (const m of data) {
  if (!m.slug || fs.existsSync(path.join(DIR, m.slug))) { skipped++; continue; }
  const dir = path.join(DIR, m.slug);
  fs.mkdirSync(dir, { recursive: true });
  let meta = `id: ${m.slug}\ncategory: world\ntype: zone\nzone: ${Q(m.en)}\n`;
  if (m.region && m.region.en) meta += `region: ${Q(m.region.en)}\n`;
  if (m.regionLinked) meta += `related: [${m.regionSlug}]\n`;
  meta += `tags: [zone, region, travel]\nstatus: stable\n`;
  fs.writeFileSync(path.join(dir, 'meta.yaml'), meta);
  for (const loc of LOCALES) {
    const n = pick(m.n, loc);
    const reg = m.region ? pick(m.region, loc) : '';
    let s, b;
    if (loc === 'en') { s = reg ? `An explorable zone in ${reg}.` : `An explorable zone.`;
      b = `**${n}** is an explorable field zone of Eorzea${reg ? `, part of the wider region of **${reg}**` : ''} — an area a resident can travel through on their journeys. In-game name: ${m.en}.`; }
    else if (loc === 'ja') { s = reg ? `${reg}の野外エリア。` : `野外エリア。`;
      b = `**${n}**はエオルゼアの野外エリア${reg ? `で、**${reg}**地方の一部` : ''}。住民が旅の途中で通り抜ける地域。ゲーム内名称：${m.en}。`; }
    else if (loc === 'zh-CN') { s = reg ? `${reg}的野外地区。` : `野外地区。`;
      b = `**${n}** 是艾欧泽亚的野外地区${reg ? `，属于**${reg}**地方` : ''}，居民旅途中会途经此地。游戏内名称：${m.en}。`; }
    else { s = reg ? `${reg}的野外地區。` : `野外地區。`;
      b = `**${n}** 是艾歐澤亞的野外地區${reg ? `，屬於**${reg}**地方` : ''}，居民旅途中會途經此地。遊戲內名稱：${m.en}。`; }
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, b));
  }
  created++;
}
console.log(`gen-zones：新增 ${created}，跳過 ${skipped}。共 ${data.length} 個野外地區。`);
