import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import { CATEGORIES, LOCALES, type Locale } from '@/lib/config';
import { getEntries } from '@/lib/content';

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// 與其他路由一致：只輸出 generateStaticParams 列舉的語言，未知語言一律 404。
export const dynamicParams = false;

export default function LocaleHome({ params }: { params: { lang: string } }) {
  const lang = params.lang as Locale;
  if (!LOCALES.includes(lang)) notFound();

  const links = Object.fromEntries(LOCALES.map((l) => [l, `/${l}/`])) as Record<Locale, string>;

  return (
    <>
      <SiteHeader locale={lang} links={links} />
      <div className="container">
        <h1>知識庫分類</h1>
        <p className="summary">給 FF14 居民 bot 的世界資料。點選分類瀏覽條目。</p>
        <div className="grid">
          {CATEGORIES.map((cat) => {
            const count = getEntries(cat.key).length;
            return (
              <Link key={cat.key} href={`/${lang}/${cat.key}/`} className="card">
                <div className="title">
                  {cat.label[lang]} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({count})</span>
                </div>
                <div className="desc">{cat.description[lang]}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
