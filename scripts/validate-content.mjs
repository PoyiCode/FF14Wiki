#!/usr/bin/env node
// 驗證 content/ 結構是否符合知識庫規範。CI 與本地皆可用：`npm run validate`。
// 錯誤 (✖) 會讓程序以非零結束；警告 (⚠) 只提示（wiki 本就會逐步補齊）。
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'];
const CATEGORIES = [
  'world', 'locations', 'lore', 'culture',
  'personas', 'activities', 'emotes', 'glossary', 'weather', 'mounts',
  'minions', 'music', 'titles', 'dyes', 'ornaments', 'triple-triad',
  'sightseeing', 'food', 'furniture', 'garden', 'hairstyles', 'fish',
  'facewear', 'fishing-spots', 'instruments', 'barding', 'online-status',
  'gardening',
];
const CONTENT_DIR = path.join(process.cwd(), 'content');

let errors = 0;
let warnings = 0;
const err = (m) => { console.error(`  ✖ ${m}`); errors++; };
const warn = (m) => { console.warn(`  ⚠ ${m}`); warnings++; };

const knownIds = new Set();
const referenced = []; // { id, where }

for (const category of CATEGORIES) {
  const dir = path.join(CONTENT_DIR, category);
  if (!fs.existsSync(dir)) continue;
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const slug = d.name;
    const entryDir = path.join(dir, slug);
    const rel = `${category}/${slug}`;

    const metaPath = path.join(entryDir, 'meta.yaml');
    if (!fs.existsSync(metaPath)) { err(`${rel}: 缺少 meta.yaml`); continue; }

    let meta;
    try { meta = yaml.load(fs.readFileSync(metaPath, 'utf8')) ?? {}; }
    catch (e) { err(`${rel}/meta.yaml: YAML 解析失敗 — ${e.message}`); continue; }

    if (!meta.id) err(`${rel}: meta.yaml 缺少 id`);
    else if (meta.id !== slug) warn(`${rel}: meta.id (${meta.id}) 與資料夾名不一致`);
    if (meta.category && meta.category !== category) warn(`${rel}: meta.category (${meta.category}) 與所在分類不一致`);
    if (meta.id) knownIds.add(meta.id);
    for (const r of meta.related ?? []) referenced.push({ id: r, where: rel });

    const present = LOCALES.filter((l) => fs.existsSync(path.join(entryDir, `${l}.md`)));
    if (present.length === 0) err(`${rel}: 沒有任何語言檔 (<locale>.md)`);
    for (const loc of present) {
      const { data } = matter(fs.readFileSync(path.join(entryDir, `${loc}.md`), 'utf8'));
      if (!data.title) err(`${rel}/${loc}.md: frontmatter 缺少 title`);
    }
    const missing = LOCALES.filter((l) => !present.includes(l));
    if (missing.length) warn(`${rel}: 尚缺語言 ${missing.join(', ')}`);
  }
}

for (const { id, where } of referenced) {
  if (!knownIds.has(id)) warn(`${where}: related 參照到不存在的 id「${id}」`);
}

console.log(`\n驗證完成：${knownIds.size} 個條目，${errors} 個錯誤，${warnings} 個警告。`);
process.exit(errors > 0 ? 1 : 0);
