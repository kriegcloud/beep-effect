import { InkCoverage, PdfRect, PdfTools, TextBlock } from "@beep/pdf-tools";
import {
  applyDispositions,
  buildDrawingJudgePack,
  buildFindings,
  DeliverRequest,
  Disposition,
  DispositionEntry,
  DrawingReview,
  DrawingsCommandError,
  drawingsCommand,
  isAllSheetsNote,
  MarkupNote,
  matchSheet,
  parseFigureOverride,
  ReviewDispositions,
  ReviewedPage,
  ReviewFinding,
  ReviewFindingId,
  ReviewIngestRequest,
  ReviewInventory,
  ReviewOpenRequest,
  ReviewPageRef,
  ReviewPlanRequest,
  ReviewRound,
  ReviewRoundLocation,
  reviewerRequestsSection,
  SheetCandidate,
  SheetMatch,
  statementGuard,
  textLayerNotes,
} from "@beep/repo-cli/commands/Drawings";
import { Sha256Hex } from "@beep/schema";
import { it } from "@beep/test-runner";
import { NodeServices } from "@effect/platform-node";
import { describe, expect } from "@effect/vitest";
import { assertFailure, assertInstanceOf, assertSome, assertTrue } from "@effect/vitest/utils";
import * as A from "effect/Array";
import { Command } from "effect/cli";
import * as Effect from "effect/Effect";
import * as Hex from "effect/encoding/Hex";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import { ChildProcess, ChildProcessSpawner } from "effect/process";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as TestConsole from "effect/testing/TestConsole";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { PDFPage } from "pdf-lib";

// Every fixture here is synthetic: three text-free sheets drawn with pdf-lib
// and reviewer pages that copy a sheet and type notes over it, the way a
// flattened reviewer export comes back.

const hashA = Sha256Hex.make("a".repeat(64));
const hashB = Sha256Hex.make("b".repeat(64));
const rect = (yMin: number, xMin = 72) => PdfRect.make({ xMin, yMin, xMax: xMin + 100, yMax: yMin + 12 });
const coverage = (covered: number, base: number, marked: number) =>
  InkCoverage.make({
    baseInkPixels: base,
    coveredPixels: covered,
    markedInkPixels: marked,
    coverage: base === 0 ? 0 : covered / base,
  });
const candidate = (figure: number, covered: number, base: number, marked = 1000) =>
  SheetCandidate.make({ figure, page: figure, coverage: coverage(covered, base, marked) });
const source = (file: string, page = 1) => ReviewPageRef.make({ file, page });
const note = (text: string, file: string, yMin = 80) =>
  MarkupNote.make({ text, rect: rect(yMin), origin: "text-layer", source: source(file) });
const pageOf = (file: string, figure: number, notes: ReadonlyArray<MarkupNote>) =>
  ReviewedPage.make({
    file,
    pdfSha256: hashB,
    page: 1,
    match: SheetMatch.make({ sheetSetSha256: hashA, figure, page: figure, coverage: 1, basis: "ink-coverage" }),
    notes,
  });
const findingsOf = (pages: ReadonlyArray<ReviewedPage>) =>
  Result.getOrElse(buildFindings({ round: 1, pages }), () => []);
const nth = <T>(items: ReadonlyArray<T>, index: number): T => O.getOrThrow(A.get(items, index));
const entry = (id: string, disposition: Disposition, severity: "P0" | "P1" | "P2" = "P1") =>
  DispositionEntry.make({ id: ReviewFindingId.make(id), severity, lens: "sheet-compliance", disposition });
const declined = Disposition.cases.decline.make({ kind: "decline", reason: "Already drawn that way." });
const specChange = Disposition.cases["spec-change"].make({
  kind: "spec-change",
  pointer: "/sheet/margins",
  summary: "Raise the top margin.",
});

const sharedPages = [
  pageOf("Fig1.pdf", 1, [note("Make the box taller", "Fig1.pdf"), note("Margins: 1 in (all sheets)", "Fig1.pdf", 700)]),
  pageOf("Fig2.pdf", 2, [note("Margins:  1 in (ALL SHEETS)", "Fig2.pdf", 700), note("Flip the oval", "Fig2.pdf", 90)]),
];

