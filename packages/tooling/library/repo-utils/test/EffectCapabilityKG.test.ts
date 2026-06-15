import { TSMorphServiceLive } from "@beep/repo-utils";
import {
  adviseEffectCapabilitySeedFixtures,
  buildEffectCapabilitySeedReport,
  defaultEffectCapabilitySeedFixtures,
} from "@beep/repo-utils/EffectCapabilityKG";
import { A } from "@beep/utils";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { expect, layer } from "@effect/vitest";
import { Context, Effect, Layer, Path, pipe } from "effect";
import * as O from "effect/Option";
import type { EffectCapabilitySeedReport } from "@beep/repo-utils/EffectCapabilityKG";

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const TestLayer = TSMorphServiceLive.pipe(Layer.provideMerge(PlatformLayer));
const pathApi = Effect.runSync(Effect.scoped(Layer.build(NodePath.layer).pipe(Effect.map(Context.get(Path.Path)))));
const REPO_ROOT = pathApi.resolve(__dirname, "..", "..", "..", "..", "..");
const TIMEOUT = 60_000;

const findModule = (report: EffectCapabilitySeedReport, name: string) =>
  A.findFirst(report.modules, (module) => module.moduleName === name);

layer(TestLayer, { timeout: TIMEOUT })("EffectCapabilityKG", (it) => {
  it.effect(
    "extracts seeded Effect v4 modules with source, JSDoc, graph, and catalog evidence",
    Effect.fn(function* () {
      const report = yield* buildEffectCapabilitySeedReport(REPO_ROOT);

      expect(report.seedModules).toEqual(["Combiner", "Reducer", "Filter"]);
      expect(
        pipe(
          report.modules,
          A.map((module) => module.moduleName)
        )
      ).toEqual([
        "Combiner",
        "Reducer",
        "Filter",
        "Option",
        "Struct",
        "Array",
        "Record",
        "Number",
        "String",
        "Boolean",
      ]);

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

      expect(report.catalogVisibility.length).toBeGreaterThan(0);
      expect(report.catalogVisibility.some((entry) => entry.packageName === "@beep/utils")).toBe(true);
    }),
    TIMEOUT
  );

  it.effect(
    "produces advisory suggestions and a no-match decline with deterministic citations",
    Effect.fn(function* () {
      const report = yield* buildEffectCapabilitySeedReport(REPO_ROOT);
      const findings = adviseEffectCapabilitySeedFixtures(report, defaultEffectCapabilitySeedFixtures);

      expect(findings).toHaveLength(4);
      expect(findings[0]?.decision).toBe("suggest");
      expect(findings[0]?.suggestedSymbols).toContain("symbol:Combiner.make");
      expect(findings[1]?.suggestedSymbols).toContain("symbol:Reducer.make");
      expect(findings[2]?.suggestedSymbols).toContain("symbol:Filter.make");
      expect(findings[3]?.decision).toBe("decline");
      expect(findings[3]?.suggestedSymbols).toHaveLength(0);

      for (const finding of findings) {
        expect(finding.evidence.length).toBeGreaterThan(0);
      }
      expect(findings[0]?.evidence.some((evidence) => evidence.sourcePath.includes("Combiner.ts"))).toBe(true);
    }),
    TIMEOUT
  );
});
