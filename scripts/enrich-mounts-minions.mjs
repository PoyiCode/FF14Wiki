#!/usr/bin/env node
// 為既有的 mounts／minions 條目補上官方道具敘述（lore）。
// 來源：xivapi/ffxiv-datamining 的 MountTransient／CompanionTransient.Description
// （英/日原文；簡中取自 thewakingsands，繁中以 OpenCC 由簡轉繁），預先整理成
// scripts/{mount,minion}-desc-data.json（slug → 各語敘述）。
// 冪等且只追加：若該語 .md 已包含此敘述就跳過，絕不覆蓋既有內容。
import fs from 'node:fs';
import path from 'node:path';
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const JOBS = [
  { folder: 'mounts', data: 'mount-desc-data.json' },
  { folder: 'minions', data: 'minion-desc-data.json' },
];
let enriched = 0, already = 0, missing = 0;
for (const job of JOBS) {
  const map = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', job.data), 'utf8'));
  const base = path.join(process.cwd(), 'content', job.folder);
  for (const [slug, desc] of Object.entries(map)) {
    const dir = path.join(base, slug);
    if (!fs.existsSync(dir)) { missing++; continue; }
    for (const loc of LOCALES) {
      const text = desc[loc] || desc.en;
      if (!text) continue;
      const file = path.join(dir, `${loc}.md`);
      if (!fs.existsSync(file)) continue;
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes(text)) { already++; continue; }
      fs.writeFileSync(file, content.replace(/\n*$/, '') + '\n\n' + text + '\n');
      enriched++;
    }
  }
}
console.log(`enrich-mounts-minions：補上敘述 ${enriched} 個檔，已存在跳過 ${already}，缺資料夾 ${missing}。`);
