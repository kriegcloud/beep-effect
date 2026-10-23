// The frozen codec corpus as module data. Vite's glob import inlines every
// fixture's raw UTF-8 text at transform time (no newline normalization), so
// the conformance suite receives strings without touching a filesystem at
// test time (the `@beep/yaml` `fixture-text.ts` precedent).

import * as A from "effect/Array";
import * as O from "effect/Option";
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

const corpus = import.meta.glob<string>("../fixtures/codec-corpus/*/*", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** One corpus file: the codec lane (its directory), its name and its text. */
export interface CorpusFixture {
  readonly lane: string;
  readonly name: string;
  readonly text: string;
}

/** Every corpus file, in glob order. */
export const corpusFixtures: ReadonlyArray<CorpusFixture> = A.map(R.toEntries(corpus), ([key, text]) => {
  const [lane = "", name = ""] = A.takeRight(Str.split(key, "/"), 2);
  return { lane, name, text };
});

/** The text of one corpus file, addressed as `<lane>/<name>`. */
export const corpusText = (relative: string): string =>
  O.getOrThrow(R.get(corpus, `../fixtures/codec-corpus/${relative}`));
