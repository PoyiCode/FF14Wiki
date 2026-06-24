/** @type {import('next').NextConfig} */
const nextConfig = {
  // 靜態輸出：產生純靜態檔案到 out/，可直接部署到任何靜態主機 (GitHub Pages 等)。
  output: 'export',
  images: { unoptimized: true },
  // 讓網址結尾帶斜線，靜態主機的資料夾式路由比較穩定。
  trailingSlash: true,
};

export default nextConfig;