describe("drawing review rules", () => {
  it("matches the unique winner and records the sheet-set hash", () => {
    const result = matchSheet({
      sheetSetSha256: hashA,
      candidates: [candidate(1, 900, 900), candidate(2, 300, 1000)],
      override: O.none(),
    });
    assertSome(
      O.map(Result.getSuccess(result), (match) => [match.figure, match.page, match.coverage, match.basis]),
      [1, 1, 1, "ink-coverage"]
    );
  });

  it("refuses a sparse sheet that a denser sheet's page also covers", () => {
    // FIG. 3 is one stroke that also sits on FIG. 1: both reach full coverage,
    // and the covered-ink count picks FIG. 1.
    const sparse = matchSheet({
      sheetSetSha256: hashA,
      candidates: [candidate(3, 60, 60), candidate(1, 900, 900)],
      override: O.none(),
    });
    assertSome(
      O.map(Result.getSuccess(sparse), (match) => match.figure),
      1
    );
    const tied = matchSheet({
      sheetSetSha256: hashA,
      candidates: [candidate(1, 900, 900), candidate(2, 880, 890)],
      override: O.none(),
    });
    assertSome(
      Result.getFailure(tied),
      "FIG. 1 and FIG. 2 both reach 0.98 coverage with nearly the same ink (900 and 880 pixels)"
    );
  });

  it("refuses a page no sheet explains, and a page that only contains a sparse sheet", () => {
    const none = matchSheet({ sheetSetSha256: hashA, candidates: [candidate(1, 500, 900)], override: O.none() });
    assertSome(Result.getFailure(none), "no sheet reaches 0.98 ink coverage (best is FIG. 1 at 0.556)");
    const empty = matchSheet({ sheetSetSha256: hashA, candidates: [], override: O.none() });
    assertSome(Result.getFailure(empty), "no sheet reaches 0.98 ink coverage (the sent set has no sheets)");
    const foreign = matchSheet({
      sheetSetSha256: hashA,
      candidates: [candidate(3, 60, 60, 4000), candidate(1, 100, 900, 4000)],
      override: O.none(),
    });
    expect(O.getOrElse(Result.getFailure(foreign), () => "")).toContain("accounts for only 0.015 of the page's ink");
  });

  it("takes an operator override and refuses one naming a sheet that was not sent", () => {
    const forced = matchSheet({
      sheetSetSha256: hashA,
      candidates: [candidate(3, 60, 60, 4000)],
      override: O.some(3),
    });
    assertSome(
      O.map(Result.getSuccess(forced), (match) => match.basis),
      "operator"
    );
    const missing = matchSheet({ sheetSetSha256: hashA, candidates: [candidate(3, 60, 60)], override: O.some(9) });
    assertSome(Result.getFailure(missing), "FIG. 9 is not a sheet of the sent set");
  });

  it("parses --figure values", () => {
    assertSome(
      O.map(Result.getSuccess(parseFigureOverride("Fig 3.pdf:2=4")), (o) => [o.file, o.page, o.figure]),
      ["Fig 3.pdf", 2, 4]
    );
    assertSome(
      O.map(Result.getSuccess(parseFigureOverride("Fig1.pdf=1")), (o) => o.page),
      1
    );
    assertFailure(
      parseFigureOverride("Fig1.pdf"),
      '"Fig1.pdf" is not <file>[:<page>]=<FIG.> with a FIG. and page of at least 1'
    );
    assertFailure(
      parseFigureOverride("Fig1.pdf=0"),
      '"Fig1.pdf=0" is not <file>[:<page>]=<FIG.> with a FIG. and page of at least 1'
    );
  });

  it("keeps only the text a reviewer added, verbatim, top to bottom", () => {
    const notes = textLayerNotes({
      pageBlocks: [
        TextBlock.make({ text: "Second  note\nwith two lines", rect: rect(300) }),
        TextBlock.make({ text: "FIG. 1", rect: rect(50) }),
        TextBlock.make({ text: "First note", rect: rect(100) }),
        TextBlock.make({ text: "  ", rect: rect(10) }),
      ],
      baseBlocks: [TextBlock.make({ text: "fig.  1", rect: rect(50) })],
      source: source("Fig1.pdf"),
    });
    expect(notes.map((n) => n.text)).toEqual(["First note", "Second  note\nwith two lines"]);
    expect(notes.map((n) => [n.rect.yMin, n.origin])).toEqual([
      [100, "text-layer"],
      [300, "text-layer"],
    ]);
  });

  it("merges every (all sheets) note into one all-sheets finding and numbers the rest", () => {
    expect(isAllSheetsNote("Sheet numbers (all sheets)")).toBe(true);
    expect(isAllSheetsNote("all sheets")).toBe(false);
    const findings = findingsOf(sharedPages);
    expect(findings.map((f) => [f.id, f.scope, O.getOrNull(f.figure), f.notes.length, f.severity, f.status])).toEqual([
      ["A1-01", "sheet", 1, 1, "P1", "open"],
      ["A1-02", "all-sheets", null, 2, "P1", "open"],
      ["A1-03", "sheet", 2, 1, "P1", "open"],
    ]);
    // the merged finding keeps each page's text exactly as written
    expect(findings[1]?.notes.map((n) => [n.text, n.source.file])).toEqual([
      ["Margins: 1 in (all sheets)", "Fig1.pdf"],
      ["Margins:  1 in (ALL SHEETS)", "Fig2.pdf"],
    ]);
  });

  it("refuses more findings than two-digit ids can number", () => {
    const notes = Array.from({ length: 100 }, (_, i) => note(`note ${i}`, "Fig1.pdf", i));
    assertFailure(
      buildFindings({ round: 1, pages: [pageOf("Fig1.pdf", 1, notes)] }),
      "100 findings exceed the 99 a round can number"
    );
  });

  it("blocks a plan with a missing, unknown, or repeated disposition and applies a complete one", () => {
    const findings = findingsOf(sharedPages);
    const partial = applyDispositions({
      findings,
      entries: [entry("A1-01", declined), entry("A1-01", declined), entry("A1-09", declined)],
    });
    const reason = O.getOrElse(Result.getFailure(partial), () => "");
    expect(reason).toContain("A1-02 has no disposition");
    expect(reason).toContain("A1-03 has no disposition");
    expect(reason).toContain("A1-09 is not a finding of this round");
    expect(reason).toContain("A1-01 is disposed of more than once");
    const clarify = Disposition.cases.clarify.make({ kind: "clarify", question: "Dashed or hidden?" });
    const planned = Result.getOrElse(
      applyDispositions({
        findings,
        entries: [entry("A1-01", specChange), entry("A1-02", clarify, "P2"), entry("A1-03", declined)],
      }),
      () => []
    );
    expect(planned.map((f) => [f.status, f.severity, O.getOrNull(f.lens)])).toEqual([
      ["planned", "P1", "sheet-compliance"],
      ["clarify", "P2", "sheet-compliance"],
      ["declined", "P1", "sheet-compliance"],
    ]);
  });

  it("refuses the statement on the reviewed set and warns for other sets and un-ingested rounds", () => {
    const round = (n: number, hash: Sha256Hex) =>
      ReviewRound.make({
        schemaVersion: "drawing-review-round/v1",
        round: n,
        status: "ingested",
        reviewedSheetSetSha256: hash,
      });
    const findings = findingsOf(sharedPages);
    const guard = statementGuard({
      sheetSetSha256: hashA,
      rounds: [
        { round: round(1, hashA), findings: O.some(findings) },
        { round: round(2, hashB), findings: O.some(findings) },
        { round: round(3, hashA), findings: O.none() },
        { round: round(4, hashB), findings: O.some([]) },
      ],
    });
    expect(guard.refusals).toEqual([
      "review round 1 has 3 open required finding(s) on this sheet set: A1-01, A1-02, A1-03",
    ]);
    expect(guard.warnings).toEqual([
      "review round 2 on earlier sheet set bbbbbbbbbbbb still has 3 open required finding(s): A1-01, A1-02, A1-03",
      "review round 3 over this sheet set has not been ingested yet",
    ]);
  });

  it("renders the reviewer-requests table verbatim with dispositions", () => {
    const findings = findingsOf([
      pageOf("Fig1.pdf", 1, [note("Use | pipes\nand lines", "Fig1.pdf"), note("Gap (all sheets)", "Fig1.pdf", 500)]),
      pageOf("Fig2.pdf", 2, [note("Gap (all sheets)", "Fig2.pdf", 500), note("Rotate", "Fig2.pdf", 80)]),
    ]);
    const first = nth(findings, 0);
    const reverses = Disposition.cases.decision.make({
      kind: "decision",
      decisionRow: "D12",
      reverses: O.some("D8"),
    });
    const code = Disposition.cases["code-change"].make({ kind: "code-change", pr: "PR-F", summary: "Draw the tab." });
    const table = reviewerRequestsSection({
      round: 1,
      sheetSetSha256: hashA,
      findings: [
        ReviewFinding.make({ ...first, status: "planned", disposition: O.some(code) }),
        ReviewFinding.make({ ...nth(findings, 1), status: "planned", disposition: O.some(reverses) }),
        nth(findings, 2),
      ],
    });
    expect(table).toContain("### Reviewer requests (review round 1, on sheet set aaaaaaaaaaaa)");
    expect(table).toContain("| A1-01 | 1 | Use \\| pipes<br>and lines | code change in PR-F: Draw the tab. |");
    expect(table).toContain("| A1-02 | all | Gap (all sheets) | decision D12 (reverses D8) |");
    expect(table).toContain("| A1-03 | 2 | Rotate | not planned yet |");
    const others = reviewerRequestsSection({
      round: 2,
      sheetSetSha256: hashA,
      findings: [
        ReviewFinding.make({ ...first, status: "planned", disposition: O.some(specChange) }),
        ReviewFinding.make({
          ...first,
          status: "clarify",
          disposition: O.some(Disposition.cases.clarify.make({ kind: "clarify", question: "Which point?" })),
        }),
        ReviewFinding.make({ ...first, status: "declined", disposition: O.some(declined) }),
      ],
    });
    expect(others).toContain("spec change at /sheet/margins: Raise the top margin.");
    expect(others).toContain("asked the attorney: Which point?");
    expect(others).toContain("declined: Already drawn that way.");
  });

  it("rejects a finding whose scope and figure disagree", () => {
    const decode = S.decodeUnknownResult(ReviewFinding);
    const base = {
      id: "A1-01",
      severity: "P1",
      scope: "all-sheets",
      figure: 2,
      notes: [S.encodeSync(MarkupNote)(note("x", "Fig1.pdf"))],
      status: "open",
    };
    assertTrue(Result.isFailure(decode(base)));
    assertTrue(Result.isFailure(decode({ ...base, scope: "sheet", status: "planned" })));
    assertTrue(Result.isSuccess(decode({ ...base, scope: "sheet" })));
  });
});

