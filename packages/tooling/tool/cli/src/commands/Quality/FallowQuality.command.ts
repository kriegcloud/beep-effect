/**
 * Advisory Fallow quality command wrappers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt } from "@beep/schema";
import { findRepoRoot, jsonStringifyPretty } from "@beep/repo-utils";
import { A, Str } from "@beep/utils";
import { Console, DateTime, Effect, FileSystem, Path, pipe, Stream } from "effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { Argument, Command, Flag } from "effect/unstable/cli";
import { ChildProcess } from "effect/unstable/process";
import { QualityScriptCommandError } from "./Quality.errors.js";
import type { ChildProcessSpawner } from "effect/unstable/process";

const $I = $RepoCliId.create("commands/Quality/FallowQuality");

const fallowFeatureValues = [
  "audit",
  "dead-code",
  "dupes",
  "health",
  "boundaries",
  "flags",
  "security",
  "fix-preview",
];

const commonEnvelopeKeys = [
  "schemaVersion",
  "toolVersion",
  "command",
  "subcommand",
  "baseRef",
  "generatedAt",
  "advisory",
  "dirtyWorktree",
  "reportPath",
  "rawOutputRef",
  "attributionKinds",
  "findingAttributionSummary",
  "status",
  "exitStatus",
];

const okEnvelopeKeys = [...commonEnvelopeKeys, "report"];
const failureEnvelopeKeys = [...commonEnvelopeKeys, "stderrExcerpt"];
const defaultOutDir = ".beep/fallow";
const defaultBaseRef = "origin/main";
const fallbackSourceRef = "standards/fallow.pilot.inventory.jsonc";

const FallowFeatureFamily = LiteralKit(fallowFeatureValues).pipe(
  $I.annoteSchema("FallowFeatureFamily", {
    description: "Fallow feature family implemented by the quality wrapper.",
  })
);

const FindingAttributionKind = LiteralKit(["introduced", "inherited-adjacent", "not-applicable"]).pipe(
  $I.annoteSchema("FallowFindingAttributionKind", {
    description: "Attribution kind retained by repo-cli Fallow envelopes.",
  })
);

const FallowEnvelopeStatus = LiteralKit(["ok", "tool-failed", "invalid-json", "base-resolution-failed"]).pipe(
  $I.annoteSchema("FallowEnvelopeStatus", {
    description: "Status discriminator for Fallow quality envelopes.",
  })
);

class FindingAttributionSummary extends S.Class<FindingAttributionSummary>($I`FindingAttributionSummary`)(
  {
    introduced: NonNegativeInt,
    inheritedAdjacent: NonNegativeInt,
    notApplicable: NonNegativeInt,
  },
  $I.annote("FindingAttributionSummary", {
    description: "Count summary for normalized Fallow finding attribution.",
  })
) {}

class FallowReportFinding extends S.Class<FallowReportFinding>($I`FallowReportFinding`)(
  {
    id: S.String,
    featureFamily: FallowFeatureFamily,
    attribution: FindingAttributionKind,
    parser: S.String,
    subCategory: S.String,
    blocking: S.Literal(false),
    sourceRef: S.String,
  },
  $I.annote("FallowReportFinding", {
    description: "Normalized Fallow finding inside the repo-cli report envelope.",
  })
) {}

class FallowReportPayload extends S.Class<FallowReportPayload>($I`FallowReportPayload`)(
  {
    findingCount: NonNegativeInt,
    findings: S.Array(FallowReportFinding),
  },
  $I.annote("FallowReportPayload", {
    description: "Normalized report payload carried by successful Fallow envelopes.",
  })
) {}

const FallowReportBaseFields = {
  schemaVersion: S.Literal("fallow-report-envelope/v1"),
  toolVersion: S.String,
  command: S.String,
  subcommand: FallowFeatureFamily,
  baseRef: S.String,
  generatedAt: S.String,
  advisory: S.Boolean,
  dirtyWorktree: S.Boolean,
  reportPath: S.String,
  rawOutputRef: S.String,
  attributionKinds: S.NonEmptyArray(FindingAttributionKind),
  findingAttributionSummary: FindingAttributionSummary,
};

class FallowReportOk extends S.Class<FallowReportOk>($I`FallowReportOk`)(
  {
    ...FallowReportBaseFields,
    status: S.Literal("ok"),
    exitStatus: NonNegativeInt,
    report: FallowReportPayload,
  },
  $I.annote("FallowReportOk", {
    description: "Successful Fallow envelope. The raw tool exit status is preserved separately.",
  })
) {}

class FallowReportToolFailed extends S.Class<FallowReportToolFailed>($I`FallowReportToolFailed`)(
  {
    ...FallowReportBaseFields,
    status: S.Literal("tool-failed"),
    exitStatus: NonNegativeInt,
    stderrExcerpt: S.String,
  },
  $I.annote("FallowReportToolFailed", {
    description: "Fallow envelope emitted when the tool failed without decodable JSON.",
  })
) {}

class FallowReportInvalidJson extends S.Class<FallowReportInvalidJson>($I`FallowReportInvalidJson`)(
  {
    ...FallowReportBaseFields,
    status: S.Literal("invalid-json"),
    exitStatus: NonNegativeInt,
    stderrExcerpt: S.String,
  },
  $I.annote("FallowReportInvalidJson", {
    description: "Fallow envelope emitted when the tool succeeded but emitted invalid JSON.",
  })
) {}

class FallowReportBaseResolutionFailed extends S.Class<FallowReportBaseResolutionFailed>(
  $I`FallowReportBaseResolutionFailed`
)(
  {
    ...FallowReportBaseFields,
    status: S.Literal("base-resolution-failed"),
    exitStatus: NonNegativeInt,
    stderrExcerpt: S.String,
  },
  $I.annote("FallowReportBaseResolutionFailed", {
    description: "Fallow envelope emitted when a diff-aware base ref cannot be resolved.",
  })
) {}

const FallowReportWireEnvelope = S.Union([
  FallowReportOk,
  FallowReportToolFailed,
  FallowReportInvalidJson,
  FallowReportBaseResolutionFailed,
]).pipe(
  $I.annoteSchema("FallowReportWireEnvelope", {
    description: "Wire guard for Fallow report envelopes before downstream quality parsing.",
  })
);

const decodeJsonText = S.decodeUnknownEffect(S.UnknownFromJsonString);
const encodeJsonText = S.encodeUnknownEffect(S.UnknownFromJsonString);
const decodeUnknownRecordOption = S.decodeUnknownOption(S.Record(S.String, S.Unknown));
const decodeUnknownArrayOption = S.decodeUnknownOption(S.Array(S.Unknown));
const decodeNumberOption = S.decodeUnknownOption(S.Number);
const decodeStringOption = S.decodeUnknownOption(S.String);
const decodeFallowReportWireEnvelope = S.decodeUnknownEffect(FallowReportWireEnvelope);
const decodeFallowEnvelopeStatusOption = S.decodeUnknownOption(FallowEnvelopeStatus);

type FallowFeature = typeof FallowFeatureFamily.Type;
type FallowFinding = typeof FallowReportFinding.Type;
type FallowQualityEnvironment = FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner;
type FallowCommandOptions = {
  readonly advisory: boolean;
  readonly base: string;
  readonly check: boolean;
  readonly out: string;
  readonly quiet: boolean;
};
type ProcessResult = {
  readonly output: string;
  readonly exitCode: number;
};
type ReportPathResolution = {
  readonly absolute: string;
  readonly relative: string;
  readonly rawAbsolute: string;
  readonly rawRelative: string;
};

const commandText = (command: string, args: ReadonlyArray<string>) => A.join([command, ...args], " ");
const csvValues = (value: string): ReadonlyArray<string> =>
  pipe(
    Str.split(value, ","),
    A.map(Str.trim),
    A.filter((item) => item.length > 0)
  );

const normalizePath = Str.replaceAll("\\", "/");
const parserName = (feature: FallowFeature): string => `fallow/${feature}/v1`;
const subCategoryName = (feature: FallowFeature, rule: string): string => `fallow:${feature}:${rule}`;
const slugify = (value: string): string =>
  Str.toLowerCase(value)
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");

const unknownRecordProperty = (value: unknown, key: string): O.Option<unknown> =>
  pipe(
    decodeUnknownRecordOption(value),
    O.flatMap((record) => O.fromNullable(record[key]))
  );

const unknownNumberProperty = (value: unknown, key: string): O.Option<number> =>
  pipe(unknownRecordProperty(value, key), O.flatMap(decodeNumberOption));

const unknownStringProperty = (value: unknown, key: string): O.Option<string> =>
  pipe(unknownRecordProperty(value, key), O.flatMap(decodeStringOption));

const nonZeroNumberProperty = (value: unknown, key: string): O.Option<number> =>
  pipe(
    unknownNumberProperty(value, key),
    O.filter((count) => count > 0)
  );

const countFor = (findings: ReadonlyArray<FallowFinding>, attribution: typeof FindingAttributionKind.Type): number =>
  pipe(
    findings,
    A.filter((finding) => finding.attribution === attribution),
    A.length
  );

const attributionSummary = (findings: ReadonlyArray<FallowFinding>): FindingAttributionSummary =>
  FindingAttributionSummary.make({
    introduced: countFor(findings, "introduced"),
    inheritedAdjacent: countFor(findings, "inherited-adjacent"),
    notApplicable: countFor(findings, "not-applicable"),
  });

const attributionKinds = (findings: ReadonlyArray<FallowFinding>): ReadonlyArray<typeof FindingAttributionKind.Type> => {
  const discovered = pipe(
    findings,
    A.map((finding) => finding.attribution),
    A.dedupe
  );

  return A.isReadonlyArrayNonEmpty(discovered) ? discovered : ["not-applicable"];
};

const auditFinding = (
  rule: string,
  attribution: typeof FindingAttributionKind.Type,
  feature: FallowFeature
): FallowFinding =>
  FallowReportFinding.make({
    id: `${feature}-${attribution}-${rule}`,
    featureFamily: feature,
    attribution,
    parser: parserName(feature),
    subCategory: subCategoryName(feature, rule),
    blocking: false,
    sourceRef: fallbackSourceRef,
  });

const normalizeAuditFindings = (document: unknown): ReadonlyArray<FallowFinding> => {
  const attribution = pipe(unknownRecordProperty(document, "attribution"), O.getOrUndefined);
  if (attribution === undefined) {
    return A.empty();
  }

  const candidates = [
    ["dead_code_introduced", "dead-code", "introduced"],
    ["dead_code_inherited", "dead-code", "inherited-adjacent"],
    ["complexity_introduced", "complexity", "introduced"],
    ["complexity_inherited", "complexity", "inherited-adjacent"],
    ["duplication_introduced", "duplication", "introduced"],
    ["duplication_inherited", "duplication", "inherited-adjacent"],
  ] as const;

  return pipe(
    candidates,
    A.flatMap(([key, rule, attributionKind]) =>
      O.isSome(nonZeroNumberProperty(attribution, key)) ? A.of(auditFinding(rule, attributionKind, "audit")) : A.empty()
    )
  );
};

const normalizeSummaryFindings = (feature: FallowFeature, document: unknown): ReadonlyArray<FallowFinding> => {
  const summary = pipe(unknownRecordProperty(document, "summary"), O.getOrUndefined);
  const summaryRecord = decodeUnknownRecordOption(summary);
  if (O.isNone(summaryRecord)) {
    return A.empty();
  }

  return pipe(
    R.keys(summaryRecord.value),
    A.flatMap((key) =>
      O.isSome(nonZeroNumberProperty(summaryRecord.value, key))
        ? A.of(
            FallowReportFinding.make({
              id: `${feature}-not-applicable-${slugify(key)}`,
              featureFamily: feature,
              attribution: "not-applicable",
              parser: parserName(feature),
              subCategory: subCategoryName(feature, slugify(key)),
              blocking: false,
              sourceRef: fallbackSourceRef,
            })
          )
        : A.empty()
    )
  );
};

const normalizeFindings = (feature: FallowFeature, document: unknown): ReadonlyArray<FallowFinding> =>
  feature === "audit" ? normalizeAuditFindings(document) : normalizeSummaryFindings(feature, document);

const extractJsonDocumentText = (output: string): O.Option<string> => {
  const start = output.indexOf("{");
  const end = output.lastIndexOf("}");

  return start < 0 || end < start ? O.none() : O.some(output.slice(start, end + 1));
};

const stderrExcerpt = (output: string): string => {
  const trimmed = Str.trim(output);
  return trimmed.length > 0 ? trimmed.slice(0, 4000) : "fallow emitted no output";
};

const collectProcessOutput = Effect.fn("FallowQuality.collectProcessOutput")(function* (
  repoRoot: string,
  command: string,
  args: ReadonlyArray<string>
): Effect.fn.Return<ProcessResult, QualityScriptCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  return yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* ChildProcess.make(command, [...args], {
        cwd: repoRoot,
        extendEnv: true,
        stdout: "pipe",
        stderr: "pipe",
      });
      const output = yield* handle.all.pipe(
        Stream.decodeText(),
        Stream.runFold(
          () => "",
          (acc, chunk) => acc + chunk
        )
      );
      const exitCode = yield* handle.exitCode;
      return {
        output,
        exitCode,
      };
    })
  ).pipe(
    QualityScriptCommandError.mapError(`Failed to run ${commandText(command, args)}.`, {
      command: commandText(command, args),
    })
  );
});

const collectOptionalOutput = Effect.fn("FallowQuality.collectOptionalOutput")(function* (
  repoRoot: string,
  command: string,
  args: ReadonlyArray<string>,
  fallback: string
): Effect.fn.Return<string, never, ChildProcessSpawner.ChildProcessSpawner> {
  const result = yield* collectProcessOutput(repoRoot, command, args).pipe(Effect.option);
  if (O.isNone(result) || result.value.exitCode !== 0) {
    return fallback;
  }

  const jsonText = pipe(extractJsonDocumentText(result.value.output), O.getOrUndefined);
  return Str.trim(jsonText ?? result.value.output) || fallback;
});

const resolveReportPath = Effect.fn("FallowQuality.resolveReportPath")(function* (
  repoRoot: string,
  out: string,
  feature: FallowFeature
): Effect.fn.Return<ReportPathResolution, never, Path.Path> {
  const path = yield* Path.Path;
  const absolute = path.isAbsolute(out) ? out : path.join(repoRoot, out);
  const relative = normalizePath(path.relative(repoRoot, absolute));
  const rawRelative = normalizePath(path.join(path.dirname(relative), "raw", `${feature}.stdout.json`));
  const rawAbsolute = path.join(repoRoot, rawRelative);

  return {
    absolute,
    relative,
    rawAbsolute,
    rawRelative,
  };
});

const fallowArgs = (feature: FallowFeature, base: string, quiet: boolean): ReadonlyArray<string> => {
  const quietArgs = quiet ? ["--quiet"] : [];

  switch (feature) {
    case "audit":
      return [
        "run",
        "fallow",
        "--",
        "audit",
        "--config",
        ".fallowrc.jsonc",
        "--format",
        "json",
        ...quietArgs,
        "--base",
        base,
        "--gate",
        "new-only",
      ];
    case "dead-code":
      return [
        "run",
        "fallow",
        "--",
        "dead-code",
        "--config",
        ".fallowrc.jsonc",
        "--format",
        "json",
        ...quietArgs,
        "--summary",
      ];
    case "dupes":
      return ["run", "fallow", "--", "dupes", "--config", ".fallowrc.jsonc", "--format", "json", ...quietArgs, "--top", "50"];
    case "health":
      return [
        "run",
        "fallow",
        "--",
        "health",
        "--config",
        ".fallowrc.jsonc",
        "--format",
        "json",
        ...quietArgs,
        "--report-only",
        "--top",
        "50",
      ];
    case "boundaries":
      return [
        "run",
        "fallow",
        "--",
        "dead-code",
        "--boundary-violations",
        "--config",
        "standards/fallow.boundaries.generated.jsonc",
        "--format",
        "json",
        ...quietArgs,
        "--summary",
      ];
    case "flags":
      return [
        "run",
        "fallow",
        "--",
        "flags",
        "--config",
        ".fallowrc.jsonc",
        "--format",
        "json",
        ...quietArgs,
        "--summary",
        "--top",
        "50",
      ];
    case "security":
      return [
        "run",
        "fallow",
        "--",
        "security",
        "--config",
        ".fallowrc.jsonc",
        "--format",
        "json",
        ...quietArgs,
        "--summary",
      ];
    case "fix-preview":
      return ["run", "fallow", "--", "fix", "--dry-run", "--format", "json", "--no-create-config"];
  }
};

const baseEnvelope = (
  feature: FallowFeature,
  options: FallowCommandOptions,
  paths: ReportPathResolution,
  generatedAt: string,
  toolVersion: string,
  dirtyWorktree: boolean,
  findings: ReadonlyArray<FallowFinding>
) => ({
  schemaVersion: "fallow-report-envelope/v1",
  toolVersion,
  command: `beep quality fallow ${feature} --base ${options.base}`,
  subcommand: feature,
  baseRef: options.base,
  generatedAt,
  advisory: options.advisory,
  dirtyWorktree,
  reportPath: paths.relative,
  rawOutputRef: paths.rawRelative,
  attributionKinds: attributionKinds(findings),
  findingAttributionSummary: attributionSummary(findings),
});

const makeOkEnvelope = (
  feature: FallowFeature,
  options: FallowCommandOptions,
  paths: ReportPathResolution,
  generatedAt: string,
  toolVersion: string,
  dirtyWorktree: boolean,
  exitStatus: number,
  decoded: unknown
) => {
  const findings = normalizeFindings(feature, decoded);

  return {
    ...baseEnvelope(feature, options, paths, generatedAt, toolVersion, dirtyWorktree, findings),
    status: "ok",
    exitStatus,
    report: FallowReportPayload.make({
      findingCount: A.length(findings),
      findings,
    }),
  };
};

const makeFailureEnvelope = (
  feature: FallowFeature,
  options: FallowCommandOptions,
  paths: ReportPathResolution,
  generatedAt: string,
  toolVersion: string,
  dirtyWorktree: boolean,
  status: typeof FallowEnvelopeStatus.Type,
  exitStatus: number,
  message: string
) => ({
  ...baseEnvelope(feature, options, paths, generatedAt, toolVersion, dirtyWorktree, A.empty()),
  status,
  exitStatus,
  stderrExcerpt: message,
});

const encodeEnvelope = (envelope: unknown): Effect.Effect<string, QualityScriptCommandError> =>
  encodeJsonText(envelope).pipe(QualityScriptCommandError.mapError("Failed to encode Fallow report envelope."));

const writeEnvelope = Effect.fn("FallowQuality.writeEnvelope")(function* (
  paths: ReportPathResolution,
  rawOutput: string,
  envelope: unknown
): Effect.fn.Return<void, QualityScriptCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const envelopeText = yield* encodeEnvelope(envelope);

  yield* fs
    .makeDirectory(path.dirname(paths.absolute), { recursive: true })
    .pipe(QualityScriptCommandError.mapError(`Failed to create ${path.dirname(paths.absolute)}.`));
  yield* fs
    .makeDirectory(path.dirname(paths.rawAbsolute), { recursive: true })
    .pipe(QualityScriptCommandError.mapError(`Failed to create ${path.dirname(paths.rawAbsolute)}.`));
  yield* fs
    .writeFileString(paths.rawAbsolute, rawOutput)
    .pipe(QualityScriptCommandError.mapError(`Failed to write ${paths.rawAbsolute}.`));
  yield* fs
    .writeFileString(paths.absolute, `${envelopeText}\n`)
    .pipe(QualityScriptCommandError.mapError(`Failed to write ${paths.absolute}.`));
  yield* Console.log(envelopeText);
});

const dirtyWorktree = Effect.fn("FallowQuality.dirtyWorktree")(function* (
  repoRoot: string
): Effect.fn.Return<boolean, never, ChildProcessSpawner.ChildProcessSpawner> {
  const result = yield* collectProcessOutput(repoRoot, "git", ["status", "--porcelain"]).pipe(Effect.option);
  return O.isSome(result) && Str.trim(result.value.output).length > 0;
});

const resolveBaseRef = Effect.fn("FallowQuality.resolveBaseRef")(function* (
  repoRoot: string,
  base: string
): Effect.fn.Return<ProcessResult, never, ChildProcessSpawner.ChildProcessSpawner> {
  return yield* collectProcessOutput(repoRoot, "git", ["rev-parse", "--verify", base]).pipe(
    Effect.catchAll(() =>
      Effect.succeed({
        output: `unable to resolve base ref ${base}`,
        exitCode: 128,
      })
    )
  );
});

const runFallowFeature = Effect.fn("FallowQuality.runFallowFeature")(function* (
  feature: FallowFeature,
  options: FallowCommandOptions
): Effect.fn.Return<void, QualityScriptCommandError, FallowQualityEnvironment> {
  const repoRoot = yield* findRepoRoot().pipe(QualityScriptCommandError.mapError("Failed to locate repository root."));
  const paths = yield* resolveReportPath(repoRoot, options.out, feature);
  const generatedAt = yield* DateTime.now.pipe(Effect.map(DateTime.formatIso));
  const isDirty = yield* dirtyWorktree(repoRoot);
  const toolVersion = yield* collectOptionalOutput(repoRoot, "bun", ["run", "fallow", "--", "--version"], "fallow unknown");
  const baseResult = feature === "audit" ? yield* resolveBaseRef(repoRoot, options.base) : { output: "", exitCode: 0 };

  if (baseResult.exitCode !== 0) {
    const envelope = makeFailureEnvelope(
      feature,
      options,
      paths,
      generatedAt,
      toolVersion,
      isDirty,
      "base-resolution-failed",
      baseResult.exitCode,
      `unable to resolve base ref ${options.base}: ${stderrExcerpt(baseResult.output)}`
    );
    yield* writeEnvelope(paths, baseResult.output, envelope);
    if (!options.advisory) {
      return yield* QualityScriptCommandError.make({
        message: `Unable to resolve Fallow base ref ${options.base}.`,
        command: `git rev-parse --verify ${options.base}`,
        exitCode: baseResult.exitCode,
      });
    }
    return;
  }

  const args = fallowArgs(feature, options.base, true);
  const result = yield* collectProcessOutput(repoRoot, "bun", args);
  const jsonText = pipe(extractJsonDocumentText(result.output), O.getOrUndefined);
  const decoded = jsonText === undefined ? O.none() : yield* decodeJsonText(jsonText).pipe(Effect.option);
  const envelope =
    O.isSome(decoded)
      ? makeOkEnvelope(feature, options, paths, generatedAt, toolVersion, isDirty, result.exitCode, decoded.value)
      : makeFailureEnvelope(
          feature,
          options,
          paths,
          generatedAt,
          toolVersion,
          isDirty,
          result.exitCode === 0 ? "invalid-json" : "tool-failed",
          result.exitCode,
          result.exitCode === 0
            ? `fallow emitted output that could not be decoded as JSON: ${stderrExcerpt(result.output)}`
            : stderrExcerpt(result.output)
        );

  yield* writeEnvelope(paths, result.output, envelope);

  const envelopeStatus = pipe(unknownStringProperty(envelope, "status"), O.getOrElse(() => "tool-failed"));
  if (!options.advisory && (envelopeStatus !== "ok" || result.exitCode !== 0)) {
    return yield* QualityScriptCommandError.make({
      message: `Fallow ${feature} failed with status ${envelopeStatus}.`,
      command: commandText("bun", args),
      exitCode: result.exitCode === 0 ? 1 : result.exitCode,
    });
  }
});

const readJsonDocument = Effect.fn("FallowQuality.readJsonDocument")(function* (
  filePath: string
): Effect.fn.Return<unknown, QualityScriptCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const repoRoot = yield* findRepoRoot().pipe(QualityScriptCommandError.mapError("Failed to locate repository root."));
  const path = yield* Path.Path;
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath);
  const text = yield* fs
    .readFileString(absolutePath)
    .pipe(QualityScriptCommandError.mapError(`Failed to read ${absolutePath}.`));

  return yield* decodeJsonText(text).pipe(QualityScriptCommandError.mapError(`Failed to decode ${absolutePath}.`));
});

const requireEnvelopeKeys = (document: unknown, requiredKeys: ReadonlyArray<string>): Effect.Effect<void, QualityScriptCommandError> => {
  const record = decodeUnknownRecordOption(document);
  if (O.isNone(record)) {
    return QualityScriptCommandError.make({
      message: "Fallow envelope is not a JSON object.",
      exitCode: 1,
    });
  }

  const missing = pipe(
    requiredKeys,
    A.filter((key) => !R.has(record.value, key))
  );

  if (A.isReadonlyArrayNonEmpty(missing)) {
    return QualityScriptCommandError.make({
      message: `Fallow envelope is missing required key(s): ${A.join(missing, ", ")}`,
      exitCode: 1,
    });
  }

  return Effect.void;
};

const checkExactEnvelopeKeys = (document: unknown): Effect.Effect<void, QualityScriptCommandError> => {
  const record = decodeUnknownRecordOption(document);
  if (O.isNone(record)) {
    return QualityScriptCommandError.make({
      message: "Fallow envelope is not a JSON object.",
      exitCode: 1,
    });
  }

  const status = pipe(unknownRecordProperty(record.value, "status"), O.flatMap(decodeFallowEnvelopeStatusOption));
  if (O.isNone(status)) {
    return QualityScriptCommandError.make({
      message: "Fallow envelope is missing a valid status discriminator.",
      exitCode: 1,
    });
  }

  const allowed = status.value === "ok" ? okEnvelopeKeys : failureEnvelopeKeys;
  const keys = R.keys(record.value);
  const missing = pipe(
    allowed,
    A.filter((key) => !A.contains(keys, key))
  );
  const surplus = pipe(
    keys,
    A.filter((key) => !A.contains(allowed, key))
  );

  if (A.isReadonlyArrayNonEmpty(missing) || A.isReadonlyArrayNonEmpty(surplus)) {
    return QualityScriptCommandError.make({
      message: `Fallow envelope key mismatch. Missing: ${A.join(missing, ", ") || "none"}. Surplus: ${
        A.join(surplus, ", ") || "none"
      }.`,
      exitCode: 1,
    });
  }

  return Effect.void;
};

const checkReportInvariants = (document: unknown): Effect.Effect<void, QualityScriptCommandError> => {
  const status = pipe(unknownRecordProperty(document, "status"), O.flatMap(decodeFallowEnvelopeStatusOption));

  if (O.isSome(status) && status.value === "ok") {
    const report = pipe(unknownRecordProperty(document, "report"), O.getOrUndefined);
    const findingCount = pipe(unknownNumberProperty(report, "findingCount"), O.getOrElse(() => -1));
    const findings = pipe(unknownRecordProperty(report, "findings"), O.flatMap(decodeUnknownArrayOption));
    const actualCount = O.isSome(findings) ? A.length(findings.value) : -1;

    if (findingCount !== actualCount) {
      return QualityScriptCommandError.make({
        message: `Fallow envelope report findingCount ${findingCount} does not match findings length ${actualCount}.`,
        exitCode: 1,
      });
    }
  }

  return Effect.void;
};

const checkEnvelopePath = Effect.fn("FallowQuality.checkEnvelopePath")(function* (
  filePath: string,
  requiredKeys: ReadonlyArray<string>
): Effect.fn.Return<void, QualityScriptCommandError, FileSystem.FileSystem | Path.Path> {
  const document = yield* readJsonDocument(filePath);
  yield* checkExactEnvelopeKeys(document);
  yield* requireEnvelopeKeys(document, requiredKeys);
  yield* decodeFallowReportWireEnvelope(document).pipe(
    QualityScriptCommandError.mapError(`Fallow envelope ${filePath} does not match the report schema.`)
  );
  yield* checkReportInvariants(document);
  yield* Console.log(`[fallow] envelope ok: ${filePath}`);
});

const failWithDiagnostics = (label: string, diagnostics: ReadonlyArray<string>): Effect.Effect<void, QualityScriptCommandError> =>
  A.isReadonlyArrayEmpty(diagnostics)
    ? Effect.void
    : QualityScriptCommandError.make({
        message: `${label} failed:\n${A.join(diagnostics, "\n")}`,
        exitCode: 1,
      });

const runBoundariesConfigCheck = Effect.fn("FallowQuality.runBoundariesConfigCheck")(function* (
  check: boolean
): Effect.fn.Return<void, QualityScriptCommandError, ChildProcessSpawner.ChildProcessSpawner> {
  const repoRoot = yield* findRepoRoot().pipe(QualityScriptCommandError.mapError("Failed to locate repository root."));
  const args = check ? ["run", "fallow:boundaries:check"] : ["run", "fallow:boundaries"];
  const result = yield* collectProcessOutput(repoRoot, "bun", args);
  yield* Console.log(result.output);

  if (result.exitCode !== 0) {
    return yield* QualityScriptCommandError.make({
      message: "Fallow generated boundary config check failed.",
      command: commandText("bun", args),
      exitCode: result.exitCode,
    });
  }
});

const runCommandContractCheck = Effect.fn("FallowQuality.runCommandContractCheck")(function* (
  asserted: string,
  requireEnvelope: boolean,
  outDir: string
): Effect.fn.Return<void, QualityScriptCommandError, FallowQualityEnvironment> {
  const path = yield* Path.Path;
  const assertedValues = csvValues(asserted);
  const missing = pipe(
    fallowFeatureValues,
    A.filter((feature) => !A.contains(assertedValues, feature))
  );
  const unexpected = pipe(
    assertedValues,
    A.filter((feature) => !A.contains(fallowFeatureValues, feature))
  );
  yield* failWithDiagnostics("fallow command-contract-check", [
    ...A.map(missing, (feature) => `missing asserted feature: ${feature}`),
    ...A.map(unexpected, (feature) => `unexpected asserted feature: ${feature}`),
  ]);

  if (!requireEnvelope) {
    yield* Console.log("[fallow] command contract ok");
    return;
  }

  yield* Effect.forEach(
    fallowFeatureValues,
    (feature) =>
      runFallowFeature(feature, {
        advisory: true,
        base: defaultBaseRef,
        check: false,
        out: path.join(outDir, `${feature}.json`),
        quiet: true,
      }).pipe(
        Effect.zipRight(
          checkEnvelopePath(path.join(outDir, `${feature}.json`), [
            "schemaVersion",
            "status",
            "command",
            "exitStatus",
            "baseRef",
            "rawOutputRef",
          ])
        )
      ),
    { concurrency: 1 }
  );
  yield* Console.log("[fallow] command contract ok");
});

const runCiContractCheck = Effect.fn("FallowQuality.runCiContractCheck")(function* (
  workflowPath: string,
  expectLanes: string,
  expectOutDir: string,
  requireUpload: boolean,
  ifNoFilesFound: string,
  advisory: boolean
): Effect.fn.Return<void, QualityScriptCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const repoRoot = yield* findRepoRoot().pipe(QualityScriptCommandError.mapError("Failed to locate repository root."));
  const path = yield* Path.Path;
  const absolutePath = path.isAbsolute(workflowPath) ? workflowPath : path.join(repoRoot, workflowPath);
  const text = yield* fs
    .readFileString(absolutePath)
    .pipe(QualityScriptCommandError.mapError(`Failed to read ${absolutePath}.`));
  const lanes = csvValues(expectLanes);
  const diagnostics = [
    ...A.flatMap(lanes, (lane) =>
      Str.includes(`beep quality fallow ${lane}`)(text) || Str.includes(`${expectOutDir}/${lane}.json`)(text)
        ? A.empty<string>()
        : A.of(`missing CI lane or artifact reference for ${lane}`)
    ),
    ...(requireUpload && !Str.includes("actions/upload-artifact")(text) ? ["missing actions/upload-artifact step"] : []),
    ...(requireUpload && !Str.includes(`if-no-files-found: ${ifNoFilesFound}`)(text)
      ? [`missing if-no-files-found: ${ifNoFilesFound}`]
      : []),
    ...(advisory && !Str.includes("--advisory")(text) ? ["missing advisory Fallow invocation"] : []),
  ];

  yield* failWithDiagnostics("fallow ci-contract-check", diagnostics);
  yield* Console.log(`[fallow] CI contract ok: ${workflowPath}`);
});

const makeFallowFeatureCommand = (feature: FallowFeature) =>
  Command.make(
    feature,
    {
      advisory: Flag.boolean("advisory").pipe(Flag.withDescription("Exit zero while preserving Fallow exit status")),
      base: Flag.string("base").pipe(
        Flag.withDefault(defaultBaseRef),
        Flag.withDescription("Git base ref used by diff-aware Fallow commands")
      ),
      check: Flag.boolean("check").pipe(
        Flag.withDescription("Fail only for promoted blocking lanes; advisory P1 lanes do not promote findings")
      ),
      out: Flag.string("out").pipe(
        Flag.withDefault(`${defaultOutDir}/${feature}.json`),
        Flag.withDescription("Envelope output path")
      ),
      quiet: Flag.boolean("quiet").pipe(Flag.withDescription("Suppress Fallow tool chatter in raw output where supported")),
    },
    ({ advisory, base, check, out, quiet }) => runFallowFeature(feature, { advisory, base, check, out, quiet })
  ).pipe(Command.withDescription(`Run Fallow ${feature} and write a repo-cli report envelope`));

const envelopeCheckCommand = Command.make(
  "envelope-check",
  {
    path: Argument.string("path").pipe(Argument.withDescription("Envelope JSON path to validate")),
    require: Flag.string("require").pipe(
      Flag.withDefault(""),
      Flag.withDescription("Comma-separated top-level metadata keys that must be present")
    ),
  },
  ({ path, require }) => checkEnvelopePath(path, csvValues(require))
).pipe(Command.withDescription("Decode and validate one Fallow report envelope"));

const commandContractCheckCommand = Command.make(
  "command-contract-check",
  {
    assert: Flag.string("assert").pipe(
      Flag.withDefault(A.join(fallowFeatureValues, ",")),
      Flag.withDescription("Comma-separated Fallow feature commands expected in the quality surface")
    ),
    requireEnvelope: Flag.boolean("require-envelope").pipe(
      Flag.withDescription("Run each advisory command and validate the emitted envelope")
    ),
    outDir: Flag.string("out-dir").pipe(
      Flag.withDefault(defaultOutDir),
      Flag.withDescription("Directory used for command-contract envelope probes")
    ),
  },
  ({ assert: asserted, outDir, requireEnvelope }) => runCommandContractCheck(asserted, requireEnvelope, outDir)
).pipe(Command.withDescription("Verify the implemented Fallow quality command contract"));

const boundariesConfigCheckCommand = Command.make(
  "config-check",
  {
    check: Flag.boolean("check").pipe(Flag.withDescription("Fail when generated Fallow boundary config is stale")),
  },
  ({ check }) => runBoundariesConfigCheck(check)
).pipe(Command.withDescription("Verify generated Fallow boundary config freshness"));

const ciContractCheckCommand = Command.make(
  "ci-contract-check",
  {
    workflow: Argument.string("workflow").pipe(Argument.withDescription("Workflow file to inspect")),
    expectLanes: Flag.string("expect-lanes").pipe(
      Flag.withDefault(A.join(fallowFeatureValues, ",")),
      Flag.withDescription("Comma-separated Fallow lanes expected in CI")
    ),
    expectOutDir: Flag.string("expect-out-dir").pipe(
      Flag.withDefault(defaultOutDir),
      Flag.withDescription("Expected envelope artifact output directory")
    ),
    requireUpload: Flag.boolean("require-upload").pipe(Flag.withDescription("Require artifact upload wiring")),
    ifNoFilesFound: Flag.string("if-no-files-found").pipe(
      Flag.withDefault("error"),
      Flag.withDescription("Expected upload-artifact missing-file behavior")
    ),
    advisory: Flag.boolean("advisory").pipe(Flag.withDescription("Require advisory Fallow invocations")),
  },
  ({ advisory, expectLanes, expectOutDir, ifNoFilesFound, requireUpload, workflow }) =>
    runCiContractCheck(workflow, expectLanes, expectOutDir, requireUpload, ifNoFilesFound, advisory)
).pipe(Command.withDescription("Verify hosted CI uses the repo-cli Fallow envelope wrapper"));

const fallowAuditCommand = makeFallowFeatureCommand("audit");
const fallowDeadCodeCommand = makeFallowFeatureCommand("dead-code");
const fallowDupesCommand = makeFallowFeatureCommand("dupes");
const fallowHealthCommand = makeFallowFeatureCommand("health");
const fallowBoundariesCommand = makeFallowFeatureCommand("boundaries").pipe(
  Command.withSubcommands([boundariesConfigCheckCommand])
);
const fallowFlagsCommand = makeFallowFeatureCommand("flags");
const fallowSecurityCommand = makeFallowFeatureCommand("security");
const fallowFixPreviewCommand = makeFallowFeatureCommand("fix-preview");

/**
 * Fallow command group under the canonical repo quality surface.
 *
 * @example
 * ```ts
 * import { qualityFallowCommand } from "@beep/repo-cli/commands/Quality"
 *
 * console.log(qualityFallowCommand)
 * ```
 * @category cli-commands
 * @since 0.0.0
 */
export const qualityFallowCommand = Command.make("fallow", {}, () =>
  jsonStringifyPretty({
    commands: fallowFeatureValues,
    helpers: ["command-contract-check", "envelope-check", "boundaries config-check", "ci-contract-check"],
    defaultOutDir,
  }).pipe(Effect.flatMap(Console.log), QualityScriptCommandError.mapError("Failed to render Fallow quality help."))
).pipe(
  Command.withDescription("Advisory Fallow quality wrappers and report-envelope checks"),
  Command.withSubcommands([
    fallowAuditCommand,
    fallowDeadCodeCommand,
    fallowDupesCommand,
    fallowHealthCommand,
    fallowBoundariesCommand,
    fallowFlagsCommand,
    fallowSecurityCommand,
    fallowFixPreviewCommand,
    commandContractCheckCommand,
    envelopeCheckCommand,
    ciContractCheckCommand,
  ])
);
