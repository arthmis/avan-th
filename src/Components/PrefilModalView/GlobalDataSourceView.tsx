import { useState } from "react";
import type { GlobalDataSource } from "../../Graph/graph";
import type { PrefillSource } from "../../hooks/usePrefillMap";
import styles from "./PrefillModalView.module.css";

type GlobalDataSourceViewProps = {
  dataSource: GlobalDataSource;
  onSelect: (source: PrefillSource) => void;
};

export function GlobalDataSourceView({ dataSource, onSelect }: GlobalDataSourceViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.dataSource}>
      <button
        type="button"
        className={styles.dataSourceToggle}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        {dataSource.data.label}
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>▼</span>
      </button>
      {isOpen && (
        <div className={styles.fieldList}>
          {dataSource.data.fields.map((f) => (
            <button
              key={f.key}
              type="button"
              className={styles.fieldButton}
              onClick={() =>
                onSelect({
                  sourceType: "global",
                  sourceName: dataSource.data.label,
                  fieldKey: f.key,
                  fieldLabel: f.label,
                })
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
