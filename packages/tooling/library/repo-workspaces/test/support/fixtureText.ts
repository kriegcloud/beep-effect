// The checked-in lockfile and oracle captures the peer and duplicate suites
// compare against. Vite inlines each matched file's raw UTF-8 text at
// transform time (the `@beep/lockfiles` precedent), so the suites read the
// captures without touching a filesystem at test time.
import * as O from "effect/Option";
import * as R from "effect/Record";

const raw = import.meta.glob<string>("../fixtures/{peers,duplicates}/**/*", {
  query: "?raw",
  import: "default",
  eager: true,
});

/**
 * The text of one capture, by its path relative to `test/fixtures`.
 *
 * A missing capture throws: it is a misspelled fixture path in a suite, and
 * the suite should fail loudly rather than compare against nothing.
 */
export const fixture = (relative: string): string =>
  O.getOrThrowWith(R.get(raw, `../fixtures/${relative}`), () => new Error(`no fixture at test/fixtures/${relative}`));
