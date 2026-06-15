import {
  adviseEffectCapabilitySeedFixtures,
  buildEffectCapabilitySeedReport,
  defaultEffectCapabilitySeedFixtures,
  EffectCapabilitySeedFixture,
} from "@beep/repo-utils/EffectCapabilityKG";
import { A, Str } from "@beep/utils";
import { expect, layer } from "@effect/vitest";
import { Effect, FileSystem, Path, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { REPO_ROOT, TestLayer } from "./TSMorph.test-support.js";
import type {
  EffectCapabilityAdvisoryScenario,
  EffectCapabilitySeedModuleName,
  EffectCapabilitySeedReport,
} from "@beep/repo-utils/EffectCapabilityKG";

const TIMEOUT = 60_000;
const EXPECTED_SEED_MODULE_NAMES: ReadonlyArray<EffectCapabilitySeedModuleName> = ["Combiner", "Reducer", "Filter"];
const EXPECTED_ADJACENT_MODULE_NAMES: ReadonlyArray<EffectCapabilitySeedModuleName> = [
  "Option",
  "Struct",
  "Array",
  "Record",
  "Number",
  "String",
  "Boolean",
];
const EXPECTED_MODULE_NAMES = [...EXPECTED_SEED_MODULE_NAMES, ...EXPECTED_ADJACENT_MODULE_NAMES];
const EXPECTED_ADVISORY_FINDINGS = 4;
const EXPECTED_SEED_SYMBOL_COUNTS = {
  Combiner: 9,
  Reducer: 3,
  Filter: 29,
} satisfies Record<"Combiner" | "Reducer" | "Filter", number>;
const EXPECTED_SEED_LOCAL_EDGES = 329;
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

type EffectCapabilitySeedFinding = ReturnType<typeof adviseEffectCapabilitySeedFixtures>[number];
type SeedErrorCapture = {
  readonly _tag: "EffectCapabilitySeedError" | "UnexpectedSuccess";
  readonly message: string;
  readonly sourcePath: O.Option<string>;
};

const findModule = (report: EffectCapabilitySeedReport, name: string) =>
  A.findFirst(report.modules, (module) => module.moduleName === name);
const findFindingByScenario = (
  findings: ReadonlyArray<EffectCapabilitySeedFinding>,
  scenario: EffectCapabilityAdvisoryScenario
) => A.findFirst(findings, (finding) => finding.scenario === scenario);
const isCombinerGraphNode = (nodeId: string): boolean =>
  nodeId === "module:Combiner" || Str.startsWith("symbol:Combiner.")(nodeId);
const isSeedGraphNode = (nodeId: string): boolean =>
  A.some(EXPECTED_SEED_MODULE_NAMES, (moduleName) => nodeId === `module:${moduleName}`) ||
  A.some(EXPECTED_SEED_MODULE_NAMES, (moduleName) => Str.startsWith(`symbol:${moduleName}.`)(nodeId));
const writeSeedRepoFile = Effect.fn("EffectCapabilityKGTest.writeSeedRepoFile")(function* (
  repoRootPath: string,
  relativePath: string,
  content: string
) {
  const fs = yield* FileSystem.FileSystem;
  const pathApi = yield* Path.Path;
  const absolutePath = pathApi.join(repoRootPath, relativePath);

  yield* fs.makeDirectory(pathApi.dirname(absolutePath), { recursive: true });
  yield* fs.writeFileString(absolutePath, content);
});
const writeMinimalEffectCorpus = Effect.fn("EffectCapabilityKGTest.writeMinimalEffectCorpus")(function* (
  repoRootPath: string
) {
  yield* writeSeedRepoFile(
    repoRootPath,
    ".repos/effect-v4/packages/effect/tsconfig.json",
    `${encodeJson({
      compilerOptions: {
        module: "ESNext",
        moduleResolution: "Bundler",
        strict: true,
        target: "ES2022",
      },
      include: ["src/**/*.ts"],
    })}\n`
  );

  for (const moduleName of EXPECTED_MODULE_NAMES) {
    yield* writeSeedRepoFile(
      repoRootPath,
      `.repos/effect-v4/packages/effect/src/${moduleName}.ts`,
      `/** Minimal ${moduleName} seed fixture. */\nexport const ${moduleName}Seed = "${moduleName}"\n`
    );
  }
});
const captureSeedError = (repoRootPath: string) =>
  buildEffectCapabilitySeedReport(repoRootPath).pipe(
    Effect.map(
      (): SeedErrorCapture => ({
        _tag: "UnexpectedSuccess",
        message: "Expected EffectCapabilitySeedError.",
        sourcePath: O.none<string>(),
      })
    ),
    Effect.catchTag("EffectCapabilitySeedError", (error) =>
      Effect.succeed({
        _tag: error._tag,
        message: error.message,
        sourcePath: error.sourcePath,
      })
    )
  );
const expectCapturedSeedError = (result: SeedErrorCapture, expectedSourcePath: string): void => {
  expect(result._tag).toBe("EffectCapabilitySeedError");
  expect(O.isSome(result.sourcePath)).toBe(true);
  if (O.isSome(result.sourcePath)) {
    expect(result.sourcePath.value).toBe(expectedSourcePath);
  }
};

layer(TestLayer, { timeout: TIMEOUT })("EffectCapabilityKG", (it) => {
  it.effect(
    "extracts seeded Effect v4 modules with source, JSDoc, graph, and catalog evidence",
    Effect.fn(function* () {
      const report = yield* buildEffectCapabilitySeedReport(REPO_ROOT);

      expect(report.seedModules).toEqual(EXPECTED_SEED_MODULE_NAMES);
      expect(report.adjacentModules).toEqual(EXPECTED_ADJACENT_MODULE_NAMES);
      expect(report.modules).toHaveLength(EXPECTED_MODULE_NAMES.length);
      expect(report.advisoryFindings).toHaveLength(EXPECTED_ADVISORY_FINDINGS);

      const extractedSymbolCount = pipe(
        report.modules,
        A.reduce(0, (total, module) => total + module.symbols.length)
      );
      const definesEdges = A.filter(report.edges, (edge) => edge.relation === "defines");
      const seedLocalEdges = A.filter(report.edges, (edge) => isSeedGraphNode(edge.from) || isSeedGraphNode(edge.to));
      const seedSymbolCounts = Object.fromEntries(
        pipe(
          report.modules,
          A.filter((module) => A.contains(EXPECTED_SEED_MODULE_NAMES, module.moduleName)),
          A.map((module) => [module.moduleName, module.symbols.length] as const)
        )
      );
      expect(definesEdges).toHaveLength(extractedSymbolCount);
      expect(seedSymbolCounts).toEqual(EXPECTED_SEED_SYMBOL_COUNTS);
      expect(seedLocalEdges).toHaveLength(EXPECTED_SEED_LOCAL_EDGES);
      expect(report.edges.length).toBeGreaterThan(extractedSymbolCount);

      const moduleNames = pipe(
        report.modules,
        A.map((module) => module.moduleName)
      );
      expect(moduleNames).toEqual(expect.arrayContaining([...EXPECTED_SEED_MODULE_NAMES]));
      expect(moduleNames).toEqual(expect.arrayContaining([...EXPECTED_ADJACENT_MODULE_NAMES]));
      expect(A.take(moduleNames, 3)).toEqual(EXPECTED_SEED_MODULE_NAMES);

      const combiner = findModule(report, "Combiner");
      const reducer = findModule(report, "Reducer");
      const filter = findModule(report, "Filter");
      expect(O.isSome(combiner)).toBe(true);
      expect(O.isSome(reducer)).toBe(true);
      expect(O.isSome(filter)).toBe(true);

      if (O.isSome(combiner)) {
        const make = A.findFirst(combiner.value.symbols, (symbol) => symbol.name === "make");
        expect(O.isSome(make)).toBe(true);
        if (O.isSome(make)) {
          expect(make.value.sourceSpan.sourcePath).toBe(".repos/effect-v4/packages/effect/src/Combiner.ts");
          expect(make.value.signatureSummary).toContain("export function make");
          expect(
            pipe(
              make.value.category,
              A.map((tag) => tag.text)
            )
          ).toContain("constructors");
          expect(
            pipe(
              make.value.since,
              A.map((tag) => tag.text)
            )
          ).toContain("4.0.0");
          expect(
            pipe(
              make.value.docSections,
              A.map((section) => section.title)
            )
          ).toContain("When to use");
          expect(make.value.examples.length).toBeGreaterThan(0);
          expect(make.value.seeAlso.length).toBeGreaterThan(0);
          expect(
            report.edges.some(
              (edge) =>
                edge.from === "module:Combiner" && edge.to === "symbol:Combiner.make" && edge.relation === "defines"
            )
          ).toBe(true);
        }
      }

      if (O.isSome(reducer)) {
        const reducerInterface = A.findFirst(reducer.value.symbols, (symbol) => symbol.name === "Reducer");
        expect(O.isSome(reducerInterface)).toBe(true);
        if (O.isSome(reducerInterface)) {
          expect(
            pipe(
              reducerInterface.value.category,
              A.map((tag) => tag.text)
            )
          ).toContain("models");
          expect(
            pipe(
              reducerInterface.value.since,
              A.map((tag) => tag.text)
            )
          ).toContain("4.0.0");
          expect(
            pipe(
              reducerInterface.value.seeAlso,
              A.map((see) => see.target)
            )
          ).toContain("Combiner.Combiner");
        }
      }

      if (O.isSome(filter)) {
        const make = A.findFirst(filter.value.symbols, (symbol) => symbol.name === "make");
        expect(O.isSome(make)).toBe(true);
        if (O.isSome(make)) {
          expect(
            pipe(
              make.value.category,
              A.map((tag) => tag.text)
            )
          ).toContain("constructors");
          expect(make.value.examples.length).toBeGreaterThan(0);
        }
      }

      for (const moduleName of ["Option", "Struct", "Array", "Record", "Number", "String", "Boolean"]) {
        expect(
          report.edges.some(
            (edge) =>
              edge.to === `module:${moduleName}` &&
              (edge.relation === "imports" || edge.relation === "composesWith" || edge.relation === "catalogVisibleAs")
          )
        ).toBe(true);
      }
      expect(
        report.edges.some(
          (edge) => edge.from === "module:Reducer" && edge.to === "module:Combiner" && edge.relation === "imports"
        )
      ).toBe(true);

      expect(report.catalogVisibility.length).toBeGreaterThan(0);
      expect(report.catalogVisibility.some((entry) => entry.packageName === "@beep/utils")).toBe(true);
      expect(report.catalogVisibility.some((entry) => entry.packageName === "@beep/schema")).toBe(true);
      expect(
        report.catalogVisibility.some(
          (entry) => entry.moduleName === "String" && entry.importSpecifier === "@beep/utils/Str"
        )
      ).toBe(true);
    }),
    TIMEOUT
  );

  it.effect(
    "produces advisory suggestions and a no-match decline with deterministic citations",
    Effect.fn(function* () {
      const report = yield* buildEffectCapabilitySeedReport(REPO_ROOT);
      const findings = adviseEffectCapabilitySeedFixtures(report, defaultEffectCapabilitySeedFixtures);
      const mergeFinding = findFindingByScenario(findings, "merge-combine");
      const foldFinding = findFindingByScenario(findings, "fold-aggregate");
      const validationFinding = findFindingByScenario(findings, "validation-transformation");
      const declineFinding = findFindingByScenario(findings, "decline-no-match");

      expect(findings).toHaveLength(4);
      expect(O.isSome(mergeFinding)).toBe(true);
      expect(O.isSome(foldFinding)).toBe(true);
      expect(O.isSome(validationFinding)).toBe(true);
      expect(O.isSome(declineFinding)).toBe(true);
      if (O.isSome(mergeFinding)) {
        expect(mergeFinding.value.decision).toBe("suggest");
        expect(mergeFinding.value.suggestedSymbols).toContain("symbol:Combiner.make");
        expect(A.some(mergeFinding.value.evidence, (evidence) => evidence.sourcePath.includes("Combiner.ts"))).toBe(
          true
        );
      }
      if (O.isSome(foldFinding)) {
        expect(foldFinding.value.suggestedSymbols).toContain("symbol:Reducer.make");
      }
      if (O.isSome(validationFinding)) {
        expect(validationFinding.value.suggestedSymbols).toContain("symbol:Filter.make");
      }
      if (O.isSome(declineFinding)) {
        expect(declineFinding.value.decision).toBe("decline");
        expect(declineFinding.value.suggestedSymbols).toHaveLength(0);
      }
      expect(A.every(findings, (finding) => finding.evidence.length > 0)).toBe(true);
    }),
    TIMEOUT
  );

  it.effect(
    "reclassifies advisory fixture text before selecting suggested symbols",
    Effect.fn(function* () {
      const report = yield* buildEffectCapabilitySeedReport(REPO_ROOT);
      const findings = adviseEffectCapabilitySeedFixtures(report, [
        EffectCapabilitySeedFixture.make({
          id: "declared-merge-but-folds",
          scenario: "merge-combine",
          text: "Fold all collection values into an initial aggregate result.",
        }),
      ]);
      const finding = findings[0]!;

      expect(findings).toHaveLength(1);
      expect(finding.scenario).toBe("fold-aggregate");
      expect(finding.suggestedSymbols).toContain("symbol:Reducer.make");
    }),
    TIMEOUT
  );

  it.effect(
    "declines classified suggestions when no deterministic symbols can be cited",
    Effect.fn(function* () {
      const report = yield* buildEffectCapabilitySeedReport(REPO_ROOT);
      const findings = adviseEffectCapabilitySeedFixtures(
        {
          ...report,
          modules: A.filter(report.modules, (module) => module.moduleName !== "Combiner"),
          edges: A.filter(report.edges, (edge) => !isCombinerGraphNode(edge.from) && !isCombinerGraphNode(edge.to)),
          catalogVisibility: A.filter(report.catalogVisibility, (entry) => entry.moduleName !== "Combiner"),
        },
        [
          EffectCapabilitySeedFixture.make({
            id: "merge-without-combiner",
            scenario: "merge-combine",
            text: "Merge and combine configuration values with an explicit strategy.",
          }),
        ]
      );
      const finding = findings[0]!;

      expect(findings).toHaveLength(1);
      expect(finding.scenario).toBe("merge-combine");
      expect(finding.decision).toBe("decline");
      expect(finding.suggestedSymbols).toHaveLength(0);
      expect(finding.evidence).toHaveLength(1);
    }),
    TIMEOUT
  );

  it.effect(
    "returns a typed seed error when the Effect v4 corpus is missing",
    Effect.fn(function* () {
      const fs = yield* FileSystem.FileSystem;
      const tmpDir = yield* fs.makeTempDirectory();

      const result = yield* captureSeedError(tmpDir);

      expectCapturedSeedError(result, ".repos/effect-v4/packages/effect/tsconfig.json");
      expect(result.message).toContain(".repos/effect-v4/packages/effect/tsconfig.json");

      yield* fs.remove(tmpDir, { recursive: true, force: true });
    }),
    TIMEOUT
  );

  it.effect(
    "returns a typed seed error when the repo export catalog is missing",
    Effect.fn(function* () {
      const fs = yield* FileSystem.FileSystem;
      const tmpDir = yield* fs.makeTempDirectory();

      yield* writeMinimalEffectCorpus(tmpDir);
      const result = yield* captureSeedError(tmpDir);

      expectCapturedSeedError(result, "standards/repo-exports.catalog.jsonc");
      expect(result.message).toContain('Failed to read "standards/repo-exports.catalog.jsonc"');

      yield* fs.remove(tmpDir, { recursive: true, force: true });
    }),
    TIMEOUT
  );

  it.effect(
    "returns a typed seed error when the repo export catalog JSON is malformed",
    Effect.fn(function* () {
      const fs = yield* FileSystem.FileSystem;
      const tmpDir = yield* fs.makeTempDirectory();

      yield* writeMinimalEffectCorpus(tmpDir);
      yield* writeSeedRepoFile(tmpDir, "standards/repo-exports.catalog.jsonc", "{ not valid json");
      const result = yield* captureSeedError(tmpDir);

      expectCapturedSeedError(result, "standards/repo-exports.catalog.jsonc");
      expect(result.message).toContain('Failed to parse "standards/repo-exports.catalog.jsonc"');

      yield* fs.remove(tmpDir, { recursive: true, force: true });
    }),
    TIMEOUT
  );
});
