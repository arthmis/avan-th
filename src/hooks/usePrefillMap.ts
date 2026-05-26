import { useState } from "react";
import type { NodeId } from "../Graph/graph";

/**
 * `PrefillSource` is a discriminated union on `sourceType`.
 *
 * To add a new source type:
 *  1. Define a new interface that extends `DataSource` with a unique
 *     `sourceType` literal. Add any source-specific fields alongside it, e.g.:
 *
 *     ```ts
 *     export interface PrefillOrganizationSource extends DataSource {
 *       sourceType: "organization";
 *       organizationId: string; // source-specific field
 *     }
 *     ```
 *
 *  2. Add the new interface to this union:
 *
 *     ```ts
 *     export type PrefillSource = PrefillNodeSource | PrefillGlobalSource | PrefillOrganizationSource;
 *     ```
 *
 *  3. Handle the new `sourceType` wherever `PrefillSource` is narrowed
 *     (any `switch`/`if` blocks that branch on `source.sourceType`).
 */
export type PrefillSource = PrefillNodeSource | PrefillGlobalSource;

export interface PrefillNodeSource extends DataSource {
  sourceType: "node";
  sourceNodeId: NodeId;
}

export interface PrefillGlobalSource extends DataSource {
  sourceType: "global";
}

interface DataSource {
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
