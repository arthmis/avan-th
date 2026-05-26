import { useFetchGraph } from "../formsFetch";
import { usePrefillMap } from "../hooks/usePrefillMap";
import { useSelectedNode } from "../hooks/useSelectedNode";
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
