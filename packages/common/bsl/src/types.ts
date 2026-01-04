export type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * Helper type to check if a type is `any`.
 * Uses the property that `any & 1` is `0` extends it, but no other type is.
 * @internal
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Helper type to check if a type is `unknown`.
 * `unknown` is the top type, so `string extends unknown` is true for all types,
 * but only `unknown` has `unknown extends T` as true (besides `any`).
 * @internal
 */
export type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;
