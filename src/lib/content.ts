// 知識庫讀取層。網站建置時 (Node 環境) 讀取 content/ 下的檔案。
// 資料模型：content/<category>/<slug>/
//   - meta.yaml      語言中立的結構化事實 (座標、傳送點、tags、related…) — agent 做決策用
//   - <locale>.md    各語言的標題與內文 (frontmatter + Markdown) — agent 回覆玩家用
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { CATEGORY_KEYS, LOCALES, type Locale } from './config';

export const CONTENT_DIR = path.join(process.cwd(), 'content');

// meta.yaml 的結構（欄位多為選填，依分類而定）。
export interface EntryMeta {
  id: string;
  category: string;
  type?: string;
  region?: string;
  coords?: { x: number; y: number };
  aetheryte?: string;
  tags?: string[];
  related?: string[];
  status?: 'stable' | 'draft';
  [key: string]: unknown;
}

// 單一語言的 frontmatter。
export interface LocaleFront {
  title: string;
  summary?: string;
  aliases?: string[];
}

export interface Entry {
  meta: EntryMeta;
  slug: string;
  category: string;
  // 每個語言的標題/摘要/別名/內文；缺漏的語言不會出現在 map 中。
  locales: Partial<Record<Locale, LocaleFront & { body: string }>>;
}

function readEntry(category: string, slug: string): Entry | null {
  const dir = path.join(CONTENT_DIR, category, slug);
  const metaPath = path.join(dir, 'meta.yaml');
  if (!fs.existsSync(metaPath)) return null;

  const meta = yaml.load(fs.readFileSync(metaPath, 'utf8')) as EntryMeta;
  meta.id ??= slug;
  meta.category ??= category;

  const locales: Entry['locales'] = {};
  for (const loc of LOCALES) {
    const mdPath = path.join(dir, `${loc}.md`);
    if (!fs.existsSync(mdPath)) continue;
    const { data, content } = matter(fs.readFileSync(mdPath, 'utf8'));
    locales[loc] = { ...(data as LocaleFront), body: content.trim() };
  }

  return { meta, slug, category, locales };
}

export function getEntries(category: string): Entry[] {
  const dir = path.join(CONTENT_DIR, category);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => readEntry(category, d.name))
    .filter((e): e is Entry => e !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getAllEntries(): Entry[] {
  return CATEGORY_KEYS.flatMap((c) => getEntries(c));
}

export function getEntry(category: string, slug: string): Entry | null {
  return readEntry(category, slug);
}

// 取某語言的顯示欄位，缺漏時退回其他已有語言（避免網站出現空白）。
export function pickLocale(
  entry: Entry,
  locale: Locale,
): (LocaleFront & { body: string; resolvedLocale: Locale }) | null {
  const order: Locale[] = [locale, ...LOCALES.filter((l) => l !== locale)];
  for (const loc of order) {
    const data = entry.locales[loc];
    if (data) return { ...data, resolvedLocale: loc };
  }
  return null;
}
