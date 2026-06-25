#!/usr/bin/env node
// 從 scripts/settlement-data.json（源自官方遊戲資料 xivapi/ffxiv-datamining 的
// TerritoryType 表，TerritoryIntendedUse=13 住宅區、=0 城市區域 → PlaceName ＋
// PlaceNameRegion；英/日原文，簡中取自 thewakingsands，繁中以 OpenCC 由簡轉繁；
// 對已存在的地方建立 related）生成 content/world/ 下的城市區域與住宅區條目。
// 冪等：資料夾已存在就跳過。
import fs from 'node:fs';
import path from 'node:path';
const DIR = path.join(process.cwd(), 'content', 'world');
const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'settlement-data.json'), 'utf8'));
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const Q = (s) => JSON.stringify(s);
const md = (t, s, b) => `---\ntitle: ${Q(t)}\nsummary: ${Q(s)}\n---\n\n${b}\n`;
const pick = (o, loc) => (o && (o[loc] || o.en)) || '';
let created = 0, skipped = 0;
for (const m of data) {
  if (!m.slug || fs.existsSync(path.join(DIR, m.slug))) { skipped++; continue; }
  const dir = path.join(DIR, m.slug);
  fs.mkdirSync(dir, { recursive: true });
  let meta = `id: ${m.slug}\ncategory: world\ntype: ${m.type === 'housing-district' ? 'housing_district' : 'city_area'}\narea: ${Q(m.en)}\n`;
  if (m.region && m.region.en) meta += `region: ${Q(m.region.en)}\n`;
  if (m.regionLinked) meta += `related: [${m.regionSlug}]\n`;
  meta += `tags: [${m.type}, world, travel]\nstatus: stable\n`;
  fs.writeFileSync(path.join(dir, 'meta.yaml'), meta);
  const housing = m.type === 'housing-district';
  for (const loc of LOCALES) {
    const n = pick(m.n, loc);
    const reg = m.region ? pick(m.region, loc) : '';
    let s, b;
    if (loc === 'en') {
      s = housing ? `A residential district${reg ? ` in ${reg}` : ''}.` : `A district of a city${reg ? ` in ${reg}` : ''}.`;
      b = housing
        ? `**${n}** is one of Eorzea's residential districts${reg ? ` in **${reg}**` : ''}, where residents own houses and apartments and make their homes. A peaceful neighbourhood to live, garden and host friends. In-game name: ${m.en}.`
        : `**${n}** is a district of a city${reg ? ` in **${reg}**` : ''} — a bustling quarter where residents shop, gather and go about daily life. In-game name: ${m.en}.`;
    } else if (loc === 'ja') {
      s = housing ? `住宅地区${reg ? `（${reg}）` : ''}。` : `街の区画${reg ? `（${reg}）` : ''}。`;
      b = housing
        ? `**${n}**はエオルゼアの住宅地区${reg ? `（**${reg}**）` : ''}。住民が家やアパルトメントを構えて暮らす、庭いじりや友人をもてなすのに穏やかな街並み。ゲーム内名称：${m.en}。`
        : `**${n}**は街の一区画${reg ? `（**${reg}**）` : ''}。住民が買い物や待ち合わせ、日々の暮らしを送る賑やかな場所。ゲーム内名称：${m.en}。`;
    } else if (loc === 'zh-CN') {
      s = housing ? `住宅区${reg ? `（${reg}）` : ''}。` : `城市区域${reg ? `（${reg}）` : ''}。`;
      b = housing
        ? `**${n}** 是艾欧泽亚的住宅区${reg ? `（**${reg}**）` : ''}，居民在此拥有房屋与公寓、安家落户，是个适合居住、打理庭院、招待朋友的宁静社区。游戏内名称：${m.en}。`
        : `**${n}** 是城市的一处区域${reg ? `（**${reg}**）` : ''}，居民在此购物、碰面、过日常生活的热闹地带。游戏内名称：${m.en}。`;
    } else {
      s = housing ? `住宅區${reg ? `（${reg}）` : ''}。` : `城市區域${reg ? `（${reg}）` : ''}。`;
      b = housing
        ? `**${n}** 是艾歐澤亞的住宅區${reg ? `（**${reg}**）` : ''}，居民在此擁有房屋與公寓、安家落戶，是個適合居住、打理庭院、招待朋友的寧靜社區。遊戲內名稱：${m.en}。`
        : `**${n}** 是城市的一處區域${reg ? `（**${reg}**）` : ''}，居民在此購物、碰面、過日常生活的熱鬧地帶。遊戲內名稱：${m.en}。`;
    }
    fs.writeFileSync(path.join(dir, `${loc}.md`), md(n, s, b));
  }
  created++;
}
console.log(`gen-settlements：新增 ${created}，跳過 ${skipped}。共 ${data.length} 個城市區域／住宅區。`);
