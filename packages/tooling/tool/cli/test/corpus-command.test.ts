import {
  CorpusCatalogOptions,
  CorpusCommandServiceLive,
  catalogCorpus,
  classifyRecycleBinName,
  pairRecycleBinEntries,
  parseRecycleBinMetadata,
  RecycleBinScanEntry,
} from "@beep/repo-cli/commands/Corpus";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as O from "effect/Option";
import { describe, expect, it } from "vitest";

const testLayer = Layer.mergeAll(CorpusCommandServiceLive.pipe(Layer.provideMerge(NodeServices.layer)));

const runTest = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> => Effect.runPromise(effect);

const filetime2020 = 132_223_104_000_000_000n;

const setUint64 = (view: DataView, offset: number, value: bigint): void => {
  view.setBigUint64(offset, value, true);
};

const writeUtf16 = (view: DataView, offset: number, text: string): void => {
  Array.from(text).forEach((char, index) => {
    view.setUint16(offset + index * 2, char.charCodeAt(0), true);
  });
};

const makeMetadataV2 = (originalPath: string, sizeBytes: bigint, filetime: bigint): Uint8Array => {
  const bytes = new Uint8Array(28 + (originalPath.length + 1) * 2);
  const view = new DataView(bytes.buffer);
  setUint64(view, 0, 2n);
  setUint64(view, 8, sizeBytes);
  setUint64(view, 16, filetime);
  view.setUint32(24, originalPath.length + 1, true);
  writeUtf16(view, 28, originalPath);
  return bytes;
};

const makeMetadataV1 = (originalPath: string, sizeBytes: bigint, filetime: bigint): Uint8Array => {
  const bytes = new Uint8Array(24 + 520);
  const view = new DataView(bytes.buffer);
  setUint64(view, 0, 1n);
  setUint64(view, 8, sizeBytes);
  setUint64(view, 16, filetime);
  writeUtf16(view, 24, originalPath);
  return bytes;
};

describe("Corpus recycle-bin parsing", () => {
  it("parses a v2 $I metadata record", async () => {
    const original = await runTest(
      parseRecycleBinMetadata(makeMetadataV2("H:\\Clients\\Acme\\Spec (final).docx", 54_805n, filetime2020))
    );

    expect(original.version).toBe("v2");
    expect(original.originalPath).toBe("H:\\Clients\\Acme\\Spec (final).docx");
    expect(original.originalName).toBe("Spec (final).docx");
    expect(original.originalSizeBytes).toBe(54_805);
    expect(original.deletedAtIso).toBe("2020-01-01T00:00:00.000Z");
    expect(original.deletedAtFiletime).toBe(filetime2020.toString());
  });

  it("parses a v1 $I metadata record with a fixed-width path", async () => {
    const original = await runTest(parseRecycleBinMetadata(makeMetadataV1("C:\\old\\draft.doc", 11n, filetime2020)));

    expect(original.version).toBe("v1");
    expect(original.originalPath).toBe("C:\\old\\draft.doc");
    expect(original.originalName).toBe("draft.doc");
  });

  it("rejects records that are too short or have unknown versions", async () => {
    const shortResult = await runTest(parseRecycleBinMetadata(new Uint8Array(8)).pipe(Effect.flip));
    expect(shortResult.message).toContain("header bytes");

    const badVersion = makeMetadataV2("C:\\x.txt", 1n, filetime2020);
    new DataView(badVersion.buffer).setBigUint64(0, 9n, true);
    const versionResult = await runTest(parseRecycleBinMetadata(badVersion).pipe(Effect.flip));
    expect(versionResult.message).toContain("unsupported format version");
  });

  it("classifies $I and $R names and ignores everything else", () => {
    expect(O.map(classifyRecycleBinName("$I0CB4M9.docx"), (entry) => `${entry.kind}:${entry.pairKey}`)).toStrictEqual(
      O.some("metadata:0CB4M9.docx")
    );
    expect(O.map(classifyRecycleBinName("$R0CB4M9.docx"), (entry) => `${entry.kind}:${entry.pairKey}`)).toStrictEqual(
      O.some("content:0CB4M9.docx")
    );
    expect(O.isNone(classifyRecycleBinName("README.md"))).toBe(true);
    expect(O.isNone(classifyRecycleBinName("$Xnope.txt"))).toBe(true);
  });

  it("pairs metadata with content and reports leftovers", () => {
    const pairing = pairRecycleBinEntries([
      RecycleBinScanEntry.make({ kind: "metadata", pairKey: "A1.docx", relativePath: "$IA1.docx" }),
      RecycleBinScanEntry.make({ kind: "content", pairKey: "A1.docx", relativePath: "$RA1.docx" }),
      RecycleBinScanEntry.make({ kind: "metadata", pairKey: "B2.pdf", relativePath: "$IB2.pdf" }),
      RecycleBinScanEntry.make({ kind: "content", pairKey: "C3.txt", relativePath: "$RC3.txt" }),
    ]);

    expect(pairing.matched.map((pair) => pair.pairKey)).toStrictEqual(["A1.docx"]);
    expect(pairing.unmatchedMetadata.map((entry) => entry.relativePath)).toStrictEqual(["$IB2.pdf"]);
    expect(pairing.unmatchedContent.map((entry) => entry.relativePath)).toStrictEqual(["$RC3.txt"]);
  });
});

