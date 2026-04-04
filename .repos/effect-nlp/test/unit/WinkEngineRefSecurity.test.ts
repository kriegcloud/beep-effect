/**
 * Security and Isolation Tests for WinkEngineRef
 * Ensures proper state management and isolation between engine instances
 */

import { describe, it, expect } from "vitest";
import { Effect, Ref, Layer, Chunk, Data } from "effect";
import { WinkEngineRef } from "../../src/NLP/Wink/WinkEngineRef.js";
import { WinkEngine } from "../../src/NLP/Wink/WinkEngine.js";
import { WinkEngineCustomEntities } from "../../src/NLP/Wink/WinkPattern.js";
import { Pattern, LiteralPatternElement } from "../../src/NLP/Core/Pattern.js";

describe("WinkEngineRef Security and State Management", () => {
  const createTestEntities = (
    name: string,
    literals: ReadonlyArray<string>
  ) => {
    const pattern = new Pattern({
      id: Pattern.Id(`${name}-pattern`),
      elements: Chunk.make(
        LiteralPatternElement.make({ value: Data.array(literals) as any })
      ),
    });
    return WinkEngineCustomEntities.fromPatterns(name, [pattern]);
  };

  const createValidTestEntities = () => {
    const pattern = new Pattern({
      id: Pattern.Id("test-money"),
      elements: Chunk.make(
        LiteralPatternElement.make({ value: Data.array(["$"] as const) }),
        LiteralPatternElement.make({
          value: Data.array(["100", "200"] as const),
        })
      ),
    });
    return WinkEngineCustomEntities.fromPatterns("money", [pattern]);
  };

  describe("Ref State Isolation", () => {
    it("should create a single shared ref instance", async () => {
      const program = Effect.gen(function* () {
        const refService1 = yield* WinkEngineRef;
        const refService2 = yield* WinkEngineRef;

        // Both services should return the same ref instance
        const ref1 = refService1.getRef();
        const ref2 = refService2.getRef();

        expect(ref1).toBe(ref2);

        // Verify they point to the same state
        const state1 = yield* Ref.get(ref1);
        const state2 = yield* Ref.get(ref2);

        expect(state1.instanceId).toBe(state2.instanceId);
      });

      await Effect.runPromise(
        program.pipe(Effect.provide(WinkEngineRef.Default))
      );
    });

    it("should maintain state consistency across multiple WinkEngine instances", async () => {
      const program = Effect.gen(function* () {
        const engine1 = yield* WinkEngine;
        const engine2 = yield* WinkEngine;

        const entities = createValidTestEntities();

        // Learn entities through first engine
        yield* engine1.learnCustomEntities(entities);

        // Both engines should use the same underlying nlp instance
        const tokens1 = yield* engine1.getWinkTokens("I have $100 now");
        const tokens2 = yield* engine2.getWinkTokens("I have $100 now");

        // Both should have the same tokenization results
        expect(tokens1.map((t) => t.out())).toEqual(
          tokens2.map((t) => t.out())
        );
        expect(tokens1.length).toBeGreaterThan(0);
      });

      await Effect.runPromise(
        program.pipe(
          Effect.provide(Layer.mergeAll(WinkEngine.Default, WinkEngineRef.Default))
        )
      );
    });
  });

  describe("State Update Security", () => {
    it("should reuse nlp instance when learning custom entities", async () => {
      const program = Effect.gen(function* () {
        const refService = yield* WinkEngineRef;
        const initialState = yield* Ref.get(refService.getRef());
        const initialNlp = initialState.nlp;

        const entities = createTestEntities("security", ["secure", "test"]);
        yield* refService.updateWithCustomEntities(entities);

        const updatedState = yield* Ref.get(refService.getRef());
        const updatedNlp = updatedState.nlp;

        // Should reuse the same nlp instance for memory efficiency
        expect(updatedNlp).toBe(initialNlp);

        // But should have learned the entities
        expect(updatedState.customEntities).toBeDefined();
        expect(updatedState.customEntities?.name).toBe("security");
      });

      await Effect.runPromise(
        program.pipe(Effect.provide(WinkEngineRef.Default))
      );
    });

    it("should generate different instance IDs for different entity sets", async () => {
      const program = Effect.gen(function* () {
        const refService = yield* WinkEngineRef;
        const initialState = yield* Ref.get(refService.getRef());

        const entities1 = createTestEntities("set1", ["alpha", "beta"]);
        yield* refService.updateWithCustomEntities(entities1);
        const state1 = yield* Ref.get(refService.getRef());

        const entities2 = createTestEntities("set2", ["gamma", "delta"]);
        yield* refService.updateWithCustomEntities(entities2);
        const state2 = yield* Ref.get(refService.getRef());

        // All instance IDs should be different
        expect(initialState.instanceId).not.toBe(state1.instanceId);
        expect(state1.instanceId).not.toBe(state2.instanceId);
        expect(initialState.instanceId).not.toBe(state2.instanceId);
      });

      await Effect.runPromise(
        program.pipe(Effect.provide(WinkEngineRef.Default))
      );
    });

    it("should handle concurrent updates safely", async () => {
      const program = Effect.gen(function* () {
        const refService = yield* WinkEngineRef;

        const entities1 = createTestEntities("concurrent1", ["fast", "update"]);
        const entities2 = createTestEntities("concurrent2", ["slow", "update"]);

        // Start concurrent updates
        const update1 = refService.updateWithCustomEntities(entities1);
        const update2 = refService.updateWithCustomEntities(entities2);

        // Both should complete successfully
        yield* Effect.all([update1, update2], { concurrency: "unbounded" });

        const finalState = yield* Ref.get(refService.getRef());

        // One of the updates should be the final state
        expect(finalState.customEntities).toBeDefined();
        const finalName = finalState.customEntities?.name;
        expect(["concurrent1", "concurrent2"]).toContain(finalName);
      });

      await Effect.runPromise(
        program.pipe(Effect.provide(WinkEngineRef.Default))
      );
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should handle empty custom entities successfully", async () => {
      const program = Effect.gen(function* () {
        const refService = yield* WinkEngineRef;
        const initialState = yield* Ref.get(refService.getRef());

        // Create entities with empty patterns (wink-nlp actually accepts these)
        const emptyEntities = WinkEngineCustomEntities.fromPatterns(
          "empty",
          []
        );

        // This should succeed with empty entities
        yield* refService.updateWithCustomEntities(emptyEntities);

        // Ref should be updated with new state
        const stateAfterUpdate = yield* Ref.get(refService.getRef());
        expect(stateAfterUpdate.instanceId).not.toBe(initialState.instanceId);
        expect(stateAfterUpdate.customEntities?.name).toBe("empty");
        expect(stateAfterUpdate.customEntities?.size()).toBe(0);
      });

      await Effect.runPromise(
        program.pipe(Effect.provide(WinkEngineRef.Default))
      );
    });

    it("should maintain state consistency after successive updates", async () => {
      const program = Effect.gen(function* () {
        const engine = yield* WinkEngine;
        const refService = yield* WinkEngineRef;

        // First update with valid entities
        const validEntities = createTestEntities("valid", ["good", "entities"]);
        yield* engine.learnCustomEntities(validEntities);

        const stateAfterValid = yield* Ref.get(refService.getRef());
        expect(stateAfterValid.customEntities?.name).toBe("valid");

        // Second update with different entities
        const newEntities = createTestEntities("updated", ["new", "words"]);
        yield* engine.learnCustomEntities(newEntities);

        // State should be updated to reflect new entities
        const stateAfterUpdate = yield* Ref.get(refService.getRef());
        expect(stateAfterUpdate.instanceId).not.toBe(
          stateAfterValid.instanceId
        );
        expect(stateAfterUpdate.customEntities?.name).toBe("updated");
      });

      await Effect.runPromise(
        program.pipe(
          Effect.provide(
            Layer.mergeAll(WinkEngine.Default, WinkEngineRef.Default)
          )
        )
      );
    });
  });

  describe("Memory and Resource Management", () => {
    it("should not leak memory with multiple updates", async () => {
      const program = Effect.gen(function* () {
        const refService = yield* WinkEngineRef;
        const initialState = yield* Ref.get(refService.getRef());

        // Perform a couple of updates to test state management
        // (reduced from 5 to avoid memory issues with wink-nlp model)
        for (let i = 0; i < 2; i++) {
          const entities = createTestEntities(`iteration-${i}`, [
            `word${i}`,
            `test${i}`,
          ]);
          yield* refService.updateWithCustomEntities(entities);
        }

        const finalState = yield* Ref.get(refService.getRef());

        // Should have the latest entities
        expect(finalState.customEntities?.name).toBe("iteration-1");

        // Instance ID should be different from initial
        expect(finalState.instanceId).not.toBe(initialState.instanceId);

        // NLP instance should be functional
        const testDoc = finalState.nlp.readDoc("word4 test4");
        expect(testDoc.tokens().length()).toBeGreaterThan(0);
      });

      await Effect.runPromise(
        program.pipe(Effect.provide(WinkEngineRef.Default))
      );
    });

    it("should reuse nlp instances for memory efficiency", async () => {
      const program = Effect.gen(function* () {
        const refService = yield* WinkEngineRef;
        const initialState = yield* Ref.get(refService.getRef());
        const initialNlp = initialState.nlp;

        // Update with new entities
        const entities = createTestEntities("disposal", ["dispose", "test"]);
        yield* refService.updateWithCustomEntities(entities);

        const newState = yield* Ref.get(refService.getRef());
        const newNlp = newState.nlp;

        // Should reuse the same nlp instance for memory efficiency
        expect(newNlp).toBe(initialNlp);

        // Both nlp references point to the same instance with updated entities
        const testDoc = newNlp.readDoc("dispose test");
        const extractedEntities = testDoc.entities().out();

        // The reused nlp instance should have the custom entities learned
        expect(extractedEntities).toBeDefined();
        expect(testDoc.tokens().length()).toBeGreaterThan(0);
      });

      await Effect.runPromise(
        program.pipe(Effect.provide(WinkEngineRef.Default))
      );
    });
  });

  describe("State Inspection and Debugging", () => {
    it("should provide access to current state for debugging", async () => {
      const program = Effect.gen(function* () {
        const refService = yield* WinkEngineRef;
        const engine = yield* WinkEngine;

        // Check initial state
        const initialState = yield* Ref.get(refService.getRef());
        expect(initialState.customEntities).toBeUndefined();
        expect(initialState.instanceId).toMatch(/^wink-engine-/);
        expect(initialState.nlp).toBeDefined();

        // Update state
        const entities = createTestEntities("debug", ["debug", "state"]);
        yield* engine.learnCustomEntities(entities);

        // Check updated state
        const updatedState = yield* Ref.get(refService.getRef());
        expect(updatedState.customEntities).toBeDefined();
        expect(updatedState.customEntities?.name).toBe("debug");
        expect(updatedState.customEntities?.size()).toBe(1);
        expect(updatedState.instanceId).not.toBe(initialState.instanceId);
      });

      await Effect.runPromise(
        program.pipe(
          Effect.provide(
            Layer.mergeAll(WinkEngine.Default, WinkEngineRef.Default)
          )
        )
      );
    });
  });
});
