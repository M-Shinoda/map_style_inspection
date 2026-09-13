import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, NavigationControl, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { STYLE_SOURCES } from "./lib/styleSources";
import { buildGroups, type GroupInstance } from "./lib/layerGroups";
import { ControlGroup } from "./components/ControlGroup";
import { ExportPanel, type LayerOverrides } from "./components/ExportPanel";

// 渋谷駅周辺を初期表示に（別プロジェクトの対象エリアに合わせて調整可）
const INITIAL_CENTER: [number, number] = [139.7016, 35.6598];
const INITIAL_ZOOM = 13.5;

type GroupValues = Record<string, Record<string, string | number>>;
type VisibilityMap = Record<string, boolean>;

// レイヤーIDとプロパティ名を実行時に動的に決めるため、公開シグネチャの厳密なリテラル型を外して呼び出す
function getPaint(map: MapLibreMap, layerId: string, prop: string): unknown {
  return (map.getPaintProperty as (id: string, name: string) => unknown)(layerId, prop);
}
function setPaint(map: MapLibreMap, layerId: string, prop: string, value: unknown) {
  (map.setPaintProperty as (id: string, name: string, value: unknown) => void)(layerId, prop, value);
}
function getVisibility(map: MapLibreMap, layerId: string): boolean {
  const raw = (map.getLayoutProperty as (id: string, name: string) => unknown)(layerId, "visibility");
  return raw !== "none";
}
function setVisibility(map: MapLibreMap, layerId: string, visible: boolean | undefined) {
  (map.setLayoutProperty as (id: string, name: string, value: unknown) => void)(
    layerId,
    "visibility",
    visible === undefined ? undefined : visible ? "visible" : "none",
  );
}

export default function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  const [source, setSource] = useState(STYLE_SOURCES[0]);
  const [groups, setGroups] = useState<GroupInstance[]>([]);
  const [groupValues, setGroupValues] = useState<GroupValues>({});
  const [layerVisibility, setLayerVisibility] = useState<VisibilityMap>({});
  const [layerOverrides, setLayerOverrides] = useState<LayerOverrides>({});

  // 地図の初期化（ベーススタイル切替時は setStyle で再生成せずマップ自体を作り直す）
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: source.style,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    });
    map.addControl(new NavigationControl(), "top-right");
    mapRef.current = map;

    function handleStyleLoad() {
      const style = map.getStyle();
      const nextGroups = buildGroups(style.layers);
      setGroups(nextGroups);

      const initialValues: GroupValues = {};
      const initialVisibility: VisibilityMap = {};
      for (const group of nextGroups) {
        const firstLayerId = group.layerIds[0];
        const values: Record<string, string | number> = {};
        for (const control of group.controls) {
          const raw = getPaint(map, firstLayerId, control.key);
          values[control.key] = typeof raw === "string" || typeof raw === "number" ? raw : control.default;
        }
        initialValues[group.id] = values;

        for (const layerId of group.layerIds) {
          initialVisibility[layerId] = getVisibility(map, layerId);
        }
      }
      setGroupValues(initialValues);
      setLayerVisibility(initialVisibility);
      setLayerOverrides({});
    }

    map.on("load", handleStyleLoad);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  function handleControlChange(group: GroupInstance, propKey: string, value: string | number) {
    const map = mapRef.current;
    if (!map) return;

    for (const layerId of group.layerIds) {
      setPaint(map, layerId, propKey, value);
    }

    setGroupValues((prev) => ({
      ...prev,
      [group.id]: { ...prev[group.id], [propKey]: value },
    }));

    setLayerOverrides((prev) => {
      const next = { ...prev };
      for (const layerId of group.layerIds) {
        next[layerId] = { ...next[layerId], paint: { ...next[layerId]?.paint, [propKey]: value } };
      }
      return next;
    });
  }

  function handleGroupReset(group: GroupInstance) {
    const map = mapRef.current;
    if (!map) return;

    const resetValues: Record<string, string | number> = {};
    for (const control of group.controls) {
      for (const layerId of group.layerIds) {
        setPaint(map, layerId, control.key, undefined);
      }
      resetValues[control.key] = control.default;
    }

    for (const layerId of group.layerIds) {
      setVisibility(map, layerId, undefined);
    }

    setGroupValues((prev) => ({ ...prev, [group.id]: resetValues }));
    setLayerVisibility((prev) => {
      const next = { ...prev };
      for (const layerId of group.layerIds) {
        next[layerId] = getVisibility(map, layerId);
      }
      return next;
    });
    setLayerOverrides((prev) => {
      const next = { ...prev };
      for (const layerId of group.layerIds) {
        delete next[layerId];
      }
      return next;
    });
  }

  function handleLayerVisibilityToggle(layerId: string, visible: boolean) {
    const map = mapRef.current;
    if (!map) return;

    setVisibility(map, layerId, visible);
    setLayerVisibility((prev) => ({ ...prev, [layerId]: visible }));
    setLayerOverrides((prev) => ({
      ...prev,
      [layerId]: { ...prev[layerId], layout: { visibility: visible ? "visible" : "none" } },
    }));
  }

  function handleGroupVisibilityBulk(group: GroupInstance, visible: boolean) {
    const map = mapRef.current;
    if (!map) return;

    for (const layerId of group.layerIds) {
      setVisibility(map, layerId, visible);
    }
    setLayerVisibility((prev) => {
      const next = { ...prev };
      for (const layerId of group.layerIds) next[layerId] = visible;
      return next;
    });
    setLayerOverrides((prev) => {
      const next = { ...prev };
      for (const layerId of group.layerIds) {
        next[layerId] = { ...next[layerId], layout: { visibility: visible ? "visible" : "none" } };
      }
      return next;
    });
  }

  function getFullStyle(): StyleSpecification | null {
    return mapRef.current ? mapRef.current.getStyle() : null;
  }

  return (
    <div className="app">
      <div className="map-container" ref={mapContainerRef} />

      <aside className="sidebar">
        <header className="sidebar-header">
          <h1>Map Style Inspection</h1>
          <label className="source-select">
            <span>ベーススタイル</span>
            <select
              value={source.id}
              onChange={(e) => {
                const next = STYLE_SOURCES.find((s) => s.id === e.target.value);
                if (next) setSource(next);
              }}
            >
              {STYLE_SOURCES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </header>

        <div className="groups">
          {groups.length === 0 && <p className="hint">スタイルを読み込み中...</p>}
          {groups.map((group) => (
            <ControlGroup
              key={group.id}
              group={group}
              values={groupValues[group.id] ?? {}}
              visibility={layerVisibility}
              onChange={(propKey, value) => handleControlChange(group, propKey, value)}
              onReset={() => handleGroupReset(group)}
              onToggleVisibility={handleLayerVisibilityToggle}
              onBulkVisibility={(visible) => handleGroupVisibilityBulk(group, visible)}
            />
          ))}
        </div>

        <ExportPanel source={source} layerOverrides={layerOverrides} getFullStyle={getFullStyle} />
      </aside>
    </div>
  );
}
