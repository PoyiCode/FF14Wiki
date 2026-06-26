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
  'gardening', 'housing-fixtures', 'currency', 'professions', 'ingredients',
  'tools',
];
const CONTENT_DIR = path.join(process.cwd(), 'content');

let errors = 0;
let warnings = 0;
const err = (m) => { console.error(`  ✖ ${m}`); errors++; };
const warn = (m) => { console.warn(`  ⚠ ${m}`); warnings++; };

const idCats = new Map(); // id -> Set(category)：偵測跨分類同名 id（related 的歧義來源）
const referenced = []; // { ref, where, srcCat }
let entryCount = 0;     // meta.yaml 資料夾總數（與唯一 id 數不同）

const addId = (id, cat) => {
  if (!idCats.has(id)) idCats.set(id, new Set());
  idCats.get(id).add(cat);
};

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

    entryCount++;
    if (!meta.id) err(`${rel}: meta.yaml 缺少 id`);
    else if (meta.id !== slug) warn(`${rel}: meta.id (${meta.id}) 與資料夾名不一致`);
    if (meta.category && meta.category !== category) warn(`${rel}: meta.category (${meta.category}) 與所在分類不一致`);
    if (meta.id) addId(meta.id, category);
    for (const r of meta.related ?? []) referenced.push({ ref: String(r), where: rel, srcCat: category });

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

// related 參照檢查。支援兩種形式：
//   - 限定式 `category/id`：精確指向某分類的條目（消除跨分類同名歧義）。
//   - 裸 id：須在全庫唯一才不歧義；指向多分類同名 id 時警告，建議改用限定式。
for (const { ref, where, srcCat } of referenced) {
  if (ref.includes('/')) {
    const i = ref.indexOf('/');
    const cat = ref.slice(0, i);
    const id = ref.slice(i + 1);
    const cats = idCats.get(id);
    if (!cats || !cats.has(cat)) warn(`${where}: related 參照到不存在的條目「${ref}」`);
  } else {
    const cats = idCats.get(ref);
    if (!cats) {
      warn(`${where}: related 參照到不存在的 id「${ref}」`);
    } else if (cats.size > 1) {
      warn(`${where}: related「${ref}」跨分類同名（${[...cats].sort().join(', ')}），請改用 ${[...cats].sort().map((c) => `${c}/${ref}`).join(' 或 ')} 限定`);
    }
  }
}

// 跨分類同名 id 統計（資訊性）：related 用裸 id 時的歧義根源。
const collisions = [...idCats.entries()].filter(([, cats]) => cats.size > 1);
if (collisions.length) {
  console.log(`\nℹ 跨分類同名 id：${collisions.length} 個（裸 related 指向這些會有歧義，建議用 category/id）`);
}

console.log(`\n驗證完成：${entryCount} 個條目（${idCats.size} 個唯一 id），${errors} 個錯誤，${warnings} 個警告。`);
process.exit(errors > 0 ? 1 : 0);
