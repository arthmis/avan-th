import type { FormField } from "../Graph/graphTypes";
import type { UpstreamNode } from "../Graph/traverseGraph";
import type { PrefillSource } from "../PrefillMap";

type Props = {
  field: FormField;
  upstreamNodes: UpstreamNode[];
  onSelect: (source: PrefillSource) => void;
  onClose: () => void;
};

export function PrefillModal({ field, upstreamNodes, onSelect, onClose }: Props) {
  return (
    <div style={{ border: "1px solid #888", padding: 12, marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <strong>Select prefill source for &ldquo;{field.label}&rdquo;</strong>
        <button type="button" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {upstreamNodes.length === 0 && <p>No upstream forms available.</p>}

      {upstreamNodes.map(({ node, form }) =>
        form.fields.map((f) => (
          <button
            key={`${node.nodeId}-${f.key}`}
            type="button"
            style={{ display: "block", margin: "2px 0" }}
            onClick={() =>
              onSelect({
                sourceNodeId: node.nodeId,
                sourceFormName: node.name,
                fieldKey: f.key,
                fieldLabel: f.label,
              })
            }
          >
            {node.name} &gt; {f.label}
          </button>
        )),
      )}
    </div>
  );
}
