import {
  CorpusCatalogOptions,
  CorpusCommandServiceLive,
  CorpusExtractOptions,
  CorpusSalvageOptions,
  catalogCorpus,
  classifyRecycleBinName,
  extractCorpus,
  pairRecycleBinEntries,
  parseRecycleBinMetadata,
  RecycleBinScanEntry,
  verifySalvage,
} from "@beep/repo-cli/commands/Corpus";
import { provideScopedLayer } from "@beep/test-utils";
import { NodeChildProcessSpawner, NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as O from "effect/Option";

const testLayer = Layer.mergeAll(
  CorpusCommandServiceLive.pipe(
    Layer.provideMerge(NodeChildProcessSpawner.layer.pipe(Layer.provideMerge(NodeServices.layer)))
  ),
  NodeServices.layer
);

const provideTestLayer = provideScopedLayer(testLayer);

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
  it.effect("parses a v2 $I metadata record", () =>
    Effect.gen(function* () {
      const original = yield* parseRecycleBinMetadata(
        makeMetadataV2("H:\\Clients\\Acme\\Spec (final).docx", 54_805n, filetime2020)
      );

      expect(original.version).toBe("v2");
      expect(original.originalPath).toBe("H:\\Clients\\Acme\\Spec (final).docx");
      expect(original.originalName).toBe("Spec (final).docx");
      expect(original.originalSizeBytes).toBe(54_805);
      expect(original.deletedAtIso).toBe("2020-01-01T00:00:00.000Z");
      expect(original.deletedAtFiletime).toBe(filetime2020.toString());
    })
  );

  it.effect("parses a v1 $I metadata record with a fixed-width path", () =>
    Effect.gen(function* () {
      const original = yield* parseRecycleBinMetadata(makeMetadataV1("C:\\old\\draft.doc", 11n, filetime2020));

      expect(original.version).toBe("v1");
      expect(original.originalPath).toBe("C:\\old\\draft.doc");
      expect(original.originalName).toBe("draft.doc");
    })
  );

  it.effect("rejects records that are too short or have unknown versions", () =>
    Effect.gen(function* () {
      const shortResult = yield* parseRecycleBinMetadata(new Uint8Array(8)).pipe(Effect.flip);
      expect(shortResult.message).toContain("header bytes");

      const badVersion = makeMetadataV2("C:\\x.txt", 1n, filetime2020);
      new DataView(badVersion.buffer).setBigUint64(0, 9n, true);
      const versionResult = yield* parseRecycleBinMetadata(badVersion).pipe(Effect.flip);
      expect(versionResult.message).toContain("unsupported format version");
    })
  );

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
  it.effect("builds the catalog, duplicate report, and restoration manifest from a synthetic corpus", () =>
    Effect.gen(function* () {
      const digestA = "a".repeat(64);
      const digestB = "b".repeat(64);
      const digestMeta = "c".repeat(64);
      const digestContent = "d".repeat(64);
      const digestLoose = "e".repeat(64);

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

      expect(summary.sourceFiles).toBe(6);
      expect(summary.totalBytes).toBe(100 + 200 + 100 + 146 + 1_024 + 5_000);
      expect(summary.distinctDigests).toBe(5);
      expect(summary.duplicateSets).toBe(1);
      expect(summary.duplicateFiles).toBe(1);
      expect(summary.redundantBytes).toBe(100);
      expect(summary.matchedRestorations).toBe(1);
      expect(summary.unmatchedMetadataFiles).toBe(0);
      expect(summary.unmatchedContentFiles).toBe(1);

      expect(databaseExists).toBe(true);
      expect(duplicateText).toContain(`sha256:${digestA}`);
      expect(duplicateText).toContain("source-a/docs/a.txt | source-b/copy/a.txt");
      expect(summaryText).toContain('"sourceFiles":6');

      const restorationLines = restorationText.trim().split("\n");
      expect(restorationLines).toHaveLength(2);
      expect(restorationText).toContain("Spec v3.docx");
      expect(restorationText).toContain("unmatched-content");
    }).pipe(Effect.scoped, provideTestLayer)
  );
});

const stubPffexport = `#!/usr/bin/env bash
target=""
prev=""
for arg in "$@"; do
  if [ "$prev" = "-t" ]; then target="$arg"; fi
  prev="$arg"
done
source="\${@: -1}"
[ -f "$source" ] || exit 2
mkdir -p "$target.export/Top of Personal Folders/Inbox/Message00001/Attachments"
printf 'hello body' > "$target.export/Top of Personal Folders/Inbox/Message00001/Message.txt"
printf 'pdfbytes' > "$target.export/Top of Personal Folders/Inbox/Message00001/Attachments/report.pdf"
exit 0
`;

