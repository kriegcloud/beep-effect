#!/usr/bin/env bun

import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Console, Effect, FileSystem, Layer } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { parse } from "jsonc-parser";
import type { ParseError } from "jsonc-parser";

const packetRoot = "goals/fallow-debt-burndown";
const parentFeatureMatrixPath = "goals/fallow-quality-enforcement/research/feature-matrix.jsonc";
const validatorVersion = "fallow-debt-burndown-validator/v1";
const goalCharLimit = 4000;

const requiredFiles = [
  `${packetRoot}/GOAL.md`,
  `${packetRoot}/README.md`,
  `${packetRoot}/SPEC.md`,
  `${packetRoot}/PLAN.md`,
  `${packetRoot}/research/current-fallow-snapshot.md`,
  `${packetRoot}/ops/manifest.json`,
  `${packetRoot}/ops/validate-packet.ts`,
  `${packetRoot}/tasks/tasks.jsonc`,
  `${packetRoot}/tasks/tasks.schema.json`,
];

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord => typeof value === "object" && value !== null;
const asArray = (value: unknown): Array<unknown> => (Array.isArray(value) ? value : []);
const asString = (value: unknown): string => (typeof value === "string" ? value : "");

const parseErrorsMessage = (relativePath: string, errors: ReadonlyArray<ParseError>): string =>
  `${relativePath}: jsonc parse failed at offsets ${A.join(
    A.map(errors, (error) => `${error.offset}`),
    ", "
  )}`;

const readText = Effect.fn("readText")(function* (relativePath: string) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.readFileString(relativePath).pipe(Effect.mapError(() => [`${relativePath}: could not be read`]));
});

const readJsonc = Effect.fn("readJsonc")(function* (relativePath: string) {
  const text = yield* readText(relativePath);
  const parseErrors: Array<ParseError> = [];
  const parsed = parse(text, parseErrors, {
    allowTrailingComma: true,
    disallowComments: false,
  });

  if (parseErrors.length > 0) {
    return yield* Effect.fail([parseErrorsMessage(relativePath, parseErrors)]);
  }

  return parsed;
});

const requiredFileDiagnostics = Effect.fn("requiredFileDiagnostics")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const checks = yield* Effect.forEach(requiredFiles, (file) =>
    fs.exists(file).pipe(
      Effect.map((exists) => (exists ? O.none<string>() : O.some(`${file}: required packet file is missing`))),
      Effect.orElseSucceed(() => O.some(`${file}: existence check failed`))
    )
  );
  return A.getSomes(checks);
});

const goalCharLimitDiagnostics = Effect.fn("goalCharLimitDiagnostics")(function* () {
  return yield* readText(`${packetRoot}/GOAL.md`).pipe(
    Effect.map((text) =>
      Str.length(text) <= goalCharLimit
        ? A.empty<string>()
        : [`${packetRoot}/GOAL.md: exceeds ${goalCharLimit} characters (${Str.length(text)})`]
    ),
    Effect.orElseSucceed(() => [`${packetRoot}/GOAL.md: could not be read`])
  );
});

const textIncludesDiagnostics = (
  relativePath: string,
  text: string,
  requiredPhrases: ReadonlyArray<string>
): ReadonlyArray<string> =>
  A.flatMap(requiredPhrases, (phrase) =>
    Str.includes(phrase)(text) ? A.empty<string>() : [`${relativePath}: missing required phrase: ${phrase}`]
  );

const specTextDiagnostics = Effect.fn("specTextDiagnostics")(function* () {
  const text = yield* readText(`${packetRoot}/SPEC.md`).pipe(Effect.orElseSucceed(() => ""));
  return textIncludesDiagnostics(`${packetRoot}/SPEC.md`, text, [
    'The thesis is "fix selected debt, then fail new regressions".',
    "Do not remove Knip.",
    "Do not run non-dry-run `fallow fix`.",
    "Do not make runtime coverage blocking.",
    "Do not resolve findings primarily by adding inline `fallow-ignore`",
  ]);
});

const snapshotDiagnostics = Effect.fn("snapshotDiagnostics")(function* () {
  const text = yield* readText(`${packetRoot}/research/current-fallow-snapshot.md`).pipe(
    Effect.orElseSucceed(() => "")
  );
  return textIncludesDiagnostics(`${packetRoot}/research/current-fallow-snapshot.md`, text, [
    "Boundary Queue",
    "Health Queue",
    "Security Queue",
    "Duplication Queue",
    "critical: 27",
    "path-traversal: 12",
  ]);
});

