import { useState } from "react";
import type { Blueprint, NodeDataSource } from "../../Graph/graph";
import type { PrefillSource } from "../../hooks/usePrefillMap";
import styles from "./PrefillModalView.module.css";

type NodeDataSourceViewProps = {
  blueprint: Blueprint;
  dataSource: NodeDataSource;
  onSelect: (source: PrefillSource) => void;
};

export function NodeDataSourceView({ blueprint, dataSource, onSelect }: NodeDataSourceViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  switch (dataSource.data.data.componentType) {
    case "form": {
      const formDefinition = blueprint.forms.get(dataSource.data.data.componentId);
      if (!formDefinition) {
        return undefined;
      }

      return (
        <div className={styles.dataSource}>
          <button
            type="button"
            className={styles.dataSourceToggle}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {dataSource.data.name}
            <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>▼</span>
          </button>
          {isOpen && (
            <div className={styles.fieldList}>
              {formDefinition.fields.map((f) => (
                <button
                  key={`${dataSource.data.nodeId}-${f.key}`}
                  type="button"
                  className={styles.fieldButton}
                  onClick={() =>
                    onSelect({
                      sourceType: "node",
                      sourceNodeId: dataSource.data.nodeId,
                      sourceName: dataSource.data.name,
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
    default:
      return undefined;
  }
}
