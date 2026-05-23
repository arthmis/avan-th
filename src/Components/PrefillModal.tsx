import type { ActionBlueprintGraph, GraphNode } from "../Graph/graphTypes";
import type { AncestorNode } from "../Graph/traverseGraph";
import type { PrefillSource } from "../PrefillMap";

type Props = {
  graph: ActionBlueprintGraph;
  upstreamNodes: AncestorNode[];
  onSelect: (source: PrefillSource) => void;
  onClose: () => void;
};

export function PrefillModal({ graph, upstreamNodes, onSelect, onClose }: Props) {
  return (
    <div style={{ border: "1px solid #888", padding: 12, marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <strong>Select data element to map</strong>
        <button type="button" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {upstreamNodes.length === 0 && <p>No upstream data sources available.</p>}

      {upstreamNodes.map(({ node }) => {
        return (
          <DataSourceView
            key={node.nodeId}
            graph={graph}
            node={node}
            onSelect={onSelect}
            onClose={onClose}
          />
        );
      })}
    </div>
  );
}

type DataSourceViewProps = {
  graph: ActionBlueprintGraph;
  node: GraphNode;
  onSelect: (source: PrefillSource) => void;
  onClose: () => void;
};

function DataSourceView({ graph, node, onSelect }: DataSourceViewProps) {
  switch (node.data.componentType) {
    case "form": {
      const formDefinition = graph.forms.get(node.data.componentId);
      if (!formDefinition) {
        return undefined;
      }

      return formDefinition.fields.map((f) => (
        <button
          key={`${node.nodeId}-${f.key}`}
          type="button"
          style={{ display: "block", margin: "2px 0" }}
          onClick={() =>
            onSelect({
              sourceNodeId: node.nodeId,
              sourceName: node.name,
              fieldKey: f.key,
              fieldLabel: f.label,
            })
          }
        >
          {node.name} &gt; {f.label}
        </button>
      ));
    }
    default:
      return undefined;
  }
}
