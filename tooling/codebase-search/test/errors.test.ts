import { describe, expect, it } from "@effect/vitest";
import {
  EmbeddingModelError,
  IndexingError,
  IndexNotFoundError,
  SearchTimeoutError,
  SymbolNotFoundError,
} from "../src/errors.js";

describe("errors", () => {
  it("constructs IndexNotFoundError", () => {
    const error = new IndexNotFoundError({
      message: "Index missing",
      indexPath: ".code-index",
    });
    expect(error.message).toBe("Index missing");
    expect(error.indexPath).toBe(".code-index");
  });

  it("constructs SymbolNotFoundError", () => {
    const error = new SymbolNotFoundError({
      message: "Symbol missing",
      symbolId: "pkg/mod/Foo",
    });
    expect(error.message).toBe("Symbol missing");
    expect(error.symbolId).toBe("pkg/mod/Foo");
  });

  it("constructs EmbeddingModelError", () => {
    const error = new EmbeddingModelError({
      message: "Model failed",
      modelName: "nomic-ai/nomic-embed-text-v1.5",
    });
    expect(error.modelName).toBe("nomic-ai/nomic-embed-text-v1.5");
  });

  it("constructs SearchTimeoutError", () => {
    const error = new SearchTimeoutError({
      message: "Timed out",
      timeoutMs: 5000,
    });
    expect(error.timeoutMs).toBe(5000);
  });

  it("constructs IndexingError", () => {
    const error = new IndexingError({
      message: "Indexing failed",
      phase: "symbol-extraction",
    });
    expect(error.phase).toBe("symbol-extraction");
  });
});