describe("corpus catalog", () => {
  it("builds the catalog, duplicate report, and restoration manifest from a synthetic corpus", async () => {
    const digestA = "a".repeat(64);
    const digestB = "b".repeat(64);
    const digestMeta = "c".repeat(64);
    const digestContent = "d".repeat(64);
    const digestLoose = "e".repeat(64);

    const program = Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const corpusRoot = yield* fs.makeTempDirectoryScoped({ prefix: "corpus-catalog-test-" });
      const rawDir = path.join(corpusRoot, "raw");
      const sourceADir = path.join(rawDir, "source-a");
      yield* fs.makeDirectory(sourceADir, { recursive: true });

      const metadataDest = path.join(sourceADir, "$IAB12CD.docx");
      yield* fs.writeFile(metadataDest, makeMetadataV2("H:\\Clients\\Acme\\Spec v3.docx", 1_024n, filetime2020));

      const record = (
        sourceLabel: string,
        relativePath: string,
        sha256: string,
        sizeBytes: number,
        destPath: string
      ): string =>
        JSON.stringify({
          destPath,
          mtimeEpoch: 1_700_000_000,
          mtimeIso: "2023-11-14T22:13:20Z",
          originPath: `/origin/${sourceLabel}/${relativePath}`,
          relativePath,
          salvagedAt: "2026-06-11T15:00:00Z",
          sha256,
          sizeBytes,
          sourceLabel,
        });

      const manifestLines = [
        record("source-a", "docs/a.txt", digestA, 100, path.join(sourceADir, "docs/a.txt")),
        record("source-a", "docs/b.txt", digestB, 200, path.join(sourceADir, "docs/b.txt")),
        record("source-b", "copy/a.txt", digestA, 100, path.join(rawDir, "source-b/copy/a.txt")),
        record("source-a", "$IAB12CD.docx", digestMeta, 146, metadataDest),
        record("source-a", "$RAB12CD.docx", digestContent, 1_024, path.join(sourceADir, "$RAB12CD.docx")),
        record("source-a", "$RZZ99XX.pdf", digestLoose, 5_000, path.join(sourceADir, "$RZZ99XX.pdf")),
      ];
      yield* fs.writeFileString(path.join(rawDir, "provenance.jsonl"), `${manifestLines.join("\n")}\n`);

      const summary = yield* catalogCorpus(CorpusCatalogOptions.make({ corpusRoot }));

      const restorationText = yield* fs.readFileString(path.join(corpusRoot, "catalog", "restoration-manifest.jsonl"));
      const duplicateText = yield* fs.readFileString(
        path.join(corpusRoot, "catalog", "reports", "duplicate-sets.json")
      );
      const summaryText = yield* fs.readFileString(path.join(corpusRoot, "catalog", "reports", "catalog-summary.json"));
      const databaseExists = yield* fs.exists(path.join(corpusRoot, "catalog", "corpus.duckdb"));

      return { databaseExists, duplicateText, restorationText, summary, summaryText };
    });

    const result = await runTest(Effect.scoped(program).pipe(Effect.provide(testLayer)));

    expect(result.summary.sourceFiles).toBe(6);
    expect(result.summary.totalBytes).toBe(100 + 200 + 100 + 146 + 1_024 + 5_000);
    expect(result.summary.distinctDigests).toBe(5);
    expect(result.summary.duplicateSets).toBe(1);
    expect(result.summary.duplicateFiles).toBe(1);
    expect(result.summary.redundantBytes).toBe(100);
    expect(result.summary.matchedRestorations).toBe(1);
    expect(result.summary.unmatchedMetadataFiles).toBe(0);
    expect(result.summary.unmatchedContentFiles).toBe(1);

    expect(result.databaseExists).toBe(true);
    expect(result.duplicateText).toContain(`sha256:${digestA}`);
    expect(result.duplicateText).toContain("source-a/docs/a.txt | source-b/copy/a.txt");
    expect(result.summaryText).toContain('"sourceFiles":6');

    const restorationLines = result.restorationText.trim().split("\n");
    expect(restorationLines).toHaveLength(2);
    expect(result.restorationText).toContain("Spec v3.docx");
    expect(result.restorationText).toContain("unmatched-content");
  });
});
