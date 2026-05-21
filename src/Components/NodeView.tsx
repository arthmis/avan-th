import type { ActionBlueprintGraph, FormDefinition, GraphNode } from "../Graph/graphTypes";
import type { PrefillSource } from "../PrefillMap";
import classes from "./Form.module.css";
import { FormView } from "./FormView";

type Props = {
  data: GraphNode;
  formDefinition: FormDefinition;
  graph: ActionBlueprintGraph;
  selectedNodeId: string | undefined;
  handleSelectNode: (nodeId: string) => void;
  nodePrefillMap: Record<string, PrefillSource | undefined>;
  onSetPrefill: (nodeId: string, fieldKey: string, source: PrefillSource) => void;
  onClearPrefill: (nodeId: string, fieldKey: string) => void;
};

export function NodeView({
  data,
  formDefinition,
  graph,
  selectedNodeId,
  handleSelectNode,
  nodePrefillMap,
  onSetPrefill,
  onClearPrefill,
}: Props) {
  return (
    <div className={classes.border}>
      <button type="button" onClick={() => handleSelectNode(data.nodeId)}>
        {data.name}
      </button>
      {selectedNodeId === data.nodeId && (
        <FormView
          node={data}
          form={formDefinition}
          graph={graph}
          nodePrefillMap={nodePrefillMap}
          onSetPrefill={(fieldKey, source) => onSetPrefill(data.nodeId, fieldKey, source)}
          onClearPrefill={(fieldKey) => onClearPrefill(data.nodeId, fieldKey)}
        />
      )}
    </div>
  );
}
