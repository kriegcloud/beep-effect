import { runTerseEffectRules, TerseEffectRulesOptions } from "@beep/repo-cli/commands/Laws/TerseEffect";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path } from "effect";
import { describe, expect, it } from "vitest";

const testLayer = Layer.mergeAll(NodeServices.layer);

const withTempWorkingDirectory = <A, E, R>(use: Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const tmpDir = yield* fs.makeTempDirectory();
      const previousCwd = process.cwd();
      process.chdir(tmpDir);
      return { fs, previousCwd, tmpDir } as const;
    }),
    () => use,
    ({ fs, previousCwd, tmpDir }) =>
      Effect.gen(function* () {
        process.chdir(previousCwd);
        yield* fs.remove(tmpDir, { recursive: true });
      })
  );

const writeProjectFile = Effect.fn(function* (relativePath: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolutePath = path.join(process.cwd(), relativePath);
  const directoryPath = path.dirname(absolutePath);

  yield* fs.makeDirectory(directoryPath, { recursive: true });
  yield* fs.writeFileString(absolutePath, content);
});

const readProjectFile = Effect.fn(function* (relativePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  return yield* fs.readFileString(path.join(process.cwd(), relativePath));
});

const writeTsconfig = writeProjectFile(
  "tsconfig.json",
  ["{", '  "compilerOptions": {', '    "target": "ES2022",', '    "module": "ESNext"', "  }", "}"].join("\n")
);

