import type { Graph, GraphEdge, GraphNode, NodeId } from "../graph";

// ─── Result type ─────────────────────────────────────────────────────────────

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// ─── Error types ─────────────────────────────────────────────────────────────

export type BuildError =
  | { kind: "duplicate_node"; nodeId: string }
  | { kind: "unknown_source"; nodeId: string }
  | { kind: "unknown_target"; nodeId: string }
  | { kind: "cycle"; processedCount: number; totalCount: number };

// ─── Generate params ──────────────────────────────────────────────────────────

export type GenerateParams = {
  maxDepth?: number;
  maxBreadth?: number;
  /** 0 = subtrees stay shallow, 1 = subtrees go as deep as possible */
  depthBias?: number;
  /** 0 = few children per node, 1 = many children per node */
  breadthBias?: number;
  /** Guarantee one path reaches this depth (the "spine") */
  spineDepth?: number | null;
  /** Probability each node sprouts a cross-edge into a different branch */
  crossEdgeProb?: number;
  /** Hard cap on total cross-edges added */
  maxCrossEdges?: number | null;
};

// ─── DagBuilder ──────────────────────────────────────────────────────────────

let nodeCounter = 0;

function makeTestNodeId(id: string): NodeId {
  return id as NodeId;
}

function makeTestNode(id: string, prerequisites: string[] = []): GraphNode {
  nodeCounter += 1;
  return {
    nodeId: makeTestNodeId(id),
    nodeType: "form",
    name: `Node ${id}`,
    data: {
      componentId: `component-${id}`,
      componentKey: `key-${id}`,
      componentType: "form",
    },
    position: { x: nodeCounter * 100, y: nodeCounter * 100 },
    prerequisites: prerequisites.map(makeTestNodeId),
  };
}

/**
 * Builder for constructing a directed acyclic Graph for use in tests.
 *
 * Each node carries an explicit construction depth. An edge source → target is
 * valid iff depth(source) < depth(target), which makes cycles structurally
 * impossible regardless of how edges are added.
 *
 * Usage — manual:
 *   const builder = new DagBuilder();
 *   builder.addNode("A", 0).addNode("B", 1).addNode("C", 2);
 *   builder.addEdge("A", "B");
 *   const result = builder.build();
 *
 * Usage — generated:
 *   const builder = DagBuilder.generate({ maxDepth: 6, breadthBias: 0.7 }, rng);
 *   const result = builder.build();
 */
export class DagBuilder {
  private nodeIds: string[] = [];
  /** Construction depth for each node — the sole guard against cycles. */
  private nodeDepths = new Map<string, number>();
  private edgePairs: [string, string][] = [];
  /** Tracks "source->target" strings to prevent duplicate edges. */
  private edgeSet = new Set<string>();
  private buildError: BuildError | null = null;

  addNode(id: string, depth: number = 0): this {
    if (this.buildError) return this;
    if (this.nodeDepths.has(id)) {
      this.buildError = { kind: "duplicate_node", nodeId: id };
      return this;
    }
    this.nodeDepths.set(id, depth);
    this.nodeIds.push(id);
    return this;
  }

  addEdge(source: string, target: string): Result<this, BuildError> {
    if (this.buildError) return Err(this.buildError);
    if (!this.nodeDepths.has(source)) return Err({ kind: "unknown_source", nodeId: source });
    if (!this.nodeDepths.has(target)) return Err({ kind: "unknown_target", nodeId: target });

    // Cycle prevention: source must sit at a strictly shallower depth than target.
    if (this.nodeDepths.get(source)! >= this.nodeDepths.get(target)!) {
      return Err({ kind: "cycle", processedCount: 0, totalCount: this.nodeIds.length });
    }

    const key = `${source}->${target}`;
    if (!this.edgeSet.has(key)) {
      this.edgePairs.push([source, target]);
      this.edgeSet.add(key);
    }
    return Ok(this);
  }

