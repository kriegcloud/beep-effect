import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { findRepoRoot } from "@beep/tooling-utils/repo";
import * as Args from "@effect/cli/Args";
import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import * as Prompt from "@effect/cli/Prompt";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunTerminal from "@effect/platform-bun/BunTerminal";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Equal from "effect/Equal";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as Str from "effect/String";
import color from "picocolors";
import {
  fetchCollectionDetail,
  fetchCollections,
  fetchIconKeywords,
  fetchIconPayloads,
  fetchIconSet,
  IconifyApiError,
  normalizeIconLookups,
  searchIcons,
} from "./api";
import { IconifyClientConfigLive, IconifyClientLive } from "./client";
import type { IconRegistryAddition } from "./registry";
import { ICONIFY_REGISTRY_PATH, mergeRegistryContent, mergeRegistryFile } from "./registry";

// BadArgument | NoSuchFileError | SystemError
const DEFAULT_SEARCH_LIMIT = 20;
const DEFAULT_BULK_THRESHOLD = 25;
const SUMMARY_ICON_LIMIT = 12;

const append = (base: string, suffix: string): string => F.pipe(base, Str.concat(suffix));

const joinStrings = (parts: ReadonlyArray<string>): string => {
  const initial: string = Str.empty;
  return F.pipe(
    parts,
    A.reduce(initial, (acc, part) => append(acc, part))
  );
};

const dedupeStrings = (values: ReadonlyArray<string>): ReadonlyArray<string> =>
  F.pipe(
    values,
    A.reduce({ seen: HashSet.empty<string>(), result: [] as ReadonlyArray<string> }, (state, value) =>
      HashSet.has(state.seen, value)
        ? state
        : {
            seen: HashSet.add(state.seen, value),
            result: A.append(state.result, value),
          }
    ),
    (state) =>
      F.pipe(
        state.result,
        A.sortWith((item) => item, Order.string)
      )
  );

const formatCountBadge = (label: string, count: number, formatter: (value: string) => string): string =>
  joinStrings([color.gray(label), ": ", formatter(String(count))]);

const renderCountsSummary = (context: string, added: number, duplicates: number): Effect.Effect<void> =>
  renderInfo(
    joinStrings([
      context,
      " — ",
      formatCountBadge("added", added, color.green),
      ", ",
      formatCountBadge("duplicates skipped", duplicates, color.yellow),
    ])
  );

const formatCollectionLine = (prefix: string, name: string, total: number): string => {
  const prefixLabel = color.yellow(prefix);
  const nameLabel = color.white(name);
  const totalLabel = color.gray(String(total));
  return joinStrings([" - ", prefixLabel, " • ", nameLabel, " • ", totalLabel, " icons"]);
};

const describeIconChoice = (icon: string, collectionName: O.Option<string>): string =>
  F.pipe(
    collectionName,
    O.map((name) => joinStrings([icon, " (", name, ")"])),
    O.getOrElse(() => icon)
  );

const summarizeList = (title: string, values: ReadonlyArray<string>): ReadonlyArray<string> => {
  const total = A.length(values);
  if (total === 0) {
    return [joinStrings([title, ": none"])];
  }

  const displayed = F.pipe(values, A.take(SUMMARY_ICON_LIMIT));

  const header = joinStrings([title, ": ", String(total), total === 1 ? " item" : " items"]);

  const lines = F.pipe(
    displayed,
    A.map((value) => joinStrings(["   • ", value]))
  );

  const hasMore = total > SUMMARY_ICON_LIMIT;
  const summary = hasMore
    ? [joinStrings(["   … ", String(total - SUMMARY_ICON_LIMIT), " more"])]
    : ([] as ReadonlyArray<string>);

  return A.appendAll([header], A.appendAll(lines, summary));
};

const toRegistryAddition = (fullName: string, body: string, label: O.Option<string>): IconRegistryAddition => ({
  name: fullName,
  body,
  setLabel: O.getOrUndefined(label),
});

const renderError = (message: string): Effect.Effect<void> => Console.log(color.red(message));

