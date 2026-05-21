// ─── Prefill ─────────────────────────────────────────────────────────────────

import type { ActionBlueprintGraph, FormDefinition, GraphNode } from "./graphTypes";

export interface UpstreamNode {
  node: GraphNode;
  form: FormDefinition;
}

export function getAncestorNodes(nodeId: string, graph: ActionBlueprintGraph): UpstreamNode[] {
  const { reverseAdj, nodeById, forms } = graph;

  const result: UpstreamNode[] = [];
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
            const form = forms.get(node.formId);
            if (form) {
              result.push({ node, form });
            }
          }
          queue.push(parentId);
        }
      }
    }
  }

  return result;
}
