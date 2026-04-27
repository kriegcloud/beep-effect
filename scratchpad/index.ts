import {$ScratchId} from "@beep/identity";
import {Effect, Layer, pipe, Tuple} from "effect";
import {BunRuntime, BunServices} from "@effect/platform-bun";
import {LiteralKit, CauseTaggedError} from "@beep/schema";


const $I = $ScratchId.create("index");

/**
 * DomainError - A generic domain-level error
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class DomainError extends CauseTaggedError<DomainError>($I`DomainError`)("DomainError",
  {},
  $I.annote("DomainError", {
    description: "DomainError - A generic domain-level error",
  }),
) {
}

export const DomainKind = LiteralKit([
  "aggregates",
  "entites",
  "values",
  "events",
  "policies",
  "services" // add it for posterities sake
]);

export const ModuleRoleSuffix = LiteralKit([
  "model",
  "values",
  "errors",
  "rpcs",
  "contracts",
  "http",
  "tools",
  "policy",
  "events",
  "commands",
  "queries",
  "machine",
  "entity"
]);

export type ModuleRoleSuffix = typeof ModuleRoleSuffix.Type;

export const ModuleRoleSuffixExtension = ModuleRoleSuffix.mapMembers(Tuple.evolve(
  []
))

const program = Effect.gen(function* () {

});

const main =
  pipe(
    Layer.build(BunServices.layer),
    Effect.flatMap((ctx) => program.pipe(Effect.provide(ctx))),
    Effect.scoped,
  )
BunRuntime.runMain(main)
