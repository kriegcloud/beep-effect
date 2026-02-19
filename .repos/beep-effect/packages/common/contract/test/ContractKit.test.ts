import { describe, expect } from "bun:test";
import { ContractError } from "@beep/contract";
import { Contract } from "@beep/contract/Contract";
import { ContractKit } from "@beep/contract/ContractKit";
import { effect, layer } from "@beep/testkit";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as O from "effect/Option";
import * as S from "effect/Schema";

/**
 * Custom error types for testing error mapping
 */
class TestFailure extends S.TaggedError<TestFailure>()("TestFailure", {
  message: S.String,
}) {}

class MappedDefectError extends S.TaggedError<MappedDefectError>()("MappedDefectError", {
  originalMessage: S.String,
}) {}

class AnotherMappedError extends S.TaggedError<AnotherMappedError>()("AnotherMappedError", {
  reason: S.String,
}) {}

/**
 * Mock error class simulating third-party errors (like DOMException for WebAuthn)
 */
class ThirdPartyError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "ThirdPartyError";
    this.code = code;
  }
}

/**
 * Another mock third-party error for testing multiple error types
 */
class ExternalApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ExternalApiError";
    this.statusCode = statusCode;
  }
}

describe("ContractKit V2", () => {
  // Define contracts for testing
  const FooContract = Contract.make("Foo", {
    payload: { input: S.String },
    success: S.Struct({ output: S.String }),
    failure: S.Union(TestFailure, MappedDefectError),
    failureMode: "return",
  });

  const BarContract = Contract.make("Bar", {
    payload: { value: S.Number },
    success: S.Struct({ doubled: S.Number }),
    failure: S.Union(MappedDefectError, AnotherMappedError),
    failureMode: "return",
  });

  const BazContract = Contract.make("Baz", {
    payload: {},
    success: S.Void,
    failure: TestFailure,
    failureMode: "return",
  });

  describe("ContractKit.make()", () => {
    effect("creates a kit with multiple contracts", () =>
      Effect.gen(function* () {
        const kit = ContractKit.make(FooContract, BarContract);

        expect(kit.contracts).toBeDefined();
        expect(Object.keys(kit.contracts)).toHaveLength(2);
        expect(kit.contracts.Foo).toBe(FooContract);
        expect(kit.contracts.Bar).toBe(BarContract);
      })
    );

    effect("creates a kit with a single contract", () =>
      Effect.gen(function* () {
        const kit = ContractKit.make(FooContract);

        expect(Object.keys(kit.contracts)).toHaveLength(1);
        expect(kit.contracts.Foo).toBe(FooContract);
      })
    );

    effect("creates an empty kit", () =>
      Effect.gen(function* () {
        const kit = ContractKit.empty;

        expect(Object.keys(kit.contracts)).toHaveLength(0);
      })
    );
  });

  describe("ContractKit.liftService() with global mapDefect", () => {
    const TestKit = ContractKit.make(FooContract);

    const TestLayer = TestKit.toLayer({
      Foo: () => Effect.die(new ThirdPartyError("third party failed", "TP001")),
    });

    layer(TestLayer)("maps defects to typed failures", (it) => {
      it.effect("maps ThirdPartyError to MappedDefectError via global mapDefect", () =>
        Effect.gen(function* () {
          const service = yield* TestKit.liftService({
            mapDefect: (args) => {
              const error = Cause.squash(args.cause);
              if (error instanceof ThirdPartyError) {
                return new MappedDefectError({
                  originalMessage: error.message,
                });
              }
              return undefined;
            },
          });

          const exit = yield* Effect.exit(service.Foo({ input: "test" }));

          const failure = Exit.match(exit, {
            onSuccess: () => O.none(),
            onFailure: (cause) => Cause.failureOption(cause),
          });

          expect(O.isSome(failure)).toBe(true);
          const err = O.getOrUndefined(failure);
          expect(err).toBeInstanceOf(MappedDefectError);
          expect((err as MappedDefectError).originalMessage).toBe("third party failed");
        })
      );
    });

    const FallbackLayer = TestKit.toLayer({
      Foo: () => Effect.die(new Error("unmapped error type")),
    });

    layer(FallbackLayer)("falls back to UnknownError when mapper returns undefined", (it) => {
      it.effect("creates UnknownError for unmapped defects", () =>
        Effect.gen(function* () {
          const service = yield* TestKit.liftService({
            mapDefect: (args) => {
              const error = Cause.squash(args.cause);
              // Only map ThirdPartyError, return undefined for others
              if (error instanceof ThirdPartyError) {
                return new MappedDefectError({ originalMessage: error.message });
              }
              return undefined;
            },
          });

          const exit = yield* Effect.exit(service.Foo({ input: "test" }));

          const failure = Exit.match(exit, {
            onSuccess: () => O.none(),
            onFailure: (cause) => Cause.failureOption(cause),
          });

          expect(O.isSome(failure)).toBe(true);
          expect(O.getOrUndefined(failure)).toBeInstanceOf(ContractError.UnknownError);
        })
      );
    });
  });

  describe("ContractKit.liftService() per-contract mapDefect override", () => {
    // Use single-contract kits to simplify type handling
    const FooKit = ContractKit.make(FooContract);
    const BarKit = ContractKit.make(BarContract);

    const FooDefectLayer = FooKit.toLayer({
      Foo: () => Effect.die(new ThirdPartyError("foo error", "FOO001")),
    });

    const BarDefectLayer = BarKit.toLayer({
      Bar: () => Effect.die(new ExternalApiError("bar error", 500)),
    });

    layer(FooDefectLayer)("contract-specific mapper for Foo", (it) => {
      it.effect("uses contract-specific mapper when provided", () =>
        Effect.gen(function* () {
          const service = yield* FooKit.liftService({
            // Global mapper - should be overridden
            mapDefect: () => {
              return new MappedDefectError({
                originalMessage: "global mapper used",
              });
            },
            // Per-contract mappers
            contractMappers: {
              Foo: (args) => {
                const error = Cause.squash(args.cause);
                if (error instanceof ThirdPartyError) {
                  return new MappedDefectError({
                    originalMessage: `contract-specific: ${error.message}`,
                  });
                }
                return undefined;
              },
            },
          });

          const fooExit = yield* Effect.exit(service.Foo({ input: "test" }));
          const fooFailure = Exit.match(fooExit, {
            onSuccess: () => O.none(),
            onFailure: (cause) => Cause.failureOption(cause),
          });

          expect(O.isSome(fooFailure)).toBe(true);
          const fooErr = O.getOrUndefined(fooFailure) as MappedDefectError;
          expect(fooErr).toBeInstanceOf(MappedDefectError);
          // Should use contract-specific mapper
          expect(fooErr.originalMessage).toBe("contract-specific: foo error");
        })
      );
    });

    layer(BarDefectLayer)("global mapper for Bar (no contract-specific override)", (it) => {
      it.effect("uses global mapper when no contract-specific override", () =>
        Effect.gen(function* () {
          const service = yield* BarKit.liftService({
            // Global mapper - should be used for Bar
            mapDefect: (args) => {
              const error = Cause.squash(args.cause);
              return new MappedDefectError({
                originalMessage: `global: ${error instanceof Error ? error.message : "unknown"}`,
              });
            },
            // No contract mappers for Bar
          });

          const barExit = yield* Effect.exit(service.Bar({ value: 42 }));
          const barFailure = Exit.match(barExit, {
            onSuccess: () => O.none(),
            onFailure: (cause) => Cause.failureOption(cause),
          });

          expect(O.isSome(barFailure)).toBe(true);
          const barErr = O.getOrUndefined(barFailure) as MappedDefectError;
          expect(barErr).toBeInstanceOf(MappedDefectError);
          // Should use global mapper
          expect(barErr.originalMessage).toBe("global: bar error");
        })
      );
    });
  });

  describe("ContractKit.liftService() onDefect hook with mapDefect", () => {
    const HookKit = ContractKit.make(FooContract);

    const HookLayer = HookKit.toLayer({
      Foo: () => Effect.die(new ThirdPartyError("defect for hook test", "HOOK001")),
    });

    layer(HookLayer)("onDefect hook is called even when mapDefect handles the error", (it) => {
      it.effect("invokes onDefect hook before mapping", () =>
        Effect.gen(function* () {
          let hookWasCalled = false;
          let capturedCause: Cause.Cause<unknown> | undefined;

          const service = yield* HookKit.liftService({
            hooks: {
              onDefect: (args) =>
                Effect.sync(() => {
                  hookWasCalled = true;
                  capturedCause = args.cause;
                }),
            },
            mapDefect: (args) => {
              const error = Cause.squash(args.cause);
              if (error instanceof ThirdPartyError) {
                return new MappedDefectError({ originalMessage: error.message });
              }
              return undefined;
            },
          });

          yield* Effect.exit(service.Foo({ input: "test" }));

          expect(hookWasCalled).toBe(true);
          expect(capturedCause).toBeDefined();
          expect(Cause.isDie(capturedCause!)).toBe(true);
        })
      );
    });
  });

  describe("ContractKit.toLayer() creates working Layer", () => {
    const FooLayerKit = ContractKit.make(FooContract);
    const BarLayerKit = ContractKit.make(BarContract);

    const FooWorkingLayer = FooLayerKit.toLayer({
      Foo: ({ input }) => Effect.succeed({ output: `processed: ${input}` }),
    });

    const BarWorkingLayer = BarLayerKit.toLayer({
      Bar: ({ value }) => Effect.succeed({ doubled: value * 2 }),
    });

    layer(FooWorkingLayer)("Foo Layer provides working implementation", (it) => {
      it.effect("Foo implementation works correctly", () =>
        Effect.gen(function* () {
          const service = yield* FooLayerKit.liftService({ mode: "result" });

          const result = yield* service.Foo({ input: "hello" });

          expect(result._tag).toBe("success");
          if (result._tag === "success") {
            expect(result.result.output).toBe("processed: hello");
          }
        })
      );
    });

    layer(BarWorkingLayer)("Bar Layer provides working implementation", (it) => {
      it.effect("Bar implementation works correctly", () =>
        Effect.gen(function* () {
          const service = yield* BarLayerKit.liftService({ mode: "result" });

          const result = yield* service.Bar({ value: 21 });

          expect(result._tag).toBe("success");
          if (result._tag === "success") {
            expect(result.result.doubled).toBe(42);
          }
        })
      );
    });
  });

  describe("ContractKit.toLayer() with mapDefect in implementations", () => {
    const DefectKit = ContractKit.make(FooContract);

    const DefectLayer = DefectKit.toLayer({
      Foo: () => Effect.die(new ThirdPartyError("layer defect", "LAYER001")),
    });

    layer(DefectLayer)("mapDefect works through Layer interface", (it) => {
      it.effect("maps defects when accessing service through Layer", () =>
        Effect.gen(function* () {
          const service = yield* DefectKit.liftService({
            mapDefect: (args) => {
              const error = Cause.squash(args.cause);
              if (error instanceof ThirdPartyError) {
                return new MappedDefectError({
                  originalMessage: `via layer: ${error.message}`,
                });
              }
              return undefined;
            },
          });

          const exit = yield* Effect.exit(service.Foo({ input: "test" }));

          const failure = Exit.match(exit, {
            onSuccess: () => O.none(),
            onFailure: (cause) => Cause.failureOption(cause),
          });

          expect(O.isSome(failure)).toBe(true);
          const err = O.getOrUndefined(failure) as MappedDefectError;
          expect(err).toBeInstanceOf(MappedDefectError);
          expect(err.originalMessage).toBe("via layer: layer defect");
        })
      );
    });
  });

  describe("Error propagation through lifted service", () => {
    const FooPropKit = ContractKit.make(FooContract);
    const BazPropKit = ContractKit.make(BazContract);

    describe("failures from Effect.fail() are preserved", () => {
      const FooFailureLayer = FooPropKit.toLayer({
        Foo: () => Effect.fail(new TestFailure({ message: "explicit failure" })),
      });

      layer(FooFailureLayer)("preserves typed failures", (it) => {
        it.effect("Effect.fail() failures are preserved without mapping", () =>
          Effect.gen(function* () {
            const service = yield* FooPropKit.liftService({
              mapDefect: () => {
                // This should NOT be called for Effect.fail()
                return new MappedDefectError({ originalMessage: "should not see this" });
              },
            });

            const exit = yield* Effect.exit(service.Foo({ input: "test" }));

            const failure = Exit.match(exit, {
              onSuccess: () => O.none(),
              onFailure: (cause) => Cause.failureOption(cause),
            });

            expect(O.isSome(failure)).toBe(true);
            const err = O.getOrUndefined(failure);
            // Should be the original TestFailure, not MappedDefectError
            expect(err).toBeInstanceOf(TestFailure);
            expect((err as TestFailure).message).toBe("explicit failure");
          })
        );
      });
    });

    describe("defects from Effect.die() are mapped via mapDefect", () => {
      const FooDieLayer = FooPropKit.toLayer({
        Foo: () => Effect.die(new ThirdPartyError("die error", "DIE001")),
      });

      const BazDieLayer = BazPropKit.toLayer({
        Baz: () => Effect.die(new Error("generic die")),
      });

      layer(FooDieLayer)("maps Foo defects correctly", (it) => {
        it.effect("Effect.die() defects are mapped via mapDefect", () =>
          Effect.gen(function* () {
            const service = yield* FooPropKit.liftService({
              mapDefect: (args) => {
                const error = Cause.squash(args.cause);
                if (error instanceof ThirdPartyError) {
                  return new MappedDefectError({ originalMessage: error.message });
                }
                return undefined;
              },
            });

            const exit = yield* Effect.exit(service.Foo({ input: "test" }));

            const failure = Exit.match(exit, {
              onSuccess: () => O.none(),
              onFailure: (cause) => Cause.failureOption(cause),
            });

            expect(O.isSome(failure)).toBe(true);
            expect(O.getOrUndefined(failure)).toBeInstanceOf(MappedDefectError);
          })
        );
      });

      layer(BazDieLayer)("unmapped defects become UnknownError", (it) => {
        it.effect("unmapped Effect.die() becomes UnknownError", () =>
          Effect.gen(function* () {
            const service = yield* BazPropKit.liftService({
              mapDefect: (args) => {
                const error = Cause.squash(args.cause);
                // Only map ThirdPartyError - regular Error won't match
                if (error instanceof ThirdPartyError) {
                  return new TestFailure({ message: error.message });
                }
                return undefined;
              },
            });

            const exit = yield* Effect.exit(service.Baz({}));

            const failure = Exit.match(exit, {
              onSuccess: () => O.none(),
              onFailure: (cause) => Cause.failureOption(cause),
            });

            expect(O.isSome(failure)).toBe(true);
            expect(O.getOrUndefined(failure)).toBeInstanceOf(ContractError.UnknownError);
          })
        );
      });
    });
  });

  describe("liftService mode options", () => {
    const ModeKit = ContractKit.make(FooContract);

    const SuccessLayer = ModeKit.toLayer({
      Foo: ({ input }) => Effect.succeed({ output: `success: ${input}` }),
    });

    layer(SuccessLayer)("mode options work correctly", (it) => {
      it.effect("mode 'success' returns Success type directly (default)", () =>
        Effect.gen(function* () {
          const service = yield* ModeKit.liftService({ mode: "success" });

          const result = yield* service.Foo({ input: "test" });

          // In success mode, result is the Success type directly
          expect(result.output).toBe("success: test");
        })
      );

      it.effect("mode 'result' returns HandleOutcome discriminated union", () =>
        Effect.gen(function* () {
          const service = yield* ModeKit.liftService({ mode: "result" });

          const result = yield* service.Foo({ input: "test" });

          // In result mode, result is HandleOutcome
          expect(result._tag).toBe("success");
          if (result._tag === "success") {
            expect(result.result.output).toBe("success: test");
          }
        })
      );
    });
  });

  describe("mapDefect receives correct context", () => {
    const FooContextKit = ContractKit.make(FooContract);
    const BarContextKit = ContractKit.make(BarContract);

    const FooContextLayer = FooContextKit.toLayer({
      Foo: () => Effect.die(new ThirdPartyError("context test", "CTX001")),
    });

    const BarContextLayer = BarContextKit.toLayer({
      Bar: () => Effect.die(new ExternalApiError("bar context", 404)),
    });

    layer(FooContextLayer)("global mapDefect receives context for Foo", (it) => {
      it.effect("global mapDefect receives name, contract, cause, and payload", () =>
        Effect.gen(function* () {
          let capturedName: string | undefined;
          let capturedContractName: string | undefined;
          let capturedPayload: unknown;

          const service = yield* FooContextKit.liftService({
            mapDefect: (args) => {
              capturedName = args.name as string;
              capturedContractName = args.contract.name;
              capturedPayload = args.payload;
              // Return MappedDefectError for any defect, or undefined to fallback
              if (Cause.isDie(args.cause)) {
                return new MappedDefectError({ originalMessage: "mapped" });
              }
              return undefined;
            },
          });

          yield* Effect.exit(service.Foo({ input: "context-payload" }));

          expect(capturedName).toBe("Foo");
          expect(capturedContractName).toBe("Foo");
          expect(capturedPayload).toEqual({ input: "context-payload" });
        })
      );
    });

    layer(BarContextLayer)("contract-specific mapDefect receives context for Bar", (it) => {
      it.effect("contract-specific mapDefect receives contract and payload", () =>
        Effect.gen(function* () {
          let capturedContractName: string | undefined;
          let capturedPayload: unknown;

          const service = yield* BarContextKit.liftService({
            contractMappers: {
              Bar: (args) => {
                capturedContractName = args.contract.name;
                capturedPayload = args.payload;
                return new MappedDefectError({ originalMessage: "bar mapped" });
              },
            },
          });

          yield* Effect.exit(service.Bar({ value: 123 }));

          expect(capturedContractName).toBe("Bar");
          expect(capturedPayload).toEqual({ value: 123 });
        })
      );
    });
  });

  describe("hooks integration", () => {
    const HooksKit = ContractKit.make(FooContract);

    describe("onSuccess hook", () => {
      const SuccessHookLayer = HooksKit.toLayer({
        Foo: ({ input }) => Effect.succeed({ output: input }),
      });

      layer(SuccessHookLayer)("onSuccess hook is called on success", (it) => {
        it.effect("invokes onSuccess with success value", () =>
          Effect.gen(function* () {
            let successHookCalled = false;
            let capturedSuccess: unknown;

            const service = yield* HooksKit.liftService({
              hooks: {
                onSuccess: (args) =>
                  Effect.sync(() => {
                    successHookCalled = true;
                    capturedSuccess = args.success;
                  }),
              },
            });

            yield* service.Foo({ input: "hook-test" });

            expect(successHookCalled).toBe(true);
            expect(capturedSuccess).toEqual({ output: "hook-test" });
          })
        );
      });
    });

    describe("onFailure hook", () => {
      const FailureHookLayer = HooksKit.toLayer({
        Foo: () => Effect.fail(new TestFailure({ message: "hook failure" })),
      });

      layer(FailureHookLayer)("onFailure hook is called on failure", (it) => {
        it.effect("invokes onFailure with failure value", () =>
          Effect.gen(function* () {
            let failureHookCalled = false;
            let capturedFailure: unknown;

            const service = yield* HooksKit.liftService({
              hooks: {
                onFailure: (args) =>
                  Effect.sync(() => {
                    failureHookCalled = true;
                    capturedFailure = args.failure;
                  }),
              },
            });

            yield* Effect.exit(service.Foo({ input: "test" }));

            expect(failureHookCalled).toBe(true);
            expect(capturedFailure).toBeInstanceOf(TestFailure);
          })
        );
      });
    });
  });

  describe("ContractKit.merge()", () => {
    effect("merges multiple kits into one", () =>
      Effect.gen(function* () {
        const kit1 = ContractKit.make(FooContract);
        const kit2 = ContractKit.make(BarContract);
        const kit3 = ContractKit.make(BazContract);

        const merged = ContractKit.merge(kit1, kit2, kit3);

        expect(Object.keys(merged.contracts)).toHaveLength(3);
        expect(merged.contracts.Foo).toBe(FooContract);
        expect(merged.contracts.Bar).toBe(BarContract);
        expect(merged.contracts.Baz).toBe(BazContract);
      })
    );
  });

  describe("ContractKit.of() helper", () => {
    effect("provides type-safe implementation declarations", () =>
      Effect.gen(function* () {
        const kit = ContractKit.make(FooContract);

        const implementations = kit.of({
          Foo: ({ input }) => Effect.succeed({ output: input }),
        });

        // Just verify it returns the same object (type checking happens at compile time)
        expect(implementations.Foo).toBeDefined();
      })
    );
  });
});
