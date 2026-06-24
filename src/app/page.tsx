import Link from 'next/link';
import { LOCALES, LOCALE_LABELS } from '@/lib/config';

// 根頁：簡單的語言選擇入口（靜態輸出不便用 redirect）。
export default function Home() {
  return (
    <div className="container">
      <h1>FF14 居民 Wiki</h1>
      <p className="summary">FFXIV 居民 bot 知識庫 — 選擇語言開始瀏覽。</p>
      <div className="grid">
        {LOCALES.map((loc) => (
          <Link key={loc} href={`/${loc}/`} className="card">
            <div className="title">{LOCALE_LABELS[loc]}</div>
            <div className="desc">{loc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
