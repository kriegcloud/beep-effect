import type { StringTypes, UnsafeTypes } from "@beep/types";
import * as S from "effect/Schema";

export namespace Op {
  type Base<Tag extends StringTypes.NonEmptyString<string>, Exec> = {
    readonly Schema: S.Struct<{ _tag: S.Literal<[Tag]> }>;
    readonly op: Tag;
    readonly label: string;
    readonly execute: Exec;
  };

  export function make<const Tag extends StringTypes.NonEmptyString<string>>(
    tag: Tag,
    label: string,
  ): {
    // boolean-returning predicates
    <A, B>(fn: (a: A, b: B) => boolean): Base<Tag, (a: A, b: B) => boolean>;

    // type-guard predicates (on the 2nd param)
    <A, B, C extends B>(
      fn: (a: A, b: B) => b is C,
    ): Base<Tag, (a: A, b: B) => b is C>;

    // catch-all to preserve *your* generics/overloads exactly
    <
      Exec extends (
        a: UnsafeTypes.UnsafeAny,
        b: UnsafeTypes.UnsafeAny,
      ) => UnsafeTypes.UnsafeAny,
    >(
      fn: Exec,
    ): Base<Tag, Exec>;
  };
  export function make<
    const Tag extends StringTypes.NonEmptyString<string>,
    const Fields extends S.Struct.Fields,
  >(tag: Tag, label: string) {
    return <
      Exec extends (
        a: UnsafeTypes.UnsafeAny,
        b: UnsafeTypes.UnsafeAny,
      ) => UnsafeTypes.UnsafeAny,
    >(
      fn: Exec,
    ) => {
      const Schema = S.Struct({ _tag: S.Literal(tag) });
      return {
        Schema,
        op: tag,
        label,
        execute: fn,
      } as const satisfies Base<Tag, Exec>;
    };
  }

  export function lift1<B>(f: (b: B) => boolean) {
    return (_: unknown, b: B) => f(b);
  }

  export function inverse<
    const Tag extends StringTypes.NonEmptyString<string>,
    Exec extends (
      a: UnsafeTypes.UnsafeAny,
      b: UnsafeTypes.UnsafeAny,
    ) => UnsafeTypes.UnsafeAny,
  >(srcFn: Exec, op: Tag, label: string) {
    const exec: (a: Parameters<Exec>[0], b: Parameters<Exec>[1]) => boolean = (
      a,
      b,
    ) => !srcFn(a, b);

    return {
      Schema: S.Struct({ _tag: S.Literal(op) }),
      op,
      label,
      execute: exec,
    };
  }

  export type Type<Tag extends StringTypes.NonEmptyString<string>> = {
    readonly _tag: Tag;
  };
}
