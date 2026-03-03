import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  TSMorphService,
  TSMorphServiceLive,
  TsMorphCheckDriftRequest,
  TsMorphDeterministicJSDocRequest,
  TsMorphEffectDecompositionRequest,
  TsMorphExplainFunctionRequest,
  TsMorphGraphExtractionRequest,
  TsMorphJSDocTagInput,
  TsMorphJSDocWriteOperation,
  TsMorphPlanJSDocWritesRequest,
  TsMorphProjectScopeRequest,
  TsMorphSearchSymbolsRequest,
  TsMorphSymbolSelector,
  TsMorphTraverseDependenciesRequest,
  TsMorphValidateJSDocRequest,
} from "@beep/repo-utils";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Effect, HashSet, Layer } from "effect";
import * as O from "effect/Option";
import { describe, expect, it } from "vitest";

const fixtureTemplateRoot = join(__dirname, "fixtures", "tsmorph-service");
const TestLayer = TSMorphServiceLive.pipe(Layer.provideMerge(NodeFileSystem.layer), Layer.provideMerge(NodePath.layer));

const createFixture = async (): Promise<{ root: string; tsconfig: string }> => {
  const root = await mkdtemp(join(tmpdir(), "tsmorph-service-"));
  await cp(fixtureTemplateRoot, root, { recursive: true });
  return {
    root,
    tsconfig: join(root, "tsconfig.json"),
  };
};

const runWithService = <A>(effect: Effect.Effect<A, unknown, TSMorphService>): Promise<A> =>
  Effect.runPromise(effect.pipe(Effect.provide(TestLayer)));

const scopeRequest = (tsconfig: string, changedFiles?: ReadonlyArray<string>): TsMorphProjectScopeRequest =>
  new TsMorphProjectScopeRequest({
    rootTsConfigPath: tsconfig,
    changedFiles: changedFiles === undefined ? O.none() : O.some(changedFiles),
    idMode: O.none(),
  });

const findSymbol = async (tsconfig: string, query: string): Promise<string> =>
  runWithService(
    Effect.gen(function* () {
      const service = yield* TSMorphService;
      const matches = yield* service.searchSymbols(
        new TsMorphSearchSymbolsRequest({
          scope: scopeRequest(tsconfig),
          query,
          kind: O.none(),
          limit: O.none(),
        })
      );

      const found = matches.find((entry) => entry.label.includes(query));
      expect(found).toBeDefined();
      return found?.symbolId ?? "";
    })
  );

