import { useState } from "react";
import type { NodeId } from "./Graph/graph";

export type PrefillSource = PrefillNodeSource | PrefillGlobalSource;

export interface PrefillNodeSource {
  sourceType: "node";
  sourceNodeId: NodeId;
  sourceName: string;
  fieldKey: string;
  fieldLabel: string;
}

export interface PrefillGlobalSource {
  sourceType: "global";
  sourceName: string;
  fieldKey: string;
  fieldLabel: string;
}

export type PrefillMap = Record<NodeId, Record<string, PrefillSource | undefined>>;

export function usePrefillMap() {
  const [prefillMap, setPrefillMap] = useState<PrefillMap>({});

  const handleSetPrefill = (nodeId: NodeId, fieldKey: string, source: PrefillSource) => {
    setPrefillMap((prev) => {
      const prevPrefillSources = prev[nodeId];
      if (!prevPrefillSources) {
        return {
          ...prev,
          [nodeId]: {
            [fieldKey]: source,
          },
        };
      }

      return {
        ...prev,
        [nodeId]: { ...prevPrefillSources, [fieldKey]: source },
      };
    });
  };

  const handleClearPrefill = (nodeId: NodeId, fieldKey: string) => {
    setPrefillMap((prev) => ({
      ...prev,
      [nodeId]: { ...(prev[nodeId] ?? {}), [fieldKey]: undefined },
    }));
  };

  return { prefillMap, handleSetPrefill, handleClearPrefill };
}
