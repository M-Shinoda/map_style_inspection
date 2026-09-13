# Map Style Inspection

MapLibre GL の地図の見た目(色・太さ・不透明度・ラベル表示など)をブラウザ上で調整し、その結果を別プロジェクトへそのまま持ち込める形でエクスポートするための検証用ツールです。

## 技術スタック

- [Vite](https://vitejs.dev/) + React 19 + TypeScript
- [maplibre-gl](https://maplibre.org/maplibre-gl-js/docs/) — 地図描画
- 追加のUIライブラリ・状態管理ライブラリは使用せず、素のReact stateのみで構成

## セットアップ・実行方法

```bash
pnpm install
pnpm run dev       # 開発サーバー起動（http://localhost:5173）
pnpm run build     # 本番ビルド（dist/ に出力）
pnpm run preview   # ビルド結果をローカルで確認
```

## 使い方

1. **ベーススタイルを選ぶ**
   画面右上のセレクトボックスで、API キー不要・商用利用可能なベーススタイルを切り替えられます。
   - OpenFreeMap（Liberty / Bright / Positron）
   - CARTO Basemaps（Positron / Voyager / Dark Matter）
   - MapLibre デモタイル（国境ポリゴンのみの最小サンプル、道路等はなし）
   - 国土地理院（標準地図 / 淡色地図 / 航空写真「全国最新写真」、日本国内限定）
   - OpenStreetMap Standard

   ベクター系スタイル（OpenFreeMap / CARTO / MapLibreデモ）は色・太さなどをレイヤー単位で調整でき、ラスター系（国土地理院 / OpenStreetMap）は不透明度・彩度・コントラスト・明るさのみ調整できます。

2. **パラメータを調整する**
   読み込んだスタイルのレイヤーを「背景・水域・建物・土地被覆・道路・行政界・ラベル・ラスタータイル」に自動分類し、グループごとに色（カラーピッカー）・太さ・不透明度をスライダーで調整できます。変更は地図に即時反映されます。

3. **文字・記号（ラベル）の表示/非表示を切り替える**
   各グループの「表示/非表示を個別に切り替える」を開くと、レイヤーごとにチェックボックスで表示/非表示を切り替えられます（一括ON/OFFボタンあり）。レイヤーIDの横には目安として日本語の意訳ラベルも表示されます。
   ※ラスター系（国土地理院 / OSM）は文字が画像に焼き込まれているため、レイヤー単位で文字だけを消すことはできません。

4. **エクスポートする**
   画面下部の「エクスポート」パネルで、調整した内容を別プロジェクトに持ち込めます。
   - **JSONをコピー**: `{ baseStyle, layerOverrides }` 形式でクリップボードにコピー
   - **style.json をダウンロード**: 調整結果を反映した完全なスタイルファイルをダウンロード
   - **適用用JSをダウンロード**: 同じベーススタイルを読み込んだ maplibre-gl の `Map` インスタンスに調整内容を再現する `applyMapStyleOverrides(map)` 関数をダウンロード

## ディレクトリ構成

```
src/
  App.tsx                    地図の初期化・状態管理・画面全体の組み立て
  components/
    ControlGroup.tsx         レイヤーグループごとの調整UI・表示切替UI
    ExportPanel.tsx          エクスポート（JSON/style.json/JSスニペット）
  lib/
    styleSources.ts          ベーススタイルの一覧・定義
    layerGroups.ts           レイヤーをグループ分けし、調整項目を割り当てるロジック
    layerLabels.ts           レイヤーIDを日本語に意訳するための辞書・変換ロジック
```
