import Link from 'next/link';
import { LOCALES, LOCALE_LABELS, type Locale } from '@/lib/config';

// links: 每個語言對應「切到該語言時應前往的網址」，讓使用者在切語言時停留在同一條目。
export default function SiteHeader({
  locale,
  links,
}: {
  locale: Locale;
  links: Record<Locale, string>;
}) {
  return (
    <header className="site">
      <div className="inner">
        <Link href={`/${locale}/`} className="brand">
          FF14 居民 Wiki
        </Link>
        <nav className="locale-switch">
          {LOCALES.map((loc) => (
            <Link key={loc} href={links[loc]} className={loc === locale ? 'active' : ''}>
              {LOCALE_LABELS[loc]}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
