import type { Blueprint, Graph, NodeId } from "../Graph/graph";
import type { PrefillMap, PrefillSource } from "../PrefillMap";
import { NodeView } from "./NodeView";

type Props = {
  graph: Graph;
  blueprint: Blueprint;
  selectedNodeId: NodeId | undefined;
  handleSelectNode: (nodeId: NodeId) => void;
  prefillMap: PrefillMap;
  onSetPrefill: (nodeId: NodeId, fieldKey: string, source: PrefillSource) => void;
  onClearPrefill: (nodeId: NodeId, fieldKey: string) => void;
};

export function FormList({
  graph,
  blueprint,
  selectedNodeId,
  handleSelectNode,
  prefillMap,
  onSetPrefill,
  onClearPrefill,
}: Props) {
  return (
    <>
      {graph.nodes.map((node) => {
        return (
          <NodeView
            key={node.nodeId}
            data={node}
            graph={graph}
            blueprint={blueprint}
            selectedNodeId={selectedNodeId}
            handleSelectNode={handleSelectNode}
            nodePrefillMap={prefillMap[node.nodeId] ?? {}}
            onSetPrefill={onSetPrefill}
            onClearPrefill={onClearPrefill}
          />
        );
      })}
    </>
  );
}
