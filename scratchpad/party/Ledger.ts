/**
 * The authority ledger service contract and an in-memory Layer.
 *
 * Append-only: observations, assertions, and claim versions are inserted;
 * the only permitted change to an existing version is closing its knowledge
 * interval when a successor supersedes it. Projections are reads over a
 * snapshot, so deleting and rebuilding a projection is always safe.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $ScratchpadId } from "@beep/identity";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Ref from "effect/Ref";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import type { ClaimVersion, SourceAssertion } from "./Claim.ts";
import type { Observation } from "./Communication.ts";
import { ClaimVersionId } from "./Ids.ts";
import { UtcInstant } from "./Time.ts";

const $I = $ScratchpadId.create("party/Ledger");

/**
 * A ledger write violated append-only discipline.
 *
 * @category errors
 * @since 0.0.0
 */
export class LedgerConflict extends S.TaggedError<LedgerConflict, { readonly brand: unique symbol }>($I`LedgerConflict`)(
  "LedgerConflict",
  { claimVersion: ClaimVersionId, reason: S.NonEmptyString, at: UtcInstant },
  $I.annoteError<LedgerConflict>("LedgerConflict", {
    title: "Ledger conflict",
    description: "A ledger write would rewrite history instead of appending to it.",
  })
) {}

/**
 * Immutable snapshot every projection reads from.
 *
 * @category ledger
 * @since 0.0.0
 */
export interface LedgerSnapshot {
  readonly observations: ReadonlyArray<Observation>;
  readonly assertions: ReadonlyArray<SourceAssertion>;
  readonly versions: ReadonlyArray<ClaimVersion>;
}

/**
 * Service shape.
 *
 * @category ledger
 * @since 0.0.0
 */
export interface PartyLedgerShape {
  readonly recordObservation: (o: Observation) => Effect.Effect<void>;
  readonly recordAssertion: (a: SourceAssertion) => Effect.Effect<void>;
  /** Append a version whose `supersedes` is None. */
  readonly append: (v: ClaimVersion) => Effect.Effect<void, LedgerConflict>;
  /** Close the superseded version's knowledge interval at `next.knowledge.recordedAt`, then append `next`. */
  readonly supersede: (next: ClaimVersion) => Effect.Effect<void, LedgerConflict>;
  readonly snapshot: Effect.Effect<LedgerSnapshot>;
}

/**
 * The party authority ledger.
 *
 * @category ledger
 * @since 0.0.0
 */
export class PartyLedger extends Context.Service<PartyLedger, PartyLedgerShape>()($I`PartyLedger`) {}

const conflict = (v: ClaimVersion, reason: string) =>
  LedgerConflict.make({ claimVersion: v.id, reason, at: v.knowledge.recordedAt });

/**
 * In-memory ledger for experiments and tests.
 *
 * @category ledger
 * @since 0.0.0
 */
export const PartyLedgerMemory = Layer.effect(
  PartyLedger,
  Effect.gen(function* () {
    const state = yield* Ref.make<LedgerSnapshot>({ observations: [], assertions: [], versions: [] });

    // Check and write in one Ref.modify, so two fibers cannot both pass a check and then both write.
    const commit = Effect.fn("PartyLedger.commit")(function* (
      v: ClaimVersion,
      plan: (current: LedgerSnapshot) => Result.Result<LedgerSnapshot, string>
    ) {
      const refused = yield* Ref.modify(state, (current) => {
        const planned = plan(current);
        return Result.isSuccess(planned) ? [O.none<string>(), planned.success] : [O.some(planned.failure), current];
      });
      if (O.isSome(refused)) return yield* conflict(v, refused.value);
    });

    const recorded = (current: LedgerSnapshot, v: ClaimVersion) => A.some(current.versions, (x) => x.id === v.id);

    const append = (v: ClaimVersion) =>
      commit(v, (current) =>
        recorded(current, v)
          ? Result.fail("version id already recorded")
          : O.isSome(v.supersedes)
            ? Result.fail("use supersede for versions that replace another")
            : Result.succeed({ ...current, versions: [...current.versions, v] })
      );

    // A successor may state a different fact (mailbox "used-by Maya" -> "operated-by Finance");
    // supersession is about knowledge, not about keeping the proposition identical.
    const supersede = (next: ClaimVersion) =>
      commit(next, (current) => {
        if (recorded(current, next)) return Result.fail("version id already recorded");
        const target = O.flatMap(next.supersedes, (id) => A.findFirst(current.versions, (x) => x.id === id));
        if (O.isNone(target)) return Result.fail("superseded version not found");
        if (O.isSome(target.value.knowledge.expiredAt)) return Result.fail("superseded version already expired");
        const at = next.knowledge.recordedAt;
        return Result.succeed({
          ...current,
          versions: [
            ...A.map(current.versions, (x) =>
              x.id === target.value.id ? { ...x, knowledge: { ...x.knowledge, expiredAt: O.some(at) } } : x
            ),
            next,
          ],
        });
      });

    return PartyLedger.of({
      recordObservation: Effect.fn("PartyLedger.recordObservation")((o: Observation) =>
        Ref.update(state, (s) => ({ ...s, observations: [...s.observations, o] }))
      ),
      recordAssertion: Effect.fn("PartyLedger.recordAssertion")((a: SourceAssertion) =>
        Ref.update(state, (s) => ({ ...s, assertions: [...s.assertions, a] }))
      ),
      append,
      supersede,
      snapshot: Ref.get(state),
    });
  })
);
