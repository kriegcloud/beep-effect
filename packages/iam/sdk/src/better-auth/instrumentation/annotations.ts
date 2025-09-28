import * as Effect from "effect/Effect";

export interface AnnotationOptions {
  readonly values?: Readonly<Record<string, unknown>>;
}

export const annotateBetterAuthLogs =
  ({ values }: AnnotationOptions) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
    values && Object.keys(values).length > 0 ? Effect.annotateLogs(values)(effect) : effect;
