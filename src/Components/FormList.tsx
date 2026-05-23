import type { ActionBlueprintGraph } from "../Graph/graphTypes";
import type { PrefillMap, PrefillSource } from "../PrefillMap";
import { NodeView } from "./NodeView";

type Props = {
  graph: ActionBlueprintGraph;
  selectedNodeId: string | undefined;
  handleSelectNode: (nodeId: string) => void;
  prefillMap: PrefillMap;
  onSetPrefill: (nodeId: string, fieldKey: string, source: PrefillSource) => void;
  onClearPrefill: (nodeId: string, fieldKey: string) => void;
};

export function FormList({
  graph,
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
