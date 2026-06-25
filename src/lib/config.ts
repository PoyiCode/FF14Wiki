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
  {
    key: 'weather',
    label: { 'zh-TW': '天氣', 'zh-CN': '天气', ja: '天候', en: 'Weather' },
    description: {
      'zh-TW': '艾歐澤亞的各種天氣，讓 bot 能自然描述環境、與玩家閒聊天氣。',
      'zh-CN': '艾欧泽亚的各种天气，让 bot 能自然描述环境、与玩家闲聊天气。',
      ja: 'エオルゼアの天候。botが環境を自然に語り、天気の雑談ができるように。',
      en: 'The weathers of Eorzea, so the bot can describe its surroundings and chat about the weather.',
    },
  },
  {
    key: 'mounts',
    label: { 'zh-TW': '坐騎', 'zh-CN': '坐骑', ja: 'マウント', en: 'Mounts' },
    description: {
      'zh-TW': '居民代步、旅遊用的坐騎，也是玩家常炫耀、可閒聊的話題。',
      'zh-CN': '居民代步、旅游用的坐骑，也是玩家常炫耀、可闲聊的话题。',
      ja: '住民の移動や旅に使う乗り物（マウント）。プレイヤーが見せ合う話題にも。',
      en: 'Mounts residents ride to get around — also a favourite thing for players to show off and chat about.',
    },
  },
  {
    key: 'minions',
    label: { 'zh-TW': '寵物', 'zh-CN': '宠物', ja: 'ミニオン', en: 'Minions' },
    description: {
      'zh-TW': '跟在居民身邊的小寵物（ミニオン），點綴日常、也是玩家收藏炫耀與閒聊的話題。',
      'zh-CN': '跟在居民身边的小宠物（ミニオン），点缀日常、也是玩家收藏炫耀与闲聊的话题。',
      ja: '住民の傍らに連れ歩く小さなミニオン。日常を彩り、プレイヤーが集めて見せ合う話題にも。',
      en: 'The little minions that follow a resident around — companions that brighten daily life and a favourite thing for players to collect and chat about.',
    },
  },
  {
    key: 'music',
    label: { 'zh-TW': '音樂', 'zh-CN': '音乐', ja: '音楽', en: 'Music' },
    description: {
      'zh-TW': '艾歐澤亞的樂曲（管弦樂機關／Orchestrion），讓 bot 能聊喜歡的曲子、哼歌、描述場景的配樂。',
      'zh-CN': '艾欧泽亚的乐曲（管弦乐机关／Orchestrion），让 bot 能聊喜欢的曲子、哼歌、描述场景的配乐。',
      ja: 'エオルゼアの楽曲（オーケストリオン）。botが好きな曲を語り、口ずさみ、情景の音楽を描けるように。',
      en: 'The music of Eorzea (orchestrion rolls), so the bot can chat about favourite tracks, hum tunes, and describe the score of a scene.',
    },
  },
  {
    key: 'titles',
    label: { 'zh-TW': '稱號', 'zh-CN': '称号', ja: '称号', en: 'Titles' },
    description: {
      'zh-TW': '冒險者掛在名字前後的稱號，是身分與成就的象徵，也是居民閒聊與自我介紹的話題。',
      'zh-CN': '冒险者挂在名字前后的称号，是身份与成就的象征，也是居民闲聊与自我介绍的话题。',
      ja: '名前の前後に表示される称号。身分や実績の象徴で、住民の雑談や自己紹介の話題にも。',
      en: 'The titles adventurers display before or after their name — marks of identity and achievement, and a topic for a resident to chat about or introduce themselves with.',
    },
  },
  {
    key: 'dyes',
    label: { 'zh-TW': '染料', 'zh-CN': '染料', ja: 'カララント', en: 'Dyes' },
    description: {
      'zh-TW': '為裝備與幻化上色的染料色彩，讓 bot 能描述自己的穿搭、聊配色與時尚。',
      'zh-CN': '为装备与幻化上色的染料色彩，让 bot 能描述自己的穿搭、聊配色与时尚。',
      ja: '装備やミラプリを染めるカララント（染料）の色。botが自分の装いを語り、配色やファッションを話せるように。',
      en: 'The dye colours used to tint gear and glamours, so the bot can describe its own outfit and chat about colour and fashion.',
    },
  },
  {
    key: 'ornaments',
    label: { 'zh-TW': '時尚配飾', 'zh-CN': '时尚配饰', ja: 'ファッションアクセサリー', en: 'Ornaments' },
    description: {
      'zh-TW': '陽傘、翅膀、光環等可穿戴的時尚配飾，讓 bot 能裝扮自己、擺拍與聊時尚。',
      'zh-CN': '阳伞、翅膀、光环等可穿戴的时尚配饰，让 bot 能装扮自己、摆拍与聊时尚。',
      ja: 'パラソル・翼・光輪などの装えるファッションアクセサリー。botが着飾り、ポーズを取り、ファッションを語れるように。',
      en: 'Wearable fashion accessories like parasols, wings and halos, so the bot can dress up, pose and chat about fashion.',
    },
  },
  {
    key: 'triple-triad',
    label: { 'zh-TW': '幻卡', 'zh-CN': '幻卡', ja: 'トリプルトライアド', en: 'Triple Triad' },
    description: {
      'zh-TW': '金碟遊樂場的幻卡（Triple Triad）卡牌與其背景故事，居民最愛的桌上小遊戲與收藏話題。',
      'zh-CN': '金碟游乐场的幻卡（Triple Triad）卡牌与其背景故事，居民最爱的桌上小游戏与收藏话题。',
      ja: 'ゴールドソーサーのトリプルトライアドのカードと背景設定。住民が遊び、集める人気のテーブルゲーム。',
      en: 'The Triple Triad cards of the Gold Saucer and their lore — a favourite tabletop game for residents to play and collect.',
    },
  },
  {
    key: 'sightseeing',
    label: { 'zh-TW': '觀光景點', 'zh-CN': '观光景点', ja: '観光スポット', en: 'Sightseeing' },
    description: {
      'zh-TW': '探險手帳收錄的風景名勝：在特定地點、時段與天氣下擺出指定動作欣賞的美景，是 bot 規劃旅遊與觀光的依據。',
      'zh-CN': '探险手账收录的风景名胜：在特定地点、时段与天气下摆出指定动作欣赏的美景，是 bot 规划旅游与观光的依据。',
      ja: '探検手帳に載る名所・絶景。特定の場所・時間帯・天候で指定のしぐさを取って眺める風景。botの観光・旅の計画の基礎。',
      en: 'The vistas of the Sightseeing Log — scenic spots viewed by striking a set pose at a given place, time and weather. The basis for the bot to plan trips and sightseeing.',
    },
  },
  {
    key: 'food',
    label: { 'zh-TW': '料理', 'zh-CN': '料理', ja: '料理', en: 'Food' },
    description: {
      'zh-TW': '艾歐澤亞的各式料理與其風味，讓 bot 能聊愛吃的菜、在酒館點餐、描述食物香氣。',
      'zh-CN': '艾欧泽亚的各式料理与其风味，让 bot 能聊爱吃的菜、在酒馆点餐、描述食物香气。',
      ja: 'エオルゼアの料理とその風味。botが好物を語り、酒場で注文し、料理の香りを描けるように。',
      en: 'The dishes of Eorzea and their flavours, so the bot can chat about favourite foods, order at a tavern, and describe a meal.',
    },
  },
  {
    key: 'furniture',
    label: { 'zh-TW': '家具', 'zh-CN': '家具', ja: '家具', en: 'Furniture' },
    description: {
      'zh-TW': '居民布置房屋用的家具與擺設，讓 bot 能聊自己的家、描述室內裝潢與收藏。',
      'zh-CN': '居民布置房屋用的家具与摆设，让 bot 能聊自己的家、描述室内装潢与收藏。',
      ja: '住民が家を飾る家具・調度品。botが自分の家を語り、内装やコレクションを描けるように。',
      en: 'The furnishings residents use to decorate their homes, so the bot can talk about its own home, interior decor and collections.',
    },
  },
  {
    key: 'garden',
    label: { 'zh-TW': '庭園造景', 'zh-CN': '庭园造景', ja: 'エクステリア', en: 'Garden' },
    description: {
      'zh-TW': '居民布置房屋外觀與庭院用的戶外造景與庭具，讓 bot 能聊自家庭園、描述屋外風景。',
      'zh-CN': '居民布置房屋外观与庭院用的户外造景与庭具，让 bot 能聊自家庭园、描述屋外风景。',
      ja: '住民が家の外観や庭を飾るエクステリア・庭具。botが自宅の庭を語り、屋外の景観を描けるように。',
      en: 'The outdoor furnishings residents use to decorate their home exteriors and gardens, so the bot can talk about its own garden and yard.',
    },
  },
  {
    key: 'hairstyles',
    label: { 'zh-TW': '髮型', 'zh-CN': '发型', ja: '髪型', en: 'Hairstyles' },
    description: {
      'zh-TW': '居民可換的髮型樣式，讓 bot 能描述自己的外貌、聊造型與打扮。',
      'zh-CN': '居民可换的发型样式，让 bot 能描述自己的外貌、聊造型与打扮。',
      ja: '住民が変えられる髪型のスタイル。botが自分の見た目を語り、スタイルや身だしなみを話せるように。',
      en: 'The hairstyles residents can wear, so the bot can describe its own look and chat about style and grooming.',
    },
  },
  {
    key: 'fish',
    label: { 'zh-TW': '魚類', 'zh-CN': '鱼类', ja: '魚', en: 'Fish' },
    description: {
      'zh-TW': '艾歐澤亞水域的魚類與水生生物及其生態，讓 bot 能聊釣魚、描述漁獲與水邊風物。',
      'zh-CN': '艾欧泽亚水域的鱼类与水生生物及其生态，让 bot 能聊钓鱼、描述渔获与水边风物。',
      ja: 'エオルゼアの水域に棲む魚や水生生物とその生態。botが釣りを語り、釣果や水辺の風物を描けるように。',
      en: 'The fish and aquatic life of Eorzea’s waters and their lore, so the bot can chat about fishing and describe a catch.',
    },
  },
  {
    key: 'facewear',
    label: { 'zh-TW': '臉部裝飾', 'zh-CN': '面部配饰', ja: 'フェイスウェア', en: 'Facewear' },
    description: {
      'zh-TW': '眼鏡、眼罩等可戴在臉上的裝飾，讓 bot 能描述自己的造型、聊配件搭配。',
      'zh-CN': '眼镜、眼罩等可戴在脸上的装饰，让 bot 能描述自己的造型、聊配件搭配。',
      ja: 'メガネやアイマスクなど顔につけるフェイスウェア。botが自分の装いを語り、小物使いを話せるように。',
      en: 'Facewear like glasses and eyepatches worn on the face, so the bot can describe its look and chat about accessorising.',
    },
  },
  {
    key: 'fishing-spots',
    label: { 'zh-TW': '釣場', 'zh-CN': '钓场', ja: '釣り場', en: 'Fishing Spots' },
    description: {
      'zh-TW': '艾歐澤亞各地的釣場與能在該處釣到的魚，連結地點與魚類，是 bot 規劃釣魚行程的依據。',
      'zh-CN': '艾欧泽亚各地的钓场与能在该处钓到的鱼，连结地点与鱼类，是 bot 规划钓鱼行程的依据。',
      ja: 'エオルゼア各地の釣り場と、そこで釣れる魚。場所と魚を結び、botの釣り計画の基礎となる。',
      en: 'The fishing holes across Eorzea and the fish you can catch at each, linking places to fish — the basis for the bot to plan a fishing trip.',
    },
  },
  {
    key: 'instruments',
    label: { 'zh-TW': '樂器', 'zh-CN': '乐器', ja: '楽器', en: 'Instruments' },
    description: {
      'zh-TW': '居民演奏（Performance）時可用的樂器，讓 bot 能在街頭表演、聊音樂演奏與合奏。',
      'zh-CN': '居民演奏（Performance）时可用的乐器，让 bot 能在街头表演、聊音乐演奏与合奏。',
      ja: '住民が演奏（パフォーマンス）で使える楽器。botが街角で演奏し、合奏や音楽を語れるように。',
      en: 'The instruments residents can play in Performance mode, so the bot can busk, jam and chat about making music.',
    },
  },
  {
    key: 'barding',
    label: { 'zh-TW': '陸行鳥馬具', 'zh-CN': '陆行鸟马具', ja: 'バルディング', en: 'Barding' },
    description: {
      'zh-TW': '為自己的陸行鳥夥伴穿戴的鞍具與裝甲，讓 bot 能聊愛駒的打扮與裝飾。',
      'zh-CN': '为自己的陆行鸟伙伴穿戴的鞍具与装甲，让 bot 能聊爱驹的打扮与装饰。',
      ja: '相棒のチョコボに着せる鞍やバルディング。botが愛鳥の装いを語れるように。',
      en: 'The saddles and barding residents dress their chocobo companion in, so the bot can chat about decking out its trusty bird.',
    },
  },
  {
    key: 'online-status',
    label: { 'zh-TW': '線上狀態', 'zh-CN': '在线状态', ja: 'オンラインステータス', en: 'Online Status' },
    description: {
      'zh-TW': '玩家可顯示的線上狀態（角色扮演中、希望組隊、新人冒險者、指導者等），讓 bot 能辨識他人狀態並表達自己的社交狀態。',
      'zh-CN': '玩家可显示的在线状态（角色扮演中、希望组队、新人冒险者、指导者等），让 bot 能辨识他人状态并表达自己的社交状态。',
      ja: 'プレイヤーが表示できるオンラインステータス（ロールプレイ中・パーティ希望・新人・メンターなど）。botが相手の状態を読み、自分の状態を示せるように。',
      en: 'The online statuses players can display (Role-playing, Looking for Party, New Adventurer, Mentor and more), so the bot can read others’ status and signal its own.',
    },
  },
];

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);

export function getCategory(key: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.key === key);
}
