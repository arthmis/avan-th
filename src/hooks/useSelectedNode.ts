import { useState } from "react";
import type { NodeId } from "../Graph/graph";

export function useSelectedNode() {
  const [selectedNodeId, setSelectedForm] = useState<NodeId | undefined>();

  const handleSelectNode = (nodeId: NodeId) => {
    setSelectedForm((prev) => (prev === nodeId ? undefined : nodeId));
  };

  return { selectedNodeId, handleSelectNode };
}
