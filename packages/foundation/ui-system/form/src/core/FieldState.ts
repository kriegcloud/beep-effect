import type * as O from "effect/Option";
import type * as S from "effect/Schema";

export type FieldValue<T> = T extends S.Top ? S.Codec.Encoded<T> : T;

export interface FieldState<E> {
  readonly error: O.Option<string>;
  readonly isDirty: boolean;
  readonly isTouched: boolean;
  readonly isValidating: boolean;
  readonly onBlur: () => void;
  readonly onChange: (value: E) => void;
  readonly path: string;
  readonly value: E;
}

export interface ArrayFieldOperations<TItem> {
  readonly append: (value?: TItem) => void;
  readonly items: ReadonlyArray<TItem>;
  readonly move: (from: number, to: number) => void;
  readonly remove: (index: number) => void;
  readonly swap: (indexA: number, indexB: number) => void;
}
