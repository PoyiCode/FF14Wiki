# FF14Wiki

FF14（Final Fantasy XIV）**居民 wiki / 知識庫**，給 AI agent 驅動的「居民」bot 讀取使用。

未來會有一個 FF14 bot 連接 AI agent，agent 讀取本 wiki 的資料，自主決定要做什麼、在艾歐澤亞各地旅遊、像真正的居民一樣回覆玩家訊息。bot 所做的事與遊戲性無關（不戰鬥、不採集）。

## 內容

- **`content/`** — 知識庫資料（唯一真實來源）。每個條目一個資料夾，含語言中立的 `meta.yaml` 與四種語言（繁中／簡中／日／英）的 Markdown。資料規範見 [`content/README.md`](content/README.md)。
- **Next.js 靜態網站** — 用來瀏覽知識庫內容。

## 快速開始

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 靜態輸出到 out/
npm run validate   # 驗證 content/ 結構
```

開發與資料規範細節見 [`CLAUDE.md`](CLAUDE.md)。