const taskDiagnostics = (document: unknown): ReadonlyArray<string> => {
  if (!isRecord(document)) {
    return ["tasks/tasks.jsonc: expected object document"];
  }

  const diagnostics: Array<string> = [];
  if (document.schemaVersion !== "fallow-debt-burndown/tasks/v1") {
    diagnostics.push("tasks/tasks.jsonc: schemaVersion mismatch");
  }
  if (document.validatorVersion !== validatorVersion) {
    diagnostics.push("tasks/tasks.jsonc: validatorVersion mismatch");
  }

  const tasks = asArray(document.tasks).filter(isRecord);
  if (tasks.length < 6) {
    diagnostics.push("tasks/tasks.jsonc: expected at least six tasks");
  }

  const ids = tasks.map((task) => asString(task.id));
  const requiredIds = ["fdb-001", "fdb-002", "fdb-003", "fdb-004", "fdb-005", "fdb-006"];
  for (const requiredId of requiredIds) {
    if (!ids.includes(requiredId)) {
      diagnostics.push(`tasks/tasks.jsonc: missing task ${requiredId}`);
    }
  }

  if (new Set(ids).size !== ids.length) {
    diagnostics.push("tasks/tasks.jsonc: duplicate task ids");
  }

  let previousRank = 0;
  for (const task of tasks) {
    const id = asString(task.id);
    const rank = typeof task.rank === "number" ? task.rank : 0;
    if (!/^fdb-[0-9]{3}$/.test(id)) {
      diagnostics.push(`tasks/tasks.jsonc: invalid task id ${id}`);
    }
    if (rank <= previousRank) {
      diagnostics.push(`tasks/tasks.jsonc: ${id} rank is not strictly increasing`);
    }
    previousRank = rank;

    const dependencies = asArray(task.dependencies).map(asString);
    for (const dependency of dependencies) {
      if (!ids.includes(dependency)) {
        diagnostics.push(`tasks/tasks.jsonc: ${id} depends on unknown task ${dependency}`);
      }
    }
  }

  return diagnostics;
};

const manifestDiagnostics = Effect.fn("manifestDiagnostics")(function* () {
  const document = yield* readJsonc(`${packetRoot}/ops/manifest.json`).pipe(Effect.orElseSucceed(() => ({})));
  if (!isRecord(document)) {
    return ["ops/manifest.json: expected object document"];
  }

  const diagnostics: Array<string> = [];
  const initiative = isRecord(document.initiative) ? document.initiative : {};
  if (initiative.id !== "fallow-debt-burndown") {
    diagnostics.push("ops/manifest.json: initiative.id mismatch");
  }
  if (document.packetPath !== packetRoot) {
    diagnostics.push("ops/manifest.json: packetPath mismatch");
  }

  const requiredArtifacts = asArray(document.requiredArtifacts).map(asString);
  for (const file of requiredFiles) {
    if (!requiredArtifacts.includes(file)) {
      diagnostics.push(`ops/manifest.json: requiredArtifacts missing ${file}`);
    }
  }

  const verificationCommands = asArray(document.verificationCommands).map(asString).join("\n");
  for (const commandFragment of ["fallow health", "fallow boundaries", "fallow security"]) {
    if (!verificationCommands.includes(commandFragment)) {
      diagnostics.push(`ops/manifest.json: verificationCommands missing ${commandFragment}`);
    }
  }

  return diagnostics;
});

const parentMatrixDiagnostics = Effect.fn("parentMatrixDiagnostics")(function* () {
  const document = yield* readJsonc(parentFeatureMatrixPath).pipe(Effect.orElseSucceed(() => ({})));
  if (!isRecord(document)) {
    return [`${parentFeatureMatrixPath}: expected object document`];
  }

  const features = asArray(document.features).filter(isRecord);
  const byFamily = new Map(features.map((feature) => [asString(feature.featureFamily), feature]));
  const diagnostics: Array<string> = [];

  for (const family of ["audit", "dead-code"]) {
    const row = byFamily.get(family);
    if (row?.promotionStatus !== "blocking" || row.ciMode !== "blocking-check") {
      diagnostics.push(`${parentFeatureMatrixPath}: ${family} must remain blocking`);
    }
  }

  for (const family of [
    "health",
    "boundaries",
    "flags",
    "security",
    "fix-preview",
    "runtime-coverage",
    "editor-mcp-hooks",
  ]) {
    const row = byFamily.get(family);
    if (!row) {
      diagnostics.push(`${parentFeatureMatrixPath}: missing ${family} row`);
      continue;
    }
    if (row.promotionStatus === "blocking" || row.ciMode === "blocking-check") {
      diagnostics.push(`${parentFeatureMatrixPath}: ${family} must not be promoted by this packet`);
    }
  }

  return diagnostics;
});

const validate = Effect.fn("validate")(function* () {
  const fileDiagnostics = yield* requiredFileDiagnostics();
  if (!A.isReadonlyArrayEmpty(fileDiagnostics)) {
    return fileDiagnostics;
  }

  const tasks = yield* readJsonc(`${packetRoot}/tasks/tasks.jsonc`).pipe(
    Effect.map(taskDiagnostics),
    Effect.catch((errors) => Effect.succeed(errors))
  );

  const goal = yield* goalCharLimitDiagnostics();
  const spec = yield* specTextDiagnostics();
  const snapshot = yield* snapshotDiagnostics();
  const manifest = yield* manifestDiagnostics();
  const matrix = yield* parentMatrixDiagnostics();

  return [...goal, ...spec, ...snapshot, ...tasks, ...manifest, ...matrix];
});

const program = Effect.gen(function* () {
  const diagnostics = yield* validate();

  if (A.isReadonlyArrayEmpty(diagnostics)) {
    yield* Console.log("fallow-debt-burndown packet ok");
    return;
  }

  yield* Console.error("fallow-debt-burndown packet failed:");
  yield* Effect.forEach(diagnostics, (diagnostic) => Console.error(`- ${diagnostic}`));
  yield* Effect.sync(() => {
    process.exitCode = 1;
  });
});

NodeRuntime.runMain(program.pipe(Effect.provide(Layer.mergeAll(NodeServices.layer))));
