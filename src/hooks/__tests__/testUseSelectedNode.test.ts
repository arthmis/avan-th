import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NodeId } from "../../Graph/graph";
import { useSelectedNode } from "../useSelectedNode";

describe("useSelectedNode", () => {
  it("should select a node when one is selected", () => {
    const { result } = renderHook(() => useSelectedNode());

    act(() => {
      result.current.handleSelectNode(makeTestNodeId("node-1"));
    });

    expect(result.current.selectedNodeId).toBe("node-1");
  });

  it("should update the selected node when a different node is selected", () => {
    const { result } = renderHook(() => useSelectedNode());

    act(() => {
      result.current.handleSelectNode(makeTestNodeId("node-1"));
    });

    act(() => {
      result.current.handleSelectNode(makeTestNodeId("node-2"));
    });

    expect(result.current.selectedNodeId).toBe("node-2");
  });

  it("should deselect the node when the same node is selected again", () => {
    const { result } = renderHook(() => useSelectedNode());

    act(() => {
      result.current.handleSelectNode(makeTestNodeId("node-1"));
    });

    act(() => {
      result.current.handleSelectNode(makeTestNodeId("node-1"));
    });

    expect(result.current.selectedNodeId).toBeUndefined();
  });
});

function makeTestNodeId(id: string): NodeId {
  return id as NodeId;
}
