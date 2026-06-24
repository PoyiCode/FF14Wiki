#!/usr/bin/env node
// 從 scripts/emote-data.json（源自官方遊戲資料：xivapi/ffxiv-datamining 的
// Emote/TextCommand 表，中文名取自 thewakingsands CN 資料，繁中以 OpenCC 由簡轉繁）
// 生成 content/emotes/ 下「所有」emote 條目。
// 冪等：若條目資料夾（或其別名指令對應的資料夾）已存在則跳過，
//       以保留手寫的詳細條目（wave / bow / sit 等）。
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'content', 'emotes');
const DATA = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'emote-data.json'), 'utf8'));
const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const Q = (s) => JSON.stringify(s); // YAML 安全：JSON 雙引號字串為合法 YAML 純量

const cmdPrefix = {
  'zh-TW': (c) => `指令 \`${c}\``,
  'zh-CN': (c) => `指令 \`${c}\``,
  ja: (c) => `コマンドは \`${c}\``,
  en: (c) => `The command is \`${c}\``,
};
const exists = (slug) => fs.existsSync(path.join(ROOT, slug));

let created = 0;
let skipped = 0;
for (const e of DATA) {
  const aliasSlug = e.alias ? e.alias.replace(/^\//, '').toLowerCase() : null;
  if ([e.slug, aliasSlug].filter(Boolean).some(exists)) { skipped++; continue; }

  const dir = path.join(ROOT, e.slug);
  fs.mkdirSync(dir, { recursive: true });

  const aliasLine = e.alias ? `\naliases: [${e.alias}]` : '';
  fs.writeFileSync(
    path.join(dir, 'meta.yaml'),
    `id: ${e.slug}\ncategory: emotes\ntype: emote\ncommand: ${e.command}${aliasLine}\n` +
      `name_en: ${Q(e.n.en)}\ntags: [emote, ${e.category}]\nstatus: stable\n`,
  );

  for (const loc of LOCALES) {
    const name = e.n[loc] || e.n.en;
    const aliasNote = e.alias ? (loc === 'en' ? ` (alias \`${e.alias}\`)` : `（別名 \`${e.alias}\`）`) : '';
    let summary, body;
    if (loc === 'en') {
      summary = `The ${e.n.en} emote (${e.command}).`;
      body = `${cmdPrefix.en(e.command)}${aliasNote}. The ${e.n.en} emote in FFXIV.`;
    } else if (loc === 'ja') {
      summary = `「${e.n.en}」エモート（${e.command}）。`;
      body = `${cmdPrefix.ja(e.command)}${aliasNote}。FFXIVの「${e.n.en}」エモート。`;
    } else {
      const w = loc === 'zh-CN' ? '动作' : '動作';
      summary = `「${e.n.en}」${w} emote（${e.command}）。`;
      body = `${cmdPrefix[loc](e.command)}${aliasNote}。FFXIV 的「${e.n.en}」${w}。`;
    }
    fs.writeFileSync(path.join(dir, `${loc}.md`), `---\ntitle: ${Q(name)}\nsummary: ${Q(summary)}\n---\n\n${body}\n`);
  }
  created++;
}
console.log(`gen-all-emotes：新增 ${created}，跳過（已存在）${skipped}。共 ${DATA.length} 個官方指令。`);
