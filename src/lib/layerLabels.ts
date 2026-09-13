// レイヤーIDはベーススタイルごとに命名規則が異なり網羅的な対訳表は作れないため、
// トークン単位のキーワード変換による意訳を行う（完全な翻訳ではなく目安表示）。

const PHRASE_DICT: Record<string, string> = {
  "national park": "国立公園",
  "nature reserve": "自然保護区",
  "us interstate": "米国州間高速道路",
  "non us": "海外仕様",
  "city capital": "首都",
  "one way": "一方通行",
};

const TOKEN_DICT: Record<string, string> = {
  background: "背景",
  raster: "ラスタータイル",
  gsi: "地理院",
  osm: "OSM",
  water: "水域",
  waterway: "水路",
  watername: "水域名",
  ocean: "海洋",
  sea: "海",
  lake: "湖",
  river: "河川",
  shadow: "影",
  landcover: "土地被覆",
  landuse: "土地利用",
  residential: "住宅地",
  park: "公園",
  building: "建物",
  buildings: "建物",
  top: "上面",
  boundary: "境界",
  admin: "行政界",
  county: "郡",
  state: "都道府県",
  province: "都道府県",
  country: "国",
  inner: "内側",
  outline: "輪郭",
  aeroway: "空港施設",
  airport: "空港",
  runway: "滑走路",
  taxiway: "誘導路",
  tunnel: "トンネル",
  bridge: "橋",
  road: "道路",
  roads: "道路",
  highway: "幹線道路",
  rail: "鉄道",
  railway: "鉄道",
  dash: "破線",
  line: "線",
  service: "生活道路",
  minor: "生活道路",
  sec: "地方道",
  secondary: "地方道",
  pri: "主要道路",
  primary: "主要道路",
  tertiary: "地方道",
  trunk: "国道",
  major: "主要",
  mot: "高速道路",
  motorway: "高速道路",
  link: "ランプ",
  ramp: "ランプ",
  noramp: "本線",
  case: "縁取り",
  fill: "塗り",
  path: "歩道・小道",
  track: "小道",
  name: "名称",
  shield: "番号標識",
  label: "ラベル",
  labels: "ラベル",
  place: "地名",
  places: "地名",
  hamlet: "集落",
  suburb: "郊外",
  suburbs: "郊外",
  village: "村",
  villages: "村",
  town: "町",
  city: "市",
  cities: "市",
  capital: "首都",
  continent: "大陸",
  poi: "施設",
  pois: "施設",
  transit: "交通機関",
  ferry: "フェリー",
  other: "その他",
  glacier: "氷河",
  sand: "砂地",
  wood: "森林",
  forest: "森林",
  grass: "草地",
  farmland: "農地",
  golf: "ゴルフ場",
  cemetery: "墓地",
  text: "文字",
  icon: "アイコン",
  arrow: "矢印",
  opposite: "逆方向",
  us: "米国",
  way: "方向",
};

function tokenize(layerId: string): string[] {
  return layerId
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function describeLayer(layerId: string): string {
  const tokens = tokenize(layerId);
  if (tokens.length === 0) return layerId;

  const words: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    const two = tokens.slice(i, i + 2).join(" ");
    if (PHRASE_DICT[two]) {
      words.push(PHRASE_DICT[two]);
      i += 2;
      continue;
    }

    const tok = tokens[i];
    const rankMatch = tok.match(/^r(\d+)$/);
    if (rankMatch) {
      words.push(`優先度${rankMatch[1]}`);
      i += 1;
      continue;
    }
    if (/^\d+$/.test(tok) && words.length > 0) {
      words.push(`第${tok}水準`);
      i += 1;
      continue;
    }

    words.push(TOKEN_DICT[tok] ?? tok);
    i += 1;
  }

  return words.join("・");
}