const stubJava = `#!/usr/bin/env bash
printf '%s' '[{"Content-Type":"text/plain","X-TIKA:content":"\\n  stub text body\\n"}]'
exit 0
`;

const writeStub = Effect.fn("CorpusTest.writeStub")(function* (script: string, stubPath: string) {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.writeFileString(stubPath, script);
  yield* fs.chmod(stubPath, 0o755);
});

describe("corpus extract and salvage", () => {
  it.effect("extracts a synthetic corpus through stub engines and verifies salvage", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const corpusRoot = yield* fs.makeTempDirectoryScoped({ prefix: "corpus-extract-test-" });
      const rawDir = path.join(corpusRoot, "raw", "source-a");
      yield* fs.makeDirectory(rawDir, { recursive: true });

      const pffexportStubPath = path.join(corpusRoot, "pffexport-stub");
      const javaStubPath = path.join(corpusRoot, "java-stub");
      yield* writeStub(stubPffexport, pffexportStubPath);
      yield* writeStub(stubJava, javaStubPath);

      const pstPath = path.join(rawDir, "mailbox.pst");
      const txtPath = path.join(rawDir, "note.txt");
      yield* fs.writeFileString(pstPath, "not a real pst");
      yield* fs.writeFileString(txtPath, "stub text body");

      const record = (relativePath: string, hash: string, sizeBytes: number, destPath: string): string =>
        JSON.stringify({
          destPath,
          mtimeEpoch: 1_700_000_000,
          mtimeIso: "2023-11-14T22:13:20Z",
          originPath: `/origin/source-a/${relativePath}`,
          relativePath,
          salvagedAt: "2026-06-11T15:00:00Z",
          sha256: hash,
          sizeBytes,
          sourceLabel: "source-a",
        });

      // Real digests so salvage verification passes: sha256("not a real pst") / sha256("stub text body")
      const pstDigest = "166df44db090f14dbb3ec7730fc17e78c170477163a6c913e5485d075c4b92d0";
      const txtDigest = "ed17e4908506d9bfe380ef2aa2b226c484600dc77ada8ee21a6b3380242228c1";

      const manifestLines = [
        record("mailbox.pst", pstDigest, 14, pstPath),
        record("note.txt", txtDigest, 14, txtPath),
        record("copy/note-copy.txt", txtDigest, 14, txtPath),
      ];
      yield* fs.writeFileString(path.join(corpusRoot, "raw", "provenance.jsonl"), `${manifestLines.join("\n")}\n`);

      const summary = yield* extractCorpus(
        CorpusExtractOptions.make({
          concurrency: 2,
          corpusRoot,
          exportChildren: true,
          includeDuplicates: false,
          javaPath: javaStubPath,
          overwrite: false,
          pffexportPath: pffexportStubPath,
          tikaJarPath: path.join(corpusRoot, "raw", "provenance.jsonl"),
        })
      );

      const outDir = path.join(corpusRoot, "staging", "extract");
      const sourcesText = yield* fs.readFileString(path.join(outDir, "sources.jsonl"));
      const runExists = yield* fs.exists(path.join(outDir, "run.json"));
      const pstArtifactId = `artifact:${pstDigest}`;
      const childrenText = yield* fs.readFileString(path.join(outDir, "children", pstArtifactId, "artifacts.jsonl"));

      const salvage = yield* verifySalvage(CorpusSalvageOptions.make({ corpusRoot }));

      expect(summary.sourceCount).toBe(2);
      expect(summary.duplicatesSkipped).toBe(1);
      expect(summary.succeededCount).toBe(2);
      expect(summary.failedCount).toBe(0);
      expect(summary.childArtifactCount).toBe(2);
      expect(summary.textArtifactCount).toBe(1);
      expect(runExists).toBe(true);
      expect(sourcesText).toContain('"status":"succeeded"');
      expect(childrenText).toContain("Attachments/report.pdf");
      expect(salvage.matched).toBe(3);
      expect(salvage.mismatched).toBe(0);
      expect(salvage.missing).toBe(0);
    }).pipe(Effect.scoped, provideTestLayer)
  );
});