const renderInfo = (message: string): Effect.Effect<void> => Console.log(color.cyan(message));

const renderSuccess = (message: string): Effect.Effect<void> => Console.log(color.green(message));

const renderWarning = (message: string): Effect.Effect<void> => Console.log(color.yellow(message));

const requireNonEmptyIcons = (
  icons: ReadonlyArray<string>,
  message: string
): Effect.Effect<ReadonlyArray<string>, void> =>
  A.isEmptyReadonlyArray(icons)
    ? Effect.fail(void 0).pipe(Effect.tapError(() => renderWarning(message)))
    : Effect.succeed(icons);

const handleCollections = (options: {
  readonly prefix: O.Option<string>;
  readonly filter: O.Option<string>;
  readonly json: boolean;
}) =>
  Effect.gen(function* () {
    const rawCollections = yield* fetchCollections;

    const filtered = F.pipe(
      rawCollections,
      A.filter((entry) => {
        const prefixMatch = O.match(options.prefix, {
          onNone: () => true,
          onSome: (needle) => F.pipe(entry.prefix, Equal.equals(needle)),
        });

        if (!prefixMatch) {
          return false;
        }

        return O.match(F.pipe(options.filter, O.map(Str.trim), O.filter(Str.isNonEmpty), O.map(Str.toLowerCase)), {
          onNone: () => true,
          onSome: (needle) => {
            const prefixLower = Str.toLowerCase(entry.prefix);
            const nameLower = Str.toLowerCase(entry.metadata.name);
            return F.pipe(prefixLower, Str.includes(needle)) || F.pipe(nameLower, Str.includes(needle));
          },
        });
      })
    );

    if (options.json) {
      const asJson = JSON.stringify(filtered, null, 2);
      yield* Console.log(asJson);
      return;
    }

    if (A.isEmptyReadonlyArray(filtered)) {
      yield* renderWarning("No Iconify collections matched your filters.");
      return;
    }

    const header = joinStrings(["Iconify collections (", String(A.length(filtered)), ")"]);

    yield* renderInfo(header);

    yield* Effect.forEach(
      filtered,
      (entry) => Console.log(formatCollectionLine(entry.prefix, entry.metadata.name, entry.metadata.total)),
      { discard: true }
    );
  });

const ensureQuery = (queryOption: O.Option<string>) =>
  F.pipe(
    queryOption,
    O.filter(Str.isNonEmpty),
    O.match({
      onSome: (query) => Effect.succeed(query),
      onNone: () =>
        Prompt.run(
          Prompt.text({
            message: "Search query",
          })
        ).pipe(
          Effect.map(Str.trim),
          Effect.filterOrFail(Str.isNonEmpty, () => new Error("A non-empty search query is required.")),
          Effect.catchAll((error) => renderError(String(error)).pipe(Effect.zipRight(Effect.fail(error))))
        ),
    })
  );

const handleSearch = (options: {
  readonly query: O.Option<string>;
  readonly limit: O.Option<number>;
  readonly prefix: O.Option<string>;
  readonly json: boolean;
}) =>
  Effect.gen(function* () {
    const query = yield* ensureQuery(options.query);
    const limit = O.getOrElse(options.limit, () => DEFAULT_SEARCH_LIMIT);
    const prefixFilter = options.prefix;

    const results = yield* searchIcons({
      query,
      limit,
      prefix: O.getOrUndefined(prefixFilter),
    });

    if (options.json) {
      yield* Console.log(JSON.stringify(results, null, 2));
      return;
    }

    if (A.isEmptyReadonlyArray(results)) {
      yield* renderWarning("No icons matched your search.");
      return;
    }

    const heading = joinStrings(["Search results for ", color.cyan(query), " • ", String(A.length(results)), " icons"]);
    yield* renderInfo(heading);

    yield* Effect.forEach(
      results,
      (result) => {
        const line = describeIconChoice(
          result.icon,
          F.pipe(
            result.collection,
            O.map((collection) => collection.name)
          )
        );
        return Console.log(joinStrings([" - ", line]));
      },
      { discard: true }
    );
  });

