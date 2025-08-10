import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as R from "effect/Record";
import * as Str from "effect/String";
import { DomainError, getRepoWorkspace } from "./utils";

export const makeFileNames = <TName extends Capitalize<string>>(
  name: TName,
) => ({
  model: `${name}.model.ts`,
  repo: `${name}.repo.ts`,
  policy: `${name}.policy.ts`,
  index: `index.ts`,
  commands: `${name}.commands.ts`,
  queries: `${name}.queries.ts`,
});
const CONTEXTS = [
  "iam",
  "orgs",
  "docs",
  "tasks",
  "geo",
  "party",
  "comms",
] as const;

const createDomainEntity = Effect.fn("createDomainEntity")(function* <
  TName extends Capitalize<string>,
>(opts: { context: (typeof CONTEXTS)[number]; name: TName }) {
  const domainPath = yield* getRepoWorkspace("@beep/kernel");

  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;

  const domainEntityPath = path.join(
    domainPath,
    "src",
    opts.context,
    "entities",
    Str.capitalize(opts.name),
  );

  yield* Console.log(domainEntityPath);
  const exists = yield* fs.exists(domainEntityPath);
  yield* Console.log(exists);

  const entityFilePaths = R.map(makeFileNames(opts.name), (v, _) =>
    path.join(domainEntityPath, v),
  );

  yield* Console.log(entityFilePaths);

  for (const [_, path] of R.toEntries(entityFilePaths)) {
    if (yield* fs.exists(path)) {
      return yield* Effect.fail(
        new DomainError({
          message: `File already exists: ${path}`,
        }),
      );
    }
    // write to file
  }
});

const program = Effect.gen(function* () {
  const opts = {
    context: "iam",
    name: "Verification",
  } as const;

  yield* createDomainEntity(opts);
});

const mainProgram = program.pipe(Effect.provide([NodeContext.layer]));

NodeRuntime.runMain(mainProgram);
