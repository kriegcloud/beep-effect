import {
  FsUtilsLive,
  jaccardSimilarity,
  lshBandKeys,
  minhashSignature,
  normalizedDeclarationSignature,
  ReuseCloneService,
  ReuseServiceSuiteLive,
  TSMorphServiceLive,
  tokenShingles,
} from "@beep/repo-utils";
import { A } from "@beep/utils";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as O from "effect/Option";
import { Project } from "ts-morph";

const keyOf = (code: string, name: string): string => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile("fixture.ts", code);
  const declarations = sourceFile.getExportedDeclarations().get(name) ?? [];
  const [node] = declarations;
  return node === undefined ? "" : normalizedDeclarationSignature(node).key;
};

const shinglesOf = (code: string, name: string): ReadonlySet<string> =>
  tokenShingles({ tokens: keyOf(code, name).split(","), k: 3 });

const sumItems = `export function sumItems(items: ReadonlyArray<number>): number {
  let total = 0
  for (const item of items) {
    total = total + item * 2
  }
  return total
}`;
// Alpha-renamed identifiers + a changed literal: structurally identical to sumItems.
const sumValues = `export function sumValues(values: ReadonlyArray<number>): number {
  let acc = 0
  for (const value of values) {
    acc = acc + value * 9
  }
  return acc
}`;
// One extra statement: structurally similar to sumItems but NOT identical (near-miss).
const sumClamped = `export function sumClamped(values: ReadonlyArray<number>): number {
  let acc = 0
  for (const value of values) {
    acc = acc + value * 2
  }
  if (acc > 100) {
    acc = 100
  }
  return acc
}`;
const joinNames = `export function joinNames(names: ReadonlyArray<string>): string {
  return names.join(", ")
}`;

describe("TokenSimilarity primitives", () => {
  it("tokenShingles produces sliding k-grams as a set", () => {
    expect(tokenShingles({ tokens: ["I0", "K1", "L", "I1", "K2"], k: 3 }).size).toBe(3);
    expect(tokenShingles({ tokens: ["I0", "K1"], k: 3 }).size).toBe(1);
  });

  it("jaccardSimilarity is intersection over union, empty sets score 0", () => {
    expect(jaccardSimilarity({ self: new Set(["a", "b", "c"]), that: new Set(["a", "b", "d"]) })).toBe(0.5);
    expect(jaccardSimilarity({ self: new Set<string>(), that: new Set<string>() })).toBe(0);
  });

  it("minhashSignature is deterministic and estimates Jaccard within tolerance", () => {
    const left = shinglesOf(sumItems, "sumItems");
    const right = shinglesOf(sumClamped, "sumClamped");
    const signatureLeft = minhashSignature({ shingles: left, permutations: 128 });
    const signatureRight = minhashSignature({ shingles: right, permutations: 128 });

    // Determinism: same input -> identical signature.
    expect(minhashSignature({ shingles: left, permutations: 128 })).toEqual(signatureLeft);
    expect(signatureLeft.length).toBe(128);

    let equal = 0;
    for (let index = 0; index < signatureLeft.length; index += 1) {
      if (signatureLeft[index] === signatureRight[index]) {
        equal += 1;
      }
    }
    const estimate = equal / signatureLeft.length;
    const exact = jaccardSimilarity({ self: left, that: right });
    expect(Math.abs(estimate - exact)).toBeLessThan(0.2);
  });

  it("lshBandKeys yields one key per band and is deterministic", () => {
    const signature = minhashSignature({ shingles: shinglesOf(sumItems, "sumItems"), permutations: 128 });
    const keys = lshBandKeys({ signature, bands: 16 });
    expect(keys.length).toBe(16);
    expect(lshBandKeys({ signature, bands: 16 })).toEqual(keys);
  });
});

describe("near-miss similarity over normalized declarations", () => {
  it("scores alpha-renamed + literal-changed copies as identical (1.0)", () => {
    expect(
      jaccardSimilarity({ self: shinglesOf(sumItems, "sumItems"), that: shinglesOf(sumValues, "sumValues") })
    ).toBe(1);
  });

  it("scores a one-statement-different copy as a high but sub-1 near-miss", () => {
    const similarity = jaccardSimilarity({
      self: shinglesOf(sumItems, "sumItems"),
      that: shinglesOf(sumClamped, "sumClamped"),
    });
    expect(similarity).toBeGreaterThan(0.6);
    expect(similarity).toBeLessThan(1);
  });

  it("scores structurally unrelated declarations low", () => {
    expect(
      jaccardSimilarity({ self: shinglesOf(sumItems, "sumItems"), that: shinglesOf(joinNames, "joinNames") })
    ).toBeLessThan(0.3);
  });
});

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A2, E, R>(effect: Effect.Effect<A2, E, R>): Effect.Effect<A2, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const InfrastructureLayer = Layer.mergeAll(
  PlatformLayer,
  FsUtilsLive.pipe(Layer.provideMerge(PlatformLayer)),
  TSMorphServiceLive.pipe(Layer.provideMerge(PlatformLayer))
);
const makeTestLayer = () => ReuseServiceSuiteLive.pipe(Layer.provideMerge(InfrastructureLayer));

describe("ReuseCloneService.detectNearMissClones", () => {
  it.effect(
    "detects a cross-package near-miss within a known scope",
    Effect.fnUntraced(function* () {
      const cloneService = yield* ReuseCloneService;
      const candidates = yield* cloneService.detectNearMissClones(
        O.some("packages/drivers/duckdb,packages/drivers/ffmpeg")
      );

      expect(candidates.length).toBeGreaterThan(0);
      expect(A.every(candidates, (candidate) => candidate.kind === "near-miss-clone")).toBe(true);
      expect(A.some(candidates, (candidate) => candidate.sourceScopes.length >= 2)).toBe(true);
      // Near-misses sit at or above the default threshold and below an exact match.
      expect(A.every(candidates, (candidate) => candidate.confidence >= 0.8 && candidate.confidence <= 1)).toBe(true);
    }, provideScopedLayer(makeTestLayer())),
    180_000
  );
});