  build(): Result<Graph, BuildError> {
    if (this.buildError) return Err(this.buildError);

    nodeCounter = 0;

    const prerequisiteMap = new Map<string, string[]>();
    for (const [source, target] of this.edgePairs) {
      const list = prerequisiteMap.get(target) ?? [];
      list.push(source);
      prerequisiteMap.set(target, list);
    }

    const nodes: GraphNode[] = this.nodeIds.map((id) =>
      makeTestNode(id, prerequisiteMap.get(id) ?? []),
    );

    const edges: GraphEdge[] = this.edgePairs.map(([source, target]) => ({
      source: makeTestNodeId(source),
      target: makeTestNodeId(target),
    }));

    const reverseAdj = new Map<NodeId, NodeId[]>();
    for (const edge of edges) {
      const list = reverseAdj.get(edge.target) ?? [];
      list.push(edge.source);
      reverseAdj.set(edge.target, list);
    }

    return Ok({ nodes, edges, reverseAdj });
  }

  /**
   * Generate a tree-shaped DAG with optional cross-edges between branches.
   *
   * Phase 1 — tree: a single root at depth 0 recursively spawns children.
   * `depthBias` steers how deep child subtrees grow; `breadthBias` steers how
   * many children each node spawns. An optional `spineDepth` forces the first
   * child at every level to continue to that depth, producing one guaranteed
   * deep path even in an otherwise shallow tree.
   *
   * Phase 2 — cross-edges: each node independently attempts to add an edge to
   * a randomly chosen node at a strictly greater depth in a different branch.
   * Because target depth > source depth, these edges can never create cycles.
   */
  static generate(params: GenerateParams = {}, rng: () => number): DagBuilder {
    const {
      maxDepth = 8,
      maxBreadth = 4,
      depthBias = 0.5,
      breadthBias = 0.5,
      spineDepth = null,
      crossEdgeProb = 0.15,
      maxCrossEdges = null,
    } = params;

    const builder = new DagBuilder();
    const nodesByDepth = new Map<number, string[]>();
    let idCounter = 0;

    /**
     * Power-transformed uniform sample in [0, 1].
     * bias → 1: values cluster near 1  (deep / wide)
     * bias → 0: values cluster near 0  (shallow / narrow)
     */
    const skewed = (bias: number) => Math.pow(rng(), 1 / (bias * 9 + 1));

    function buildNode(depth: number, depthBudget: number, isSpine: boolean): string {
      const id = String(idCounter++);
      builder.addNode(id, depth);

      const bucket = nodesByDepth.get(depth) ?? [];
      bucket.push(id);
      nodesByDepth.set(depth, bucket);

      if (depth >= depthBudget) return id;

      const numChildren = Math.min(maxBreadth, 1 + Math.floor(skewed(breadthBias) * maxBreadth));

      for (let i = 0; i < numChildren; i++) {
        const childIsSpine = isSpine && i === 0;
        let childBudget: number;

        if (childIsSpine && spineDepth !== null) {
          // Spine child always reaches spineDepth.
          childBudget = Math.max(spineDepth, depthBudget);
        } else {
          const remaining = depthBudget - depth - 1;
          if (remaining <= 0) continue;
          childBudget = depth + 1 + Math.floor(skewed(depthBias) * remaining);
        }

        const childId = buildNode(depth + 1, childBudget, childIsSpine);
        builder.addEdge(id, childId);
      }

      return id;
    }

    // ── Phase 1: tree ─────────────────────────────────────────────────────────
    buildNode(0, maxDepth, spineDepth !== null);

    // ── Phase 2: cross-edges between branches ─────────────────────────────────
    const allDepths = [...nodesByDepth.keys()].sort((a, b) => a - b);
    let crossEdgesAdded = 0;

    outer: for (const depth of allDepths) {
      const deeperDepths = allDepths.filter((d) => d > depth);
      if (deeperDepths.length === 0) continue;

      for (const nodeId of nodesByDepth.get(depth) ?? []) {
        if (maxCrossEdges !== null && crossEdgesAdded >= maxCrossEdges) break outer;
        if (rng() > crossEdgeProb) continue;

        const targetDepth = deeperDepths[Math.floor(rng() * deeperDepths.length)];
        const candidates = nodesByDepth.get(targetDepth) ?? [];
        if (candidates.length === 0) continue;

        const target = candidates[Math.floor(rng() * candidates.length)];
        // addEdge silently deduplicates; only count genuinely new edges.
        const sizeBefore = builder.edgePairs.length;
        builder.addEdge(nodeId, target);
        if (builder.edgePairs.length > sizeBefore) crossEdgesAdded++;
      }
    }

    return builder;
  }
}
