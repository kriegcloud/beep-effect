export type NullableProps<T> = {
  readonly [K in keyof T]: T[K] | null;
};