describe("TSMorphService", () => {
  it("resolves scoped projects with changed-file narrowing", async () => {
    const fixture = await createFixture();

    const full = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.resolveProjectScope(scopeRequest(fixture.tsconfig));
      })
    );

    const narrowed = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.resolveProjectScope(scopeRequest(fixture.tsconfig, ["packages/lib-b/src/derived.ts"]));
      })
    );

    expect(narrowed.selectedTsConfigPaths.length).toBeLessThan(full.selectedTsConfigPaths.length);
    expect(narrowed.selectedTsConfigPaths.some((value) => value.endsWith("packages/lib-b/tsconfig.json"))).toBe(true);
    expect(narrowed.selectedTsConfigPaths.some((value) => value.endsWith("packages/lib-a/tsconfig.json"))).toBe(true);
    expect(
      narrowed.selectedTsConfigPaths.some((value) => value.endsWith("/tsconfig.json") && !value.includes("packages/"))
    ).toBe(false);
  });

  it("extracts all 19 node kinds and 26 edge kinds", async () => {
    const fixture = await createFixture();

    const graph = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.extractCodebaseGraph(
          new TsMorphGraphExtractionRequest({
            scope: scopeRequest(fixture.tsconfig),
            includeTests: O.some(true),
          })
        );
      })
    );

    const nodeKinds = HashSet.fromIterable(graph.nodes.map((node) => node.kind));
    const edgeKinds = HashSet.fromIterable(graph.edges.map((edge) => edge.kind));

    expect(HashSet.size(nodeKinds)).toBe(19);
    expect(HashSet.size(edgeKinds)).toBe(26);
  });

  it("derives deterministic tags from AST", async () => {
    const fixture = await createFixture();
    const symbolId = await findSymbol(fixture.tsconfig, "compute");

    const tags = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.deriveDeterministicJSDoc(
          new TsMorphDeterministicJSDocRequest({
            scope: scopeRequest(fixture.tsconfig),
            symbol: new TsMorphSymbolSelector({
              symbolId,
              filePath: O.none(),
              symbolName: O.none(),
            }),
          })
        );
      })
    );

    const tagNames = tags.map((entry) => entry.tag);
    expect(tagNames).toContain("@param");
    expect(tagNames).toContain("@returns");
    expect(tagNames).toContain("@throws");
    expect(tagNames).toContain("@requires");
  });

  it("decomposes Effect<A,E,R> into throws/requires channels", async () => {
    const fixture = await createFixture();
    const symbolId = await findSymbol(fixture.tsconfig, "compute");

    const channels = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.decomposeEffectChannels(
          new TsMorphEffectDecompositionRequest({
            scope: scopeRequest(fixture.tsconfig),
            symbol: new TsMorphSymbolSelector({
              symbolId,
              filePath: O.none(),
              symbolName: O.none(),
            }),
          })
        );
      })
    );

    expect(channels.isEffectReturn).toBe(true);
    expect(channels.errors).toContain("DomainError");
    expect(channels.errors).toContain("ValidationError");
    expect(channels.requirements).toContain("Repo");
    expect(channels.requirements).toContain("Logger");
  });

  it("returns stable deterministic outputs for search/traverse/explain", async () => {
    const fixture = await createFixture();

    const searchA = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.searchSymbols(
          new TsMorphSearchSymbolsRequest({
            scope: scopeRequest(fixture.tsconfig),
            query: "DerivedService",
            kind: O.none(),
            limit: O.none(),
          })
        );
      })
    );

    const searchB = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.searchSymbols(
          new TsMorphSearchSymbolsRequest({
            scope: scopeRequest(fixture.tsconfig),
            query: "DerivedService",
            kind: O.none(),
            limit: O.none(),
          })
        );
      })
    );

    expect(searchA).toEqual(searchB);

    const symbolId = searchA[0]?.symbolId ?? "";

    const traversedA = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.traverseDependencies(
          new TsMorphTraverseDependenciesRequest({
            scope: scopeRequest(fixture.tsconfig),
            symbolId,
            direction: "downstream",
            maxHops: O.none(),
          })
        );
      })
    );

    const traversedB = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.traverseDependencies(
          new TsMorphTraverseDependenciesRequest({
            scope: scopeRequest(fixture.tsconfig),
            symbolId,
            direction: "downstream",
            maxHops: O.none(),
          })
        );
      })
    );

    expect(traversedA.nodes).toEqual(traversedB.nodes);
    expect(traversedA.edges).toEqual(traversedB.edges);

    const explainedA = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.explainFunction(
          new TsMorphExplainFunctionRequest({
            scope: scopeRequest(fixture.tsconfig),
            symbolId,
          })
        );
      })
    );

    const explainedB = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.explainFunction(
          new TsMorphExplainFunctionRequest({
            scope: scopeRequest(fixture.tsconfig),
            symbolId,
          })
        );
      })
    );

    expect(explainedA.signature).toEqual(explainedB.signature);
    expect(explainedA.deterministicTags).toEqual(explainedB.deterministicTags);
    expect(explainedA.context.nodes).toEqual(explainedB.context.nodes);
    expect(explainedA.context.edges).toEqual(explainedB.context.edges);
  });

  it("validates JSDoc payloads for valid and invalid inputs", async () => {
    const fixture = await createFixture();
    const symbolId = await findSymbol(fixture.tsconfig, "helper");

    const valid = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.validateJSDoc(
          new TsMorphValidateJSDocRequest({
            scope: scopeRequest(fixture.tsconfig),
            symbol: new TsMorphSymbolSelector({
              symbolId,
              filePath: O.none(),
              symbolName: O.none(),
            }),
            tags: [
              new TsMorphJSDocTagInput({ tag: "@param", value: O.some("value string"), confidence: O.none() }),
              new TsMorphJSDocTagInput({ tag: "@returns", value: O.some("number"), confidence: O.none() }),
            ],
          })
        );
      })
    );

    expect(valid.valid).toBe(true);

    const invalid = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.validateJSDoc(
          new TsMorphValidateJSDocRequest({
            scope: scopeRequest(fixture.tsconfig),
            symbol: new TsMorphSymbolSelector({
              symbolId,
              filePath: O.none(),
              symbolName: O.none(),
            }),
            tags: [new TsMorphJSDocTagInput({ tag: "returns", value: O.none(), confidence: O.none() })],
          })
        );
      })
    );

    expect(invalid.valid).toBe(false);
    expect(invalid.issues.map((issue) => issue.code)).toContain("invalid_tag_format");
  });

  it("plans deterministic writes and records conflicts", async () => {
    const fixture = await createFixture();
    const symbolId = await findSymbol(fixture.tsconfig, "helper");

    const plan = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.planJSDocWrites(
          new TsMorphPlanJSDocWritesRequest({
            scope: scopeRequest(fixture.tsconfig),
            operations: [
              new TsMorphJSDocWriteOperation({
                symbolId,
                filePath: "packages/lib-b/src/helper.ts",
                tags: [new TsMorphJSDocTagInput({ tag: "@returns", value: O.some("number"), confidence: O.some(0.4) })],
              }),
              new TsMorphJSDocWriteOperation({
                symbolId,
                filePath: "packages/lib-b/src/helper.ts",
                tags: [
                  new TsMorphJSDocTagInput({ tag: "@returns", value: O.some("integer"), confidence: O.some(0.9) }),
                ],
              }),
            ],
          })
        );
      })
    );

    expect(plan.operations.length).toBe(1);
    expect(plan.conflicts.length).toBeGreaterThan(0);
    const keptTag = plan.operations[0]?.tags.find((entry) => entry.tag === "@returns");
    expect(keptTag?.value).toEqual(O.some("integer"));
  });

  it("applies write plans and returns receipt metadata", async () => {
    const fixture = await createFixture();
    const symbolId = await findSymbol(fixture.tsconfig, "helper");

    const plan = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.planJSDocWrites(
          new TsMorphPlanJSDocWritesRequest({
            scope: scopeRequest(fixture.tsconfig),
            operations: [
              new TsMorphJSDocWriteOperation({
                symbolId,
                filePath: "packages/lib-b/src/helper.ts",
                tags: [new TsMorphJSDocTagInput({ tag: "@returns", value: O.some("number"), confidence: O.some(0.9) })],
              }),
            ],
          })
        );
      })
    );

    const receipt = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.applyJSDocWrites(plan);
      })
    );

    expect(receipt.appliedOperations).toBe(1);
    expect(receipt.touchedFiles).toContain("packages/lib-b/src/helper.ts");

    const helperSource = await readFile(join(fixture.root, "packages/lib-b/src/helper.ts"), "utf8");
    expect(helperSource.includes("@signatureHash")).toBe(true);
  });

  it("detects drift only when signatures change", async () => {
    const fixture = await createFixture();
    const symbolId = await findSymbol(fixture.tsconfig, "helper");

    const plan = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.planJSDocWrites(
          new TsMorphPlanJSDocWritesRequest({
            scope: scopeRequest(fixture.tsconfig),
            operations: [
              new TsMorphJSDocWriteOperation({
                symbolId,
                filePath: "packages/lib-b/src/helper.ts",
                tags: [new TsMorphJSDocTagInput({ tag: "@returns", value: O.some("number"), confidence: O.some(1) })],
              }),
            ],
          })
        );
      })
    );

    await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.applyJSDocWrites(plan);
      })
    );

    const baseline = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.checkJSDocDrift(
          new TsMorphCheckDriftRequest({
            scope: scopeRequest(fixture.tsconfig),
            symbolIds: O.some([symbolId]),
            driftScope: O.none(),
          })
        );
      })
    );

    expect(baseline.entries[0]?.driftDetected).toBe(false);

    const helperPath = join(fixture.root, "packages/lib-b/src/helper.ts");
    const source = await readFile(helperPath, "utf8");
    const updated = source.replace(
      "helper = (value: string): number",
      'helper = (value: string, mode = "len"): number'
    );
    await writeFile(helperPath, updated, "utf8");

    const drifted = await runWithService(
      Effect.gen(function* () {
        const service = yield* TSMorphService;
        return yield* service.checkJSDocDrift(
          new TsMorphCheckDriftRequest({
            scope: scopeRequest(fixture.tsconfig),
            symbolIds: O.some([symbolId]),
            driftScope: O.none(),
          })
        );
      })
    );

    expect(drifted.entries[0]?.driftDetected).toBe(true);
  });
}, 20_000);
