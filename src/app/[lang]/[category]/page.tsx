import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import { CATEGORY_KEYS, LOCALES, getCategory, type Locale } from '@/lib/config';
import { getEntries, pickLocale } from '@/lib/content';

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => CATEGORY_KEYS.map((category) => ({ lang, category })));
}

export default function CategoryPage({ params }: { params: { lang: string; category: string } }) {
  const lang = params.lang as Locale;
  const cat = getCategory(params.category);
  if (!LOCALES.includes(lang) || !cat) notFound();

  const entries = getEntries(cat.key);
  const links = Object.fromEntries(
    LOCALES.map((l) => [l, `/${l}/${cat.key}/`]),
  ) as Record<Locale, string>;

  return (
    <>
      <SiteHeader locale={lang} links={links} />
      <div className="container">
        <div className="crumbs">
          <Link href={`/${lang}/`}>首頁</Link> / {cat.label[lang]}
        </div>
        <h1>{cat.label[lang]}</h1>
        <p className="summary">{cat.description[lang]}</p>
        <div className="grid">
          {entries.map((entry) => {
            const view = pickLocale(entry, lang);
            return (
              <Link key={entry.slug} href={`/${lang}/${cat.key}/${entry.slug}/`} className="card">
                <div className="title">{view?.title ?? entry.slug}</div>
                {view?.summary && <div className="desc">{view.summary}</div>}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export const dynamicParams = false;
