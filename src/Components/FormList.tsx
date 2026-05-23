import type { Blueprint, Graph } from "../Graph/graphTypes";
import type { PrefillMap, PrefillSource } from "../PrefillMap";
import { NodeView } from "./NodeView";

type Props = {
  graph: Graph;
  blueprint: Blueprint;
  selectedNodeId: string | undefined;
  handleSelectNode: (nodeId: string) => void;
  prefillMap: PrefillMap;
  onSetPrefill: (nodeId: string, fieldKey: string, source: PrefillSource) => void;
  onClearPrefill: (nodeId: string, fieldKey: string) => void;
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
