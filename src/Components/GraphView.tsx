import { useState } from "react";
import { useFetchGraph } from "../formsFetch";
import type { NodeId } from "../Graph/graph";
import { usePrefillMap } from "../PrefillMap";
import { NodeList } from "./NodeListView/NodeListView";

export function GraphView() {
  const tenantId = "1";
  const actionBlueprintId = "1";
  const graphFetchState = useFetchGraph(tenantId, actionBlueprintId);
  const { selectedNodeId, handleSelectNode } = useSelectedNode();
  const { prefillMap, handleSetPrefill, handleClearPrefill } = usePrefillMap();

  switch (graphFetchState.type) {
    case "success":
      return (
        <NodeList
          graph={graphFetchState.data.graph}
          blueprint={graphFetchState.data.blueprint}
          selectedNodeId={selectedNodeId}
          handleSelectNode={handleSelectNode}
          prefillMap={prefillMap}
          onSetPrefill={handleSetPrefill}
          onClearPrefill={handleClearPrefill}
        />
      );
    case "loading":
      return <h1>Loading</h1>;
    case "error":
      return (
        <>
          <h1>Error</h1>
          <p>{graphFetchState.message}</p>
        </>
      );
  }
}

function useSelectedNode() {
  const [selectedNodeId, setSelectedForm] = useState<NodeId | undefined>();

  const handleSelectNode = (nodeId: NodeId) => {
    setSelectedForm((prev) => (prev === nodeId ? undefined : nodeId));
  };

  return { selectedNodeId, handleSelectNode };
}
