import { describe, expect } from "bun:test";
import { ContractError } from "@beep/contract";
import { Contract } from "@beep/contract/Contract";
import { effect } from "@beep/testkit";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Exit from "effect/Exit";
import * as O from "effect/Option";
import * as S from "effect/Schema";

/**
 * Custom error types for testing error mapping
 */
class TestError extends S.TaggedError<TestError>()("TestError", {
  message: S.String,
  code: S.optional(S.Number),
}) {}

class NotAllowedError extends S.TaggedError<NotAllowedError>()("NotAllowedError", {
  message: S.String,
  domain: S.optional(S.String),
}) {}

class InvalidStateError extends S.TaggedError<InvalidStateError>()("InvalidStateError", {
  message: S.String,
}) {}

/**
 * Custom error class simulating DOMException for WebAuthn testing
 */
class MockDOMException extends Error {
  override name: string;
  constructor(message: string, name: string) {
    super(message);
    this.name = name;
  }
}

describe("Contract V2 Error Mapping", () => {
  effect("continuation mapError maps raw errors to typed failures", () =>
    Effect.gen(function* () {
      const contract = Contract.make("MapError", {
        payload: {},
        success: S.Struct({ ok: S.Boolean }),
        failure: S.Union(TestError, NotAllowedError),
      });

      const continuation = contract.continuation({
        mapError: (error, _ctx) => {
          if (error instanceof MockDOMException && error.name === "NotAllowedError") {
            return new NotAllowedError({
              message: error.message,
              domain: "test",
            });
          }
          if (error instanceof Error && error.message.includes("test")) {
            return new TestError({ message: error.message, code: 500 });
          }
          return undefined; // Fall through to default
        },
      });

      // Test NotAllowedError mapping
      const notAllowedExit = yield* Effect.exit(
        continuation.run(() => Promise.reject(new MockDOMException("User cancelled", "NotAllowedError")))
      );

      const notAllowedFailure = Exit.match(notAllowedExit, {
        onSuccess: () => O.none(),
        onFailure: (cause) => Cause.dieOption(cause),
      });

      expect(O.isSome(notAllowedFailure)).toBe(true);
      const notAllowed = O.getOrUndefined(notAllowedFailure);
      expect(notAllowed).toBeInstanceOf(NotAllowedError);
      expect((notAllowed as NotAllowedError).message).toBe("User cancelled");
      expect((notAllowed as NotAllowedError).domain).toBe("test");

      // Test TestError mapping
      const testErrorExit = yield* Effect.exit(continuation.run(() => Promise.reject(new Error("test failure"))));

      const testErrorFailure = Exit.match(testErrorExit, {
        onSuccess: () => O.none(),
        onFailure: (cause) => Cause.dieOption(cause),
      });

      expect(O.isSome(testErrorFailure)).toBe(true);
      const testErr = O.getOrUndefined(testErrorFailure);
      expect(testErr).toBeInstanceOf(TestError);
      expect((testErr as TestError).message).toBe("test failure");
      expect((testErr as TestError).code).toBe(500);

      // Test fallthrough to UnknownError
      const unknownExit = yield* Effect.exit(continuation.run(() => Promise.reject(new Error("unmapped error"))));

      const unknownFailure = Exit.match(unknownExit, {
        onSuccess: () => O.none(),
        onFailure: (cause) => Cause.dieOption(cause),
      });

      expect(O.isSome(unknownFailure)).toBe(true);
      expect(O.getOrUndefined(unknownFailure)).toBeInstanceOf(ContractError.UnknownError);
    })
  );

  effect("continuation mapError supports multiple mappers (tried in order)", () =>
    Effect.gen(function* () {
      const contract = Contract.make("MultiMapper", {
        payload: {},
        success: S.Void,
        failure: S.Union(NotAllowedError, InvalidStateError, TestError),
      });

      const domExceptionMapper = (error: unknown) => {
        if (error instanceof MockDOMException) {
          if (error.name === "NotAllowedError") {
            return new NotAllowedError({ message: error.message });
          }
          if (error.name === "InvalidStateError") {
            return new InvalidStateError({ message: error.message });
          }
        }
        return undefined;
      };

      const genericMapper = (error: unknown) => {
        if (error instanceof Error && error.message.startsWith("GENERIC:")) {
          return new TestError({ message: error.message.replace("GENERIC:", "") });
        }
        return undefined;
      };

      const continuation = contract.continuation({
        mapError: [domExceptionMapper, genericMapper],
      });

      // First mapper should handle DOMException
      const domExit = yield* Effect.exit(
        continuation.run(() => Promise.reject(new MockDOMException("cancelled", "NotAllowedError")))
      );
      const domFailure = Exit.match(domExit, {
        onSuccess: () => O.none(),
        onFailure: (cause) => Cause.dieOption(cause),
      });
      expect(O.getOrUndefined(domFailure)).toBeInstanceOf(NotAllowedError);

      // Second mapper should handle generic prefixed errors
      const genericExit = yield* Effect.exit(continuation.run(() => Promise.reject(new Error("GENERIC:handled"))));
      const genericFailure = Exit.match(genericExit, {
        onSuccess: () => O.none(),
        onFailure: (cause) => Cause.dieOption(cause),
      });
      expect(O.getOrUndefined(genericFailure)).toBeInstanceOf(TestError);
      expect((O.getOrUndefined(genericFailure) as TestError).message).toBe("handled");
    })
  );

  effect("continuation surfaceDefect returns Either with mapped error", () =>
    Effect.gen(function* () {
      const contract = Contract.make("SurfaceDefect", {
        payload: {},
        success: S.Struct({ ok: S.Boolean }),
        failure: NotAllowedError,
      });

      const continuation = contract.continuation({
        mapError: (error) => {
          if (error instanceof MockDOMException && error.name === "NotAllowedError") {
            return new NotAllowedError({ message: error.message });
          }
          return undefined;
        },
      });

      // With surfaceDefect: true, error becomes Either.Left
      const result = yield* continuation.run(
        () => Promise.reject(new MockDOMException("user declined", "NotAllowedError")),
        { surfaceDefect: true }
      );

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left).toBeInstanceOf(NotAllowedError);
        // Use unknown cast since the type is a union but runtime narrows to NotAllowedError
        expect((result.left as unknown as NotAllowedError).message).toBe("user declined");
      }
    })
  );

  effect("lift mapDefect converts defects to typed failures", () =>
    Effect.gen(function* () {
      const contract = Contract.make("LiftDefect", {
        payload: { value: S.Number },
        success: S.Struct({ doubled: S.Number }),
        failure: S.Union(NotAllowedError, InvalidStateError),
        failureMode: "return",
      });

      const liftedWithDefectMapper = Contract.lift(contract, {
        method: () => Effect.die(new MockDOMException("defect error", "NotAllowedError")),
        mapDefect: (cause, _ctx) => {
          const squashed = Cause.squash(cause);
          if (squashed instanceof MockDOMException && squashed.name === "NotAllowedError") {
            return new NotAllowedError({ message: squashed.message });
          }
          return undefined; // Fall through to UnknownError
        },
      });

      const defectExit = yield* Effect.exit(liftedWithDefectMapper.result({ value: 2 }));

      const defectFailure = Exit.match(defectExit, {
        onSuccess: () => O.none(),
        onFailure: (cause) => Cause.failureOption(cause),
      });

      expect(O.isSome(defectFailure)).toBe(true);
      const failure = O.getOrUndefined(defectFailure);
      expect(failure).toBeInstanceOf(NotAllowedError);
      expect((failure as NotAllowedError).message).toBe("defect error");
    })
  );

  effect("lift mapDefect falls back to UnknownError when mapper returns undefined", () =>
    Effect.gen(function* () {
      const contract = Contract.make("LiftDefectFallback", {
        payload: { value: S.Number },
        success: S.Struct({ doubled: S.Number }),
        failure: NotAllowedError,
        failureMode: "return",
      });

      const liftedWithFallback = Contract.lift(contract, {
        method: () => Effect.die(new Error("some other error")),
        mapDefect: (cause, _ctx) => {
          const squashed = Cause.squash(cause);
          // Only map DOMException NotAllowedError, return undefined for others
          if (squashed instanceof MockDOMException && squashed.name === "NotAllowedError") {
            return new NotAllowedError({ message: squashed.message });
          }
          return undefined;
        },
      });

      const defectExit = yield* Effect.exit(liftedWithFallback.result({ value: 2 }));

      const defectFailure = Exit.match(defectExit, {
        onSuccess: () => O.none(),
        onFailure: (cause) => Cause.failureOption(cause),
      });

      expect(O.isSome(defectFailure)).toBe(true);
      expect(O.getOrUndefined(defectFailure)).toBeInstanceOf(ContractError.UnknownError);
    })
  );

  effect("lift onDefect hook still called when mapDefect is provided", () =>
    Effect.gen(function* () {
      let defectHookCalled = false;
      let defectCauseIsDie = false;

      const contract = Contract.make("LiftDefectHook", {
        payload: { value: S.Number },
        success: S.Void,
        failure: NotAllowedError,
        failureMode: "return",
      });

      const lifted = Contract.lift(contract, {
        method: () => Effect.die(new MockDOMException("hook test", "NotAllowedError")),
        onDefect: (cause) =>
          Effect.sync(() => {
            defectHookCalled = true;
            defectCauseIsDie = Cause.isDie(cause);
          }),
        mapDefect: (cause, _ctx) => {
          const squashed = Cause.squash(cause);
          if (squashed instanceof MockDOMException && squashed.name === "NotAllowedError") {
            return new NotAllowedError({ message: squashed.message });
          }
          return undefined;
        },
      });

      yield* Effect.exit(lifted.result({ value: 1 }));

      expect(defectHookCalled).toBe(true);
      expect(defectCauseIsDie).toBe(true);
    })
  );

  effect("continuation metadata is available in mapError context", () =>
    Effect.gen(function* () {
      const contract = Contract.make("MetadataContext", {
        payload: {},
        success: S.Void,
        failure: NotAllowedError,
      })
        .annotate(Contract.Domain, "passkey")
        .annotate(Contract.Method, "create");

      let capturedDomain: string | undefined;
      let capturedMethod: string | undefined;
      let capturedContractName: string | undefined;

      const continuation = contract.continuation({
        mapError: (error, ctx) => {
          capturedDomain = ctx.metadata.domain;
          capturedMethod = ctx.metadata.method;
          capturedContractName = ctx.contract.name;
          if (error instanceof MockDOMException) {
            return new NotAllowedError({
              message: error.message,
              domain: ctx.metadata.domain,
            });
          }
          return undefined;
        },
      });

      yield* Effect.exit(
        continuation.run(() => Promise.reject(new MockDOMException("context test", "NotAllowedError")))
      );

      expect(capturedDomain).toBe("passkey");
      expect(capturedMethod).toBe("create");
      expect(capturedContractName).toBe("MetadataContext");
    })
  );

  effect("continuation decodeFailure is tried before mapError", () =>
    Effect.gen(function* () {
      const contract = Contract.make("DecodeBeforeMap", {
        payload: {},
        success: S.Void,
        failure: S.Struct({ code: S.Number, message: S.String }),
      });

      let mapperWasCalled = false;

      const continuation = contract.continuation({
        decodeFailure: {
          select: (error) => (error as { readonly payload?: unknown }).payload,
        },
        mapError: (_error, _ctx) => {
          mapperWasCalled = true;
          return undefined;
        },
      });

      // Error with payload that matches failureSchema - should be decoded directly
      const decodableExit = yield* Effect.exit(
        continuation.run(() => Promise.reject({ payload: { code: 400, message: "bad request" } }))
      );

      const decodedFailure = Exit.match(decodableExit, {
        onSuccess: () => O.none(),
        onFailure: (cause) => Cause.dieOption(cause),
      });

      expect(O.isSome(decodedFailure)).toBe(true);
      expect(O.getOrUndefined(decodedFailure)).toEqual({ code: 400, message: "bad request" });
      // mapError should NOT have been called because decodeFailure succeeded
      expect(mapperWasCalled).toBe(false);
    })
  );

  effect("continuation mapError is called when decodeFailure fails", () =>
    Effect.gen(function* () {
      const contract = Contract.make("DecodeFailsMapSucceeds", {
        payload: {},
        success: S.Void,
        failure: TestError,
      });

      let mapperWasCalled = false;

      const continuation = contract.continuation({
        decodeFailure: {
          select: (error) => (error as { readonly payload?: unknown }).payload,
        },
        mapError: (error, _ctx) => {
          mapperWasCalled = true;
          if (error instanceof Error) {
            return new TestError({ message: error.message });
          }
          return undefined;
        },
      });

      // Error that doesn't have payload matching failureSchema
      yield* Effect.exit(continuation.run(() => Promise.reject(new Error("not decodable"))));

      expect(mapperWasCalled).toBe(true);
    })
  );
});