// ---------------------------------------------------------------------------
// Service and command coverage over a synthetic corpus root.
// ---------------------------------------------------------------------------

const toJson = S.encodeUnknownEffect(S.fromJsonString(S.Unknown));
const sha256 = (bytes: Uint8Array) =>
  Effect.promise(() => crypto.subtle.digest("SHA-256", bytes.slice().buffer)).pipe(
    Effect.map((digest) => Hex.encode(new Uint8Array(digest)))
  );

const black = rgb(0, 0, 0);
// A short stroke shared by FIG. 1 and the sparse FIG. 3.
const stroke = (page: PDFPage) =>
  page.drawLine({ start: { x: 200, y: 250 }, end: { x: 320, y: 250 }, thickness: 3, color: black });
const SHEETS: ReadonlyArray<(page: PDFPage) => void> = [
  (page) => {
    page.drawRectangle({ x: 150, y: 300, width: 300, height: 200, borderColor: black, borderWidth: 3 });
    page.drawLine({ start: { x: 150, y: 300 }, end: { x: 450, y: 500 }, thickness: 3, color: black });
    stroke(page);
  },
  (page) => {
    page.drawEllipse({ x: 306, y: 420, xScale: 150, yScale: 100, borderColor: black, borderWidth: 3 });
    page.drawRectangle({ x: 100, y: 100, width: 80, height: 80, borderColor: black, borderWidth: 3 });
  },
  stroke,
];

