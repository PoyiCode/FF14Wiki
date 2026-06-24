# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案目的

這個 repo 是一個 **FF14（Final Fantasy XIV）居民 wiki / 知識庫**。最終用途：未來會有一個 FF14 bot，bot 連接一個 AI agent，agent 讀取本 wiki 的資料來**自主決策**——決定要做什麼、在艾歐澤亞各地旅遊、回覆玩家訊息，像一名真正的「居民」一樣生活。

關鍵範圍限制：bot 做的事**與遊戲性無關**（不戰鬥、不採集、不打副本）。因此知識庫只收錄居民會用到的世界知識：地理、地點、世界觀、社交禮儀、人設、日常活動、emote、用語。**不要**寫戰鬥數值、副本攻略、配裝等遊戲性內容。

這個 repo 只包含 **wiki 資料** + 一個 **Next.js 靜態網站**（用來瀏覽資料）。bot 與 AI agent 本身的程式碼在其他 repo。

## 架構（big picture）

資料與呈現分離，`content/` 是唯一真實來源；網站只是 viewer：

- **`content/`** — 知識庫資料（給 AI agent 讀取的真正產物）。規範詳見 `content/README.md`。
- **`src/lib/config.ts`** — 全站單一設定來源：四種語言 `LOCALES`（`zh-TW`/`zh-CN`/`ja`/`en`）與八種分類 `CATEGORIES`。**新增語言或分類時，這裡是改動的起點**，並要同步 `scripts/validate-content.mjs` 的常數。
- **`src/lib/content.ts`** — 建置時的讀取層，把 `content/` 解析成型別化的 `Entry`。`pickLocale()` 會在缺某語言時自動退回其他語言。
- **`src/app/`** — Next.js App Router 頁面，全部靜態輸出（`output: 'export'`）。動態路由靠 `generateStaticParams()` 列舉所有 語言×分類×條目 的組合。

### 資料模型（最重要的設計，需讀多個檔才懂）

每個條目是一個資料夾 `content/<category>/<slug>/`，內含兩種檔案，刻意對應 agent 使用 wiki 的兩種方式：

| 檔案 | 內容 | agent 用途 |
| --- | --- | --- |
| `meta.yaml` | **語言中立**的結構化事實（座標、傳送點、tags、`related`） | **做決策**：去哪、與什麼相關 |
| `<locale>.md` | 各語言的 `title`/`summary`/`aliases` + Markdown 內文 | **回覆玩家**：生成自然對白 |

每個條目的 `meta.yaml` 只有一份（四語共用），結構化事實**不要**重複寫進各語言的 frontmatter，避免漂移。

> **語言中立識別碼一律用遊戲內英文原名 / 英文 slug**（傳送點名、emote 指令、種族、`related` 目標、`slug`/`id`）。中文、日文名稱只放在各語言 `.md`。這是 agent 能跨語言正確比對的前提。

## 常用指令

```bash
npm run dev        # 本地開發伺服器 (localhost:3000)
npm run build      # 靜態輸出到 out/
npm run validate   # 驗證 content/ 結構（CI 必跑；錯誤會非零退出，警告僅提示）
npm run lint       # next lint
```

新增或修改條目後，先跑 `npm run validate` 再跑 `npm run build`。`validate` 會檢查：每個條目有 `meta.yaml`、`id` 與資料夾同名、至少一個語言檔、frontmatter 有 `title`，並對缺漏語言與失效的 `related` 參照發出警告（warning 不擋建置，因 wiki 本就逐步補齊）。

## 新增條目的流程

1. 建立 `content/<category>/<slug>/meta.yaml`（`id` 必須等於 `<slug>`）。
2. 為各語言建立 `<locale>.md`，frontmatter 至少要有 `title`。四語盡量補齊，但允許先缺。
3. `npm run validate` → `npm run build` 確認通過。

擴充分類或語言時，改 `src/lib/config.ts` 與 `scripts/validate-content.mjs`，兩處的常數要一致。

## emote 條目的特殊處理

`content/emotes/` 下涵蓋遊戲內**全部** emote 指令。批次條目由 `scripts/gen-all-emotes.mjs` 讀取 `scripts/emote-data.json` 生成——該 JSON 源自官方遊戲資料（emote 名稱與 `/指令` 取自 `xivapi/ffxiv-datamining`，簡中名取自 thewakingsands CN 資料，繁中以 OpenCC 由簡轉繁）。生成器**冪等**：資料夾（或其別名指令對應的資料夾）已存在就跳過，因此 `wave`、`bow`、`sit` 等手寫的詳細條目會被保留、不會被覆蓋。要補充某 emote 的細緻說明，直接編輯該條目的 `<locale>.md` 即可（之後重跑生成器也不會蓋掉）。
