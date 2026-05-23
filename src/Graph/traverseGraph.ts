// ─── Prefill ─────────────────────────────────────────────────────────────────

import type { ActionBlueprintGraph, GraphNode } from "./graphTypes";

export interface AncestorNode {
  node: GraphNode;
}

// upstream node should only return node id
// registry will provide the actual data like FormDefinition or whatever the type of node it is
export function getAncestorNodes(nodeId: string, graph: ActionBlueprintGraph): AncestorNode[] {
  const { reverseAdj, nodeById, forms } = graph;

  const result: AncestorNode[] = [];
  const visited = new Set<string>();
  const queue: string[] = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current) {
      for (const parentId of reverseAdj.get(current) ?? []) {
        if (!visited.has(parentId)) {
          visited.add(parentId);
          const node = nodeById.get(parentId);
          if (node) {
            const form = forms.get(node.data.componentId);
            if (form) {
              result.push({ node });
            }
          }
          queue.push(parentId);
        }
      }
    }
  }

  return result;
}
