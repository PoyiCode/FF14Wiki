import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FF14 居民 Wiki',
  description: 'FFXIV 居民 bot 知識庫 — 給 AI agent 讀取的世界資料',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
