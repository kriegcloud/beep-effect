import type * as S from "effect/Schema";
import type * as StringTypes from "./string.types.js";

export type PropertyKey<Literal extends string> = StringTypes.NonEmptyString<Literal>;

export interface PropFields {
  readonly [x: PropertyKey<string>]: S.Struct.Field;
}

export type InitialProps<Fields extends PropFields = PropFields> = {
  readonly [K in keyof Fields]: Fields[K];
};

export type Props<T extends InitialProps> = keyof T extends string
  ? T extends NonNullable<unknown>
    ? NonNullable<unknown> extends T
      ? never
      : T
    : T
  : never;

// const l = <const Fields extends InitialProps>(fields: Props<Fields>) => fields;
