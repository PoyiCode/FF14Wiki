#!/usr/bin/env node
// 從 scripts/profession-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// ClassJob 表，篩 ClassJobCategory=33 工匠（製作之手）與 32 採集（大地之手），
// 即非戰鬥的生業；英/日原文，簡中取自 thewakingsands，繁中以 OpenCC 由簡轉繁）
// 生成 content/professions/。每個職業附一句本行說明（常識，非遊戲機制）。
// 冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'professions');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'profession-data.json'), 'utf8'));
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const Q = (s) => JSON.stringify(s);
const md = (t, s, b) => `---\ntitle: ${Q(t)}\nsummary: ${Q(s)}\n---\n\n${b}\n`;
const pick = (o, loc) => (o && (o[loc] || o.en)) || '';
// 各職業的本行（產物／工作），四語常識性描述
const TRADE = {
  carpenter: { en: 'works wood into furniture, bows and staves', ja: '木を加工して家具・弓・杖などを作る', 'zh-CN': '将木料加工成家具、弓、法杖等', 'zh-TW': '將木料加工成家具、弓、法杖等' },
  blacksmith: { en: 'forges metal into weapons and tools', ja: '金属を鍛えて武器や道具を作る', 'zh-CN': '锻造金属武器与工具', 'zh-TW': '鍛造金屬武器與工具' },
  armorer: { en: 'hammers metal into armor', ja: '金属を打って鎧を作る', 'zh-CN': '打造金属铠甲', 'zh-TW': '打造金屬鎧甲' },
  goldsmith: { en: 'crafts jewelry, accessories and gem-set pieces', ja: '装飾品や宝飾品を作る', 'zh-CN': '制作首饰与宝石饰品', 'zh-TW': '製作首飾與寶石飾品' },
  leatherworker: { en: 'tans hide and crafts leather goods', ja: '皮をなめして革製品を作る', 'zh-CN': '鞣制皮革、制作皮具', 'zh-TW': '鞣製皮革、製作皮具' },
  weaver: { en: 'spins cloth and sews clothing', ja: '布を織り、衣服を仕立てる', 'zh-CN': '纺织布料、缝制衣物', 'zh-TW': '紡織布料、縫製衣物' },
  alchemist: { en: 'brews potions, medicines and reagents', ja: '薬や錬成物を調合する', 'zh-CN': '调配药剂与炼成物', 'zh-TW': '調配藥劑與煉成物' },
  culinarian: { en: 'cooks meals and prepares food', ja: '料理を作り、食事を整える', 'zh-CN': '烹调料理与饮食', 'zh-TW': '烹調料理與飲食' },
  miner: { en: 'digs ore, gems and minerals from the earth', ja: '鉱石や宝石を採掘する', 'zh-CN': '采掘矿石与宝石', 'zh-TW': '採掘礦石與寶石' },
  botanist: { en: 'harvests plants, herbs and lumber', ja: '草木や木材を採集する', 'zh-CN': '采集草木与木材', 'zh-TW': '採集草木與木材' },
  fisher: { en: 'casts a line to catch fish', ja: '釣り糸を垂れて魚を釣る', 'zh-CN': '垂钓捕鱼', 'zh-TW': '垂釣捕魚' },
};
const DISC = {
  hand: { en: 'a Disciple of the Hand (an artisan craft)', ja: 'クラフター（ハンド職）', 'zh-CN': '制作之手（工匠职业）', 'zh-TW': '製作之手（工匠職業）' },
  land: { en: 'a Disciple of the Land (a gathering trade)', ja: 'ギャザラー（ランド職）', 'zh-CN': '大地之手（采集职业）', 'zh-TW': '大地之手（採集職業）' },
};
let created = 0, skipped = 0;
for (const m of data) {
  if (!m.slug || fs.existsSync(path.join(DIR, m.slug))) { skipped++; continue; }
  const dir = path.join(DIR, m.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'meta.yaml'),
    `id: ${m.slug}\ncategory: professions\ntype: profession\nprofession: ${Q(m.en)}\ndiscipline: ${m.discipline}\ntags: [profession, trade, ${m.discipline === 'hand' ? 'crafter' : 'gatherer'}]\nstatus: stable\n`);
  for (const loc of LOCALES) {
    const n = pick(m.n, loc);
    const trade = pick(TRADE[m.slug], loc);
    const disc = pick(DISC[m.discipline], loc);
    let s, b;
    if (loc === 'en') { s = `A resident's trade — ${disc}.`;
      b = `**${n}** is a profession — ${disc}. A resident who takes up this trade ${trade}, earning a living and an identity by it. In-game name: ${m.en}.`; }
    else if (loc === 'ja') { s = `住民の生業（${disc}）。`;
      b = `**${n}**は職業のひとつで、${disc}。この生業に就く住民は${trade}ことで暮らしを立て、自らの身分とする。ゲーム内名称：${m.en}。`; }
    else if (loc === 'zh-CN') { s = `居民的生业（${disc}）。`;
      b = `**${n}** 是一种职业，属于${disc}。从事这门手艺的居民${trade}，以此谋生、立身。游戏内名称：${m.en}。`; }
    else { s = `居民的生業（${disc}）。`;
      b = `**${n}** 是一種職業，屬於${disc}。從事這門手藝的居民${trade}，以此謀生、立身。遊戲內名稱：${m.en}。`; }
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, b));
  }
  created++;
}
console.log(`gen-professions：新增 ${created}，跳過 ${skipped}。共 ${data.length} 種職業。`);
