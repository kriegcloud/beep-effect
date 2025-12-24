/**
 * Utility types for Effect Schema property maps used by prop builders.
 *
 * @example
 * import type * as PropTypes from "@beep/types/prop.type";
 *
 * @category Types/Struct
 * @since 0.1.0
 */
import type * as S from "effect/Schema";
import type * as StringTypes from "./string.types";

/**
 * Non-empty string literal ensuring struct keys are not blank.
 *
 * @example
 * import type { PropertyKey } from "@beep/types/prop.type";
 *
 * type FieldName = PropertyKey<"display_name">;
 * let example!: FieldName;
 * void example;
 *
 * @category Types/Struct
 * @since 0.1.0
 */
export type PropertyKey<Literal extends string> = StringTypes.NonEmptyString<Literal>;

/**
 * Effect Schema field map keyed by {@link PropertyKey} strings.
 *
 * @example
 * import type { PropFields } from "@beep/types/prop.type";
 * import * as S from "effect/Schema";
 *
 * const fields: PropFields = { id: S.String, name: S.String };
 * void fields;
 *
 * @category Types/Struct
 * @since 0.1.0
 */
export interface PropFields {
  readonly [x: PropertyKey<string>]: S.Struct.Field;
}

/**
 * Helper that preserves the specific key/value pairs from a `PropFields`
 * record, avoiding widening when inferring `const` objects.
 *
 * @example
 * import type { InitialProps } from "@beep/types/prop.type";
 * import * as S from "effect/Schema";
 *
 * type PropsMap = InitialProps<{ readonly id: S.Struct.Field }>;
 * let example!: PropsMap;
 * void example;
 *
 * @category Types/Struct
 * @since 0.1.0
 */
export type InitialProps<Fields extends PropFields = PropFields> = {
  readonly [K in keyof Fields]: Fields[K];
};

/**
 * Narrows a `PropFields` object to shapes with provably non-empty keys.
 *
 * Eliminates accidentally empty configs when building DSLs that rely on at
 * least one field definition.
 *
 * @example
 * import type { Props } from "@beep/types/prop.type";
 * import * as S from "effect/Schema";
 *
 * type RequiredProps = Props<{ id: S.Struct.Field; name: S.Struct.Field }>;
 * let example!: RequiredProps;
 * void example;
 *
 * @category Types/Struct
 * @since 0.1.0
 */
export type Props<T extends InitialProps> = keyof T extends string
  ? T extends NonNullable<unknown>
    ? NonNullable<unknown> extends T
      ? never
      : T
    : T
  : never;
