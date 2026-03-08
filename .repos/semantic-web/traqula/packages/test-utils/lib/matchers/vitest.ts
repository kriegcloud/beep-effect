import 'vitest';

interface CustomMatchers<R = unknown> {
  toEqualParsedQuery: (expected: unknown) => R;
  toEqualParsedQueryIgnoring: (selector: (obj: object) => boolean, keys: string[], expected: unknown) => R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
