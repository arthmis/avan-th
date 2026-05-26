import type { Blueprint, Graph, NodeId } from "../../Graph/graph";
import type { PrefillMap, PrefillSource } from "../../PrefillMap";
import formListClasses from "./NodeListView.module.css";
import { NodeView } from "./NodeView/NodeView";

type Props = {
  graph: Graph;
  blueprint: Blueprint;
  selectedNodeId: NodeId | undefined;
  handleSelectNode: (nodeId: NodeId) => void;
  prefillMap: PrefillMap;
  onSetPrefill: (nodeId: NodeId, fieldKey: string, source: PrefillSource) => void;
  onClearPrefill: (nodeId: NodeId, fieldKey: string) => void;
};

export function NodeList({
  graph,
  blueprint,
  selectedNodeId,
  handleSelectNode,
  prefillMap,
  onSetPrefill,
  onClearPrefill,
}: Props) {
  return (
    <ul className={formListClasses.forms}>
      {graph.nodes.map((node) => {
        return (
          <li key={node.nodeId}>
            <NodeView
              data={node}
              graph={graph}
              blueprint={blueprint}
              selectedNodeId={selectedNodeId}
              handleSelectNode={handleSelectNode}
              nodePrefillMap={prefillMap[node.nodeId] ?? {}}
              onSetPrefill={onSetPrefill}
              onClearPrefill={onClearPrefill}
            />
          </li>
        );
      })}
    </ul>
  );
}
