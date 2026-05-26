import { useState } from "react";
import type { Blueprint, GlobalDataSource, NodeDataSource, PrefillDataSource } from "../Graph/graph";
import type { AncestorNode } from "../Graph/traverseGraph";
import type { PrefillSource } from "../PrefillMap";
import styles from "./PrefillModal.module.css";

type Props = {
  blueprint: Blueprint;
  upstreamNodes: AncestorNode[];
  onSelect: (source: PrefillSource) => void;
  onClose: () => void;
};

export function PrefillModal({ blueprint, upstreamNodes, onSelect, onClose }: Props) {
  return (
    <div className={styles.background}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2>Select data element to map</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {upstreamNodes.length === 0 && blueprint.globalDataSources.size === 0 && (
          <p>No upstream data sources available.</p>
        )}
        {Array.from(blueprint.globalDataSources, ([key, dataSource]) => (
          <DataSourceView
            key={key}
            blueprint={blueprint}
            dataSource={dataSource}
            onSelect={onSelect}
            onClose={onClose}
          />
        ))}

        {upstreamNodes.map(({ node }) => {
          const nodeDataSource: NodeDataSource = {
            sourceType: "node",
            data: node,
          };
          return (
            <DataSourceView
              key={node.nodeId}
              blueprint={blueprint}
              dataSource={nodeDataSource}
              onSelect={onSelect}
              onClose={onClose}
            />
          );
        })}
      </div>
    </div>
  );
}

type DataSourceViewProps = {
  blueprint: Blueprint;
  dataSource: PrefillDataSource;
  onSelect: (source: PrefillSource) => void;
  onClose: () => void;
};

function DataSourceView({ blueprint, dataSource, onSelect }: DataSourceViewProps) {
  switch (dataSource.sourceType) {
    case "node":
      return (
        <NodeDataSourceView blueprint={blueprint} dataSource={dataSource} onSelect={onSelect} />
      );
    case "global":
      return <GlobalDataSourceView dataSource={dataSource} onSelect={onSelect} />;
    default:
      return undefined;
  }
}

type NodeDataSourceViewProps = {
  blueprint: Blueprint;
  dataSource: NodeDataSource;
  onSelect: (source: PrefillSource) => void;
};

function NodeDataSourceView({ blueprint, dataSource, onSelect }: NodeDataSourceViewProps) {
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

type GlobalDataSourceViewProps = {
  dataSource: GlobalDataSource;
  onSelect: (source: PrefillSource) => void;
};

function GlobalDataSourceView({ dataSource, onSelect }: GlobalDataSourceViewProps) {
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