// The sent set, with `blankPages` extra empty pages to make a different set.
const sheetSetPdf = (blankPages = 0) =>
  Effect.gen(function* () {
    const doc = yield* Effect.promise(() => PDFDocument.create());
    A.forEach(SHEETS, (draw) => draw(doc.addPage([612, 792])));
    if (blankPages > 0) {
      A.forEach(
        A.makeBy(blankPages, () => 0),
        () => doc.addPage([612, 792])
      );
    }
    return yield* Effect.promise(() => doc.save());
  });

// A reviewer page: the drawing (or a foreign one) with typed notes on top.
const reviewerPdf = (draw: (page: PDFPage) => void, notes: ReadonlyArray<readonly [string, number, number]>) =>
  Effect.gen(function* () {
    const doc = yield* Effect.promise(() => PDFDocument.create());
    const font = yield* Effect.promise(() => doc.embedFont(StandardFonts.Helvetica));
    const page = doc.addPage([612, 792]);
    draw(page);
    A.forEach(notes, ([text, x, y]) => page.drawText(text, { x, y, font, size: 11 }));
    return yield* Effect.promise(() => doc.save());
  });

const foreignDrawing = (page: PDFPage) => {
  stroke(page);
  for (let i = 0; i < 12; i += 1) {
    page.drawLine({ start: { x: 100, y: 560 + i * 12 }, end: { x: 520, y: 560 + i * 12 }, thickness: 5, color: black });
  }
};

const manifestJson = (pdfSha256: string) =>
  toJson({
    title: "Synthetic bracket",
    specSha256: "0".repeat(64),
    engine: { name: "synthetic", version: "0", binarySha256: "" },
    model: { boundingBox: { min: [0, 0, 0], max: [1, 1, 1] }, volume: 1, faceCount: 6, edgeCount: 12 },
    scale: 1,
    shaded: false,
    figures: [1, 2, 3].map((figure) => ({
      figure,
      view: "front",
      description: `FIG. ${figure} is a synthetic sheet.`,
      svgFile: `fig-${figure}.svg`,
      svgSha256: "",
      visibleSegments: 1,
    })),
    omissions: [],
    pdfFile: "sheets.pdf",
    pdfSha256,
    validation: null,
  });

// <root>/matter/work/<set>/{sheets.pdf,manifest.json} and <root>/matter/inputs/*.pdf
const makeCorpus = Effect.fnUntraced(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const root = yield* fs.makeTempDirectoryScoped();
  const matter = path.join(root, "matter");
  const writeSet = Effect.fnUntraced(function* (name: string, bytes: Uint8Array) {
    const dir = path.join(matter, "work", name);
    yield* fs.makeDirectory(dir, { recursive: true });
    yield* fs.writeFile(path.join(dir, "sheets.pdf"), bytes);
    const hash = yield* sha256(bytes);
    yield* fs.writeFileString(path.join(dir, "manifest.json"), yield* manifestJson(hash));
    return { manifest: path.join(dir, "manifest.json"), hash: Sha256Hex.make(hash), dir };
  });
  const sent = yield* writeSet("sent", yield* sheetSetPdf());
  // a different set: same sheets plus a blank fourth page, so a different hash
  const other = yield* writeSet("other", yield* sheetSetPdf(1));
  const inputs = path.join(matter, "inputs");
  yield* fs.makeDirectory(inputs, { recursive: true });
  const location = ReviewRoundLocation.make({ corpusRoot: root, matter: "matter", round: 1 });
  return { root, matter, inputs, sent, other, location };
});

