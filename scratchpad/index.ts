import { $ScratchId } from "@beep/identity";
import { Effect } from "effect";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";
import { dual } from "effect/Function";

const $I = $ScratchId.create("index");

/**
 * DomainError - A generic domain-level error
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class DomainError extends TaggedErrorClass<DomainError>($I`DomainError`)(
  "DomainError",
  {
    cause: S.DefectWithStack,
    message: S.String,
  },
  $I.annote("DomainError", {
    description: "DomainError - A generic domain-level error"
  })
) {
  static readonly new: {
    (cause: unknown, message: string): DomainError
    (message: string): (cause: unknown) => DomainError
  } = dual(2, (cause: unknown, message: string): DomainError => new DomainError({
    message,
    cause
  }))

  static readonly mapError: {
    <A, E, R>(self: Effect.Effect<A, E, R>, message: string): Effect.Effect<A, DomainError, R>
    (message: string): <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, DomainError, R>
  } = dual(2, <A, E, R>(self: Effect.Effect<A, E, R>, message: string): Effect.Effect<A, DomainError, R> =>
    Effect.mapError(self, DomainError.new(message))
  )
}

