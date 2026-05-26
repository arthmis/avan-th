import clsx from "clsx";
import type { FormField } from "../../Graph/graph";
import type { PrefillSource } from "../../PrefillMap";
import fieldRowClasses from "./FieldRowView.module.css";

type Props = {
  field: FormField;
  currentMapping: PrefillSource | undefined;
  onClick: () => void;
  onClear: () => void;
};

export function FieldRow({ field, currentMapping, onClick, onClear }: Props) {
  if (field.avantosType === "button") {
    return undefined;
  }

  const button = currentMapping ? (
    <button type="button" onClick={onClear} aria-label="Clear prefill">
      ✕
    </button>
  ) : (
    <button type="button" onClick={onClick}>
      Select Source
    </button>
  );

  return (
    <div className={clsx(fieldRowClasses.row, { [fieldRowClasses.borderActive]: currentMapping })}>
      <p>
        {field.label}
        {currentMapping && (
          <span>
            :
            <span style={{ paddingLeft: "4px" }}>
              {currentMapping.sourceName}.{currentMapping.fieldLabel}
            </span>
          </span>
        )}
      </p>
      {button}
    </div>
  );
}
