import { describe, expect } from "bun:test";
import { Contract, ContractError, ContractKit } from "@beep/contract";
import { layer } from "@beep/testkit";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const Echo = Contract.make("Echo", {
  payload: { value: S.String },
  success: S.Struct({ echoed: S.String }),
  failure: S.Struct({ reason: S.String }),
});

const Returner = Contract.make("Returner", {
  payload: { value: S.String },
  success: S.Struct({ echoed: S.String }),
  failure: S.Struct({ reason: S.String }),
  failureMode: "return",
});

describe("ContractKit", () => {
  const EchoKit = ContractKit.make(Echo);
  const ReturnKit = ContractKit.make(Returner);

  layer(EchoKit.toLayer({ Echo: ({ value }) => Effect.succeed({ echoed: value }) }))(
    "success path and payload validation",
    (it) => {
      it.effect("executes implementations and encodes results", () =>
        Effect.gen(function* () {
          const withImpl = yield* EchoKit;
          const result = yield* withImpl.handle("Echo")({ value: "ping" });
          expect(result.isFailure).toBe(false);
          if (result.isFailure) {
            throw new Error("expected success");
          }
          const successResult = result as {
            readonly isFailure: false;
            readonly result: { readonly echoed: string };
            readonly encodedResult: { readonly echoed: string };
          };
          expect(successResult.result.echoed).toBe("ping");
          expect(successResult.encodedResult).toEqual({ echoed: "ping" });
        })
      );

      it.effect("fails when payload validation fails", () =>
        Effect.gen(function* () {
          const withImpl = yield* EchoKit;
          const exit = yield* Effect.exit(withImpl.handle("Echo")({ value: 123 as any }));
          const failure = O.getOrUndefined(
            Exit.match(exit, {
              onSuccess: () => O.none(),
              onFailure: (cause) => Cause.failureOption(cause),
            })
          );
          if (!(failure instanceof ContractError.MalformedOutput)) {
            throw new Error("expected MalformedOutput");
          }
          expect(F.pipe(failure.description ?? "", Str.includes("Failed to decode contract call payload"))).toBe(true);
        })
      );

      it.effect("reports missing contracts", () =>
        Effect.gen(function* () {
          const withImpl = yield* EchoKit;
          const exit = yield* Effect.exit((withImpl.handle as any)("Missing")({ value: "x" }));
          const failure = O.getOrUndefined(
            Exit.match(exit, {
              onSuccess: () => O.none(),
              onFailure: (cause) => Cause.failureOption(cause),
            })
          );
          if (!(failure instanceof ContractError.MalformedOutput)) {
            throw new Error("expected MalformedOutput");
          }
          expect(F.pipe(failure.description ?? "", Str.includes("Failed to find contract with name 'Missing'"))).toBe(
            true
          );
        })
      );
    }
  );

  layer(EchoKit.toLayer({ Echo: () => Effect.fail({ reason: "boom" }) }))("error failure mode", (it) => {
    it.effect("propagates failure channel when failureMode is error", () =>
      Effect.gen(function* () {
        const withImpl = yield* EchoKit;
        const exit = yield* Effect.exit(withImpl.handle("Echo")({ value: "x" }));
        const failure = O.getOrUndefined(
          Exit.match(exit, {
            onSuccess: () => O.none(),
            onFailure: (cause) => Cause.failureOption(cause),
          })
        );
        expect(failure).toEqual({ reason: "boom" });
      })
    );
  });

  layer(EchoKit.toLayer({ Echo: () => Effect.succeed({ echoed: 123 as any }) }))(
    "malformed implementation outputs",
    (it) => {
      it.effect("fails validation when implementations return malformed results", () =>
        Effect.gen(function* () {
          const withImpl = yield* EchoKit;
          const exit = yield* Effect.exit(withImpl.handle("Echo")({ value: "ping" }));
          const failure = O.getOrUndefined(
            Exit.match(exit, {
              onSuccess: () => O.none(),
              onFailure: (cause) => Cause.failureOption(cause),
            })
          );
          if (!(failure instanceof ContractError.MalformedInput)) {
            throw new Error("expected MalformedInput");
          }
          expect(F.pipe(failure.description ?? "", Str.includes("Failed to validate contract call result"))).toBe(true);
        })
      );
    }
  );

  layer(ReturnKit.toLayer({ Returner: () => Effect.fail({ reason: "broken" }) }))("return failure mode", (it) => {
    it.effect("returns failure results when failureMode is return", () =>
      Effect.gen(function* () {
        const withImpl = yield* ReturnKit;
        const result = yield* withImpl.handle("Returner")({ value: "x" });
        expect(result.isFailure).toBe(true);
        if (!result.isFailure) {
          throw new Error("expected failure");
        }
        const failureResult = result as {
          readonly isFailure: true;
          readonly result: { readonly reason: string };
        };
        expect(failureResult.result.reason).toBe("broken");
      })
    );
  });
});
