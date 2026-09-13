import { useState } from "react";
import type { StyleSpecification } from "maplibre-gl";
import type { StyleSource } from "../lib/styleSources";

export interface LayerOverride {
  paint?: Record<string, string | number>;
  layout?: Record<string, string>;
}
export type LayerOverrides = Record<string, LayerOverride>;

interface Props {
  source: StyleSource;
  layerOverrides: LayerOverrides;
  getFullStyle: () => StyleSpecification | null;
}

function download(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildSnippet(source: StyleSource, overrides: LayerOverrides): string {
  const baseStyleNote = typeof source.style === "string" ? source.style : `インラインスタイル（${source.label}）`;
  return `// map_style_inspection で調整したパラメータを別プロジェクトへ適用するスニペット
// 前提: 同じベーススタイル (${baseStyleNote}) を読み込んだ maplibre-gl の Map インスタンス
const mapStyleOverrides = ${JSON.stringify(overrides, null, 2)};

export function applyMapStyleOverrides(map) {
  for (const [layerId, { paint, layout }] of Object.entries(mapStyleOverrides)) {
    for (const [prop, value] of Object.entries(paint ?? {})) {
      map.setPaintProperty(layerId, prop, value);
    }
    for (const [prop, value] of Object.entries(layout ?? {})) {
      map.setLayoutProperty(layerId, prop, value);
    }
  }
}
`;
}

export function ExportPanel({ source, layerOverrides, getFullStyle }: Props) {
  const [copied, setCopied] = useState(false);
  const hasOverrides = Object.keys(layerOverrides).length > 0;
  const exportObject = {
    baseStyle: { id: source.id, label: source.label, style: source.style },
    layerOverrides,
  };
  const json = JSON.stringify(exportObject, null, 2);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API 不可時は何もしない（テキストはパネル上で選択可能）
    }
  }

  function handleDownloadStyle() {
    const style = getFullStyle();
    if (!style) return;
    download("style.json", JSON.stringify(style, null, 2), "application/json");
  }

  function handleDownloadSnippet() {
    download("applyMapStyleOverrides.js", buildSnippet(source, layerOverrides), "text/javascript");
  }

  return (
    <div className="export-panel">
      <h2>エクスポート</h2>
      <p className="hint">
        {hasOverrides
          ? "調整したパラメータを別プロジェクトで再現できます。"
          : "パラメータを調整すると、ここに差分が表示されます。"}
      </p>
      <div className="export-actions">
        <button type="button" onClick={handleCopy} disabled={!hasOverrides}>
          {copied ? "コピーしました" : "JSONをコピー"}
        </button>
        <button type="button" onClick={handleDownloadStyle}>
          style.json をダウンロード
        </button>
        <button type="button" onClick={handleDownloadSnippet} disabled={!hasOverrides}>
          適用用JSをダウンロード
        </button>
      </div>
      <pre className="export-json">{json}</pre>
    </div>
  );
}
