import type { ActionBlueprintGraph, FormField } from "../Graph/graphTypes";
import type { AncestorNode } from "../Graph/traverseGraph";
import type { PrefillSource } from "../PrefillMap";

type Props = {
  graph: ActionBlueprintGraph;
  field: FormField;
  upstreamNodes: AncestorNode[];
  onSelect: (source: PrefillSource) => void;
  onClose: () => void;
};

export function PrefillModal({ graph, field, upstreamNodes, onSelect, onClose }: Props) {
  return (
    <div style={{ border: "1px solid #888", padding: 12, marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <strong>Select prefill source for &ldquo;{field.label}&rdquo;</strong>
        <button type="button" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {upstreamNodes.length === 0 && <p>No upstream data sources available.</p>}

      {upstreamNodes.map(({ node }) => {
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
      })}
    </div>
  );
}
