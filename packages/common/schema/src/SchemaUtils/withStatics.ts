/**
 * Attach static methods to a schema.
 *
 * @module @beep/schema/utils/withStatics
 * @since 0.0.0
 */
import { Function as Fn } from "effect";

const attachStatics = <S extends object, M extends Record<string, unknown>>(
  schema: S,
  methods: (schema: S) => M
): S & M => {
  const originalAnnotate = Reflect.get(schema, "annotate");
  const statics = methods(schema);

  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(statics))) {
    const existing = Reflect.getOwnPropertyDescriptor(schema, key);
    const nextValue = "value" in descriptor ? descriptor.value : Reflect.get(statics, key);

    if (existing !== undefined) {
      const currentValue = "value" in existing ? existing.value : Reflect.get(schema, key);

      if (Object.is(currentValue, nextValue)) {
        continue;
      }

      if (existing.configurable === false) {
        throw new TypeError(`Cannot redefine non-configurable static '${key}'.`);
      }
    }

    Reflect.defineProperty(schema, key, descriptor);
  }

  if (typeof originalAnnotate === "function") {
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
 * Attach static methods to a schema object. Designed to be used with `.pipe()`:
 *
 * @example
 *   export const Foo = fooSchema.pipe(
 *     withStatics((schema) => ({
 *       zero: schema.makeUnsafe(0),
 *       from: Schema.decodeUnknownOption(schema),
 *     }))
 *   )
 * @since 0.0.0
 */
export const withStatics: {
  <S extends object, M extends Record<string, unknown>>(methods: (schema: S) => M): (schema: S) => S & M;
  <S extends object, M extends Record<string, unknown>>(schema: S, methods: (schema: S) => M): S & M;
} = Fn.dual(2, attachStatics);
