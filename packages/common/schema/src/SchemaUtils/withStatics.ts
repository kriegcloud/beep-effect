/**
 * Attach static methods to a schema.
 *
 * @module
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity/packages";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $SchemaId.create("SchemaUtils/withStatics");

class WithStaticsStaticRedefinitionError extends S.TaggedErrorClass<WithStaticsStaticRedefinitionError>(
  $I`WithStaticsStaticRedefinitionError`
)(
  "WithStaticsStaticRedefinitionError",
  {
    key: S.String,
    message: S.String,
  },
  $I.annote("WithStaticsStaticRedefinitionError", {
    description: "Raised when schema statics would redefine a non-configurable property with a different value.",
  })
) {}

const attachStatics = <S extends object, M extends Record<string, unknown>>(
  schema: S,
  methods: (schema: S) => M
): S & M => {
  const originalAnnotate = Reflect.get(schema, "annotate");
  const statics = methods(schema);

  for (const [key, descriptor] of R.toEntries(Object.getOwnPropertyDescriptors(statics))) {
    const existing = Reflect.getOwnPropertyDescriptor(schema, key);
    const nextValue = "value" in descriptor ? descriptor.value : Reflect.get(statics, key);

    if (existing !== undefined) {
      const currentValue = "value" in existing ? existing.value : Reflect.get(schema, key);

      if (Object.is(currentValue, nextValue)) {
        continue;
      }

      if (existing.configurable === false) {
        throw new WithStaticsStaticRedefinitionError({
          key,
          message: `Cannot redefine non-configurable static '${key}'.`,
        });
      }
    }

    Reflect.defineProperty(schema, key, descriptor);
  }

  if (P.isFunction(originalAnnotate)) {
    Reflect.defineProperty(schema, "annotate", {
      value(annotation: unknown) {
        return attachStatics(originalAnnotate.call(schema, annotation), methods);
      },
      enumerable: false,
      writable: false,
      configurable: true,
    });
  }

  return schema as S & M;
};

/**
 * Attach static methods to a schema object. Designed to be used with `.pipe()`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { withStatics } from "@beep/schema/SchemaUtils/withStatics"
 *
 * const MySchema = S.String.pipe(
 *
 *
 *
 * )
 *
 * void MySchema.empty
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const withStatics: {
  <S extends object, M extends Record<string, unknown>>(methods: (schema: S) => M): (schema: S) => S & M;
  <S extends object, M extends Record<string, unknown>>(schema: S, methods: (schema: S) => M): S & M;
} = dual(2, attachStatics);
