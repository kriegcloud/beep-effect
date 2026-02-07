/**
 * Spawn function - extracted from machine.ts to break circular dependency:
 *   machine.ts -> actor.ts -> machine.ts
 *
 * @module
 */
import { Effect, Scope } from "effect";
import * as O from "effect/Option";
import type { ActorRef } from "./actor";
import { createActor } from "./actor";
import type { BuiltMachine } from "./machine";

/**
 * Spawn an actor directly without ActorSystem ceremony.
 * Accepts only `BuiltMachine` (call `.build()` first).
 *
 * **Single actor, no registry.** Caller manages lifetime via `actor.stop`.
 * If a `Scope` exists in context, cleanup attaches automatically on scope close.
 *
 * For registry, lookup by ID, persistence, or multi-actor coordination,
 * use `ActorSystemService` / `system.spawn` instead.
 *
 * @example
 * ```ts
 * // Fire-and-forget — caller manages lifetime
 * const actor = yield* Machine.spawn(machine.build());
 * yield* actor.send(Event.Start);
 * yield* actor.awaitFinal;
 * yield* actor.stop;
 *
 * // Scope-aware — auto-cleans up on scope close
 * yield* Effect.scoped(Effect.gen(function* () {
 *   const actor = yield* Machine.spawn(machine.build());
 *   yield* actor.send(Event.Start);
 *   // actor.stop called automatically when scope closes
 * }));
 * ```
 */
const spawnImpl = Effect.fn("effect-machine.spawn")(function* <
  S extends { readonly _tag: string },
  E extends { readonly _tag: string },
  R,
>(built: BuiltMachine<S, E, R>, id?: undefined | string) {
  const actorId = id ?? `actor-${Math.random().toString(36).slice(2)}`;
  const actor = yield* createActor(actorId, built._inner);

  // If a scope exists in context, attach cleanup automatically
  const maybeScope = yield* Effect.serviceOption(Scope.Scope);
  if (O.isSome(maybeScope)) {
    yield* Scope.addFinalizer(maybeScope.value, actor.stop);
  }

  return actor;
});

export const spawn: {
  <S extends { readonly _tag: string }, E extends { readonly _tag: string }, R>(
    machine: BuiltMachine<S, E, R>
  ): Effect.Effect<ActorRef<S, E>, never, R>;

  <S extends { readonly _tag: string }, E extends { readonly _tag: string }, R>(
    machine: BuiltMachine<S, E, R>,
    id: string
  ): Effect.Effect<ActorRef<S, E>, never, R>;
} = spawnImpl;