const writeReviewerFiles = Effect.fnUntraced(function* (inputs: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const [draw1, draw2] = SHEETS;
  const files = [
    [
      "Fig1.pdf",
      draw1,
      [
        ["Make the box taller", 72, 700],
        ["Margins: 1 inch top (all sheets)", 72, 50],
      ],
    ],
    [
      "Fig2.pdf",
      draw2,
      [
        ["Margins: 1 inch top (all sheets)", 72, 50],
        ["Flip the oval", 380, 720],
      ],
    ],
    ["Foreign.pdf", foreignDrawing, [["Not one of ours", 72, 720]]],
  ] as const;
  return yield* Effect.forEach(files, ([name, draw, notes]) =>
    Effect.gen(function* () {
      const file = path.join(inputs, name);
      yield* fs.writeFile(file, yield* reviewerPdf(draw ?? stroke, notes));
      return file;
    })
  );
});

const writeJsonFile = <A, I>(schema: S.Codec<A, I>, file: string, value: A) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    yield* fs.writeFileString(file, yield* S.encodeEffect(S.fromJsonString(schema))(value));
  });

// An ingested round without running poppler: round.json plus a synthetic inventory.
const seedIngested = Effect.fnUntraced(function* (options: { readonly roundDir: string; readonly round: ReviewRound }) {
  const path = yield* Path.Path;
  const findings = findingsOf(sharedPages);
  yield* writeJsonFile(
    ReviewInventory,
    path.join(options.roundDir, "inventory.json"),
    ReviewInventory.make({
      schemaVersion: "drawing-review-inventory/v1",
      round: options.round.round,
      reviewedSheetSetSha256: options.round.reviewedSheetSetSha256,
      findings,
    })
  );
  yield* writeJsonFile(
    ReviewRound,
    path.join(options.roundDir, "round.json"),
    ReviewRound.make({ ...options.round, status: "ingested" })
  );
  return findings;
});

const toolPresent = (command: string) =>
  Effect.scoped(
    Effect.gen(function* () {
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
      const handle = yield* spawner.spawn(
        ChildProcess.make(command, ["-v"], { stdin: "ignore", stderr: "ignore", stdout: "ignore" })
      );
      return (yield* handle.exitCode) === 0;
    })
  ).pipe(
    Effect.catchTag("PlatformError", (error) =>
      error.reason._tag === "NotFound" ? Effect.succeed(false) : Effect.fail(error)
    )
  );

const skipWithoutPoppler = (context: { readonly skip: (note?: string) => void }) =>
  Effect.gen(function* () {
    for (const tool of ["pdftoppm", "pdftotext"]) {
      if (!(yield* toolPresent(tool))) {
        context.skip(`Missing native prerequisite: ${tool} on PATH`);
        return true;
      }
    }
    return false;
  });

const runDrawings = Command.runWith(drawingsCommand, { version: "0.0.0" });
const logged = TestConsole.logLines.pipe(Effect.map((lines) => lines.join("\n")));

const TestLayer = Layer.mergeAll(
  DrawingReview.layer.pipe(Layer.provide(PdfTools.makeLayer())),
  PdfTools.makeLayer(),
  TestConsole.layer
).pipe(Layer.provideMerge(NodeServices.layer));

