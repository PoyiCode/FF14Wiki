#!/usr/bin/env node
// 從 scripts/tool-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的 Item 表
// 中工匠／採集職業的工具類別（ItemUICategory 12–32、99；已排除「Dated」舊版且
// 限有敘述者）；英/日原文，簡中取自 thewakingsands，繁中以 OpenCC 由簡轉繁；
// 只取風味敘述，並 related 連回 professions）生成 content/tools/。
// 冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'tools');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'tool-data.json'), 'utf8'));
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const Q = (s) => JSON.stringify(s);
const md = (t, s, b) => `---\ntitle: ${Q(t)}\nsummary: ${Q(s)}\n---\n\n${b}\n`;
const pick = (o, loc) => (o && (o[loc] || o.en)) || '';
const PROF = {
  carpenter: { 'zh-TW': '刻木匠', 'zh-CN': '刻木匠', ja: '木工師', en: 'Carpenter' },
  blacksmith: { 'zh-TW': '鍛鐵匠', 'zh-CN': '锻铁匠', ja: '鍛冶師', en: 'Blacksmith' },
  armorer: { 'zh-TW': '鑄甲匠', 'zh-CN': '铸甲匠', ja: '甲冑師', en: 'Armorer' },
  goldsmith: { 'zh-TW': '雕金匠', 'zh-CN': '雕金匠', ja: '彫金師', en: 'Goldsmith' },
  leatherworker: { 'zh-TW': '製革匠', 'zh-CN': '制革匠', ja: '革細工師', en: 'Leatherworker' },
  weaver: { 'zh-TW': '裁衣匠', 'zh-CN': '裁衣匠', ja: '裁縫師', en: 'Weaver' },
  alchemist: { 'zh-TW': '鍊金術士', 'zh-CN': '炼金术士', ja: '錬金術師', en: 'Alchemist' },
  culinarian: { 'zh-TW': '烹調師', 'zh-CN': '烹调师', ja: '調理師', en: 'Culinarian' },
  miner: { 'zh-TW': '採礦工', 'zh-CN': '采矿工', ja: '採掘師', en: 'Miner' },
  botanist: { 'zh-TW': '園藝工', 'zh-CN': '园艺工', ja: '園芸師', en: 'Botanist' },
  fisher: { 'zh-TW': '捕魚人', 'zh-CN': '捕鱼人', ja: '漁師', en: 'Fisher' },
};
let created = 0, skipped = 0;
for (const m of data) {
  if (!m.slug || fs.existsSync(path.join(DIR, m.slug))) { skipped++; continue; }
  const dir = path.join(DIR, m.slug);
  fs.mkdirSync(dir, { recursive: true });
  let meta = `id: ${m.slug}\ncategory: tools\ntype: tool\ntool: ${Q(m.en)}\nprofession: ${m.profession}\nslot: ${m.slot}\n`;
  if (m.profLinked) meta += `related: [professions/${m.profession}]\n`;
  meta += `tags: [tool, ${m.profession}, ${m.slot === 'primary' ? 'main-tool' : 'sub-tool'}]\nstatus: stable\n`;
  fs.writeFileSync(path.join(dir, 'meta.yaml'), meta);
  for (const loc of LOCALES) {
    const n = pick(m.n, loc);
    const desc = m.desc ? pick(m.desc, loc) : '';
    const prof = pick(PROF[m.profession], loc);
    let s, lead;
    if (loc === 'en') { s = `A ${prof}'s tool.`;
      lead = `**${n}** is a tool of the **${prof}**'s trade — an implement a resident plies their craft with. In-game name: ${m.en}.`; }
    else if (loc === 'ja') { s = `${prof}の道具。`;
      lead = `**${n}**は**${prof}**の商売道具。住民が生業に使う器具。ゲーム内名称：${m.en}。`; }
    else if (loc === 'zh-CN') { s = `${prof}的工具。`;
      lead = `**${n}** 是**${prof}**的本行工具，居民赖以谋生的器具。游戏内名称：${m.en}。`; }
    else { s = `${prof}的工具。`;
      lead = `**${n}** 是**${prof}**的本行工具，居民賴以謀生的器具。遊戲內名稱：${m.en}。`; }
    const body = desc ? `${lead}\n\n${desc}` : lead;
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, body));
  }
  created++;
}
console.log(`gen-tools：新增 ${created}，跳過 ${skipped}。共 ${data.length} 件工具。`);
