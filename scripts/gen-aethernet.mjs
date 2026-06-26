#!/usr/bin/env node
// 從 scripts/aethernet-data.json（由官方 Aetheryte.csv 中 IsAetheryte=False 的
// 乙太網水晶 join PlaceName / TerritoryType 而成；簡中取自 thewakingsands，繁中以
// OpenCC 由簡轉繁）生成 content/world/ 下的「乙太網水晶」條目——城內各區的傳送子點
// 與公會所在地，居民在城市內移動、辦事時的據點。parent 指向所在城區（world/<area>）。
// 冪等：資料夾已存在就跳過；與既有地標同名者在建資料階段已略過，不重複。
import fs from 'node:fs';
import path from 'node:path';

const WORLD = path.join(process.cwd(), 'content', 'world');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'aethernet-data.json'), 'utf8'));
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const Q = (s) => JSON.stringify(s);
const exists = (slug) => fs.existsSync(path.join(WORLD, slug));
const md = (title, summary, body) => `---\ntitle: ${Q(title)}\nsummary: ${Q(summary)}\n---\n\n${body}\n`;

let created = 0, skipped = 0;
for (const m of data) {
  if (!m.slug || exists(m.slug)) { skipped++; continue; }
  const dir = path.join(WORLD, m.slug);
  fs.mkdirSync(dir, { recursive: true });
  const a = (loc) => m.area[loc] || m.area.en;
  const nTW = m.tw || m.cn, nCN = m.cn || m.tw;
  const locales = {
    'zh-TW': md(nTW || m.en, `「${a('zh-TW')}」的乙太網水晶。`,
      `**${nTW || m.en}** 是「${a('zh-TW')}」的乙太網水晶（城內傳送子點）。居民在城內移動、辦事時會傳送到這裡。遊戲內英文名：${m.en}。`),
    'zh-CN': md(nCN || m.en, `「${a('zh-CN')}」的以太网水晶。`,
      `**${nCN || m.en}** 是「${a('zh-CN')}」的以太网水晶（城内传送子点）。居民在城内移动、办事时会传送到这里。游戏内英文名：${m.en}。`),
    ja: md(m.ja || m.en, `「${a('ja')}」のエーテライト（街中の転移先）。`,
      `**${m.ja || m.en}**は「${a('ja')}」にあるエーテルネット（街中の転移ポイント）。住民が街なかを移動したり用事を済ませたりするとき、ここへ転移する。ゲーム内英語名：${m.en}。`),
    en: md(m.en, `An aethernet shard in ${a('en')}.`,
      `**${m.en}** is an aethernet shard (an in-city teleport point) in ${a('en')}. Residents teleport here to get around town and run errands. In-game name: ${m.en}.`),
  };
  const meta =
    `id: ${m.slug}\ncategory: world\ntype: aethernet\nrank: aetheryte\nparent: world/${m.parent}\n` +
    `aethernet: ${Q(m.en)}\narea: ${Q(m.area.en)}\n` +
    `related: [world/${m.parent}]\ntags: [aethernet, aetheryte, travel, teleport]\nstatus: stable\n`;
  fs.writeFileSync(path.join(dir, 'meta.yaml'), meta);
  for (const loc of LOCALES) fs.writeFileSync(path.join(dir, `${loc}.md`), locales[loc]);
  created++;
}
console.log(`gen-aethernet：新增 ${created}，跳過（已存在）${skipped}。資料 ${data.length} 筆。`);