const handleInspect = (config: { readonly icon: string; readonly keywords: boolean }) =>
  Effect.gen(function* () {
    const lookups = yield* normalizeIconLookups([config.icon]);
    const payloads = yield* fetchIconPayloads(
      F.pipe(
        lookups,
        A.map((lookup) => lookup.fullName)
      )
    );

    if (A.isEmptyReadonlyArray(payloads)) {
      yield* renderWarning("Icon was not found.");
      return;
    }

    const payload = payloads[0]!;

    const header = joinStrings(["Icon ", color.yellow(payload.lookup.fullName)]);

    yield* renderInfo(header);

    const collectionLine = F.pipe(
      payload.collectionTitle,
      O.match({
        onNone: () => "   • collection: unknown",
        onSome: (name) => joinStrings(["   • collection: ", name]),
      })
    );

    const widthLine = F.pipe(
      payload.entry.width,
      O.fromNullable,
      O.match({
        onNone: () => "   • width: default",
        onSome: (w) => joinStrings(["   • width: ", String(w)]),
      })
    );

    const heightLine = F.pipe(
      payload.entry.height,
      O.fromNullable,
      O.match({
        onNone: () => "   • height: default",
        onSome: (h) => joinStrings(["   • height: ", String(h)]),
      })
    );

    yield* Console.log(collectionLine);
    yield* Console.log(widthLine);
    yield* Console.log(heightLine);

    yield* Console.log("   • body:");
    yield* Console.log(joinStrings(["       ", payload.entry.body]));

    if (config.keywords) {
      const keywords = yield* fetchIconKeywords(payload.lookup.fullName);
      const keywordLines = summarizeList("Keywords", keywords.matches);
      yield* Effect.forEach(keywordLines, Console.log, { discard: true });
    }
  });

const confirmBulkImport = (iconCount: number, threshold: number, skip: boolean) => {
  if (skip || iconCount <= threshold) {
    return Effect.succeed(true);
  }

  const prompt = Prompt.confirm({
    message: joinStrings(["About to import ", String(iconCount), " icons. Continue?"]),
    initial: false,
  });

  return Prompt.run(prompt);
};

const collectAdditions = (
  payloads: ReadonlyArray<{
    readonly lookup: { readonly fullName: string };
    readonly entry: { readonly body: string };
    readonly collectionTitle: O.Option<string>;
  }>
): Effect.Effect<ReadonlyArray<IconRegistryAddition>, IconifyApiError> =>
  Effect.forEach(
    payloads,
    (payload) => {
      if (Str.isEmpty(payload.entry.body)) {
        return Effect.fail(
          new IconifyApiError({
            message: joinStrings(["Icon ", payload.lookup.fullName, " is missing SVG body."]),
          })
        );
      }

      return Effect.succeed(toRegistryAddition(payload.lookup.fullName, payload.entry.body, payload.collectionTitle));
    },
    { concurrency: "inherit" }
  );

const withRepoPath = <A, E, R>(effect: (repoRoot: string, path_: Path.Path) => Effect.Effect<A, E, R>) =>
  Effect.gen(function* () {
    const repoRoot = yield* findRepoRoot;
    const path_ = yield* Path.Path;
    return yield* effect(repoRoot, path_);
  });

