// 全站共用設定：語言與分類。內容檔案與網站路由都以這裡為準。

export const LOCALES = ['zh-TW', 'zh-CN', 'ja', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'zh-TW';

export const LOCALE_LABELS: Record<Locale, string> = {
  'zh-TW': '繁體中文',
  'zh-CN': '简体中文',
  ja: '日本語',
  en: 'English',
};

// 知識庫分類。key 對應 content/ 下的資料夾名稱。
// 這些分類刻意只涵蓋「居民」會用到的知識，與戰鬥/採集等遊戲性無關。
export interface CategoryDef {
  key: string;
  label: Record<Locale, string>;
  description: Record<Locale, string>;
}

export const CATEGORIES: CategoryDef[] = [
  {
    key: 'world',
    label: { 'zh-TW': '世界地理', 'zh-CN': '世界地理', ja: '世界地理', en: 'World' },
    description: {
      'zh-TW': '地區、城市、傳送點與交通方式，bot 移動旅遊的依據。',
      'zh-CN': '地区、城市、传送点与交通方式，bot 移动旅游的依据。',
      ja: '地域・都市・エーテライト・移動手段。botの移動の基礎。',
      en: 'Regions, cities, aetherytes and travel — the basis for the bot to move around.',
    },
  },
  {
    key: 'locations',
    label: { 'zh-TW': '地點景點', 'zh-CN': '地点景点', ja: 'スポット', en: 'Locations' },
    description: {
      'zh-TW': '酒館、市集、地標、風景點等居民會造訪的具體地點。',
      'zh-CN': '酒馆、市集、地标、风景点等居民会造访的具体地点。',
      ja: '酒場・マーケット・名所など住民が訪れる場所。',
      en: 'Taverns, markets, landmarks and scenic spots a resident would visit.',
    },
  },
  {
    key: 'lore',
    label: { 'zh-TW': '世界觀', 'zh-CN': '世界观', ja: '世界観', en: 'Lore' },
    description: {
      'zh-TW': '國家、勢力、歷史、種族、神祇與曆法等背景知識。',
      'zh-CN': '国家、势力、历史、种族、神祇与历法等背景知识。',
      ja: '国家・勢力・歴史・種族・神々・暦などの背景知識。',
      en: 'Nations, factions, history, races, deities and the calendar.',
    },
  },
  {
    key: 'culture',
    label: { 'zh-TW': '文化社交', 'zh-CN': '文化社交', ja: '文化・社交', en: 'Culture' },
    description: {
      'zh-TW': '問候、禮儀、習俗、節慶與禁忌，決定 bot 的社交舉止。',
      'zh-CN': '问候、礼仪、习俗、节庆与禁忌，决定 bot 的社交举止。',
      ja: '挨拶・礼儀・風習・祭事・タブー。botの振る舞いの基準。',
      en: 'Greetings, etiquette, customs, festivals and taboos that shape behaviour.',
    },
  },
  {
    key: 'personas',
    label: { 'zh-TW': '人物設定', 'zh-CN': '人物设定', ja: 'ペルソナ', en: 'Personas' },
    description: {
      'zh-TW': 'bot 自身的角色設定：背景、性格、說話風格與喜好。',
      'zh-CN': 'bot 自身的角色设定：背景、性格、说话风格与喜好。',
      ja: 'bot自身のキャラ設定：背景・性格・口調・好み。',
      en: 'The bot’s own character: background, personality, voice and preferences.',
    },
  },
  {
    key: 'activities',
    label: { 'zh-TW': '日常活動', 'zh-CN': '日常活动', ja: '日常の活動', en: 'Activities' },
    description: {
      'zh-TW': '觀光、購物、釣魚、看夕陽等非戰鬥的居民日常行為。',
      'zh-CN': '观光、购物、钓鱼、看夕阳等非战斗的居民日常行为。',
      ja: '観光・買い物・釣り・夕日鑑賞などの非戦闘の日常行動。',
      en: 'Sightseeing, shopping, fishing, watching sunsets — non-combat daily life.',
    },
  },
  {
    key: 'emotes',
    label: { 'zh-TW': '情感動作', 'zh-CN': '情感动作', ja: 'エモート', en: 'Emotes' },
    description: {
      'zh-TW': '可用的 emote 與其使用情境，讓 bot 的反應更生動。',
      'zh-CN': '可用的 emote 与其使用情境，让 bot 的反应更生动。',
      ja: '使えるエモートと使用シーン。botの反応を豊かにする。',
      en: 'Available emotes and when to use them, to make reactions lifelike.',
    },
  },
  {
    key: 'glossary',
    label: { 'zh-TW': '術語黑話', 'zh-CN': '术语黑话', ja: '用語集', en: 'Glossary' },
    description: {
      'zh-TW': '遊戲用語與聊天縮寫，幫助 bot 理解與回覆玩家訊息。',
      'zh-CN': '游戏用语与聊天缩写，帮助 bot 理解与回复玩家讯息。',
      ja: 'ゲーム用語とチャット略語。プレイヤーの理解と返信を助ける。',
      en: 'Game terms and chat shorthand to help the bot read and answer players.',
    },
  },
];

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);

export function getCategory(key: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.key === key);
}