describe("beep drawings review", () => {
  it.layer(TestLayer, { timeout: "180 seconds" })((it) => {
    it.effect("ingests flattened markup: notes with rects, an all-sheets merge, and unique-winner matches", (context) =>
      Effect.gen(function* () {
        if (yield* skipWithoutPoppler(context)) return;
        const fs = yield* FileSystem.FileSystem;
        const review = yield* DrawingReview;
        const corpus = yield* makeCorpus();
        const [fig1, fig2, foreign] = yield* writeReviewerFiles(corpus.inputs);
        const opened = yield* review.open(
          ReviewOpenRequest.make({
            location: corpus.location,
            manifestPath: corpus.sent.manifest,
            deliveryPath: O.none(),
          })
        );
        expect(opened.round.reviewedSheetSetSha256).toBe(corpus.sent.hash);
        const again = yield* Effect.flip(
          review.open(
            ReviewOpenRequest.make({
              location: corpus.location,
              manifestPath: corpus.sent.manifest,
              deliveryPath: O.none(),
            })
          )
        );
        expect(again.message).toContain("is already open");

        const status = yield* review.ingest(
          ReviewIngestRequest.make({
            location: corpus.location,
            manifestPath: corpus.sent.manifest,
            pdfPaths: [fig1 ?? "", fig2 ?? ""],
            figureOverrides: [],
          })
        );
        expect(status.round.status).toBe("ingested");
        const intake = O.getOrThrow(status.intake);
        // FIG. 1's page also covers the sparse FIG. 3 fully; the denser sheet wins
        expect(intake.pages.map((p) => [p.file, p.match.figure, p.match.basis])).toEqual([
          ["Fig1.pdf", 1, "ink-coverage"],
          ["Fig2.pdf", 2, "ink-coverage"],
        ]);
        expect(intake.pages.every((p) => p.match.coverage >= 0.98)).toBe(true);
        const findings = O.getOrThrow(status.inventory).findings;
        expect(findings.map((f) => [f.id, f.scope, O.getOrNull(f.figure), f.notes.map((n) => n.text)])).toEqual([
          ["A1-01", "sheet", 1, ["Make the box taller"]],
          ["A1-02", "all-sheets", null, ["Margins: 1 inch top (all sheets)", "Margins: 1 inch top (all sheets)"]],
          ["A1-03", "sheet", 2, ["Flip the oval"]],
        ]);
        // rects in the top-left frame: the first note's baseline sits 92 pt below the top edge
        const first = findings[0]?.notes[0];
        expect(first?.rect.xMin).toBeCloseTo(72, 0);
        expect(first?.rect.yMax).toBeGreaterThan(84);
        expect(first?.rect.yMax).toBeLessThan(100);
        expect(first?.origin).toBe("text-layer");
        expect(yield* fs.exists(`${status.roundDir}/intake.json`)).toBe(true);

        // the foreign page contains FIG. 3's stroke but is refused, then accepted by --figure
        const refused = yield* Effect.flip(
          review.ingest(
            ReviewIngestRequest.make({
              location: corpus.location,
              manifestPath: corpus.sent.manifest,
              pdfPaths: [foreign ?? ""],
              figureOverrides: [],
            })
          )
        );
        expect(refused.message).toContain("Foreign.pdf page 1: FIG. 3 reaches 1.000 coverage but accounts for only");
        expect(refused.message).toContain("--figure Foreign.pdf:1=<FIG.>");
        const forced = yield* review.ingest(
          ReviewIngestRequest.make({
            location: corpus.location,
            manifestPath: corpus.sent.manifest,
            pdfPaths: [foreign ?? ""],
            figureOverrides: [O.getOrThrow(Result.getSuccess(parseFigureOverride("Foreign.pdf=3")))],
          })
        );
        assertSome(
          O.map(forced.intake, (i) => i.pages.map((p) => [p.match.figure, p.match.basis])),
          [[3, "operator"]]
        );
        const stray = yield* Effect.flip(
          review.ingest(
            ReviewIngestRequest.make({
              location: corpus.location,
              manifestPath: corpus.sent.manifest,
              pdfPaths: [fig1 ?? ""],
              figureOverrides: [O.getOrThrow(Result.getSuccess(parseFigureOverride("Fig9.pdf=3")))],
            })
          )
        );
        expect(stray.message).toContain("--figure names a file that is not ingested: Fig9.pdf");
      })
    );

    it.effect("refuses a mismatched sent set, a file outside the corpus root, and a matter outside it", (context) =>
      Effect.gen(function* () {
        if (yield* skipWithoutPoppler(context)) return;
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const review = yield* DrawingReview;
        const corpus = yield* makeCorpus();
        const [fig1] = yield* writeReviewerFiles(corpus.inputs);
        yield* review.open(
          ReviewOpenRequest.make({
            location: corpus.location,
            manifestPath: corpus.sent.manifest,
            deliveryPath: O.none(),
          })
        );
        const mismatch = yield* Effect.flip(
          review.ingest(
            ReviewIngestRequest.make({
              location: corpus.location,
              manifestPath: corpus.other.manifest,
              pdfPaths: [fig1 ?? ""],
              figureOverrides: [],
            })
          )
        );
        assertInstanceOf(mismatch, DrawingsCommandError);
        expect(mismatch.message).toContain(`is not the set review round 1 reviewed (${corpus.sent.hash})`);

        const outside = yield* fs.makeTempDirectoryScoped();
        const stray = path.join(outside, "Fig1.pdf");
        yield* fs.copyFile(fig1 ?? "", stray);
        const escaped = yield* Effect.flip(
          review.ingest(
            ReviewIngestRequest.make({
              location: corpus.location,
              manifestPath: corpus.sent.manifest,
              pdfPaths: [stray],
              figureOverrides: [],
            })
          )
        );
        expect(escaped.message).toContain("is not under the corpus root");

        const elsewhere = yield* Effect.flip(
          review.status(ReviewRoundLocation.make({ corpusRoot: corpus.root, matter: outside, round: 1 }))
        );
        expect(elsewhere.message).toContain("is not under the corpus root");
      })
    );

    it.effect("builds a judge pack with the reviewer-requests table", (context) =>
      Effect.gen(function* () {
        if (yield* skipWithoutPoppler(context)) return;
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const review = yield* DrawingReview;
        const corpus = yield* makeCorpus();
        const opened = yield* review.open(
          ReviewOpenRequest.make({
            location: corpus.location,
            manifestPath: corpus.sent.manifest,
            deliveryPath: O.none(),
          })
        );
        const roundFile = path.join(opened.roundDir, "round.json");
        const notIngested = yield* Effect.flip(
          buildDrawingJudgePack({
            manifestPath: corpus.other.manifest,
            round: 1,
            photosDir: O.none(),
            reviewPath: O.some(roundFile),
          })
        );
        expect(notIngested.message).toContain("has no readable inventory.json");
        yield* seedIngested({ roundDir: opened.roundDir, round: opened.round });
        const pack = yield* buildDrawingJudgePack({
          manifestPath: corpus.other.manifest,
          round: 1,
          photosDir: O.none(),
          reviewPath: O.some(roundFile),
        });
        expect(pack.reviewed).toBe(true);
        const prompt = yield* fs.readFileString(path.join(pack.packDir, "prompt.md"));
        expect(prompt).toContain("### Reviewer requests (review round 1");
        expect(prompt).toContain("| A1-02 | all | Margins: 1 in (all sheets) | not planned yet |");
        expect(prompt).toContain("What the design claims is the attorney's call");
        const manifest = yield* fs.readFileString(path.join(pack.packDir, "manifest.json"));
        expect(manifest).toContain('"kind":"sheet"');
      })
    );

    it.effect(
      "plans only when every finding has a disposition, and reports status",
      Effect.fnUntraced(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const review = yield* DrawingReview;
        const corpus = yield* makeCorpus();
        const opened = yield* review.open(
          ReviewOpenRequest.make({
            location: corpus.location,
            manifestPath: corpus.sent.manifest,
            deliveryPath: O.none(),
          })
        );
        const early = yield* Effect.flip(
          review.plan(ReviewPlanRequest.make({ location: corpus.location, dispositionsPath: "unused.json" }))
        );
        expect(early.message).toContain("is open; plan a round after ingest");
        yield* seedIngested({ roundDir: opened.roundDir, round: opened.round });

        const dispositionsFile = path.join(corpus.matter, "dispositions-draft.json");
        const write = (round: number, entries: ReadonlyArray<DispositionEntry>) =>
          writeJsonFile(
            ReviewDispositions,
            dispositionsFile,
            ReviewDispositions.make({ schemaVersion: "drawing-review-dispositions/v1", round, entries })
          );
        yield* write(1, [entry("A1-01", specChange)]);
        const missing = yield* Effect.flip(
          review.plan(ReviewPlanRequest.make({ location: corpus.location, dispositionsPath: dispositionsFile }))
        );
        expect(missing.message).toContain("every finding needs one disposition");
        expect(missing.message).toContain("A1-02 has no disposition");
        expect(yield* fs.exists(path.join(opened.roundDir, "dispositions.json"))).toBe(false);

        yield* write(2, [entry("A1-01", specChange)]);
        const wrongRound = yield* Effect.flip(
          review.plan(ReviewPlanRequest.make({ location: corpus.location, dispositionsPath: dispositionsFile }))
        );
        expect(wrongRound.message).toContain("is for review round 2, not 1");

        yield* write(1, [entry("A1-01", specChange), entry("A1-02", declined), entry("A1-03", specChange, "P2")]);
        const planned = yield* review.plan(
          ReviewPlanRequest.make({ location: corpus.location, dispositionsPath: dispositionsFile })
        );
        expect(planned.round.status).toBe("planned");
        assertTrue(O.isSome(planned.round.dispositionsSha256));
        expect(yield* fs.exists(path.join(opened.roundDir, "dispositions.json"))).toBe(true);
        assertSome(
          O.map(planned.inventory, (inventory) => inventory.findings.map((f) => f.status)),
          ["planned", "declined", "planned"]
        );

        const reingest = yield* Effect.flip(
          review.ingest(
            ReviewIngestRequest.make({
              location: corpus.location,
              manifestPath: corpus.sent.manifest,
              pdfPaths: ["unused.pdf"],
              figureOverrides: [],
            })
          )
        );
        expect(reingest.message).toContain("ingesting again would drop its dispositions");

        yield* runDrawings([
          "review",
          "status",
          "--corpus-root",
          corpus.root,
          "--matter",
          corpus.matter,
          "--round",
          "1",
        ]);
        const output = yield* logged;
        expect(output).toContain(`review round 1: planned, sheet set ${corpus.sent.hash}`);
        expect(output).toContain("3 finding(s), 1 open required, 2 required in all");
        expect(output).toContain("  A1-02 P1 declined all sheets: Margins: 1 in (all sheets) (×2)");

        const unopened = yield* Effect.flip(
          review.status(ReviewRoundLocation.make({ corpusRoot: corpus.root, matter: "matter", round: 7 }))
        );
        expect(unopened.message).toContain("Review round 7 is not open");
      })
    );

    it.effect(
      "statement refuses while the reviewed set has open required findings and warns for an earlier set",
      Effect.fnUntraced(function* () {
        const review = yield* DrawingReview;
        const corpus = yield* makeCorpus();
        const opened = yield* review.open(
          ReviewOpenRequest.make({
            location: corpus.location,
            manifestPath: corpus.sent.manifest,
            deliveryPath: O.none(),
          })
        );
        const pending = yield* review.guard(corpus.sent.manifest, O.none());
        expect(pending.warnings).toEqual(["review round 1 over this sheet set has not been ingested yet"]);
        yield* seedIngested({ roundDir: opened.roundDir, round: opened.round });

        const refused = yield* Effect.flip(runDrawings(["statement", "--manifest", corpus.sent.manifest]));
        assertInstanceOf(refused, DrawingsCommandError);
        expect(refused.message).toContain(
          "review round 1 has 3 open required finding(s) on this sheet set: A1-01, A1-02, A1-03"
        );

        yield* runDrawings(["statement", "--manifest", corpus.other.manifest]);
        const output = yield* logged;
        expect(output).toContain(`warning: review round 1 on earlier sheet set ${corpus.sent.hash.slice(0, 12)}`);
        expect(output).toContain(`I approve design-figure sheet set ${corpus.other.hash} for filing.`);

        // no review directory anywhere above the manifest: nothing to guard
        const none = yield* review.guard(corpus.sent.manifest, O.some(corpus.inputs));
        expect([none.refusals, none.warnings]).toEqual([[], []]);
      })
    );

    it.effect(
      "records a delivery from an outbox draft and opens the round from it",
      Effect.fnUntraced(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const review = yield* DrawingReview;
        const corpus = yield* makeCorpus();
        const draftFile = path.join(corpus.matter, "draft.json");
        const draft = (sha256: string) =>
          toJson({
            draftId: "AAMk-synthetic",
            webLink: "https://example.test/draft",
            attachments: [{ name: "sheets.pdf", size: 1234, sha256 }],
          });
        yield* fs.writeFileString(draftFile, yield* draft(corpus.other.hash));
        const wrong = yield* Effect.flip(
          runDrawings(["deliver", "record", "--manifest", corpus.sent.manifest, "--draft", draftFile])
        );
        expect(wrong.message).toContain("No attachment of the draft is the sheet-set PDF");

        yield* fs.writeFileString(draftFile, yield* draft(corpus.sent.hash));
        yield* runDrawings([
          "deliver",
          "record",
          "--manifest",
          corpus.sent.manifest,
          "--draft",
          draftFile,
          "--sent-message-id",
          "AAMk-sent",
        ]);
        expect(yield* logged).toContain(`delivery of sheet set ${corpus.sent.hash} recorded`);
        const deliveryFile = path.join(corpus.sent.dir, "delivery.json");
        const twice = yield* Effect.flip(
          review.deliver(
            DeliverRequest.make({
              manifestPath: corpus.sent.manifest,
              draftPath: draftFile,
              sentMessageId: O.none(),
              internetMessageId: O.none(),
              outPath: O.none(),
            })
          )
        );
        expect(twice.message).toContain("already exists");

        const mismatched = yield* Effect.flip(
          review.open(
            ReviewOpenRequest.make({
              location: corpus.location,
              manifestPath: corpus.other.manifest,
              deliveryPath: O.some(deliveryFile),
            })
          )
        );
        expect(mismatched.message).toContain("The delivery record names sheet set");

        yield* runDrawings([
          "review",
          "open",
          "--corpus-root",
          corpus.root,
          "--matter",
          corpus.matter,
          "--round",
          "1",
          "--manifest",
          corpus.sent.manifest,
          "--delivery",
          deliveryFile,
        ]);
        const status = yield* review.status(corpus.location);
        assertSome(status.round.sentMessageId, "AAMk-sent");
        expect(yield* logged).toContain("not ingested yet");
      })
    );

    it.effect(
      "lists the review and deliver subcommands, and refuses a malformed --figure",
      Effect.fnUntraced(function* () {
        yield* runDrawings([]);
        yield* runDrawings(["review"]);
        yield* runDrawings(["deliver"]);
        const output = yield* logged;
        expect(output).toContain(
          "drawings commands: render, validate, judge, judge-ingest, statement, sign, deliver, review"
        );
        expect(output).toContain("drawings review commands: open, ingest, plan, status");
        expect(output).toContain("drawings deliver commands: record");
        const corpus = yield* makeCorpus();
        const malformed = yield* Effect.flip(
          runDrawings([
            "review",
            "ingest",
            "--corpus-root",
            corpus.root,
            "--matter",
            corpus.matter,
            "--round",
            "1",
            "--manifest",
            corpus.sent.manifest,
            "--pdf",
            corpus.sent.manifest,
            "--figure",
            "nonsense",
          ])
        );
        expect(malformed.message).toContain('"nonsense" is not <file>[:<page>]=<FIG.>');
      })
    );
  });
});
