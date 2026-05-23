import { useMemo, useState } from "react";
import type { Blueprint, FormDefinition, Graph, GraphNode } from "../Graph/graphTypes";
import { getAncestorNodes } from "../Graph/traverseGraph";
import type { PrefillSource } from "../PrefillMap";
import { FieldRow } from "./FieldRow";
import { PrefillModal } from "./PrefillModal";

type Props = {
  node: GraphNode;
  form: FormDefinition;
  graph: Graph;
  blueprint: Blueprint;
  nodePrefillMap: Record<string, PrefillSource | undefined>;
  onSetPrefill: (fieldKey: string, source: PrefillSource) => void;
  onClearPrefill: (fieldKey: string) => void;
};

export function FormView({
  node,
  form,
  graph,
  blueprint,
  nodePrefillMap,
  onSetPrefill,
  onClearPrefill,
}: Props) {
  const [modalFieldKey, setModalFieldKey] = useState<string | undefined>(undefined);

  const upstreamNodes = useMemo(() => {
    return getAncestorNodes(node.nodeId, graph, blueprint);
  }, [node.nodeId, graph, blueprint]);
  const modalField = form.fields.find((f) => f.key === modalFieldKey) ?? undefined;

  return (
    <div style={{ padding: "8px 0" }}>
      {form.fields.map((field) => (
        <FieldRow
          key={field.key}
          field={field}
          currentMapping={nodePrefillMap[field.key] ?? undefined}
          onClick={() => setModalFieldKey(field.key)}
          onClear={() => onClearPrefill(field.key)}
        />
      ))}

      {modalField && (
        <PrefillModal
          blueprint={blueprint}
          upstreamNodes={upstreamNodes}
          onSelect={(source) => {
            onSetPrefill(modalField.key, source);
            setModalFieldKey(undefined);
          }}
          onClose={() => setModalFieldKey(undefined)}
        />
      )}
    </div>
  );
}
