import type { Blueprint, NodeDataSource } from "../../Graph/graph";
import type { AncestorNode } from "../../Graph/traverseGraph";
import type { PrefillSource } from "../../hooks/usePrefillMap";
import { DataSourceView } from "./DataSourceView";
import styles from "./PrefillModalView.module.css";

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
