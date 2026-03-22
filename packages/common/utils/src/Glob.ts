import { $UtilsId } from "@beep/identity/packages";
import { Effect, Function as Fn, Layer, ServiceMap } from "effect";
import * as S from "effect/Schema";
import * as GlobLib from "glob";
import * as Thunk from "./internal/Thunk.ts";

const $I = $UtilsId.create("Glob");

/**
 * @since 0.0.0
 * @category Validation
 */
export const Pattern = S.Union([S.String, S.Array(S.String)]);

/**
 * @since 0.0.0
 * @category Validation
 */
export type Pattern = typeof Pattern.Type;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace GlobError {
  /**
   * @since 0.0.0
   * @category DomainModel
   */
  export type Encoded = typeof GlobError.Encoded;
}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class GlobError extends S.TaggedErrorClass<GlobError>($I`GlobError`)(
  "GlobError",
  {
    pattern: Pattern,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("GlobError", {
    description: "An error that occurs during glob pattern matching",
  })
) {
  static readonly new = (pattern: GlobError.Encoded["pattern"], cause: GlobError.Encoded["cause"]) =>
    new GlobError({ pattern, cause });
  static readonly newThunk = (pattern: GlobError.Encoded["pattern"], cause: GlobError.Encoded["cause"]) =>
    Thunk.make(new GlobError({ pattern, cause }));
}

/**
 * @since 0.0.0
 * @category PortContract
 */
export interface Glob {
  readonly glob: (
    pattern: string | ReadonlyArray<string>,
    options?: GlobLib.GlobOptions
  ) => Effect.Effect<Array<string>, GlobError>;
}

/**
 * @since 0.0.0
 * @category PortContract
 */
export const Glob: ServiceMap.Service<Glob, Glob> = ServiceMap.Service("@effect/utils/Glob");

/**
 * @since 0.0.0
 * @category Configuration
 */
export const layer: Layer.Layer<Glob> = Layer.succeed(Glob, {
  glob: (pattern, options) =>
    Effect.tryPromise({
      try: (): Promise<string[]> => Fn.cast(GlobLib.glob(pattern as string | Array<string>, options ?? {})),
      catch: (cause) => new GlobError({ pattern, cause: S.decodeUnknownOption(S.ErrorWithStack)(cause) }),
    }),
});
