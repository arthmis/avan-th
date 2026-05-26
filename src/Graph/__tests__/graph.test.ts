import seedrandom from "seedrandom";
import { describe, expect, test } from "vitest";
import type { Blueprint, Graph, NodeId } from "../graph";
import { getAncestorNodes } from "../traverseGraph";
import { DagBuilder } from "./dagBuilder";

// ─── Config ───────────────────────────────────────────────────────────────────

/** Number of random graph runs per test. */
const RUNS = 500;

// ─── Graph builder ────────────────────────────────────────────────────────────
//
// Each run samples random generation parameters, producing a wide variety of
// shapes: shallow-and-wide, deep-and-narrow, spined, and everything in between.
// Cross-edges (branch-to-branch shortcuts) are also randomly added, giving the
// generator a chance to produce non-tree DAGs.

type GraphGenerationOptions = {
  maxDepth?: number;
  maxBreadth?: number;
  depthBias?: number;
  breadthBias?: number;
  crossEdgeProb?: number;
};

function buildGraph(
  rng: () => number,
  options?: GraphGenerationOptions,
): {
  graph: Graph;
  blueprint: Blueprint;
  params: string;
} {
  let { maxDepth, maxBreadth, depthBias, breadthBias, crossEdgeProb } = options ?? {};
  maxDepth = 2 + Math.floor(rng() * (maxDepth ?? 9)); // 2–10
  maxBreadth = 1 + Math.floor(rng() * (maxBreadth ?? 5)); // 1–5
  depthBias = depthBias ?? rng();
  breadthBias = breadthBias ?? rng();
  crossEdgeProb = rng() * (crossEdgeProb ?? 0.3); // 0–0.3

  const params = `maxDepth=${maxDepth} maxBreadth=${maxBreadth} depthBias=${depthBias.toFixed(2)} breadthBias=${breadthBias.toFixed(2)} crossEdgeProb=${crossEdgeProb.toFixed(2)}`;

  const builder = DagBuilder.generate(
    { maxDepth, maxBreadth, depthBias, breadthBias, crossEdgeProb },
    rng,
  );

  const graphResult = builder.build();
  if (!graphResult.ok) throw new Error(`Graph build failed: ${graphResult.error.kind}`);

  const graph: Graph = graphResult.value;

  const blueprint: Blueprint = {
    id: "test-blueprint",
    tenantId: "test-tenant",
    name: "Test Blueprint",
    description: "",
    category: "",
    nodeById: new Map(graph.nodes.map((n) => [n.nodeId, n])),
    forms: new Map(),
    globalDataSources: new Map(),
  };

  return { graph, blueprint, params };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildForwardAdj(g: Graph): Map<NodeId, NodeId[]> {
  const adj = new Map<NodeId, NodeId[]>();
  for (const edge of g.edges) {
    const list = adj.get(edge.source) ?? [];
    list.push(edge.target);
    adj.set(edge.source, list);
  }
  return adj;
}

function canReach(fromId: NodeId, toId: NodeId, forwardAdj: Map<NodeId, NodeId[]>): boolean {
  const visited = new Set<NodeId>();
  const queue: NodeId[] = [fromId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === toId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const neighbor of forwardAdj.get(current) ?? []) {
      queue.push(neighbor);
    }
  }
  return false;
}

// ─── traverseGraph tests ──────────────────────────────────────────────────────

describe("getAncestorNodes", () => {
  test("every returned ancestor can reach its descendant via forward traversal", () => {
    for (let run = 0; run < RUNS; run++) {
      const seed = Math.random();
      const rng = seedrandom(seed);
      const { graph, blueprint, params } = buildGraph(rng);
      const forwardAdj = buildForwardAdj(graph);

      for (const node of graph.nodes) {
        const ancestors = getAncestorNodes(node.nodeId, graph, blueprint);
        const uniqueAncestors = new Set(ancestors.map((a) => a.node.nodeId));
        expect(uniqueAncestors.size).toBe(ancestors.length);

        for (const { node: ancestor } of ancestors) {
          expect(
            canReach(ancestor.nodeId, node.nodeId, forwardAdj),
            `run ${run + 1}/${RUNS} (seed=${seed}, ${params}): expected ${ancestor.nodeId} to reach ${node.nodeId}`,
          ).toBe(true);
        }
      }
    }
  });

  test("root nodes (no incoming edges) have no ancestors", () => {
    for (let run = 0; run < RUNS; run++) {
      const seed = Math.random();
      const rng = seedrandom(seed);
      const { graph, blueprint, params } = buildGraph(rng);

      for (const node of graph.nodes) {
        const hasParent = (graph.reverseAdj.get(node.nodeId) ?? []).length > 0;
        if (!hasParent) {
          expect(
            getAncestorNodes(node.nodeId, graph, blueprint),
            `run ${run + 1}/${RUNS} (seed=${seed}, ${params}): root node ${node.nodeId} should have no ancestors`,
          ).toEqual([]);
        }
      }
    }
  });
});
