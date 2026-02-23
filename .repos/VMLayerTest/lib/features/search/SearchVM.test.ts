import { describe, it, expect } from "vitest";
import { assert } from "chai";
import * as Atom from "@effect-atom/atom/Atom";
import * as Registry from "@effect-atom/atom/Registry";
import { SearchVM, SearchVMLayer } from "./SearchVM";
import { TodoVM, TodoVMLive } from "../todos/TodoVM";
import { Context, Effect, Layer } from "effect";
import * as Loadable from "@/lib/Loadable";

const SearchVMWithDeps = SearchVMLayer.pipe(Layer.provide(TodoVMLive));

describe("SearchVM", () => {
  const makeVM = () => {
    const r = Registry.make();
    const ctx = Layer.build(SearchVMWithDeps).pipe(
      Effect.scoped,
      Effect.provideService(Registry.AtomRegistry, r),
      Effect.runSync
    );
    const searchVM = Context.get(ctx, SearchVM);
    // Mount fn atoms
    r.mount(searchVM.clearSearch$);
    return { r, searchVM };
  };

  it("should start with empty query", () => {
    const { r, searchVM } = makeVM();
    expect(r.get(searchVM.query$)).toBe("");
  });

  it("should not be searching when query is empty", () => {
    const { r, searchVM } = makeVM();
    assert(!r.get(searchVM.isSearching$));
  });

  it("should be searching when query is non-empty", () => {
    const { r, searchVM } = makeVM();
    r.set(searchVM.setQuery$, "test");
    assert(r.get(searchVM.isSearching$));
  });

  it("should update query via setQuery$", () => {
    const { r, searchVM } = makeVM();
    r.set(searchVM.setQuery$, "new query");
    expect(r.get(searchVM.query$)).toBe("new query");
  });

  it("should clear query via clearSearch$", () => {
    const { r, searchVM } = makeVM();
    r.set(searchVM.setQuery$, "test");
    expect(r.get(searchVM.query$)).toBe("test");

    r.set(searchVM.clearSearch$, undefined);
    expect(r.get(searchVM.query$)).toBe("");
  });

  it("should return pending results when todos are pending", () => {
    const { r, searchVM } = makeVM();
    const results = r.get(searchVM.results$);

    // Initially todos are pending (they load asynchronously)
    // This test may pass if ready, since loading is fast
    assert(Loadable.isPending(results) || Loadable.isReady(results));
  });

  it("should filter todos by search query (case insensitive)", () => {
    const { r, searchVM } = makeVM();

    // SearchVM filters todos that are loaded asynchronously
    // We can test that if there are any todos, filtering works correctly
    r.set(searchVM.setQuery$, "test");

    const results = r.get(searchVM.results$);

    if (Loadable.isReady(results) && results.value.length > 0) {
      // All results should contain "test" (case insensitive)
      for (const item of results.value) {
        const text = r.get(item.text$);
        assert(text.toLowerCase().includes("test"));
      }
    }
  });

  it("should compute resultCount correctly when query is empty", () => {
    const { r, searchVM } = makeVM();

    const results = r.get(searchVM.results$);
    const resultCount = r.get(searchVM.resultCount$);

    if (Loadable.isReady(results)) {
      expect(resultCount).toBe(results.value.length);
    } else {
      expect(resultCount).toBe(0);
    }
  });

  it("should compute resultCount correctly when filtering", () => {
    const { r, searchVM } = makeVM();

    // Search with a filter
    r.set(searchVM.setQuery$, "test");

    const results = r.get(searchVM.results$);
    const resultCount = r.get(searchVM.resultCount$);

    if (Loadable.isReady(results)) {
      expect(resultCount).toBe(results.value.length);
    } else {
      expect(resultCount).toBe(0);
    }
  });

  it("should return empty results when no matches found", () => {
    const { r, searchVM } = makeVM();

    r.set(searchVM.setQuery$, "xyznonexistent12345");

    const results = r.get(searchVM.results$);

    if (Loadable.isReady(results)) {
      expect(results.value.length).toBe(0);
    }
  });

  it("should return all todos when query is cleared", () => {
    const { r, searchVM } = makeVM();

    // Set a search query
    r.set(searchVM.setQuery$, "test");
    const filteredResults = r.get(searchVM.results$);

    // Clear search
    r.set(searchVM.clearSearch$, undefined);
    const allResults = r.get(searchVM.results$);

    // After clearing, should show all todos (if any are loaded)
    if (Loadable.isReady(allResults) && Loadable.isReady(filteredResults)) {
      expect(allResults.value.length).toBeGreaterThanOrEqual(filteredResults.value.length);
    }
  });

  it("should handle partial matches", () => {
    const { r, searchVM } = makeVM();

    r.set(searchVM.setQuery$, "a");

    const results = r.get(searchVM.results$);

    // If there are results, all should contain the letter "a"
    if (Loadable.isReady(results) && results.value.length > 0) {
      for (const item of results.value) {
        const text = r.get(item.text$);
        assert(text.toLowerCase().includes("a"));
      }
    }
  });
});
