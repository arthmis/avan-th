import type { ActionBlueprintGraph, GraphNode } from "../Graph/graphTypes";
import type { PrefillSource } from "../PrefillMap";
import classes from "./Form.module.css";
import { FormView } from "./FormView";

type Props = {
  data: GraphNode;
  graph: ActionBlueprintGraph;
  selectedNodeId: string | undefined;
  handleSelectNode: (nodeId: string) => void;
  nodePrefillMap: Record<string, PrefillSource | undefined>;
  onSetPrefill: (nodeId: string, fieldKey: string, source: PrefillSource) => void;
  onClearPrefill: (nodeId: string, fieldKey: string) => void;
};

export function NodeView({
  data,
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
        <NodeComponentView
          data={data}
          graph={graph}
          nodePrefillMap={nodePrefillMap}
          onSetPrefill={onSetPrefill}
          onClearPrefill={onClearPrefill}
        />
      )}
    </div>
  );
}

type NodeComponentViewProps = {
  data: GraphNode;
  graph: ActionBlueprintGraph;
  nodePrefillMap: Record<string, PrefillSource | undefined>;
  onSetPrefill: (nodeId: string, fieldKey: string, source: PrefillSource) => void;
  onClearPrefill: (nodeId: string, fieldKey: string) => void;
};

function NodeComponentView({
  data: node,
  graph,
  nodePrefillMap,
  onSetPrefill,
  onClearPrefill,
}: NodeComponentViewProps) {
  switch (node.data.componentType) {
    case "form": {
      const formDefinition = graph.forms.get(node.data.componentId);
      if (!formDefinition) {
        return undefined;
      }

      return (
        <FormView
          node={node}
          form={formDefinition}
          graph={graph}
          nodePrefillMap={nodePrefillMap}
          onSetPrefill={(fieldKey, source) => onSetPrefill(node.nodeId, fieldKey, source)}
          onClearPrefill={(fieldKey) => onClearPrefill(node.nodeId, fieldKey)}
        />
      );
    }
    default:
      return;
  }
}
