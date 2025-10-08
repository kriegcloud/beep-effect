import * as Effect from "effect/Effect";
import * as Struct from "effect/Struct";
export interface AnnotationOptions {
  readonly values?: Readonly<Record<string, unknown>>;
}

export const annotateAuthLogs =
  ({ values }: AnnotationOptions) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
    values && Struct.keys(values).length > 0 ? Effect.annotateLogs(values)(effect) : effect;