const handleAdd = (options: {
  readonly icons: ReadonlyArray<string>;
  readonly fromSearch: O.Option<string>;
  readonly searchLimit: O.Option<number>;
  readonly fromCollection: O.Option<string>;
  readonly yes: boolean;
  readonly dryRun: boolean;
  readonly threshold: O.Option<number>;
}) =>
  Effect.gen(function* () {
    let collectedIcons = F.pipe(options.icons, A.map(Str.trim), A.filter(Str.isNonEmpty), dedupeStrings);

    if (O.isSome(options.fromSearch)) {
      const query = yield* ensureQuery(options.fromSearch);
      const limit = O.getOrElse(options.searchLimit, () => DEFAULT_SEARCH_LIMIT);
      const searchResults = yield* searchIcons({ query, limit });

      if (A.isEmptyReadonlyArray(searchResults)) {
        yield* renderWarning("Search did not return any icons.");
      } else {
        const choices = F.pipe(
          searchResults,
          A.map((result) => ({
            title: describeIconChoice(
              result.icon,
              F.pipe(
                result.collection,
                O.map((collection) => collection.name)
              )
            ),
            value: result.icon,
          }))
        );

        const selected = yield* Prompt.run(
          Prompt.multiSelect({
            message: "Select icons to add",
            choices,
            maxPerPage: 20,
          })
        );

        collectedIcons = dedupeStrings(A.appendAll(collectedIcons, selected));
      }
    }

    if (O.isSome(options.fromCollection)) {
      const prefix = options.fromCollection.value;
      const iconSetEither = yield* Effect.either(fetchIconSet(prefix));

      if (Either.isLeft(iconSetEither)) {
        const error = iconSetEither.left;
        yield* renderError(
          joinStrings([
            "Failed to fetch Iconify collection ",
            prefix,
            ": ",
            error instanceof IconifyApiError ? error.message : String(error),
          ])
        );
        return;
      }

      const iconSet = iconSetEither.right;
      const detailOption = yield* Effect.option(fetchCollectionDetail(prefix));

      const icons = F.pipe(
        iconSet.icons,
        R.keys,
        A.map((name) => joinStrings([prefix, ":", name]))
      );

      const unique = dedupeStrings(icons);
      const threshold = O.getOrElse(options.threshold, () => DEFAULT_BULK_THRESHOLD);
      const confirm = yield* confirmBulkImport(A.length(unique), threshold, options.yes);

      if (!confirm) {
        yield* renderWarning("Bulk import cancelled.");
        return;
      }

      collectedIcons = dedupeStrings(A.appendAll(collectedIcons, unique));

      if (O.isSome(detailOption) && detailOption.value.title && Str.isNonEmpty(detailOption.value.title)) {
        yield* renderInfo(joinStrings(["Collection: ", detailOption.value.title]));
      }
    }

    yield* requireNonEmptyIcons(collectedIcons, "No icons selected. Nothing to add.");

    const payloads = yield* fetchIconPayloads(collectedIcons);

    const additions = yield* collectAdditions(payloads);

    if (A.isEmptyReadonlyArray(additions)) {
      yield* renderWarning("No additions were produced.");
      return;
    }

    const summaryLines = summarizeList(
      "Planned additions",
      F.pipe(
        additions,
        A.map((addition) => addition.name)
      )
    );
    yield* Effect.forEach(summaryLines, Console.log, { discard: true });

    const threshold = O.getOrElse(options.threshold, () => DEFAULT_BULK_THRESHOLD);
    const confirmed = yield* confirmBulkImport(A.length(additions), threshold, options.yes);
    if (!confirmed) {
      yield* renderWarning("Operation cancelled.");
      return;
    }

    const execution = withRepoPath((repoRoot, path_) =>
      Effect.gen(function* () {
        const registryPath = path_.join(repoRoot, ICONIFY_REGISTRY_PATH);
        const dryRun = options.dryRun;

        if (dryRun) {
          const fileSystem = yield* FileSystem.FileSystem;
          const originalContent = yield* fileSystem.readFileString(registryPath);
          const result = mergeRegistryContent(originalContent, additions);

          const summary = summarizeList("Dry run summary", result.added);
          yield* Effect.forEach(summary, Console.log, { discard: true });

          if (A.isEmptyReadonlyArray(result.added)) {
            yield* renderWarning("Dry run completed: no changes detected.");
          } else {
            yield* renderInfo("Dry run completed. No files were modified.");
          }

          if (!A.isEmptyReadonlyArray(result.duplicates)) {
            const duplicateLines = summarizeList("Duplicates skipped", result.duplicates);
            yield* Effect.forEach(duplicateLines, Console.log, { discard: true });
          }

          yield* renderCountsSummary("Dry run totals", A.length(result.added), A.length(result.duplicates));
        } else {
          const result = yield* mergeRegistryFile({
            additions,
            path: registryPath,
          });

          if (!result.updated) {
            yield* renderWarning("No changes were written (all icons already present).");
          } else {
            yield* renderSuccess("Icon registry updated successfully.");
          }

          if (!A.isEmptyReadonlyArray(result.added)) {
            const addedLines = summarizeList("Added", result.added);
            yield* Effect.forEach(addedLines, Console.log, { discard: true });
          }

          if (!A.isEmptyReadonlyArray(result.duplicates)) {
            const duplicateLines = summarizeList("Skipped duplicates", result.duplicates);
            yield* Effect.forEach(duplicateLines, Console.log, { discard: true });
          }

          yield* renderCountsSummary("Operation totals", A.length(result.added), A.length(result.duplicates));
        }
      })
    );

    yield* execution;
  });

