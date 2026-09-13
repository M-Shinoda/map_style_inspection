// maplibre-gl は Web Worker スクリプト（maplibre-gl-worker.mjs）を実行時に動的な
// URL（import.meta.url からの相対パス）で読み込むが、その URL は文字列テンプレートで
// 組み立てられており Vite のビルド時静的解析では検出できない。
// そのため本番ビルドではワーカーファイルが dist に含まれず 404 になり、
// ベクタータイル（pbf の解析にワーカーが必須）が描画されなくなる。
// 対策として node_modules 内の実体ファイルを public/ に複製し、
// アプリ側で maplibregl.setWorkerUrl() により固定パスを明示する。
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, "..", "node_modules", "maplibre-gl", "dist");
const destDir = join(__dirname, "..", "public");

// maplibre-gl-worker.mjs は同ディレクトリの maplibre-gl-shared.mjs を相対 import するため、
// 両方を同じ階層に配置しないとワーカー起動時にモジュール解決へ失敗する。
const files = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

mkdirSync(destDir, { recursive: true });
for (const file of files) {
  const src = join(srcDir, file);
  if (!existsSync(src)) {
    console.error(`[copy-maplibre-worker] not found: ${src}`);
    process.exit(1);
  }
  copyFileSync(src, join(destDir, file));
}
console.log(`[copy-maplibre-worker] copied ${files.join(", ")} to ${destDir}`);
