import type { GroupInstance, PropControl } from "../lib/layerGroups";
import { describeLayer } from "../lib/layerLabels";

interface Props {
  group: GroupInstance;
  values: Record<string, string | number>;
  visibility: Record<string, boolean>;
  onChange: (propKey: string, value: string | number) => void;
  onReset: () => void;
  onToggleVisibility: (layerId: string, visible: boolean) => void;
  onBulkVisibility: (visible: boolean) => void;
}

function ControlRow({ control, value, onChange }: { control: PropControl; value: string | number; onChange: (v: string | number) => void }) {
  if (control.kind === "color") {
    return (
      <label className="control-row">
        <span>{control.label}</span>
        <input type="color" value={String(value)} onChange={(e) => onChange(e.target.value)} />
      </label>
    );
  }

  const numeric = typeof value === "number" ? value : Number(value) || 0;
  return (
    <label className="control-row">
      <span>
        {control.label} <em>{numeric}</em>
      </span>
      <input
        type="range"
        min={control.kind === "opacity" ? 0 : control.min}
        max={control.kind === "opacity" ? 1 : control.max}
        step={control.kind === "opacity" ? 0.05 : control.step}
        value={numeric}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function ControlGroup({ group, values, visibility, onChange, onReset, onToggleVisibility, onBulkVisibility }: Props) {
  return (
    <fieldset className="control-group">
      <legend>
        {group.title} <small>[{group.layerType}] ({group.layerIds.length} layers)</small>
      </legend>
      {group.controls.map((control) => (
        <ControlRow
          key={control.key}
          control={control}
          value={values[control.key] ?? control.default}
          onChange={(v) => onChange(control.key, v)}
        />
      ))}
      <button type="button" className="reset-btn" onClick={onReset}>
        このグループをリセット
      </button>

      <details className="layer-visibility">
        <summary>表示/非表示を個別に切り替える（{group.layerIds.length}件）</summary>
        <div className="layer-visibility-bulk">
          <button type="button" onClick={() => onBulkVisibility(true)}>
            すべて表示
          </button>
          <button type="button" onClick={() => onBulkVisibility(false)}>
            すべて非表示
          </button>
        </div>
        <ul className="layer-visibility-list">
          {group.layerIds.map((layerId) => (
            <li key={layerId}>
              <label>
                <input
                  type="checkbox"
                  checked={visibility[layerId] ?? true}
                  onChange={(e) => onToggleVisibility(layerId, e.target.checked)}
                />
                <span className="layer-label-ja">{describeLayer(layerId)}</span>
                <span className="layer-label-id">{layerId}</span>
              </label>
            </li>
          ))}
        </ul>
      </details>
    </fieldset>
  );
}
