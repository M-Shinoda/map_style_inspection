import type { LayerSpecification } from "maplibre-gl";

export type ControlKind = "color" | "opacity" | "width";

export interface PropControl {
  key: string;
  kind: ControlKind;
  label: string;
  default: string | number;
  min?: number;
  max?: number;
  step?: number;
}

export interface GroupInstance {
  id: string;
  title: string;
  layerType: string;
  layerIds: string[];
  controls: PropControl[];
}

interface GroupDef {
  id: string;
  title: string;
  match: (hay: string, type: string) => boolean;
}

// 判定順が重要（先勝ち）。id / source-layer 名からレイヤーの役割を推測する。
const GROUP_DEFS: GroupDef[] = [
  { id: "background", title: "背景", match: (_hay, type) => type === "background" },
  { id: "raster", title: "ラスタータイル", match: (_hay, type) => type === "raster" },
  { id: "water", title: "水域", match: (hay) => /water|ocean|lake|river|waterway/.test(hay) },
  {
    id: "building",
    title: "建物",
    match: (hay, type) => /building/.test(hay) && (type === "fill" || type === "fill-extrusion"),
  },
  {
    id: "landcover",
    title: "土地被覆（緑地・公園など）",
    match: (hay) => /landuse|landcover|park|wood|forest|grass|farmland|golf|cemetery|sand|glacier/.test(hay),
  },
  {
    id: "road",
    title: "道路",
    match: (hay, type) =>
      type === "line" &&
      /road|highway|transportation|street|motorway|trunk|primary|secondary|tertiary|path|track|rail|bridge|tunnel|link/.test(
        hay,
      ) &&
      !/boundary/.test(hay),
  },
  { id: "boundary", title: "行政界", match: (hay, type) => type === "line" && /boundary|admin/.test(hay) },
  { id: "label", title: "ラベル", match: (_hay, type) => type === "symbol" },
];

function controlsForType(type: string): PropControl[] {
  switch (type) {
    case "background":
      return [
        { key: "background-color", kind: "color", label: "色", default: "#f8f4f0" },
        { key: "background-opacity", kind: "opacity", label: "不透明度", default: 1 },
      ];
    case "fill":
      return [
        { key: "fill-color", kind: "color", label: "色", default: "#888888" },
        { key: "fill-opacity", kind: "opacity", label: "不透明度", default: 1 },
      ];
    case "fill-extrusion":
      return [
        { key: "fill-extrusion-color", kind: "color", label: "色", default: "#888888" },
        { key: "fill-extrusion-opacity", kind: "opacity", label: "不透明度", default: 1 },
      ];
    case "line":
      return [
        { key: "line-color", kind: "color", label: "色", default: "#888888" },
        { key: "line-width", kind: "width", label: "太さ", default: 1, min: 0, max: 10, step: 0.25 },
        { key: "line-opacity", kind: "opacity", label: "不透明度", default: 1 },
      ];
    case "circle":
      return [
        { key: "circle-color", kind: "color", label: "色", default: "#888888" },
        { key: "circle-radius", kind: "width", label: "半径", default: 5, min: 0, max: 20, step: 0.5 },
        { key: "circle-opacity", kind: "opacity", label: "不透明度", default: 1 },
      ];
    case "symbol":
      return [
        { key: "text-color", kind: "color", label: "文字色", default: "#333333" },
        { key: "text-halo-color", kind: "color", label: "縁取り色", default: "#ffffff" },
        { key: "text-halo-width", kind: "width", label: "縁取り太さ", default: 1, min: 0, max: 4, step: 0.25 },
        { key: "text-opacity", kind: "opacity", label: "不透明度", default: 1 },
      ];
    case "raster":
      return [
        { key: "raster-opacity", kind: "opacity", label: "不透明度", default: 1 },
        { key: "raster-saturation", kind: "width", label: "彩度", default: 0, min: -1, max: 1, step: 0.05 },
        { key: "raster-contrast", kind: "width", label: "コントラスト", default: 0, min: -1, max: 1, step: 0.05 },
        { key: "raster-brightness-min", kind: "width", label: "明るさ（最小）", default: 0, min: 0, max: 1, step: 0.05 },
        { key: "raster-brightness-max", kind: "width", label: "明るさ（最大）", default: 1, min: 0, max: 1, step: 0.05 },
      ];
    default:
      return [];
  }
}

export function buildGroups(layers: LayerSpecification[]): GroupInstance[] {
  const buckets = new Map<string, GroupInstance>();

  for (const layer of layers) {
    if (layer.type === "hillshade") continue;
    const sourceLayer = (layer as unknown as Record<string, unknown>)["source-layer"];
    const hay = `${layer.id} ${typeof sourceLayer === "string" ? sourceLayer : ""}`.toLowerCase();
    const def = GROUP_DEFS.find((g) => g.match(hay, layer.type));
    if (!def) continue;

    const key = `${def.id}:${layer.type}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { id: key, title: def.title, layerType: layer.type, layerIds: [], controls: controlsForType(layer.type) };
      buckets.set(key, bucket);
    }
    bucket.layerIds.push(layer.id);
  }

  return [...buckets.values()];
}
