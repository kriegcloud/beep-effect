// The open-JSON ↔ class wire transform shared by `Package` (and its
// `.extend()`ed subclasses via `Package.wireFor`) and the presence-lenient
// `PackageManifest`. Raw object keys are partitioned against `Class.fields`:
// known keys decode to typed members, the remainder flow into the `rest`
// catch-all; on encode `rest` flattens back to top-level keys, so the on-disk
// shape never carries a literal `rest` key.
//
// It also holds the provenance helpers the field models (`Person`,
// `Repository`, `Bugs`, `Funding`) share to decide whether a remembered wire
// value still describes the decoded value.
//
// Private implementation module — never re-exported from `index.ts`.

import * as A from "effect/Array";
import { dual, identity } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as R from "effect/Record";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as SchemaTransformation from "effect/SchemaTransformation";

const RawJson = S.Record(S.String, S.Unknown);

/**
 * Build the open-JSON ↔ class wire codec for a `Schema.Class` carrying a
 * `rest` catch-all field. Generic over the class so `Package`, its
 * `.extend()`ed subclasses and `PackageManifest` all share the one
 * implementation and cannot drift.
 *
 * **Example** (Flatten custom class metadata)
 *
 * ```ts
 * import { makeWire } from "@beep/package-json/internal/wire";
 * import * as S from "effect/Schema";
 *
 * class Manifest extends S.Class<Manifest>("Manifest")({
 *   name: S.String,
 *   rest: S.Record(S.String, S.Unknown),
 * }) {}
 *
 * const wire = makeWire(Manifest);
 * const manifest = S.decodeUnknownSync(wire)({ name: "p", custom: true });
 * console.log(JSON.stringify(S.encodeSync(wire)(manifest))); // {"custom":true,"name":"p"}
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const makeWire = <Self, RD = never, RE = never>(
  Class: S.Codec<Self, unknown, RD, RE> & { readonly fields: Record<string, unknown> }
): S.Codec<Self, { readonly [k: string]: unknown }, RD, RE> => {
  const knownKeys = HashSet.fromIterable(A.filter(R.keys(Class.fields), (k) => k !== "rest"));
  return RawJson.pipe(
    S.decode(
      SchemaTransformation.transform({
        decode: (raw: { readonly [k: string]: unknown }): Record<string, unknown> => {
          // Declared subclass fields can include `__proto__`; fromEntries
          // defines own data properties instead of invoking inherited setters.
          const known = R.fromEntries(A.filter(R.toEntries(raw), ([key]) => HashSet.has(knownKeys, key)));
          // A null-prototype record: on a plain object, `rest["__proto__"] = v`
          // MUTATES the prototype instead of storing data, so a manifest
          // carrying an own `__proto__` key would both pollute the record and
          // lose the key on encode.
          const rest: Record<string, unknown> = { __proto__: null };
          for (const [key, value] of R.toEntries(raw)) {
            if (!HashSet.has(knownKeys, key)) rest[key] = value;
          }
          // Spread uses define-own-property semantics, so an own `__proto__`
          // data key survives into the encode side untouched.
          return { ...known, rest };
        },
        encode: (encoded: Record<string, unknown> & { readonly rest?: Record<string, unknown> }) => {
          const { rest, ...known } = encoded;
          // Typed fields win on a key collision: a hand-built instance whose
          // `rest` smuggles a known key (including an .extend()ed subclass
          // field — this is the one shared wire implementation behind
          // `Package.schema`, `Package.wireFor` and `PackageManifest.schema`)
          // must not shadow the typed member on the wire.
          return { ...rest, ...known };
        },
      })
    ),
    S.decodeTo(Class)
  );
};

/**
 * The keys of a raw wire object outside a documented key set: what a field
 * model's `rest` catch-all holds.
 *
 * **Example** (Split the unknown keys off a person object)
 *
 * ```ts
 * import { restOf } from "@beep/package-json/internal/wire";
 * import * as HashSet from "effect/HashSet";
 *
 * console.log(restOf({ name: "Ann", twitter: "@ann" }, HashSet.make("name", "email", "url"))); // { twitter: '@ann' }
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const restOf: {
  (wire: { readonly [k: string]: unknown }, known: HashSet.HashSet<string>): Record<string, unknown>;
  (known: HashSet.HashSet<string>): (wire: { readonly [k: string]: unknown }) => Record<string, unknown>;
} = dual(
  2,
  (wire: { readonly [k: string]: unknown }, known: HashSet.HashSet<string>): Record<string, unknown> =>
    R.fromEntries(A.filter(R.toEntries(wire), ([key]) => !HashSet.has(known, key)))
);

const encodeRestJson = S.encodeResult(S.fromJsonString(S.Unknown));
const restJsonOf = (value: unknown): string => Result.getOrThrowWith(encodeRestJson(value ?? {}), identity);

/**
 * Whether two `rest` records have the same JSON spelling.
 *
 * **Details**
 *
 * Compares the JSON spelling, key order included, rather than structural
 * equality: a remembered wire object is replayed only while its rest still has
 * the same wire form. A nullish rest compares as `{}`.
 *
 * **Example** (Compare rest records by spelling)
 *
 * ```ts
 * import { sameRest } from "@beep/package-json/internal/wire";
 *
 * console.log(sameRest({ a: 1, b: 2 }, { a: 1, b: 2 })); // true
 * console.log(sameRest({ a: 1, b: 2 }, { b: 2, a: 1 })); // false
 * console.log(sameRest(undefined, {})); // true
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const sameRest: {
  (a: unknown, b: unknown): boolean;
  (b: unknown): (a: unknown) => boolean;
} = dual(2, (a: unknown, b: unknown): boolean => restJsonOf(a) === restJsonOf(b));
