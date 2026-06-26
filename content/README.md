# content/ — 知識庫資料規範

這個資料夾是整個 wiki 的**唯一真實來源 (source of truth)**。未來的 FF14 居民 bot 所連接的 AI agent 會讀取這裡的資料來做決策；Next.js 網站只是把這些資料呈現出來。

## 目錄結構

```
content/
  <category>/
    <slug>/
      meta.yaml      # 語言中立的結構化事實
      zh-TW.md       # 繁體中文：標題 + 摘要 + 內文
      zh-CN.md       # 簡體中文
      ja.md          # 日文
      en.md          # 英文
  _sources.yaml      # 資料版本與來源（provenance，非條目）
```

> **資料版本**：批次條目所依據的遊戲版本與各資料來源的釘選 commit 記在 `content/_sources.yaml`（目前 FFXIV **7.51h2 / Dawntrail**）。重跑生成器更新資料後，請一併更新該檔。

- `<category>`：必須是下列八種之一 —
  `world`、`locations`、`lore`、`culture`、`personas`、`activities`、`emotes`、`glossary`。
  （定義在 `src/lib/config.ts`，新增分類請同步修改該檔與 `scripts/validate-content.mjs`。）
- `<slug>`：條目的穩定識別碼，全小寫、用連字號 `-`。等同 `meta.id`。

## 兩種檔案、兩種用途

知識庫刻意把「**事實**」與「**敘述**」分開，對應 agent 使用 wiki 的兩種方式：

| 檔案 | 內容 | agent 怎麼用 |
| --- | --- | --- |
| `meta.yaml` | 語言中立的結構化資料：座標、傳送點、tags、關聯 | **做決策**：去哪裡、和什麼相關、能做什麼 |
| `<locale>.md` | 各語言的標題、摘要、別名、散文內文 | **回覆玩家**：用對應語言生成自然的對白 |

### `meta.yaml`（必填 `id`、`category`）

```yaml
id: limsa-lominsa          # 與資料夾同名
category: world
type: city-state           # 條目細分類型（自由字串）
region: la-noscea
coords: { x: 9.5, y: 11.0 } # 遊戲內地圖座標（選填）
aetheryte: Limsa Lominsa Lower Decks  # 傳送點用「遊戲內英文名」當語言中立識別碼
tags: [city, port]
related: [la-noscea, fishing-spots/cedarwood]  # 其他條目的 id 或 category/id
status: stable             # stable | draft
```

> 規則：所有**語言中立識別碼**（傳送點名、emote 指令、種族、`related` 目標）一律用遊戲內**英文原名 / 英文 slug**，這樣 agent 跨語言比對才不會出錯。中文/日文名稱放在各語言的 `.md` 裡。

> **`related` 兩種形式**：裸 `id`（須全庫唯一）或限定式 `category/id`。`id` 只在**分類內**唯一，不同分類可能同名（如魚 `syldra` 與坐騎 `syldra`），裸 id 指向這類目標會歧義。**跨分類連結請用 `category/id`**（如 `fishing-spots/cedarwood`、`professions/armorer`）。`npm run validate` 會警告「指向跨分類同名 id 的裸 related」。

### `<locale>.md`（frontmatter 必填 `title`）

```markdown
---
title: 利姆薩·羅敏薩
summary: 一句話描述，會顯示在列表卡片上。
aliases: [海都, Limsa]      # 玩家可能用到的別名，供比對
---

Markdown 內文。寫給「居民視角」——這個地方/概念對一名居民意味著什麼。
```

## 慣例

- **四語盡量補齊**，但允許缺漏：網站會自動退回其他已有語言並標示。
- 同一條目各語言的 `meta.yaml` 只有一份（共用），不要把結構化事實重複寫進 frontmatter。
- 內容聚焦在**非遊戲性**的居民生活：地理、地點、世界觀、社交、人設、日常、emote、用語。不要寫戰鬥數值、副本攻略、裝備配裝等。
- 新增條目後執行 `npm run validate` 確認結構正確。
