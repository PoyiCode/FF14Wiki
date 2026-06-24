import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SiteHeader from '@/components/SiteHeader';
import { CATEGORY_KEYS, LOCALES, LOCALE_LABELS, getCategory, type Locale } from '@/lib/config';
import { getEntries, getEntry, pickLocale } from '@/lib/content';

export function generateStaticParams() {
  return LOCALES.flatMap((lang) =>
    CATEGORY_KEYS.flatMap((category) =>
      getEntries(category).map((entry) => ({ lang, category, slug: entry.slug })),
    ),
  );
}

// 顯示 meta.yaml 中對 agent / 讀者有用的結構化欄位。
const META_ROWS: { key: string; label: string }[] = [
  { key: 'type', label: '類型' },
  { key: 'region', label: '地區' },
  { key: 'aetheryte', label: '傳送點' },
  { key: 'coords', label: '座標' },
  { key: 'command', label: '指令' },
];

export default function EntryPage({
  params,
}: {
  params: { lang: string; category: string; slug: string };
}) {
  const lang = params.lang as Locale;
  const cat = getCategory(params.category);
  if (!LOCALES.includes(lang) || !cat) notFound();

  const entry = getEntry(cat.key, params.slug);
  if (!entry) notFound();

  const view = pickLocale(entry, lang);
  if (!view) notFound();

  const links = Object.fromEntries(
    LOCALES.map((l) => [l, `/${l}/${cat.key}/${entry.slug}/`]),
  ) as Record<Locale, string>;

  const tags = entry.meta.tags ?? [];

  return (
    <>
      <SiteHeader locale={lang} links={links} />
      <div className="container">
        <div className="crumbs">
          <Link href={`/${lang}/`}>首頁</Link> /{' '}
          <Link href={`/${lang}/${cat.key}/`}>{cat.label[lang]}</Link> / {view.title}
        </div>

        {view.resolvedLocale !== lang && (
          <p className="fallback-note">
            （此條目尚無 {LOCALE_LABELS[lang]} 版本，顯示 {LOCALE_LABELS[view.resolvedLocale]}）
          </p>
        )}

        <h1>{view.title}</h1>
        {view.summary && <p className="summary">{view.summary}</p>}

        <div className="meta-box">
          <div className="row">
            <span className="k">id</span>
            <code>{entry.meta.id}</code>
          </div>
          {META_ROWS.map(({ key, label }) => {
            const v = entry.meta[key];
            if (v == null) return null;
            const text =
              key === 'coords' && typeof v === 'object'
                ? `(${(v as { x: number; y: number }).x}, ${(v as { x: number; y: number }).y})`
                : String(v);
            return (
              <div className="row" key={key}>
                <span className="k">{label}</span>
                <span>{text}</span>
              </div>
            );
          })}
        </div>

        {tags.length > 0 && (
          <div className="tags">
            {tags.map((t) => (
              <span className="tag" key={t}>
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{view.body}</ReactMarkdown>
        </div>
      </div>
    </>
  );
}

export const dynamicParams = false;