const collectionsCommand = Command.make(
  "collections",
  {
    prefix: F.pipe(Options.text("prefix"), Options.withAlias("p"), Options.optional),
    filter: F.pipe(Options.text("filter"), Options.withAlias("f"), Options.optional),
    json: F.pipe(Options.boolean("json"), Options.withDefault(false)),
  },
  handleCollections
).pipe(Command.withDescription("List Iconify collections."));

const searchCommand = Command.make(
  "search",
  {
    query: F.pipe(Options.text("query"), Options.withAlias("q"), Options.optional),
    limit: F.pipe(Options.integer("limit"), Options.withAlias("l"), Options.optional),
    prefix: F.pipe(Options.text("prefix"), Options.withAlias("p"), Options.optional),
    json: F.pipe(Options.boolean("json"), Options.withDefault(false)),
  },
  handleSearch
).pipe(Command.withDescription("Search Iconify icons."));

const inspectCommand = Command.make(
  "inspect",
  {
    keywords: F.pipe(Options.boolean("keywords"), Options.withAlias("k"), Options.withDefault(false)),
    icon: Args.text({ name: "icon" }),
  },
  ({ icon, keywords }) => handleInspect({ icon, keywords })
).pipe(Command.withDescription("Inspect an Iconify icon."));

const addCommand = Command.make(
  "add",
  {
    icons: F.pipe(Options.repeated(Options.text("icon")), Options.withAlias("i")),
    fromSearch: F.pipe(Options.text("from-search"), Options.withAlias("s"), Options.optional),
    searchLimit: F.pipe(Options.integer("limit"), Options.optional),
    fromCollection: F.pipe(Options.text("collection"), Options.withAlias("c"), Options.optional),
    yes: F.pipe(Options.boolean("yes"), Options.withAlias("y"), Options.withDefault(false)),
    dryRun: F.pipe(Options.boolean("dry-run"), Options.withAlias("d"), Options.withDefault(false)),
    threshold: Options.integer("threshold").pipe(Options.optional),
  },
  handleAdd
).pipe(Command.withDescription("Add icons to the registry."));

export const iconifyCommand = Command.make("iconify").pipe(
  Command.withDescription("Iconify registry management CLI."),
  Command.withSubcommands([collectionsCommand, searchCommand, inspectCommand, addCommand])
);

export const __iconifyCliTestExports = {
  handleCollections,
  handleSearch,
};

const fetchLayer = Layer.sync(FetchHttpClient.Fetch, () => globalThis.fetch.bind(globalThis));

const runtimeLayers = Layer.mergeAll(
  BunContext.layer,
  BunTerminal.layer,
  BunFileSystem.layer,
  BunPath.layerPosix,
  FsUtilsLive,
  IconifyClientConfigLive,
  IconifyClientLive.pipe(Layer.provide(fetchLayer))
);

const iconifyCli = Command.run(iconifyCommand, {
  name: "iconify",
  version: "0.1.0",
});
// IconifyClientService | Terminal | FileSystem | Path | FsUtils
export const runIconifyCli = (argv: ReadonlyArray<string>) =>
  iconifyCli(argv).pipe(Effect.provide(runtimeLayers), BunRuntime.runMain);

// IconifyClientConfig | Fetc
