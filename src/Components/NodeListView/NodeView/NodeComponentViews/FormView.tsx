import { useMemo, useState } from "react";
import type { Blueprint, FormDefinition, Graph, GraphNode } from "../../../../Graph/graph";
import { getAncestorNodes } from "../../../../Graph/traverseGraph";
import type { PrefillSource } from "../../../../hooks/usePrefillMap";
import { PrefillModal } from "../../../PrefilModalView/PrefillModalView";
import { FieldRow } from "../../FieldRowView";
import formClasses from "./FormView.module.css";

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
    <>
      <ul className={formClasses.fieldList}>
        {form.fields.map((field) => (
          <li key={field.key} className={formClasses.listStyle}>
            <FieldRow
              field={field}
              currentMapping={nodePrefillMap[field.key] ?? undefined}
              onClick={() => setModalFieldKey(field.key)}
              onClear={() => onClearPrefill(field.key)}
            />
          </li>
        ))}
      </ul>

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
    </>
  );
}
