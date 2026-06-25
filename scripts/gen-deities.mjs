#!/usr/bin/env node
// 從 scripts/deity-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// GuardianDeity 表，即十二神；英/日原文含完整神祇敘述，簡中取自
// thewakingsands，繁中以 OpenCC 由簡轉繁）生成 content/lore/ 下的個別神祇條目，
// 並以 related 連回既有的 the-twelve 條目。冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'lore');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'deity-data.json'), 'utf8'));
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const Q = (s) => JSON.stringify(s);
const md = (t, s, b) => `---\ntitle: ${Q(t)}\nsummary: ${Q(s)}\n---\n\n${b}\n`;
const ELEM = {
  ice: { 'zh-TW': '冰', 'zh-CN': '冰', ja: '氷', en: 'ice' },
  water: { 'zh-TW': '水', 'zh-CN': '水', ja: '水', en: 'water' },
  wind: { 'zh-TW': '風', 'zh-CN': '风', ja: '風', en: 'wind' },
  lightning: { 'zh-TW': '雷', 'zh-CN': '雷', ja: '雷', en: 'lightning' },
  fire: { 'zh-TW': '火', 'zh-CN': '火', ja: '火', en: 'fire' },
  earth: { 'zh-TW': '土', 'zh-CN': '土', ja: '土', en: 'earth' },
};
let created = 0, skipped = 0;
for (const m of data) {
  if (!m.slug || fs.existsSync(path.join(DIR, m.slug))) { skipped++; continue; }
  const dir = path.join(DIR, m.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'meta.yaml'),
    `id: ${m.slug}\ncategory: lore\ntype: deity\ndeity: ${Q(m.en)}\nelement: ${Q(m.element)}\nmoon: ${m.moon}\npantheon: the-twelve\nrelated: [the-twelve]\ntags: [deity, religion, the-twelve, ${m.element}]\nstatus: stable\n`);
  for (const loc of LOCALES) {
    const n = (m.n && (m.n[loc] || m.n.en)) || m.en;
    const desc = (m.desc && (m.desc[loc] || m.desc.en)) || '';
    const el = (ELEM[m.element] && ELEM[m.element][loc]) || m.element;
    let s, lead;
    if (loc === 'en') { s = `One of the Twelve — guardian deity of the ${ordinal(m.moon)} moon.`;
      lead = `**${n}** is one of the Twelve, the gods of Eorzea. This deity commands the element of ${el} and watches over the ${ordinal(m.moon)} moon of the Eorzean calendar.`; }
    else if (loc === 'ja') { s = `エオルゼアの十二神の一柱（第${m.moon}の月）。`;
      lead = `**${n}**はエオルゼアの十二神の一柱。${el}属性をつかさどり、エオルゼア暦の第${m.moon}の月を守護する。`; }
    else if (loc === 'zh-CN') { s = `艾欧泽亚十二神之一（第${m.moon}月）。`;
      lead = `**${n}** 是艾欧泽亚十二神之一，司掌${el}属性，守护着艾欧泽亚历的第${m.moon}个月。`; }
    else { s = `艾歐澤亞十二神之一（第${m.moon}月）。`;
      lead = `**${n}** 是艾歐澤亞十二神之一，司掌${el}屬性，守護著艾歐澤亞曆的第${m.moon}個月。`; }
    const body = desc ? `${lead}\n\n${desc}` : lead;
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, body));
  }
  created++;
}
function ordinal(k) {
  const sfx = ['th', 'st', 'nd', 'rd'], v = k % 100;
  return k + (sfx[(v - 20) % 10] || sfx[v] || sfx[0]);
}
console.log(`gen-deities：新增 ${created}，跳過 ${skipped}。共 ${data.length} 位神祇（十二神）。`);
