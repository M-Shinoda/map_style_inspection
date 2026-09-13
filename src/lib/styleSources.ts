import type { StyleSpecification } from "maplibre-gl";

export interface StyleSource {
  id: string;
  label: string;
  // ベクタースタイル: style.json の URL / ラスタータイル: インラインの StyleSpecification
  style: string | StyleSpecification;
}

function gsiRasterStyle(tileTemplate: string, opts?: { maxzoom?: number }): StyleSpecification {
  return {
    version: 8,
    sources: {
      gsi: {
        type: "raster",
        tiles: [tileTemplate],
        tileSize: 256,
        maxzoom: opts?.maxzoom ?? 18,
        attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>',
      },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": "#f8f4f0" } },
      { id: "gsi-raster", type: "raster", source: "gsi" },
    ],
  };
}

function osmRasterStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        maxzoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": "#f2efe9" } },
      { id: "osm-raster", type: "raster", source: "osm" },
    ],
  };
}

// API キー不要・商用利用可能なベーススタイルのみを収録
export const STYLE_SOURCES: StyleSource[] = [
  { id: "openfreemap-liberty", label: "OpenFreeMap / Liberty", style: "https://tiles.openfreemap.org/styles/liberty" },
  { id: "openfreemap-bright", label: "OpenFreeMap / Bright", style: "https://tiles.openfreemap.org/styles/bright" },
  { id: "openfreemap-positron", label: "OpenFreeMap / Positron", style: "https://tiles.openfreemap.org/styles/positron" },
  { id: "carto-positron", label: "CARTO / Positron", style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" },
  { id: "carto-voyager", label: "CARTO / Voyager", style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json" },
  { id: "carto-dark-matter", label: "CARTO / Dark Matter", style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" },
  { id: "maplibre-demo", label: "MapLibre / Demo Tiles", style: "https://demotiles.maplibre.org/style.json" },
  {
    id: "gsi-std",
    label: "国土地理院 / 標準地図",
    style: gsiRasterStyle("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png"),
  },
  {
    id: "gsi-pale",
    label: "国土地理院 / 淡色地図",
    style: gsiRasterStyle("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"),
  },
  {
    id: "gsi-photo",
    label: "国土地理院 / 航空写真（全国最新写真）",
    style: gsiRasterStyle("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg"),
  },
  { id: "osm-standard", label: "OpenStreetMap / Standard", style: osmRasterStyle() },
];
