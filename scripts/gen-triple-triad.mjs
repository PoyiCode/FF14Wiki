#!/usr/bin/env node
// 從 scripts/triple-triad-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// TripleTriadCard 表，即金碟幻卡；英/日原文含卡牌背景敘述，簡中取自
// thewakingsands，繁中以 OpenCC 由簡轉繁）生成 content/triple-triad/。
// 冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'triple-triad');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'triple-triad-data.json'), 'utf8'));
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const Q = (s) => JSON.stringify(s);
const md = (t, s, b) => `---\ntitle: ${Q(t)}\nsummary: ${Q(s)}\n---\n\n${b}\n`;
let created = 0, skipped = 0;
for (const m of data) {
  if (!m.slug || fs.existsSync(path.join(DIR, m.slug))) { skipped++; continue; }
  const dir = path.join(DIR, m.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'meta.yaml'),
    `id: ${m.slug}\ncategory: triple-triad\ntype: triple_triad_card\ncard: ${Q(m.en)}\ntags: [triple-triad, minigame, card]\nstatus: stable\n`);
  for (const loc of LOCALES) {
    const n = m.n[loc] || m.n.en;
    const desc = (m.desc && (m.desc[loc] || m.desc.en)) || '';
    let s, lead;
    if (loc === 'en') { s = `A Triple Triad card.`;
      lead = `**${n}** is a Triple Triad card — collected and played at the Gold Saucer, a pastime residents love. In-game name: ${m.en}.`; }
    else if (loc === 'ja') { s = `トリプルトライアドのカード。`;
      lead = `**${n}**はトリプルトライアドのカード。ゴールドソーサーで集めて遊ぶ、住民に人気のゲーム。ゲーム内名称：${m.en}。`; }
    else if (loc === 'zh-CN') { s = `幻卡卡牌。`;
      lead = `**${n}** 是一张幻卡（Triple Triad）卡牌，居民会在金碟游乐场收集与对战，是大受欢迎的消遣。游戏内名称：${m.en}。`; }
    else { s = `幻卡卡牌。`;
      lead = `**${n}** 是一張幻卡（Triple Triad）卡牌，居民會在金碟遊樂場收集與對戰，是大受歡迎的消遣。遊戲內名稱：${m.en}。`; }
    const body = desc ? `${lead}\n\n${desc}` : lead;
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, body));
  }
  created++;
}
console.log(`gen-triple-triad：新增 ${created}，跳過 ${skipped}。共 ${data.length} 張幻卡。`);
