import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { NodeId } from "../../Graph/graph";
import { type PrefillSource, usePrefillMap } from "../usePrefillMap";

describe("usePrefillMap", () => {
  it("should add a prefill source for a given node", () => {
    const { result } = renderHook(() => usePrefillMap());

    act(() => {
      result.current.handleSetPrefill(
        makeTestNodeId("node-1"),
        "field-1",
        makeTestSource("source-a"),
      );
    });

    expect(result.current.prefillMap[makeTestNodeId("node-1")]["field-1"]).toEqual(
      makeTestSource("source-a"),
    );
  });

  it("should not change when the same source is added to the same node twice", () => {
    const { result } = renderHook(() => usePrefillMap());

    act(() => {
      result.current.handleSetPrefill(
        makeTestNodeId("node-1"),
        "field-1",
        makeTestSource("source-a"),
      );
    });

    act(() => {
      result.current.handleSetPrefill(
        makeTestNodeId("node-1"),
        "field-1",
        makeTestSource("source-a"),
      );
    });

    expect(result.current.prefillMap[makeTestNodeId("node-1")]["field-1"]).toEqual(
      makeTestSource("source-a"),
    );
    expect(Object.keys(result.current.prefillMap[makeTestNodeId("node-1")])).toHaveLength(1);
  });

  it("should remove a prefill source for a given node", () => {
    const { result } = renderHook(() => usePrefillMap());

    act(() => {
      result.current.handleSetPrefill(
        makeTestNodeId("node-1"),
        "field-1",
        makeTestSource("source-a"),
      );
    });

    act(() => {
      result.current.handleClearPrefill(makeTestNodeId("node-1"), "field-1");
    });

    expect(result.current.prefillMap[makeTestNodeId("node-1")]["field-1"]).toBeUndefined();
  });

  it("should have equal sources when the same source is added to two different nodes", () => {
    const { result } = renderHook(() => usePrefillMap());

    act(() => {
      result.current.handleSetPrefill(
        makeTestNodeId("node-1"),
        "field-1",
        makeTestSource("source-a"),
      );
      result.current.handleSetPrefill(
        makeTestNodeId("node-2"),
        "field-1",
        makeTestSource("source-a"),
      );
    });

    expect(result.current.prefillMap[makeTestNodeId("node-1")]["field-1"]).toEqual(
      result.current.prefillMap[makeTestNodeId("node-2")]["field-1"],
    );
  });

  it("should do nothing when removing a source from a node that does not have that source", () => {
    const { result } = renderHook(() => usePrefillMap());

    act(() => {
      result.current.handleSetPrefill(
        makeTestNodeId("node-1"),
        "field-1",
        makeTestSource("source-a"),
      );
    });

    expect(result.current.prefillMap[makeTestNodeId("node-1")]["field-2"]).toBeUndefined();
    act(() => {
      result.current.handleClearPrefill(makeTestNodeId("node-1"), "field-2");
    });

    expect(result.current.prefillMap[makeTestNodeId("node-1")]["field-1"]).toEqual(
      makeTestSource("source-a"),
    );
    expect(result.current.prefillMap[makeTestNodeId("node-1")]["field-2"]).toBeUndefined();
  });

  it("should not affect another node when a source is removed from one node", () => {
    const { result } = renderHook(() => usePrefillMap());

    act(() => {
      result.current.handleSetPrefill(
        makeTestNodeId("node-1"),
        "field-1",
        makeTestSource("source-a"),
      );
      result.current.handleSetPrefill(
        makeTestNodeId("node-2"),
        "field-1",
        makeTestSource("source-a"),
      );
    });

    act(() => {
      result.current.handleClearPrefill(makeTestNodeId("node-1"), "field-1");
    });

    expect(result.current.prefillMap[makeTestNodeId("node-1")]["field-1"]).toBeUndefined();
    expect(result.current.prefillMap[makeTestNodeId("node-2")]["field-1"]).toEqual(
      makeTestSource("source-a"),
    );
  });

  it("should not affect an existing source when a different source is added to the same node", () => {
    const { result } = renderHook(() => usePrefillMap());

    act(() => {
      result.current.handleSetPrefill(
        makeTestNodeId("node-1"),
        "field-1",
        makeTestSource("source-a"),
      );
    });

    act(() => {
      result.current.handleSetPrefill(
        makeTestNodeId("node-1"),
        "field-2",
        makeTestSource("source-b"),
      );
    });

    expect(result.current.prefillMap[makeTestNodeId("node-1")]["field-1"]).toEqual(
      makeTestSource("source-a"),
    );
    expect(result.current.prefillMap[makeTestNodeId("node-1")]["field-2"]).toEqual(
      makeTestSource("source-b"),
    );
  });

  it("should store multiple fields mapped to the same source for a node", () => {
    const { result } = renderHook(() => usePrefillMap());
    const source = makeTestSource("source-a");

    act(() => {
      result.current.handleSetPrefill(makeTestNodeId("node-1"), "field-1", source);
      result.current.handleSetPrefill(makeTestNodeId("node-1"), "field-2", source);
      result.current.handleSetPrefill(makeTestNodeId("node-1"), "field-3", source);
    });

    expect(result.current.prefillMap[makeTestNodeId("node-1")]["field-1"]).toEqual(source);
    expect(result.current.prefillMap[makeTestNodeId("node-1")]["field-2"]).toEqual(source);
    expect(result.current.prefillMap[makeTestNodeId("node-1")]["field-3"]).toEqual(source);
    expect(Object.keys(result.current.prefillMap[makeTestNodeId("node-1")])).toHaveLength(3);
  });

  it("should not add a source to another node when adding to one node", () => {
    const { result } = renderHook(() => usePrefillMap());

    act(() => {
      result.current.handleSetPrefill(
        makeTestNodeId("node-1"),
        "field-1",
        makeTestSource("source-a"),
      );
    });

    expect(result.current.prefillMap[makeTestNodeId("node-1")]["field-1"]).toEqual(
      makeTestSource("source-a"),
    );
    expect(result.current.prefillMap[makeTestNodeId("node-2")]).toBeUndefined();
  });
});

function makeTestNodeId(id: string): NodeId {
  return id as NodeId;
}

function makeTestSource(name: string): PrefillSource {
  return {
    sourceType: "global",
    sourceName: name,
    fieldKey: `${name}-key`,
    fieldLabel: `${name}-label`,
  };
}
