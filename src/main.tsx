import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setWorkerUrl } from "maplibre-gl";
import App from "./App";
import "./App.css";

// maplibre-gl はワーカースクリプトの URL を実行時に動的に組み立てるため、
// 本番ビルドでは静的解析されず 404 になりベクタータイルが描画されない。
// public/ に複製したファイル（scripts/copy-maplibre-worker.mjs）を固定パスで明示する。
setWorkerUrl(`${import.meta.env.BASE_URL}maplibre-gl-worker.mjs`);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
