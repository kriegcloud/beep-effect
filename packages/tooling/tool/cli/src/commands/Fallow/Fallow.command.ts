/**
 * Fallow integration helpers for repo quality experiments.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { buildRepoDependencyIndex, findRepoRoot, jsonStringifyPretty, resolveWorkspaceDirs } from "@beep/repo-utils";
import { A, Str } from "@beep/utils";
import { Console, Effect, FileSystem, HashMap, Order, Path, pipe } from "effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import { Command, Flag } from "effect/unstable/cli";
import { failWithReportedExit } from "../../internal/cli/ExitCodeError.js";
import type { WorkspaceDeps } from "@beep/repo-utils";

const FALLOW_CONFIG_SCHEMA_URL = "https://raw.githubusercontent.com/fallow-rs/fallow/main/schema.json";
const DEFAULT_BOUNDARY_CONFIG_PATH = "standards/fallow.boundaries.generated.jsonc";
const ROOT_FALLOW_CONFIG_FILENAME = ".fallowrc.jsonc";

type FallowBoundaryZone = {
  readonly name: string;
  readonly patterns: ReadonlyArray<string>;
};

type FallowBoundaryRule = {
  readonly from: string;
  readonly allow: ReadonlyArray<string>;
  readonly allowTypeOnly: ReadonlyArray<string>;
};

type FallowBoundaryConfig = {
  readonly $schema: string;
  readonly extends: ReadonlyArray<string>;
  readonly boundaries: {
    readonly zones: ReadonlyArray<FallowBoundaryZone>;
    readonly rules: ReadonlyArray<FallowBoundaryRule>;
  };
  readonly rules: {
    readonly "boundary-violation": "warn";
  };
};

const normalizeSlashes = Str.replaceAll("\\", "/");

const workspaceEntryOrder: Order.Order<readonly [string, string]> = Order.mapInput(Order.String, ([name]) => name);

const workspaceDependencyNames = (workspaceDeps: WorkspaceDeps): ReadonlyArray<string> =>
  pipe(
    [
      ...R.keys(workspaceDeps.workspace.dependencies),
      ...R.keys(workspaceDeps.workspace.devDependencies),
      ...R.keys(workspaceDeps.workspace.peerDependencies),
      ...R.keys(workspaceDeps.workspace.optionalDependencies),
    ],
    A.dedupe,
    A.sort(Order.String)
  );

const makeBoundaryConfig = Effect.fn("Fallow.makeBoundaryConfig")(function* (
  repoRoot: string,
  rootConfigExtendsPath: string
) {
  const path = yield* Path.Path;
  const workspaceDirs = yield* resolveWorkspaceDirs(repoRoot);
  const dependencyIndex = yield* buildRepoDependencyIndex(repoRoot);

  const workspaceEntries = pipe(A.fromIterable(workspaceDirs), A.sort(workspaceEntryOrder));

  const zones = pipe(
    workspaceEntries,
    A.map(([name, absolutePath]): FallowBoundaryZone => {
      const workspacePath = normalizeSlashes(path.relative(repoRoot, absolutePath));

      return {
        name,
        patterns: [`${workspacePath}/src/**`],
      };
    })
  );

  const rules = pipe(
    workspaceEntries,
    A.map(([name]): FallowBoundaryRule => {
      const dependencyNames = pipe(
        HashMap.get(dependencyIndex, name),
        O.map(workspaceDependencyNames),
        O.getOrElse(A.empty<string>)
      );
      const allow = pipe(
        [name, ...dependencyNames],
        A.dedupe,
        A.filter((dependencyName) => HashMap.has(workspaceDirs, dependencyName)),
        A.sort(Order.String)
      );

      return {
        from: name,
        allow,
        allowTypeOnly: allow,
      };
    })
  );

  const config = {
    $schema: FALLOW_CONFIG_SCHEMA_URL,
    extends: [rootConfigExtendsPath],
    boundaries: {
      zones,
      rules,
    },
    rules: {
      "boundary-violation": "warn",
    },
  } satisfies FallowBoundaryConfig;

  return config;
});

const renderBoundaryConfig = Effect.fn("Fallow.renderBoundaryConfig")(function* (repoRoot: string, outputPath: string) {
  const path = yield* Path.Path;
  const rootConfigExtendsPath = normalizeSlashes(
    path.relative(path.dirname(outputPath), path.join(repoRoot, ROOT_FALLOW_CONFIG_FILENAME))
  );
  const config = yield* makeBoundaryConfig(repoRoot, rootConfigExtendsPath);
  const configText = yield* jsonStringifyPretty(config);

  return `${configText}\n`;
});

const resolveOutputPath = Effect.fn("Fallow.resolveOutputPath")(function* (repoRoot: string, output: string) {
  const path = yield* Path.Path;
  return path.isAbsolute(output) ? output : path.join(repoRoot, output);
});

const writeBoundaryConfig = Effect.fn("Fallow.writeBoundaryConfig")(function* (
  outputPath: string,
  expectedText: string
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  yield* fs.makeDirectory(path.dirname(outputPath), { recursive: true });
  yield* fs.writeFileString(outputPath, expectedText);
});

const checkBoundaryConfig = Effect.fn("Fallow.checkBoundaryConfig")(function* (
  outputPath: string,
  expectedText: string
) {
  const fs = yield* FileSystem.FileSystem;
  const existingText = yield* fs.readFileString(outputPath).pipe(
    Effect.catch(
      Effect.fn(function* (error) {
        yield* Console.error(`fallow boundaries: failed to read ${outputPath}: ${error.message}`);
        return yield* failWithReportedExit("fallow boundaries: generated config is missing or unreadable.");
      })
    )
  );

  if (existingText === expectedText) {
    yield* Console.log(`fallow boundaries: ${outputPath} is up to date.`);
    return;
  }

  yield* Console.error(`fallow boundaries: ${outputPath} is stale.`);
  yield* Console.error("Run `bun run fallow:boundaries:write` to refresh it.");
  return yield* failWithReportedExit("fallow boundaries: generated config drift detected.");
});

const boundariesCommand = Command.make(
  "boundaries",
  {
    output: Flag.string("output").pipe(
      Flag.withAlias("o"),
      Flag.withDefault(DEFAULT_BOUNDARY_CONFIG_PATH),
      Flag.withDescription("Generated Fallow boundary config path")
    ),
    write: Flag.boolean("write").pipe(Flag.withDescription("Write the generated boundary config")),
    check: Flag.boolean("check").pipe(Flag.withDescription("Fail when the generated boundary config is stale")),
  },
  Effect.fn(function* ({ output, write, check }) {
    if (write && check) {
      yield* Console.error("fallow boundaries: --write and --check are mutually exclusive.");
      return yield* failWithReportedExit("fallow boundaries: choose either --write or --check.");
    }

    const repoRoot = yield* findRepoRoot();
    const outputPath = yield* resolveOutputPath(repoRoot, output);
    const expectedText = yield* renderBoundaryConfig(repoRoot, outputPath);

    if (write) {
      yield* writeBoundaryConfig(outputPath, expectedText);
      yield* Console.log(`fallow boundaries: wrote ${outputPath}.`);
      return;
    }

    if (check) {
      yield* checkBoundaryConfig(outputPath, expectedText);
      return;
    }

    yield* Console.log(expectedText);
  })
).pipe(Command.withDescription("Generate the advisory Fallow boundary config from workspace dependency metadata"));

/**
 * Fallow quality-tooling command group.
 *
 * @example
 * ```ts
 * import { fallowCommand } from "@beep/repo-cli/commands/Fallow"
 *
 * console.log(fallowCommand)
 * ```
 * @category cli-commands
 * @since 0.0.0
 */
export const fallowCommand = Command.make("fallow", {}, () => Console.log("Available Fallow helpers: boundaries")).pipe(
  Command.withDescription("Fallow quality-tooling helpers"),
  Command.withSubcommands([boundariesCommand])
);
