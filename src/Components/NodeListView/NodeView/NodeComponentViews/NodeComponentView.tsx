import type { Blueprint, Graph, GraphNode, NodeId } from "../../../Graph/graph";
import type { PrefillSource } from "../../../PrefillMap";
import { FormView } from "./FormView";

type NodeComponentViewProps = {
  data: GraphNode;
  graph: Graph;
  blueprint: Blueprint;
  nodePrefillMap: Record<string, PrefillSource | undefined>;
  onSetPrefill: (nodeId: NodeId, fieldKey: string, source: PrefillSource) => void;
  onClearPrefill: (nodeId: NodeId, fieldKey: string) => void;
};

export function NodeComponentView({
  data: node,
  graph,
  blueprint,
  nodePrefillMap,
  onSetPrefill,
  onClearPrefill,
}: NodeComponentViewProps) {
  switch (node.data.componentType) {
    case "form": {
      const formDefinition = blueprint.forms.get(node.data.componentId);
      if (!formDefinition) {
        return undefined;
      }

      return (
        <FormView
          node={node}
          form={formDefinition}
          graph={graph}
          blueprint={blueprint}
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
