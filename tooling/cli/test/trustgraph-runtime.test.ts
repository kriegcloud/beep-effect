import { HashSet } from "effect";
import { describe, expect, it } from "vitest";
import {
  normalizeCuratedSyncStateForTarget,
  partitionManagedProcessingEntriesByDocument,
  shouldReloadManagedDocument,
} from "../src/commands/TrustGraph/internal/TrustGraphRuntime.js";

describe("TrustGraph sync state helpers", () => {
  it("reseeds the local sync state when the configured collection changes", () => {
    const state = {
      collection: "beep-effect",
      flow: "default",
      documents: {
        "urn:beep-effect:doc:AGENTS.md": {
          hash: "hash-1",
        },
      },
    } as const;

    const result = normalizeCuratedSyncStateForTarget(state, "beep-effect-sandbox", "default");

    expect(result.identityChanged).toBe(true);
    expect(result.previousCollection).toBe("beep-effect");
    expect(result.previousFlow).toBe("default");
    expect(result.state.collection).toBe("beep-effect-sandbox");
    expect(result.state.flow).toBe("default");
    expect(result.state.documents).toEqual({});
  });

  it("reseeds the local sync state when the configured flow changes", () => {
    const result = normalizeCuratedSyncStateForTarget(
      {
        collection: "beep-effect",
        flow: "default",
        documents: {
          "urn:beep-effect:doc:AGENTS.md": {
            hash: "hash-1",
          },
        },
      },
      "beep-effect",
      "graph-rag"
    );

    expect(result.identityChanged).toBe(true);
    expect(result.previousCollection).toBe("beep-effect");
    expect(result.previousFlow).toBe("default");
    expect(result.state.collection).toBe("beep-effect");
    expect(result.state.flow).toBe("graph-rag");
    expect(result.state.documents).toEqual({});
  });

  it("keeps empty sync state quiet while still targeting the requested collection and flow", () => {
    const result = normalizeCuratedSyncStateForTarget(
      {
        collection: "beep-effect",
        flow: "default",
        documents: {},
      },
      "beep-effect-sandbox",
      "graph-rag"
    );

    expect(result.identityChanged).toBe(false);
    expect(result.state.collection).toBe("beep-effect-sandbox");
    expect(result.state.flow).toBe("graph-rag");
    expect(result.state.documents).toEqual({});
  });

  it("reuses an unchanged managed document when only processing must be re-queued", () => {
    const managedDocumentIds = HashSet.fromIterable(["urn:beep-effect:doc:AGENTS.md"]);
    const shouldReload = shouldReloadManagedDocument(
      {
        documentId: "urn:beep-effect:doc:AGENTS.md",
        hash: "hash-1",
      },
      {
        collection: "beep-effect",
        flow: "default",
        documents: {
          "urn:beep-effect:doc:AGENTS.md": {
            hash: "hash-1",
          },
        },
      },
      managedDocumentIds
    );

    expect(shouldReload).toBe(false);
  });

  it("reloads a managed document when the tracked hash changes", () => {
    const managedDocumentIds = HashSet.fromIterable(["urn:beep-effect:doc:AGENTS.md"]);
    const shouldReload = shouldReloadManagedDocument(
      {
        documentId: "urn:beep-effect:doc:AGENTS.md",
        hash: "hash-2",
      },
      {
        collection: "beep-effect",
        flow: "default",
        documents: {
          "urn:beep-effect:doc:AGENTS.md": {
            hash: "hash-1",
          },
        },
      },
      managedDocumentIds
    );

    expect(shouldReload).toBe(true);
  });

  it("partitions managed processing rows by document id", () => {
    const partition = partitionManagedProcessingEntriesByDocument(
      [
        {
          collection: "beep-effect",
          documentId: "urn:beep-effect:doc:AGENTS.md",
          flow: "default",
          id: "processing-1",
          tags: [],
          user: "trustgraph",
        },
        {
          collection: "beep-effect",
          documentId: "urn:beep-effect:doc:CLAUDE.md",
          flow: "default",
          id: "processing-2",
          tags: [],
          user: "trustgraph",
        },
        {
          collection: "beep-effect",
          documentId: "urn:beep-effect:doc:AGENTS.md",
          flow: "graph-rag",
          id: "processing-3",
          tags: [],
          user: "trustgraph",
        },
      ],
      "urn:beep-effect:doc:AGENTS.md"
    );

    expect(partition.matching.map((entry) => entry.id)).toEqual(["processing-1", "processing-3"]);
    expect(partition.remaining.map((entry) => entry.id)).toEqual(["processing-2"]);
  });
});
