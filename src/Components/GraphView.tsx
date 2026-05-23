import { useState } from "react";
import { useFetchGraph } from "../formsFetch";
import { usePrefillMap } from "../PrefillMap";
import { FormList } from "./FormList";

export function GraphView() {
  const tenantId = "1";
  const actionBlueprintId = "1";
  const graphFetchState = useFetchGraph(tenantId, actionBlueprintId);
  const { selectedNodeId, handleSelectNode } = useSelectedForm();
  const { prefillMap, handleSetPrefill, handleClearPrefill } = usePrefillMap();

  switch (graphFetchState.type) {
    case "success":
      return (
        <FormList
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

function useSelectedForm() {
  const [selectedNodeId, setSelectedForm] = useState<string | undefined>();

  const handleSelectNode = (nodeId: string) => {
    setSelectedForm((prev) => (prev === nodeId ? undefined : nodeId));
  };

  return { selectedNodeId, handleSelectNode };
}
