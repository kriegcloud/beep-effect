import { MemoryFileSystem } from "@beep/memfs";
import * as Layer from "effect/Layer";
import * as Path from "effect/Path";
import * as R from "effect/Record";
import type * as FileSystem from "effect/FileSystem";

/** A fixture file tree: absolute file path -> file contents. */
export type FixtureTree = Readonly<Record<string, string>>;

/** Build a fixture tree from `[absolutePath, contents]` pairs (forward-slash keys). */
export const tree = (...entries: ReadonlyArray<readonly [string, string]>): FixtureTree => R.fromEntries(entries);

/**
 * The fixture filesystem merged with a POSIX `Path`, the layer every resolution suite provides.
 *
 * The volume is `@beep/memfs`, a real virtual POSIX filesystem, rather than
 * a `FileSystem.layerNoop` answering the two methods the resolver happens to
 * call. The difference is not cosmetic: a stub implements only the semantics
 * its author remembered, and an unseeded read there returns whatever the stub
 * decided rather than failing — the exact shape that made a hand stub answering
 * `""` hide a real bug elsewhere in the kit. memfs fails an unseeded read typed
 * `NotFound` and never fabricates content.
 *
 * One deliberate behavior change comes with it: memfs creates parent
 * directories, so a directory path now *exists* where the old map-membership
 * stub reported it absent. That is more faithful, and harmless here — the
 * resolution engine probes config *files*, never directories.
 */
export const fixtureLayer = (files: FixtureTree): Layer.Layer<FileSystem.FileSystem | Path.Path> =>
  Layer.mergeAll(MemoryFileSystem.layerWith(files), Path.layer);
