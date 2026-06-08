import { runTerseEffectRules, TerseEffectRulesOptions } from "@beep/repo-cli/test/Laws";
import { A } from "@beep/utils";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path } from "effect";
import { describe, expect, it } from "vitest";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

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
  A.join(["{", '  "compilerOptions": {', '    "target": "ES2022",', '    "module": "ESNext"', "  }", "}"], "\n")
);

describe("terse effect laws", () => {
  it("reports helper simplifications in dry-run check mode without rewriting files", () =>
    Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            A.join(
              [
                'import * as A from "effect/Array";',
                "",
                "export const value = {",
                "  onNone: () => A.empty<string>(),",
                "  onSome: (reference) => A.make(reference),",
                "};",
                "",
              ],
              "\n"
            )
          );

          const summary = yield* runTerseEffectRules(
            TerseEffectRulesOptions.make({
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
      ).pipe(provideScopedLayer(testLayer))
    ));

  it("rewrites supported helper wrappers in write mode", () =>
    Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            A.join(
              [
                'import * as A from "effect/Array";',
                "",
                "export const value = {",
                "  onNone: () => A.empty<string>(),",
                "  onSome: (reference) => A.make(reference),",
                "};",
                "",
              ],
              "\n"
            )
          );

          const summary = yield* runTerseEffectRules(
            TerseEffectRulesOptions.make({
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
      ).pipe(provideScopedLayer(testLayer))
    ));

  it("leaves already-terse code unchanged", () =>
    Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            A.join(
              [
                'import * as A from "effect/Array";',
                "",
                "export const value = {",
                "  onNone: A.empty<string>,",
                "  onSome: A.of,",
                "};",
                "",
              ],
              "\n"
            )
          );

          const summary = yield* runTerseEffectRules(
            TerseEffectRulesOptions.make({
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
      ).pipe(provideScopedLayer(testLayer))
    ));

  it("detects flow candidates and shared thunk helpers in dry-run mode", () =>
    Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            A.join(
              [
                'import { pipe } from "effect";',
                'import * as O from "effect/Option";',
                'import { thunkUndefined } from "@beep/utils";',
                "",
                "declare const parse: (value: string) => O.Option<string>;",
                "declare const render: (value: O.Option<string>) => string;",
                "",
                "export const value = {",
                "  onNone: () => undefined,",
                "  parse: (input: string) => pipe(input, parse, render),",
                "};",
                "",
              ],
              "\n"
            )
          );

          const summary = yield* runTerseEffectRules(
            TerseEffectRulesOptions.make({
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
          expect(summary.blockingFiles).toEqual(["packages/demo/src/index.ts"]);
          expect(summary.rewritableFiles).toEqual(["packages/demo/src/index.ts"]);
          expect(summary.informationalFiles).toEqual(["packages/demo/src/index.ts"]);
          expect(summary.blockingFindings[0]).toMatch(/^packages\/demo\/src\/index\.ts:\d+:\d+ thunk-helper$/u);
          expect(summary.rewritableFindings[0]).toMatch(/^packages\/demo\/src\/index\.ts:\d+:\d+ thunk-helper$/u);
          expect(summary.informationalFindings[0]).toMatch(/^packages\/demo\/src\/index\.ts:\d+:\d+ flow-candidate$/u);
          expect(source).toContain("onNone: () => undefined");
          expect(source).toContain("parse: (input: string) => pipe(input, parse, render)");
        })
      ).pipe(provideScopedLayer(testLayer))
    ));

  it("rewrites shared thunk helper cases while leaving flow-only candidates for manual follow-up", () =>
    Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            A.join(
              [
                'import { pipe } from "effect";',
                'import * as O from "effect/Option";',
                'import { thunkUndefined } from "@beep/utils";',
                "",
                "declare const parse: (value: string) => O.Option<string>;",
                "declare const render: (value: O.Option<string>) => string;",
                "",
                "export const value = {",
                "  onNone: () => undefined,",
                "  parse: (input: string) => pipe(input, parse, render),",
                "};",
                "",
              ],
              "\n"
            )
          );

          const summary = yield* runTerseEffectRules(
            TerseEffectRulesOptions.make({
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
          expect(summary.blockingFiles).toEqual(["packages/demo/src/index.ts"]);
          expect(summary.rewritableFiles).toEqual(["packages/demo/src/index.ts"]);
          expect(summary.informationalFiles).toEqual(["packages/demo/src/index.ts"]);
          expect(summary.blockingFindings[0]).toMatch(/^packages\/demo\/src\/index\.ts:\d+:\d+ thunk-helper$/u);
          expect(summary.rewritableFindings[0]).toMatch(/^packages\/demo\/src\/index\.ts:\d+:\d+ thunk-helper$/u);
          expect(summary.informationalFindings[0]).toMatch(/^packages\/demo\/src\/index\.ts:\d+:\d+ flow-candidate$/u);
          expect(source).toContain("onNone: thunkUndefined");
          expect(source).toContain("parse: (input: string) => pipe(input, parse, render)");
        })
      ).pipe(provideScopedLayer(testLayer))
    ));

  it("ignores type-only thunk imports when checking shared helper availability", () =>
    Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            A.join(
              [
                'import { type thunkUndefined, thunk0 } from "@beep/utils";',
                "",
                "export const keep = thunk0;",
                "export const value = { onNone: () => undefined };",
                "",
              ],
              "\n"
            )
          );

          const summary = yield* runTerseEffectRules(
            TerseEffectRulesOptions.make({
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
      ).pipe(provideScopedLayer(testLayer))
    ));

  it("reports whole-object Option match compaction candidates without rewriting files", () =>
    Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            A.join(
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
              ],
              "\n"
            )
          );

          const summary = yield* runTerseEffectRules(
            TerseEffectRulesOptions.make({
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
      ).pipe(provideScopedLayer(testLayer))
    ));

  it("reports object-spread Option match compaction candidates", () =>
    Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            A.join(
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
              ],
              "\n"
            )
          );

          const summary = yield* runTerseEffectRules(
            TerseEffectRulesOptions.make({
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
      ).pipe(provideScopedLayer(testLayer))
    ));

  it("reports conditional optional object spread candidates", () =>
    Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            A.join(
              [
                "declare const name: string | undefined;",
                "declare const bucketName: string | undefined;",
                "",
                "export const options = {",
                "  verbose: true,",
                "  ...(name === undefined ? {} : { name }),",
                "  ...(bucketName !== undefined ? { lockTableName: `${bucketName}-locks` } : {}),",
                "};",
                "",
              ],
              "\n"
            )
          );

          const summary = yield* runTerseEffectRules(
            TerseEffectRulesOptions.make({
              write: false,
              strictCheck: true,
              excludePaths: [],
            })
          );

          expect(summary.touchedFiles).toBe(1);
          expect(summary.optionObjectCompactionCandidatesDetected).toBe(0);
          expect(summary.conditionalOptionalObjectSpreadCandidatesDetected).toBe(2);
          expect(summary.strictFailure).toBe(true);
          expect(summary.changedFiles).toEqual(["packages/demo/src/index.ts"]);
        })
      ).pipe(provideScopedLayer(testLayer))
    ));

  it("ignores JSX prop spreads and non-object optional spreads", () =>
    Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            A.join(
              [
                "declare const id: string | undefined;",
                "declare const imageName: string;",
                "declare const templateId: string | undefined;",
                "",
                "export const ids = [",
                "  ...(id === undefined ? [] : [id]),",
                "];",
                "export const selector = {",
                "  ...(templateId === undefined ? { imageName } : { templateId }),",
                "};",
                "",
              ],
              "\n"
            )
          );
          yield* writeProjectFile(
            "packages/demo/src/view.tsx",
            A.join(
              [
                "declare const value: string | undefined;",
                "",
                "export const view = <input {...(value !== undefined ? { value } : {})} />;",
                "",
              ],
              "\n"
            )
          );

          const summary = yield* runTerseEffectRules(
            TerseEffectRulesOptions.make({
              write: false,
              strictCheck: true,
              excludePaths: [],
            })
          );

          expect(summary.touchedFiles).toBe(0);
          expect(summary.conditionalOptionalObjectSpreadCandidatesDetected).toBe(0);
          expect(summary.strictFailure).toBe(false);
        })
      ).pipe(provideScopedLayer(testLayer))
    ));

  it("reports nested Option and Bool match candidates", () =>
    Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            A.join(
              [
                'import * as Bool from "effect/Boolean";',
                'import * as O from "effect/Option";',
                "",
                "declare const enabled: boolean;",
                "declare const maybeFallback: O.Option<string>;",
                "declare const maybeName: O.Option<string>;",
                "declare const verified: boolean;",
                "",
                "export const label = O.match(maybeName, {",
                '  onNone: () => O.match(maybeFallback, { onNone: () => "missing", onSome: (fallback) => fallback }),',
                "  onSome: (name) => name,",
                "});",
                "",
                "export const status = Bool.match(enabled, {",
                '  onFalse: () => "disabled",',
                '  onTrue: () => Bool.match(verified, { onFalse: () => "pending", onTrue: () => "ready" }),',
                "});",
                "",
              ],
              "\n"
            )
          );

          const summary = yield* runTerseEffectRules(
            TerseEffectRulesOptions.make({
              write: false,
              strictCheck: true,
              excludePaths: [],
            })
          );

          expect(summary.touchedFiles).toBe(1);
          expect(summary.helpersSimplified).toBe(0);
          expect(summary.thunkHelpersSimplified).toBe(0);
          expect(summary.flowCandidatesDetected).toBe(0);
          expect(summary.optionObjectCompactionCandidatesDetected).toBe(0);
          expect(summary.nestedOptionMatchCandidatesDetected).toBe(1);
          expect(summary.nestedBoolMatchCandidatesDetected).toBe(1);
          expect(summary.dualOverloadCandidatesDetected).toBe(0);
          expect(summary.strictFailure).toBe(true);
          expect(summary.changedFiles).toEqual(["packages/demo/src/index.ts"]);
        })
      ).pipe(provideScopedLayer(testLayer))
    ));

  it("reports explicit dual-overload helper candidates", () =>
    Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            A.join(
              [
                "type PackageOptions = Readonly<{ packageName: string }>;",
                "",
                "export function withPackage(packageName: string, options: PackageOptions): PackageOptions;",
                "export function withPackage(packageName: string): (options: PackageOptions) => PackageOptions;",
                "export function withPackage(",
                "  packageName: string,",
                "  options?: PackageOptions",
                "): PackageOptions | ((options: PackageOptions) => PackageOptions) {",
                "  if (options === undefined) {",
                "    return (self) => ({ ...self, packageName });",
                "  }",
                "",
                "  return { ...options, packageName };",
                "}",
                "",
                "export function literal(first: string, ...rest: ReadonlyArray<string>): ReadonlyArray<string>;",
                "export function literal(values: ReadonlyArray<string>): ReadonlyArray<string>;",
                "export function literal(",
                "  firstOrValues: string | ReadonlyArray<string>,",
                "  ...rest: ReadonlyArray<string>",
                "): ReadonlyArray<string> {",
                '  return typeof firstOrValues === "string" ? [firstOrValues, ...rest] : firstOrValues;',
                "}",
                "",
              ],
              "\n"
            )
          );

          const summary = yield* runTerseEffectRules(
            TerseEffectRulesOptions.make({
              write: false,
              strictCheck: true,
              excludePaths: [],
            })
          );

          expect(summary.touchedFiles).toBe(1);
          expect(summary.helpersSimplified).toBe(0);
          expect(summary.thunkHelpersSimplified).toBe(0);
          expect(summary.flowCandidatesDetected).toBe(0);
          expect(summary.optionObjectCompactionCandidatesDetected).toBe(0);
          expect(summary.nestedOptionMatchCandidatesDetected).toBe(0);
          expect(summary.nestedBoolMatchCandidatesDetected).toBe(0);
          expect(summary.dualOverloadCandidatesDetected).toBe(1);
          expect(summary.strictFailure).toBe(true);
          expect(summary.changedFiles).toEqual(["packages/demo/src/index.ts"]);
        })
      ).pipe(provideScopedLayer(testLayer))
    ));

  it("does not enforce broad nested ternary or if shapes", () =>
    Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            A.join(
              [
                "export const nestedTernary = (first: boolean, second: boolean): string =>",
                '  first ? (second ? "both" : "first") : "neither";',
                "",
                "export function nestedIf(first: boolean, second: boolean): string {",
                "  if (first) {",
                "    if (second) {",
                '      return "both";',
                "    }",
                "",
                '    return "first";',
                "  }",
                "",
                '  return "neither";',
                "}",
                "",
              ],
              "\n"
            )
          );

          const summary = yield* runTerseEffectRules(
            TerseEffectRulesOptions.make({
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
          expect(summary.nestedOptionMatchCandidatesDetected).toBe(0);
          expect(summary.nestedBoolMatchCandidatesDetected).toBe(0);
          expect(summary.dualOverloadCandidatesDetected).toBe(0);
          expect(summary.strictFailure).toBe(false);
          expect(summary.changedFiles).toEqual([]);
        })
      ).pipe(provideScopedLayer(testLayer))
    ));

  it("ignores clean Option object helpers and schema-boundary Option helpers", () =>
    Effect.runPromise(
      withTempWorkingDirectory(
        Effect.gen(function* () {
          yield* writeTsconfig;
          yield* writeProjectFile(
            "packages/demo/src/index.ts",
            A.join(
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
              ],
              "\n"
            )
          );

          const summary = yield* runTerseEffectRules(
            TerseEffectRulesOptions.make({
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
      ).pipe(provideScopedLayer(testLayer))
    ));
});
