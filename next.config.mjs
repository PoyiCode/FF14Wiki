/** @type {import('next').NextConfig} */
// 部署到 GitHub Pages 專案頁（poyicode.github.io/ff14wiki/）時，
// 由 deploy workflow 設定 PAGES_BASE_PATH=/ff14wiki；本地開發時為空。
const basePath = process.env.PAGES_BASE_PATH || '';

const nextConfig = {
  // 靜態輸出：產生純靜態檔案到 out/，可直接部署到任何靜態主機 (GitHub Pages 等)。
  output: 'export',
  images: { unoptimized: true },
  // 讓網址結尾帶斜線，靜態主機的資料夾式路由比較穩定。
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
