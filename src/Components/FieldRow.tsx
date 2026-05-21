import type { FormField, PrefillSource } from "../Graph/createGraph";

type Props = {
  field: FormField;
  currentMapping: PrefillSource | undefined;
  onClick: () => void;
  onClear: () => void;
};

export function FieldRow({ field, currentMapping, onClick, onClear }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
      <span style={{ flex: 1 }}>{field.label}</span>
      {currentMapping ? (
        <>
          <span style={{ fontStyle: "italic" }}>
            {currentMapping.sourceFormName} &gt; {currentMapping.fieldLabel}
          </span>
          <button type="button" onClick={onClear} aria-label="Clear prefill">
            ✕
          </button>
        </>
      ) : (
        <button type="button" onClick={onClick}>
          Add prefill
        </button>
      )}
    </div>
  );
}
