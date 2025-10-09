import { describe, expect } from "bun:test";
import { BeepError } from "@beep/errors/shared";
import { effect } from "@beep/testkit";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import { SessionId } from "../src/entity-ids/iam";
import { UserId } from "../src/entity-ids/shared";
import * as Policy from "../src/Policy";

const mockUser = (permissions: ReadonlyArray<Policy.Permission>): Policy.CurrentUser["Type"] => ({
  sessionId: SessionId.make("session__117a5b57-21d9-44d9-a76b-13136af7c0ae"),
  userId: UserId.make("user__117a5b57-21d9-44d9-a76b-13136af7c0ae"),
  permissions: new Set(permissions),
});

const provideCurrentUser = (permissions: ReadonlyArray<Policy.Permission> = []) =>
  Layer.succeed(Policy.CurrentUser, mockUser(permissions));

const succeedEffect = Effect.succeed("allowed");

describe("Policy Module", () => {
  describe("policy factory", () => {
    effect("should succeed if the predicate returns true", () =>
      Effect.gen(function* () {
        const p = Policy.policy(() => Effect.succeed(true));
        const exit = yield* Effect.exit(p);
        expect(Exit.isSuccess(exit)).toBe(true);
        expect(Exit.isSuccess(exit) && exit.value === undefined).toBe(true);
      }).pipe(Effect.provide(provideCurrentUser()))
    );

    effect("should fail with Forbidden if the predicate returns false", () =>
      Effect.gen(function* () {
        const p = Policy.policy(() => Effect.succeed(false));
        const exit = yield* Effect.exit(p);
        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const error = Cause.squash(exit.cause);
          expect(error).toBeInstanceOf(BeepError.Forbidden);
        }
      }).pipe(Effect.provide(provideCurrentUser()))
    );

    effect("should fail with Forbidden(message) if predicate returns false and message provided", () =>
      Effect.gen(function* () {
        const message = "Custom forbidden message";
        const p = Policy.policy(() => Effect.succeed(false), message);
        const exit = yield* Effect.exit(p);
        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const error = Cause.squash(exit.cause);
          expect(error).toBeInstanceOf(BeepError.Forbidden);
          expect((error as BeepError.Forbidden).message).toBe(message);
        }
      }).pipe(Effect.provide(provideCurrentUser()))
    );

    effect("should have access to CurrentUser", () =>
      Effect.gen(function* () {
        const p = Policy.policy((user) => Effect.succeed(user.userId === "user__117a5b57-21d9-44d9-a76b-13136af7c0ae"));
        const exit = yield* Effect.exit(p);
        expect(Exit.isSuccess(exit)).toBe(true);
      }).pipe(Effect.provide(provideCurrentUser()))
    );
  });

  describe("permission policy", () => {
    const readPolicy = Policy.permission("__test:read");

    effect("should succeed if user has the permission", () =>
      Effect.gen(function* () {
        const exit = yield* Effect.exit(readPolicy);
        expect(Exit.isSuccess(exit)).toBe(true);
      }).pipe(Effect.provide(provideCurrentUser(["__test:read"])))
    );

    effect("should fail if user lacks the permission", () =>
      Effect.gen(function* () {
        const exit = yield* Effect.exit(readPolicy);
        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const error = Cause.squash(exit.cause);
          expect(error).toBeInstanceOf(BeepError.Forbidden);
        }
      }).pipe(Effect.provide(provideCurrentUser(["__test:delete"])))
    );
  });

  describe("withPolicy operator", () => {
    const passingPolicy = Policy.policy(() => Effect.succeed(true));
    const failingPolicy = Policy.policy(() => Effect.succeed(false));

    effect("should run the effect if the policy passes", () =>
      Effect.gen(function* () {
        const result = yield* succeedEffect.pipe(Policy.withPolicy(passingPolicy));
        expect(result).toBe("allowed");
      }).pipe(Effect.provide(provideCurrentUser()))
    );

    effect("should fail the effect if the policy fails", () =>
      Effect.gen(function* () {
        const exit = yield* Effect.exit(succeedEffect.pipe(Policy.withPolicy(failingPolicy)));
        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const error = Cause.squash(exit.cause);
          expect(error).toBeInstanceOf(BeepError.Forbidden);
        }
      }).pipe(Effect.provide(provideCurrentUser()))
    );

    effect("should prevent side effects if the policy fails", () =>
      Effect.gen(function* () {
        let mutableValue = 0;
        const mutationEffect = Effect.sync(() => {
          mutableValue = 5;
          return "mutated";
        });

        const exit = yield* Effect.exit(mutationEffect.pipe(Policy.withPolicy(failingPolicy)));

        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const error = Cause.squash(exit.cause);
          expect(error).toBeInstanceOf(BeepError.Forbidden);
        }
        expect(mutableValue).toBe(0);
      }).pipe(Effect.provide(provideCurrentUser()))
    );
  });

  describe("Policy.all combinator", () => {
    const pTrue = Policy.policy(() => Effect.succeed(true));
    const pFalse = Policy.policy(() => Effect.succeed(false));

    effect("should succeed if all policies pass", () =>
      Effect.gen(function* () {
        const exit = yield* Effect.exit(succeedEffect.pipe(Policy.withPolicy(Policy.all(pTrue, pTrue))));
        expect(Exit.isSuccess(exit)).toBe(true);
      }).pipe(Effect.provide(provideCurrentUser()))
    );

    effect("should fail if any policy fails", () =>
      Effect.gen(function* () {
        const exit = yield* Effect.exit(succeedEffect.pipe(Policy.withPolicy(Policy.all(pTrue, pFalse))));
        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const error = Cause.squash(exit.cause);
          expect(error).toBeInstanceOf(BeepError.Forbidden);
        }
      }).pipe(Effect.provide(provideCurrentUser()))
    );

    effect("should short-circuit on the first failure", () =>
      Effect.gen(function* () {
        let secondPolicyExecuted = false;
        const pTracked = Policy.policy(() =>
          Effect.sync(() => {
            secondPolicyExecuted = true;
            return true;
          })
        );

        const exit = yield* Effect.exit(succeedEffect.pipe(Policy.withPolicy(Policy.all(pFalse, pTracked))));

        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const error = Cause.squash(exit.cause);
          expect(error).toBeInstanceOf(BeepError.Forbidden);
        }
        expect(secondPolicyExecuted).toBe(false);
      }).pipe(Effect.provide(provideCurrentUser()))
    );
  });

  describe("Policy.any combinator", () => {
    const pTrue = Policy.policy(() => Effect.succeed(true));
    const pFalse = Policy.policy(() => Effect.succeed(false));

    effect("should succeed if any policy passes", () =>
      Effect.gen(function* () {
        const exit = yield* Effect.exit(succeedEffect.pipe(Policy.withPolicy(Policy.any(pFalse, pTrue))));
        expect(Exit.isSuccess(exit)).toBe(true);
      }).pipe(Effect.provide(provideCurrentUser()))
    );

    effect("should fail if all policies fail", () =>
      Effect.gen(function* () {
        const exit = yield* Effect.exit(succeedEffect.pipe(Policy.withPolicy(Policy.any(pFalse, pFalse))));
        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const error = Cause.squash(exit.cause);
          expect(error).toBeInstanceOf(BeepError.Forbidden);
        }
      }).pipe(Effect.provide(provideCurrentUser()))
    );

    effect("should short-circuit on the first success", () =>
      Effect.gen(function* () {
        let secondPolicyExecuted = false;
        const pTracked = Policy.policy(() =>
          Effect.sync(() => {
            secondPolicyExecuted = true;
            return false;
          })
        );

        const exit = yield* Effect.exit(succeedEffect.pipe(Policy.withPolicy(Policy.any(pTrue, pTracked))));

        expect(Exit.isSuccess(exit)).toBe(true);
        expect(secondPolicyExecuted).toBe(false);
      }).pipe(Effect.provide(provideCurrentUser()))
    );
  });

  describe("Policy Composition (Nested)", () => {
    const canRead = Policy.permission("__test:read");
    const canManage = Policy.permission("__test:manage");
    const canDelete = Policy.permission("__test:delete");
    const isTestUser = Policy.policy((user) =>
      Effect.succeed(user.userId === "user__117a5b57-21d9-44d9-a76b-13136af7c0ae")
    );
    const alwaysFalse = Policy.policy(() => Effect.succeed(false));

    // Rule: (CanRead AND CanManage) OR (CanDelete) OR (IsTestUser)
    const complexPolicy = Policy.any(Policy.all(canRead, canManage), canDelete, isTestUser);

    effect("should succeed if 'all' part passes", () =>
      Effect.gen(function* () {
        const exit = yield* Effect.exit(succeedEffect.pipe(Policy.withPolicy(complexPolicy)));
        expect(Exit.isSuccess(exit)).toBe(true);
      }).pipe(Effect.provide(provideCurrentUser(["__test:read", "__test:manage"])))
    );

    effect("should succeed if 'delete' part passes", () =>
      Effect.gen(function* () {
        const exit = yield* Effect.exit(succeedEffect.pipe(Policy.withPolicy(complexPolicy)));
        expect(Exit.isSuccess(exit)).toBe(true);
      }).pipe(Effect.provide(provideCurrentUser(["__test:delete"])))
    );

    effect("should succeed if 'isTestUser' part passes", () =>
      Effect.gen(function* () {
        const exit = yield* Effect.exit(succeedEffect.pipe(Policy.withPolicy(complexPolicy)));
        expect(Exit.isSuccess(exit)).toBe(true);
      }).pipe(Effect.provide(provideCurrentUser()))
    );

    effect("should fail if none of the 'any' parts pass", () =>
      Effect.gen(function* () {
        // Rule: (CanRead AND AlwaysFalse) OR (CanDelete)
        const policy = Policy.any(Policy.all(canRead, alwaysFalse), canDelete);
        const exit = yield* Effect.exit(succeedEffect.pipe(Policy.withPolicy(policy)));
        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const error = Cause.squash(exit.cause);
          expect(error).toBeInstanceOf(BeepError.Forbidden);
        }
      }).pipe(Effect.provide(provideCurrentUser(["__test:read"])))
    );

    effect("demonstrates real-world: Admin (read+manage) OR Self", () =>
      Effect.gen(function* () {
        const canAdmin = Policy.all(canRead, canManage);
        const targetUserId = UserId.make("user__f3e18bf8-78ef-45fa-a7bd-8b0e32576c6a");
        const isSelf = Policy.policy((user) => Effect.succeed(user.userId === targetUserId));

        const accessPolicy = Policy.any(canAdmin, isSelf);

        // Scenario 1: User is admin, accessing other user -> SUCCESS
        const exitAdmin = yield* Effect.exit(
          succeedEffect.pipe(
            Policy.withPolicy(accessPolicy),
            Effect.provide(provideCurrentUser(["__test:read", "__test:manage"]))
          )
        );
        expect(Exit.isSuccess(exitAdmin)).toBe(true);

        // Scenario 2: User is accessing self -> SUCCESS
        const exitSelf = yield* Effect.exit(
          succeedEffect.pipe(
            Policy.withPolicy(accessPolicy),
            Effect.provide(
              Layer.succeed(Policy.CurrentUser, {
                sessionId: SessionId.make("session__117a5b57-21d9-44d9-a76b-13136af7c0ae"),
                userId: targetUserId,
                permissions: new Set<Policy.Permission>(),
              })
            )
          )
        );
        expect(Exit.isSuccess(exitSelf)).toBe(true);

        // Scenario 3: User is not admin, accessing other user -> FAILURE
        const exitOther = yield* Effect.exit(
          succeedEffect.pipe(Policy.withPolicy(accessPolicy), Effect.provide(provideCurrentUser(["__test:read"])))
        );
        expect(Exit.isFailure(exitOther)).toBe(true);
        if (Exit.isFailure(exitOther)) {
          const error = Cause.squash(exitOther.cause);
          expect(error).toBeInstanceOf(BeepError.Forbidden);
        }
      })
    );
  });
});
