import { useState } from "react";

export interface PrefillSource {
  sourceNodeId: string;
  sourceFormName: string;
  fieldKey: string;
  fieldLabel: string;
}

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
