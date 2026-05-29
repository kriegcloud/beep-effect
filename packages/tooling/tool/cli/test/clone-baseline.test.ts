import { buildCloneDocument, diffCloneBaseline } from "@beep/repo-cli/commands/Reuse";
import { ReuseCandidate, ReuseSourceSymbolRef } from "@beep/repo-utils";
import { A } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";

const candidate = (id: string, occurrences: number): ReuseCandidate =>
  ReuseCandidate.make({
    candidateId: id,
    kind: "structural-clone",
    title: `clone ${id}`,
    sourceSymbols: A.makeBy(occurrences, (index) =>
      ReuseSourceSymbolRef.make({
        symbolId: `${id}#${index}`,
        filePath: `packages/p${index}/src/file.ts`,
        symbolName: `Symbol${index}`,
        symbolKind: "ClassDeclaration",
      })
    ),
    sourceScopes: A.makeBy(occurrences, (index) => `packages/p${index}`),
    recommendedAction: "Consolidate.",
    proposedDestinationPackage: "@beep/utils",
    proposedDestinationModule: "packages/foundation/modeling/utils/src",
    confidence: 0.8,
    evidence: ["evidence"],
    blockingConcerns: [],
    implementationSteps: ["step"],
    verificationCommands: ["bun run check"],
    catalogMatchIds: [],
  });

describe("clone baseline ratchet", () => {
  it("flags clusters absent from the baseline as new", () => {
    const live = buildCloneDocument([candidate("a", 2), candidate("b", 2)]);
    const baseline = buildCloneDocument([candidate("a", 2)]);
    const drift = diffCloneBaseline({ live, baseline: O.some(baseline) });

    expect(A.map(drift.newClusters, (entry) => entry.id)).toEqual(["b"]);
    expect(drift.grownClusters.length).toBe(0);
  });

  it("flags clusters that gained occurrences as grown", () => {
    const live = buildCloneDocument([candidate("a", 3)]);
    const baseline = buildCloneDocument([candidate("a", 2)]);
    const drift = diffCloneBaseline({ live, baseline: O.some(baseline) });

    expect(drift.newClusters.length).toBe(0);
    expect(A.map(drift.grownClusters, (grown) => grown.entry.id)).toEqual(["a"]);
  });

  it("reports no drift when live matches the baseline", () => {
    const entries = [candidate("a", 2), candidate("b", 3)];
    const drift = diffCloneBaseline({
      live: buildCloneDocument(entries),
      baseline: O.some(buildCloneDocument(entries)),
    });

    expect(drift.newClusters.length).toBe(0);
    expect(drift.grownClusters.length).toBe(0);
  });

  it("treats a missing baseline as all-new", () => {
    const drift = diffCloneBaseline({ live: buildCloneDocument([candidate("a", 2)]), baseline: O.none() });

    expect(A.map(drift.newClusters, (entry) => entry.id)).toEqual(["a"]);
  });
});
