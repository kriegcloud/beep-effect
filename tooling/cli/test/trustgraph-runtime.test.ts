import { HashSet } from "effect";
import { describe, expect, it } from "vitest";
import {
  normalizeCuratedSyncStateForCollection,
  shouldReloadManagedDocument,
} from "../src/commands/TrustGraph/internal/TrustGraphRuntime.js";

describe("TrustGraph sync state helpers", () => {
  it("reseeds the local sync state when the configured collection changes", () => {
    const state = {
      collection: "beep-effect",
      documents: {
        "urn:beep-effect:doc:AGENTS.md": {
          hash: "hash-1",
        },
      },
    } as const;

    const result = normalizeCuratedSyncStateForCollection(state, "beep-effect-sandbox");

    expect(result.collectionChanged).toBe(true);
    expect(result.previousCollection).toBe("beep-effect");
    expect(result.state.collection).toBe("beep-effect-sandbox");
    expect(result.state.documents).toEqual({});
  });

  it("keeps empty sync state quiet while still targeting the requested collection", () => {
    const result = normalizeCuratedSyncStateForCollection(
      {
        collection: "beep-effect",
        documents: {},
      },
      "beep-effect-sandbox"
    );

    expect(result.collectionChanged).toBe(false);
    expect(result.state.collection).toBe("beep-effect-sandbox");
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
});
