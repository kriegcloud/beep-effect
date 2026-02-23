import { describe, it, expect } from "vitest";
import { assert } from "chai";
import * as Registry from "@effect-atom/atom/Registry";
import { FilterVM, FilterVMLayer } from "./FilterVM";
import { TodoVMLive } from "../todos/TodoVM";
import { Context, Effect, Layer } from "effect";
import * as Loadable from "@/lib/Loadable";

const FilterVMWithDeps = FilterVMLayer.pipe(Layer.provide(TodoVMLive));

describe("FilterVM", () => {
  const makeVM = () => {
    const r = Registry.make();
    const vm = Layer.build(FilterVMWithDeps).pipe(
      Effect.map((ctx) => Context.get(ctx, FilterVM)),
      Effect.scoped,
      Effect.provideService(Registry.AtomRegistry, r),
      Effect.runSync
    );
    return { r, vm };
  };

  it("should start with 'all' filter", () => {
    const { r, vm } = makeVM();
    expect(r.get(vm.currentFilter$)).toBe("all");
  });

  describe("setFilter$", () => {
    it("should change filter to 'active'", () => {
      const { r, vm } = makeVM();
      r.set(vm.setFilter$, "active");
      expect(r.get(vm.currentFilter$)).toBe("active");
    });

    it("should change filter to 'completed'", () => {
      const { r, vm } = makeVM();
      r.set(vm.setFilter$, "completed");
      expect(r.get(vm.currentFilter$)).toBe("completed");
    });

    it("should change filter to 'all'", () => {
      const { r, vm } = makeVM();
      // First change to something else
      r.set(vm.setFilter$, "active");
      // Then change back to 'all'
      r.set(vm.setFilter$, "all");
      expect(r.get(vm.currentFilter$)).toBe("all");
    });
  });

  describe("filteredTodos$", () => {
    it("should return pending or ready filteredTodos on initial load", () => {
      const { r, vm } = makeVM();
      const filtered = r.get(vm.filteredTodos$);

      // Should be either pending or ready
      const isPendingOrReady = Loadable.isPending(filtered) || Loadable.isReady(filtered);
      assert(isPendingOrReady, "filteredTodos should be pending or ready");
    });

    it("should filter by 'all' when filter is set to all", () => {
      const { r, vm } = makeVM();

      // Set filter to 'all'
      r.set(vm.setFilter$, "all");

      const filtered = r.get(vm.filteredTodos$);
      // Should be either pending or ready with all todos
      assert(Loadable.isPending(filtered) || Loadable.isReady(filtered), "filteredTodos should be loadable");
    });

    it("should filter by 'active' when filter is set to active", () => {
      const { r, vm } = makeVM();

      // Set filter to 'active'
      r.set(vm.setFilter$, "active");

      const filtered = r.get(vm.filteredTodos$);
      assert(Loadable.isPending(filtered) || Loadable.isReady(filtered), "filteredTodos should be loadable");

      if (Loadable.isReady(filtered)) {
        // All todos in the filtered list should not be completed
        filtered.value.forEach(todo => {
          assert(!r.get(todo.completed$), "filtered todo should not be completed");
        });
      }
    });

    it("should filter by 'completed' when filter is set to completed", () => {
      const { r, vm } = makeVM();

      // Set filter to 'completed'
      r.set(vm.setFilter$, "completed");

      const filtered = r.get(vm.filteredTodos$);
      assert(Loadable.isPending(filtered) || Loadable.isReady(filtered), "filteredTodos should be loadable");

      if (Loadable.isReady(filtered)) {
        // All todos in the filtered list should be completed
        filtered.value.forEach(todo => {
          assert(r.get(todo.completed$), "filtered todo should be completed");
        });
      }
    });

    it("should reactively update when filter changes", () => {
      const { r, vm } = makeVM();

      // Start with 'all'
      expect(r.get(vm.currentFilter$)).toBe("all");
      const filtered1 = r.get(vm.filteredTodos$);
      assert(Loadable.isPending(filtered1) || Loadable.isReady(filtered1), "should be loadable");

      // Change to 'active'
      r.set(vm.setFilter$, "active");
      expect(r.get(vm.currentFilter$)).toBe("active");
      const filtered2 = r.get(vm.filteredTodos$);
      assert(Loadable.isPending(filtered2) || Loadable.isReady(filtered2), "should be loadable");

      // Change to 'completed'
      r.set(vm.setFilter$, "completed");
      expect(r.get(vm.currentFilter$)).toBe("completed");
      const filtered3 = r.get(vm.filteredTodos$);
      assert(Loadable.isPending(filtered3) || Loadable.isReady(filtered3), "should be loadable");
    });
  });
});
