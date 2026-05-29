/**
 * Structural-clone baseline document, diff, and ratchet gate.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { DomainError } from "@beep/repo-utils";
import { A, Str, thunkEmptyStr } from "@beep/utils";
import { Console, DateTime, Effect, FileSystem, HashMap, Order, Path, pipe, SchemaGetter } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { parse } from "jsonc-parser";
import type { ReuseCandidate } from "@beep/repo-utils";

const $I = $RepoCliId.create("commands/Reuse/internal/CloneBaseline");
const CLONE_INVENTORY_PATH = "standards/clone.inventory.jsonc";

const stringifyJsonPretty = SchemaGetter.stringifyJson({ space: 2 });

class CloneBaselineEntry extends S.Class<CloneBaselineEntry>($I`CloneBaselineEntry`)(
  {
    id: S.String,
    title: S.String,
    occurrences: S.Number,
    packages: S.Number,
    members: S.Array(S.String),
  },
  $I.annote("CloneBaselineEntry", {
    description: "One acknowledged structural-clone cluster in the committed baseline.",
  })
) {}

class CloneBaselineDocument extends S.Class<CloneBaselineDocument>($I`CloneBaselineDocument`)(
  {
    version: S.Literal(1),
    generatedOn: S.String,
    entries: S.Array(CloneBaselineEntry),
  },
  $I.annote("CloneBaselineDocument", {
    description: "Committed baseline of acknowledged structural-clone clusters for ratchet enforcement.",
  })
) {}

type GrownCluster = {
  readonly entry: CloneBaselineEntry;
  readonly previousOccurrences: number;
};

type CloneDrift = {
  readonly newClusters: ReadonlyArray<CloneBaselineEntry>;
  readonly grownClusters: ReadonlyArray<GrownCluster>;
};

const decodeDocument = S.decodeUnknownEffect(CloneBaselineDocument);
const encodeDocument = S.encodeUnknownEffect(CloneBaselineDocument);

const todayYmd = (): string => {
  const now = DateTime.nowUnsafe();
  const year = `${DateTime.getPartUtc(now, "year")}`;
  const month = Str.padStart(2, "0")(`${DateTime.getPartUtc(now, "month")}`);
  const day = Str.padStart(2, "0")(`${DateTime.getPartUtc(now, "day")}`);
  return `${year}-${month}-${day}`;
};

const byEntryId: Order.Order<CloneBaselineEntry> = Order.mapInput(Order.String, (entry) => entry.id);

const entryFromCandidate = (candidate: ReuseCandidate): CloneBaselineEntry =>
  CloneBaselineEntry.make({
    id: candidate.candidateId,
    title: candidate.title,
    occurrences: A.length(candidate.sourceSymbols),
    packages: A.length(candidate.sourceScopes),
    members: pipe(
      candidate.sourceSymbols,
      A.map((symbol) => `${symbol.filePath}#${symbol.symbolName}`)
    ),
  });

const buildCloneDocument = (candidates: ReadonlyArray<ReuseCandidate>): CloneBaselineDocument =>
  CloneBaselineDocument.make({
    version: 1,
    generatedOn: todayYmd(),
    entries: pipe(candidates, A.map(entryFromCandidate), A.sort(byEntryId)),
  });

const readCloneBaseline = Effect.fn("CloneBaseline.read")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolutePath = path.resolve(process.cwd(), CLONE_INVENTORY_PATH);

  if (!(yield* fs.exists(absolutePath).pipe(Effect.orElseSucceed(() => false)))) {
    return O.none<CloneBaselineDocument>();
  }

  const content = yield* fs.readFileString(absolutePath).pipe(Effect.orElseSucceed(thunkEmptyStr));
  return yield* decodeDocument(parse(content)).pipe(Effect.option);
});

const writeCloneBaseline = Effect.fn("CloneBaseline.write")(function* (document: CloneBaselineDocument) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolutePath = path.resolve(process.cwd(), CLONE_INVENTORY_PATH);
  const encoded = yield* encodeDocument(document).pipe(
    Effect.mapError(DomainError.newCauseMessage(`Failed to encode ${CLONE_INVENTORY_PATH}`))
  );
  const rendered = yield* stringifyJsonPretty
    .run(O.some(encoded), {})
    .pipe(Effect.mapError(DomainError.newCauseMessage(`Failed to render ${CLONE_INVENTORY_PATH}`)));
  const serialized = O.getOrElse(rendered, thunkEmptyStr);
  yield* fs
    .writeFileString(absolutePath, `${serialized}\n`)
    .pipe(Effect.mapError(DomainError.newCauseMessage(`Failed to write ${CLONE_INVENTORY_PATH}`)));
});

const diffCloneBaseline = (live: CloneBaselineDocument, baseline: O.Option<CloneBaselineDocument>): CloneDrift => {
  const baselineById = pipe(
    baseline,
    O.map((document) =>
      HashMap.fromIterable(A.map(document.entries, (entry): readonly [string, CloneBaselineEntry] => [entry.id, entry]))
    ),
    O.getOrElse(() => HashMap.empty<string, CloneBaselineEntry>())
  );

  const newClusters = pipe(
    live.entries,
    A.filter((entry) => !HashMap.has(baselineById, entry.id))
  );

  const grownClusters: Array<GrownCluster> = [];
  for (const entry of live.entries) {
    const previous = HashMap.get(baselineById, entry.id);
    if (O.isSome(previous) && entry.occurrences > previous.value.occurrences) {
      grownClusters.push({ entry, previousOccurrences: previous.value.occurrences });
    }
  }

  return { newClusters, grownClusters };
};

/**
 * Refresh or enforce the structural-clone baseline from current clone candidates.
 *
 * In `write` mode it regenerates `standards/clone.inventory.jsonc`. Otherwise it
 * compares the live clusters against the committed baseline and fails when new
 * clones appear or an existing cluster gains copies.
 *
 * @example
 * ```ts
 * console.log("runCloneGate")
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const runCloneGate = Effect.fn("CloneBaseline.runCloneGate")(function* (
  candidates: ReadonlyArray<ReuseCandidate>,
  options: { readonly write: boolean }
) {
  const live = buildCloneDocument(candidates);
  const baseline = yield* readCloneBaseline();

  if (options.write) {
    yield* writeCloneBaseline(live);
    yield* Console.log(`[clones] wrote ${CLONE_INVENTORY_PATH} (${A.length(live.entries)} clusters)`);
    return;
  }

  const baselineCount = O.match(baseline, {
    onNone: () => 0,
    onSome: (document) => A.length(document.entries),
  });
  yield* Console.log(`[clones] live_clusters=${A.length(live.entries)} baseline_clusters=${baselineCount}`);

  if (O.isNone(baseline)) {
    return yield* DomainError.make({
      message: `Missing ${CLONE_INVENTORY_PATH}; run \`beep reuse clones --write\` and commit it.`,
    });
  }

  const drift = diffCloneBaseline(live, baseline);
  yield* Console.log(
    `[clones] new_clusters=${A.length(drift.newClusters)} grown_clusters=${A.length(drift.grownClusters)}`
  );

  if (A.isReadonlyArrayNonEmpty(drift.newClusters)) {
    yield* Console.error("[clones] new structural clones introduced:");
    for (const entry of drift.newClusters) {
      yield* Console.error(`- ${entry.title} [${entry.id}]`);
      for (const member of entry.members) {
        yield* Console.error(`    ${member}`);
      }
    }
  }

  if (A.isReadonlyArrayNonEmpty(drift.grownClusters)) {
    yield* Console.error("[clones] existing clones gained copies:");
    for (const grown of drift.grownClusters) {
      yield* Console.error(
        `- ${grown.entry.title} [${grown.entry.id}] (${grown.previousOccurrences} -> ${grown.entry.occurrences})`
      );
    }
  }

  if (A.isReadonlyArrayNonEmpty(drift.newClusters) || A.isReadonlyArrayNonEmpty(drift.grownClusters)) {
    return yield* DomainError.make({
      message:
        "clones: new duplication introduced. Extract the shared declaration, or run `beep reuse clones --write` to accept it into the baseline.",
    });
  }
});
