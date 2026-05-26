import type { Blueprint, Graph, GraphNode, NodeId } from "../../Graph/graph";
import type { PrefillSource } from "../../PrefillMap";
import { NodeComponentView } from "./NodeComponentViews/NodeComponentView";
import nodeClasses from "./NodeView.module.css";

type Props = {
  data: GraphNode;
  graph: Graph;
  blueprint: Blueprint;
  selectedNodeId: NodeId | undefined;
  handleSelectNode: (nodeId: NodeId) => void;
  nodePrefillMap: Record<string, PrefillSource | undefined>;
  onSetPrefill: (nodeId: NodeId, fieldKey: string, source: PrefillSource) => void;
  onClearPrefill: (nodeId: NodeId, fieldKey: string) => void;
};

export function NodeView({
  data,
  graph,
  blueprint,
  selectedNodeId,
  handleSelectNode,
  nodePrefillMap,
  onSetPrefill,
  onClearPrefill,
}: Props) {
  return (
    <div className={nodeClasses.node}>
      <button
        className={nodeClasses.button}
        type="button"
        onClick={() => handleSelectNode(data.nodeId)}
      >
        {data.name}
      </button>
      {selectedNodeId === data.nodeId && (
        <NodeComponentView
          data={data}
          graph={graph}
          blueprint={blueprint}
          nodePrefillMap={nodePrefillMap}
          onSetPrefill={onSetPrefill}
          onClearPrefill={onClearPrefill}
        />
      )}
    </div>
  );
}
