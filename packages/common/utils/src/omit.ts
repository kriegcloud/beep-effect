/**
 * Type-level utility that removes `undefined` from all property types.
 * Used for compatibility with libraries that don't type optionals as `| undefined`.
 *
 * Note: This is a type-level lie—the runtime value is unchanged.
 */
export const omitUndefineds = <T extends Record<keyof any, unknown>>(
  rec: T
): {
  [K in keyof T]: Exclude<T[K], undefined>;
} => {
  return rec as never;
};
