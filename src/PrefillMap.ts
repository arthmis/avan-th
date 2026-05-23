import { useState } from "react";

export interface PrefillSource {
  sourceNodeId: string;
  sourceName: string;
  fieldKey: string;
  fieldLabel: string;
}
// generalized form of PrefillSource
// sourceNodeId
// fieldKey: probably could be optional
// field schema: describes what the data looks like for the fieldKey
// this is to check if the source field is compatible with the destination field

export type PrefillMap = Record<string, Record<string, PrefillSource | undefined>>;

export function usePrefillMap() {
  const [prefillMap, setPrefillMap] = useState<PrefillMap>({});

  const handleSetPrefill = (nodeId: string, fieldKey: string, source: PrefillSource) => {
    setPrefillMap((prev) => ({
      ...prev,
      [nodeId]: { ...(prev[nodeId] ?? {}), [fieldKey]: source },
    }));
  };

  const handleClearPrefill = (nodeId: string, fieldKey: string) => {
    setPrefillMap((prev) => ({
      ...prev,
      [nodeId]: { ...(prev[nodeId] ?? {}), [fieldKey]: undefined },
    }));
  };

  return { prefillMap, handleSetPrefill, handleClearPrefill };
}