describe("terse effect laws", () => {
  it("reports helper simplifications in dry-run check mode without rewriting files", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            [
              'import * as A from "effect/Array";',
              "",
              "export const value = {",
              "  onNone: () => A.empty<string>(),",
              "  onSome: (reference) => A.make(reference),",
              "};",
              "",
            ].join("\n")
          );

          const summary = yield* runTerseEffectRules(
            new TerseEffectRulesOptions({
              write: false,
              strictCheck: true,
              excludePaths: [],
            })
          );
          const source = yield* readProjectFile("packages/demo/src/index.ts");

          expect(summary.touchedFiles).toBe(1);
          expect(summary.helpersSimplified).toBe(2);
          expect(summary.thunkHelpersSimplified).toBe(0);
          expect(summary.flowCandidatesDetected).toBe(0);
          expect(summary.optionObjectCompactionCandidatesDetected).toBe(0);
          expect(summary.strictFailure).toBe(true);
          expect(summary.changedFiles).toEqual(["packages/demo/src/index.ts"]);
          expect(source).toContain("onNone: () => A.empty<string>()");
          expect(source).toContain("onSome: (reference) => A.make(reference)");
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("rewrites supported helper wrappers in write mode", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            [
              'import * as A from "effect/Array";',
              "",
              "export const value = {",
              "  onNone: () => A.empty<string>(),",
              "  onSome: (reference) => A.make(reference),",
              "};",
              "",
            ].join("\n")
          );

          const summary = yield* runTerseEffectRules(
            new TerseEffectRulesOptions({
              write: true,
              strictCheck: false,
              excludePaths: [],
            })
          );
          const source = yield* readProjectFile("packages/demo/src/index.ts");

          expect(summary.touchedFiles).toBe(1);
          expect(summary.helpersSimplified).toBe(2);
          expect(summary.thunkHelpersSimplified).toBe(0);
          expect(summary.flowCandidatesDetected).toBe(0);
          expect(summary.optionObjectCompactionCandidatesDetected).toBe(0);
          expect(summary.strictFailure).toBe(false);
          expect(source).toContain("onNone: A.empty<string>");
          expect(source).toContain("onSome: A.of");
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("leaves already-terse code unchanged", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            [
              'import * as A from "effect/Array";',
              "",
              "export const value = {",
              "  onNone: A.empty<string>,",
              "  onSome: A.of,",
              "};",
              "",
            ].join("\n")
          );

          const summary = yield* runTerseEffectRules(
            new TerseEffectRulesOptions({
              write: false,
              strictCheck: true,
              excludePaths: [],
            })
          );

          expect(summary.touchedFiles).toBe(0);
          expect(summary.helpersSimplified).toBe(0);
          expect(summary.thunkHelpersSimplified).toBe(0);
          expect(summary.flowCandidatesDetected).toBe(0);
          expect(summary.optionObjectCompactionCandidatesDetected).toBe(0);
          expect(summary.strictFailure).toBe(false);
          expect(summary.changedFiles).toEqual([]);
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("detects flow candidates and shared thunk helpers in dry-run mode", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            [
              'import { pipe } from "effect";',
              'import * as O from "effect/Option";',
              'import { thunkUndefined } from "@beep/utils";',
              "",
              "declare const parse: (value: string) => O.Option<string>;",
              "",
              "export const value = {",
              "  onNone: () => undefined,",
              "  parse: (input) => pipe(input, parse, O.getOrElse(() => input)),",
              "};",
              "",
            ].join("\n")
          );

          const summary = yield* runTerseEffectRules(
            new TerseEffectRulesOptions({
              write: false,
              strictCheck: true,
              excludePaths: [],
            })
          );
          const source = yield* readProjectFile("packages/demo/src/index.ts");

          expect(summary.touchedFiles).toBe(1);
          expect(summary.helpersSimplified).toBe(0);
          expect(summary.thunkHelpersSimplified).toBe(1);
          expect(summary.flowCandidatesDetected).toBe(1);
          expect(summary.optionObjectCompactionCandidatesDetected).toBe(0);
          expect(summary.strictFailure).toBe(true);
          expect(source).toContain("onNone: () => undefined");
          expect(source).toContain("parse: (input) => pipe(input, parse, O.getOrElse(() => input))");
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("rewrites shared thunk helper cases while leaving flow-only candidates for manual follow-up", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            [
              'import { pipe } from "effect";',
              'import * as O from "effect/Option";',
              'import { thunkUndefined } from "@beep/utils";',
              "",
              "declare const parse: (value: string) => O.Option<string>;",
              "",
              "export const value = {",
              "  onNone: () => undefined,",
              "  parse: (input) => pipe(input, parse, O.getOrElse(() => input)),",
              "};",
              "",
            ].join("\n")
          );

          const summary = yield* runTerseEffectRules(
            new TerseEffectRulesOptions({
              write: true,
              strictCheck: false,
              excludePaths: [],
            })
          );
          const source = yield* readProjectFile("packages/demo/src/index.ts");

          expect(summary.touchedFiles).toBe(1);
          expect(summary.helpersSimplified).toBe(0);
          expect(summary.thunkHelpersSimplified).toBe(1);
          expect(summary.flowCandidatesDetected).toBe(1);
          expect(summary.optionObjectCompactionCandidatesDetected).toBe(0);
          expect(summary.strictFailure).toBe(false);
          expect(source).toContain("onNone: thunkUndefined");
          expect(source).toContain("parse: (input) => pipe(input, parse, O.getOrElse(() => input))");
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("ignores type-only thunk imports when checking shared helper availability", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            [
              'import { type thunkUndefined, thunk0 } from "@beep/utils";',
              "",
              "export const keep = thunk0;",
              "export const value = { onNone: () => undefined };",
              "",
            ].join("\n")
          );

          const summary = yield* runTerseEffectRules(
            new TerseEffectRulesOptions({
              write: false,
              strictCheck: true,
              excludePaths: [],
            })
          );

          expect(summary.touchedFiles).toBe(0);
          expect(summary.helpersSimplified).toBe(0);
          expect(summary.thunkHelpersSimplified).toBe(0);
          expect(summary.flowCandidatesDetected).toBe(0);
          expect(summary.optionObjectCompactionCandidatesDetected).toBe(0);
          expect(summary.strictFailure).toBe(false);
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("reports whole-object Option match compaction candidates without rewriting files", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            [
              'import { pipe } from "effect";',
              'import * as O from "effect/Option";',
              "",
              "declare const maybeParse: O.Option<(input: string) => unknown>;",
              "",
              "export const runtime = pipe(",
              "  maybeParse,",
              "  O.match({",
              "    onNone: () => ({}),",
              "    onSome: (parse) => ({",
              "      Bun: {",
              "        YAML: { parse },",
              "      },",
              "    }),",
              "  })",
              ");",
              "",
            ].join("\n")
          );

          const summary = yield* runTerseEffectRules(
            new TerseEffectRulesOptions({
              write: false,
              strictCheck: true,
              excludePaths: [],
            })
          );
          const source = yield* readProjectFile("packages/demo/src/index.ts");

          expect(summary.touchedFiles).toBe(1);
          expect(summary.helpersSimplified).toBe(0);
          expect(summary.thunkHelpersSimplified).toBe(0);
          expect(summary.flowCandidatesDetected).toBe(0);
          expect(summary.optionObjectCompactionCandidatesDetected).toBe(1);
          expect(summary.strictFailure).toBe(true);
          expect(summary.changedFiles).toEqual(["packages/demo/src/index.ts"]);
          expect(source).toContain("onNone: () => ({})");
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("reports object-spread Option match compaction candidates", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            [
              'import * as O from "effect/Option";',
              "",
              "declare const selector: O.Option<string>;",
              "",
              "export const options = {",
              "  verbose: true,",
              "  ...O.match(selector, {",
              "    onNone: () => ({}),",
              "    onSome: (packageName) => ({ package: packageName }),",
              "  }),",
              "};",
              "",
            ].join("\n")
          );

          const summary = yield* runTerseEffectRules(
            new TerseEffectRulesOptions({
              write: false,
              strictCheck: true,
              excludePaths: [],
            })
          );

          expect(summary.touchedFiles).toBe(1);
          expect(summary.optionObjectCompactionCandidatesDetected).toBe(1);
          expect(summary.strictFailure).toBe(true);
          expect(summary.changedFiles).toEqual(["packages/demo/src/index.ts"]);
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("ignores clean Option object helpers and schema-boundary Option helpers", async () => {
    await Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            [
              'import * as O from "effect/Option";',
              'import * as R from "effect/Record";',
              'import * as S from "effect/Schema";',
              "",
              "declare const selector: O.Option<string>;",
              "",
              "export const options = R.getSomes({ package: selector });",
              'export class Input extends S.Class<Input>("Input")({',
              "  package: S.OptionFromOptionalKey(S.String),",
              "}) {}",
              "",
            ].join("\n")
          );

          const summary = yield* runTerseEffectRules(
            new TerseEffectRulesOptions({
              write: false,
              strictCheck: true,
              excludePaths: [],
            })
          );

          expect(summary.touchedFiles).toBe(0);
          expect(summary.helpersSimplified).toBe(0);
          expect(summary.thunkHelpersSimplified).toBe(0);
          expect(summary.flowCandidatesDetected).toBe(0);
          expect(summary.optionObjectCompactionCandidatesDetected).toBe(0);
          expect(summary.strictFailure).toBe(false);
        })
      ).pipe(Effect.provide(testLayer))
    );
  });
});
