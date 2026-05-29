import {
  FsUtilsLive,
  normalizedDeclarationSignature,
  ReuseCloneService,
  ReuseServiceSuiteLive,
  TSMorphServiceLive,
} from "@beep/repo-utils";
import { A } from "@beep/utils";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as O from "effect/Option";
import { Project } from "ts-morph";

const sigOf = (code: string, name: string): { readonly key: string; readonly size: number } => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile("fixture.ts", code);
  const declarations = sourceFile.getExportedDeclarations().get(name) ?? [];
  const [node] = declarations;
  return node === undefined ? { key: "", size: 0 } : normalizedDeclarationSignature(node);
};

const sumItems = `export function sumItems(items: ReadonlyArray<number>): number {
  let total = 0
  for (const item of items) {
    total = total + item * 2
  }
  return total
}`;
// Alpha-renamed identifiers and a changed literal: structurally identical to sumItems.
const sumValues = `export function sumValues(values: ReadonlyArray<number>): number {
  let acc = 0
  for (const value of values) {
    acc = acc + value * 9
  }
  return acc
}`;
const joinNames = `export function joinNames(names: ReadonlyArray<string>): string {
  return names.join(", ")
}`;
const tinyConst = `export const answer = 42`;

describe("normalizedDeclarationSignature", () => {
  it("collapses identical declarations to the same key", () => {
    // Two independent in-memory projects built from the same source must agree,
    // and the key must be non-empty (a broken signature returning "" would fail here).
    const first = sigOf(sumItems, "sumItems");
    const second = sigOf(sumItems, "sumItems");
    expect(first.key).toBe(second.key);
    expect(first.key).not.toBe("");
  });

  it("treats alpha-renamed and literal-changed copies as the same clone (Type-1/Type-2)", () => {
    expect(sigOf(sumValues, "sumValues").key).toBe(sigOf(sumItems, "sumItems").key);
  });

  it("gives structurally different declarations different keys", () => {
    expect(sigOf(joinNames, "joinNames").key).not.toBe(sigOf(sumItems, "sumItems").key);
  });

  it("counts tiny declarations below the clone-eligibility floor", () => {
    expect(sigOf(tinyConst, "answer").size).toBeLessThan(50);
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

describe("ReuseCloneService.detectClones", () => {
  it.effect(
    "detects a cross-package structural clone within a known-clone scope",
    Effect.fnUntraced(function* () {
      const cloneService = yield* ReuseCloneService;
      const candidates = yield* cloneService.detectClones(O.some("packages/drivers/runpod,packages/drivers/sanity"));

      expect(candidates.length).toBeGreaterThan(0);
      expect(A.every(candidates, (candidate) => candidate.kind === "structural-clone")).toBe(true);
      expect(A.some(candidates, (candidate) => candidate.sourceScopes.length >= 2)).toBe(true);
    }, provideScopedLayer(makeTestLayer())),
    180_000
  );
});
