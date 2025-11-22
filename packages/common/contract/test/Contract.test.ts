import { describe, expect } from "bun:test";
import { Contract, ContractError } from "@beep/contract";
import { effect } from "@beep/testkit";
import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Exit from "effect/Exit";
import * as O from "effect/Option";
import * as S from "effect/Schema";

describe("Contract runtime", () => {
  effect("creates contracts with schema helpers and annotations", () =>
    Effect.gen(function* () {
      const contract = Contract.make("Example", {
        description: "example contract",
        payload: { id: S.String },
        success: S.Struct({ ok: S.Boolean }),
        failure: S.Struct({ reason: S.String }),
      })
        .annotate(Contract.Title, "Example Title")
        .annotate(Contract.Domain, "contract-tests")
        .annotate(Contract.Method, "example.run")
        .annotate(Contract.SupportsAbort, true);

      expect(contract.id).toBe("@beep/contract/Contract/Example");
      expect(contract.failureMode).toBe(Contract.FailureMode.Enum.error);

      const payload = { id: "abc" };
      const decodedPayload = yield* contract.decodePayload(payload);
      expect(decodedPayload.id).toBe("abc");
      const encodedPayload = yield* contract.encodePayload(payload);
      expect(encodedPayload.id).toBe("abc");
      expect(contract.isPayload(payload)).toBe(true);

      const updatedPayload = contract.setPayload(S.Struct({ id: S.Number }));
      const decodedNumberPayload = yield* updatedPayload.decodeUnknownPayload({ id: 1 });
      expect(decodedNumberPayload.id).toBe(1);

      const successValue = { ok: true };
      const decodedSuccess = yield* contract.decodeUnknownSuccess(successValue);
      expect(decodedSuccess.ok).toBe(true);
      expect(contract.isSuccess(successValue)).toBe(true);

      const failureValue = { reason: "bad" };
      const decodedFailure = yield* contract.decodeUnknownFailure(failureValue);
      expect(decodedFailure.reason).toBe("bad");
      expect(contract.isFailure(failureValue)).toBe(true);

      const annotations = contract.annotations;
      const titleOpt = Context.getOption(annotations, Contract.Title);
      const domainOpt = Context.getOption(annotations, Contract.Domain);
      const methodOpt = Context.getOption(annotations, Contract.Method);
      const supportsAbortOpt = Context.getOption(annotations, Contract.SupportsAbort);

      expect(O.isSome(titleOpt)).toBe(true);
      expect(O.isSome(domainOpt)).toBe(true);
      expect(O.isSome(methodOpt)).toBe(true);
      expect(O.getOrElse(() => false)(supportsAbortOpt)).toBe(true);
    })
  );

  effect("implements handlers with hooks and failure handling", () =>
    Effect.gen(function* () {
      let successHookCalled = false;
      let failureHookCalled = false;

      const successContract = Contract.make("Hooked", {
        payload: { id: S.String },
        success: S.Struct({ ok: S.String }),
        failure: S.Struct({ reason: S.String }),
      });

      const successImpl = successContract.implement(({ id }) => Effect.succeed({ ok: id }), {
        onSuccess: () =>
          Effect.sync(() => {
            successHookCalled = true;
          }),
      });

      const successResult = yield* successImpl({ id: "value" });
      expect(successResult.ok).toBe("value");
      expect(successHookCalled).toBe(true);

      const failureContract = Contract.make("HookedFail", {
        payload: { id: S.String },
        success: S.Struct({ ok: S.Boolean }),
        failure: S.Struct({ reason: S.String }),
      });

      const failingImpl = failureContract.implement(() => Effect.fail({ reason: "boom" }), {
        onFailure: () =>
          Effect.sync(() => {
            failureHookCalled = true;
          }),
      });

      const failureExit = yield* Effect.exit(failingImpl({ id: "x" }));
      const failureOpt = Exit.match(failureExit, {
        onSuccess: () => O.none(),
        onFailure: (cause) => Cause.failureOption(cause),
      });
      expect(O.isSome(failureOpt)).toBe(true);
      expect(O.getOrUndefined(failureOpt)).toEqual({ reason: "boom" });
      expect(failureHookCalled).toBe(true);
    })
  );

  effect("matches outcomes using FailureMode and handleOutcome", () =>
    Effect.gen(function* () {
      const returnContract = Contract.make("ReturnMode", {
        payload: {},
        success: S.Void,
        failure: S.Struct({ issue: S.String }),
        failureMode: "return",
      });

      const errorContract = Contract.make("ErrorMode", {
        payload: {},
        success: S.Void,
        failure: S.Struct({ issue: S.String }),
      });

      const failureOutcome = Contract.FailureMode.matchOutcome(returnContract, {
        isFailure: true,
        result: { issue: "nope" },
        encodedResult: { issue: "nope" },
      });

      const successOutcome = Contract.FailureMode.matchOutcome(errorContract, {
        isFailure: false,
        result: undefined,
        encodedResult: undefined,
      });

      expect(failureOutcome.mode).toBe(Contract.FailureMode.Enum.return);
      expect(failureOutcome._tag).toBe("failure");
      expect(successOutcome.mode).toBe(Contract.FailureMode.Enum.error);

      const handled = yield* Contract.handleOutcome(returnContract)({
        onSuccess: (succ) => Effect.succeed(succ.result),
        onFailure: (fail) => Effect.succeed(fail.result.issue),
      })(failureOutcome);

      expect(handled as unknown as string).toBe("nope");
    })
  );

  effect("continuation composes metadata, abort support, and normalization", () =>
    Effect.gen(function* () {
      const contract = Contract.make("Abortable", {
        payload: {},
        success: S.Struct({ ok: S.String }),
        failure: S.Struct({ reason: S.String }),
      }).annotate(Contract.SupportsAbort, true);

      const continuation = contract.continuation({
        metadata: { extra: { attempt: 1 }, overrides: { description: "overridden" } },
      });

      let sawSignal = false;
      const continuationResult = yield* continuation.run(({ signal }) => {
        if (signal) {
          sawSignal = signal.aborted === false;
        }
        return Promise.resolve({ ok: "done" });
      });

      expect(continuationResult.ok).toBe("done");
      expect(continuation.metadata.supportsAbort).toBe(true);
      expect(continuation.metadata.extra?.attempt).toBe(1);
      expect(sawSignal).toBe(true);

      const dieExit = yield* Effect.exit(continuation.run(() => Promise.reject(new Error("explode"))));
      const dieCheck = Exit.match(dieExit, {
        onFailure: (cause) => Cause.isDie(cause),
        onSuccess: () => false,
      });
      expect(dieCheck).toBe(true);

      const either = yield* continuation.run(() => Promise.reject(new Error("visible failure")), {
        surfaceDefect: true,
      });
      if (Either.isLeft(either)) {
        expect(either.left).toBeInstanceOf(ContractError.UnknownError);
      } else {
        throw new Error("expected UnknownError");
      }

      const raiseExit = yield* Effect.exit(continuation.raiseResult({ error: new Error("bad result") }));
      const raiseDie = Exit.match(raiseExit, {
        onFailure: (cause) => Cause.isDie(cause),
        onSuccess: () => false,
      });
      expect(raiseDie).toBe(true);

      const noErrorExit = yield* Effect.exit(continuation.raiseResult({ error: null } as any));
      expect(Exit.isSuccess(noErrorExit)).toBe(true);
    })
  );

  effect("lift wraps implementations and hooks", () =>
    Effect.gen(function* () {
      let successHook = false;
      let failureHook = false;
      let defectHook = false;

      const liftedContract = Contract.make("Liftable", {
        payload: { value: S.Number },
        success: S.Struct({ doubled: S.Number }),
        failure: S.Struct({ reason: S.String }),
        failureMode: "return",
      });

      const liftedSuccess = Contract.lift(liftedContract, {
        method: () =>
          Effect.succeed({
            isFailure: false,
            result: { doubled: 4 },
            encodedResult: { doubled: 4 },
          }),
        onSuccess: () =>
          Effect.sync(() => {
            successHook = true;
          }),
      });

      const success = yield* liftedSuccess.success({ value: 2 });
      expect(success.doubled).toBe(4);
      expect(successHook).toBe(true);

      const liftedFailure = Contract.lift(liftedContract, {
        method: () =>
          Effect.succeed({
            isFailure: true,
            result: { reason: "nope" },
            encodedResult: { reason: "nope" },
          }),
        onFailure: () =>
          Effect.sync(() => {
            failureHook = true;
          }),
      });

      const failureExit = yield* Effect.exit(liftedFailure.success({ value: 2 }));
      expect(Exit.isFailure(failureExit)).toBe(true);
      expect(failureHook).toBe(true);

      const liftedDefect = Contract.lift(liftedContract, {
        method: () => Effect.die("defect"),
        onDefect: (cause) =>
          Effect.sync(() => {
            defectHook = Cause.isDie(cause);
          }),
      });

      const defectExit = yield* Effect.exit(liftedDefect.result({ value: 1 }));
      const defectFailure = Exit.match(defectExit, {
        onSuccess: () => O.none(),
        onFailure: (cause) => Cause.failureOption(cause),
      });
      expect(O.getOrUndefined(defectFailure)).toBeInstanceOf(ContractError.UnknownError);
      expect(defectHook).toBe(true);
    })
  );

  effect("uses default empty payload schema", () =>
    Effect.gen(function* () {
      const noPayloadContract = Contract.make("NoPayload");
      const payload = {};
      const decoded = yield* noPayloadContract.decodeUnknownPayload(payload);
      expect(decoded).toEqual({});
    })
  );

  effect("fromTaggedRequest copies schemas from tagged request", () =>
    Effect.gen(function* () {
      class Tagged extends S.TaggedRequest<Tagged>()("Tagged", {
        payload: { name: S.String },
        success: S.Struct({ ok: S.Boolean }),
        failure: S.Struct({ reason: S.String }),
      }) {}

      const contract = Contract.fromTaggedRequest(Tagged);
      const decoded = yield* contract.decodeUnknownPayload({ _tag: "Tagged", name: "abc" });
      expect(decoded.name).toBe("abc");
      expect(contract.name).toBe("Tagged");
    })
  );
});
