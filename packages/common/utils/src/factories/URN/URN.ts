import type { Proto, Segment } from "@beep/utils/factories/URN/types";

/** Internal marker to denote “leaf” positions in the config. */
export const IdSymbol: unique symbol = Symbol.for("Identifier");
export type IdSymbol = typeof IdSymbol;

/**
 * Recursive config tree:
 * - Keys are path segments (no "/").
 * - Leaf nodes are `IdSymbol` (places where you can mint identifiers).
 */
export type Config = {
  readonly [K in Segment<string>]?: Config | IdSymbol;
};

/**
 * Builder type:
 * - For nested objects -> nested builders.
 * - For `IdSymbol` leaves -> a function `identity => "<proto><path>/<identity>"`
 */
export type Builder<TProto extends Proto, C extends Config, P extends string = ""> = {
  readonly [K in keyof C]: C[K] extends Config
    ? Builder<TProto, Extract<C[K], Config>, Join<P, K & string>>
    : C[K] extends IdSymbol
      ? <T extends string>(identity: T) => `${NormalizeProto<TProto>}${Join<P, K & string>}/${T}`
      : never;
};

/** Normalize proto to guarantee exactly one trailing slash. */
type NormalizeProto<T extends string> = T extends `${infer H}/` ? `${H}/` : `${T}/`;

/** Join path parts with "/" while avoiding leading "//" when P is empty. */
type Join<P extends string, K extends string> = P extends "" ? K : `${P}/${K}`;

/** Runtime helpers ------------------------------------------------------- */

const normalizeProto = (proto: string): string => (proto.endsWith("/") ? proto : `${proto}/`);

const join = (parts: readonly string[]): string => parts.filter(Boolean).join("/");

/**
 * Create a typed identifier/route builder from a `proto` and a `config`.
 *
 * @example
 * const sid = Identifier.makeBuilder("@beep/", { common: { schema: Identifier.IdSymbol } } as const);
 * sid.common.schema("Person.Schema"); // "@beep/common/schema/Person.Schema"
 */
export function makeBuilder<const TProto extends Proto, const C extends Config>(
  proto: TProto,
  config: C,
  currentPath: string[] = []
): Builder<TProto, C> {
  const out: Record<string, unknown> = {};
  const np = normalizeProto(proto);

  for (const key in config) {
    const value = (config as Record<string, unknown>)[key];

    // sanity check: refuse keys with "/"
    if (key.includes("/")) {
      throw new Error(`Identifier config key must be a single segment (no "/"): "${key}"`);
    }

    if (value === IdSymbol) {
      out[key] = <T extends string>(identity: T) => `${np}${join([...currentPath, key])}/${identity}` as const;
    } else if (typeof value === "object" && value !== null) {
      out[key] = makeBuilder(np as TProto, value as Config, [...currentPath, key]);
    }
  }
  return out as Builder<TProto, C>;
}
