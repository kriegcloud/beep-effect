// The vendored toml-test corpus as module data. Vite's glob import inlines
// every fixture's raw UTF-8 text at transform time (no newline
// normalization: the CRLF and lone-CR cases arrive byte-for-byte), so the
// corpus suites receive strings without touching a filesystem at test time.

import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as Str from "effect/String";

/** The subset of Vite's `import.meta.glob` signature the corpus loader uses. */
interface RawGlobOptions {
  readonly eager: true;
  readonly import: "default";
  readonly query: "?raw";
}

declare global {
  interface ImportMeta {
    glob<T>(pattern: string, options: RawGlobOptions): Record<string, T>;
  }
}

const VALID_ROOT = "./fixtures/toml-test/valid/";
const INVALID_ROOT = "./fixtures/toml-test/invalid/";

const validFiles = import.meta.glob<string>("./fixtures/toml-test/valid/**/*.{toml,json}", {
  query: "?raw",
  import: "default",
  eager: true,
});
const invalidFiles = import.meta.glob<string>("./fixtures/toml-test/invalid/**/*.toml", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** Sorted `.toml` paths of `files`, relative to `root`. */
const tomlCases = (files: Record<string, string>, root: string): ReadonlyArray<string> =>
  A.sort(A.map(A.filter(R.keys(files), Str.endsWith(".toml")), Str.slice(root.length)), Order.String);

const read = (files: Record<string, string>, root: string, relPath: string): string =>
  O.getOrThrow(R.get(files, `${root}${relPath}`));

/** Every valid-tree `.toml` case, as sorted paths relative to the valid root. */
export const validCases = tomlCases(validFiles, VALID_ROOT);

/** Every invalid-tree `.toml` case, as sorted paths relative to the invalid root. */
export const invalidCases = tomlCases(invalidFiles, INVALID_ROOT);

/** The raw source of a valid case. */
export const readValid = (relPath: string): string => read(validFiles, VALID_ROOT, relPath);

/** The raw tagged-JSON expectation paired with a valid case. */
export const readValidExpected = (relPath: string): string =>
  read(validFiles, VALID_ROOT, Str.replace(/\.toml$/, ".json")(relPath));

/** The raw source of an invalid case. */
export const readInvalid = (relPath: string): string => read(invalidFiles, INVALID_ROOT, relPath);
