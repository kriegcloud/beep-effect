import {
  BoundingBox,
  Box,
  Camera,
  cameraForView,
  composeSheet,
  DrawingError,
  EdgeSet,
  EngineInfo,
  FigureSet,
  GeometryEngine,
  InkBounds,
  ModelSpec,
  ModelSummary,
  marginFindings,
  mirrorSegments,
  PageMetrics,
  Part,
  PdfBackend,
  PdfFacts,
  PdfFontFact,
  PdfPageSize,
  purityFindings,
  RenderManifest,
  RenderRequest,
  SheetOptions,
  sameSegments,
  structuralFindings,
  ValidationOptions,
} from "@beep/technical-drawing";
import { it } from "@beep/test-runner";
import { A } from "@beep/utils";
import { NodeServices } from "@effect/platform-node";
import { describe, expect } from "@effect/vitest";
import { assertInstanceOf, assertSome } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Path from "effect/Path";
import * as S from "effect/Schema";

// A fake engine: every view projects a unit square, except that the "rear"
// camera (eye +Y) projects the square shifted, so omission proofs can fail.
const RenderManifestJson = S.fromJsonString(RenderManifest);

const square: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, 0, 10, 0],
  [0, 0, 0, 5],
  [0, 5, 10, 5],
  [10, 0, 10, 5],
];
const shifted = A.map(square, ([a, b, c, d]) => [a + 1, b, c + 1, d] as const);

const fakeEngine = Layer.succeed(
  GeometryEngine,
  GeometryEngine.of({
    info: Effect.succeed(EngineInfo.make({ name: "fake", version: "0", binarySha256: "" })),
    summarize: Effect.fnUntraced(function* () {
      return ModelSummary.make({
        boundingBox: BoundingBox.make({ min: [0, 0, 0], max: [10, 5, 5] }),
        volume: 250,
        faceCount: 6,
        edgeCount: 12,
      });
    }),
    project: Effect.fnUntraced(function* (model, cameras, shading) {
      // shaded projections carry one diagonal hatch line per view; a model
      // with a broken-line part carries one broken segment per view
      const hatch = O.match(shading, { onNone: () => [], onSome: () => [[1, 1, 4, 4] as const] });
      const broken = A.some(model.parts, (part) => part.lineStyle === "broken") ? [[2, 1, 8, 1] as const] : [];
      return A.map(cameras, (camera) =>
        EdgeSet.make({ visible: camera.eye[1] > 0 ? shifted : square, hidden: [], shading: hatch, broken })
      );
    }),
  })
);

const letter = PdfPageSize.make({ widthPt: 612, heightPt: 792 });
const cleanMetrics = (dpi: number, antiAliased: boolean) =>
  PageMetrics.make({
    width: Math.round(8.5 * dpi),
    height: Math.round(11 * dpi),
    dpi,
    antiAliased,
    inkBounds: O.some(
      InkBounds.make({
        minX: Math.round(1.1 * dpi),
        minY: Math.round(1.1 * dpi),
        maxX: Math.round(7.5 * dpi),
        maxY: Math.round(10 * dpi),
      })
    ),
    inkPixels: 100,
    impurePixels: 0,
    largestBlackSquare: 4,
  });

const fakeBackend = (pageCount: { current: number }) =>
  Layer.effect(
    PdfBackend,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      return PdfBackend.of({
        svgToPdf: Effect.fnUntraced(function* (svgPaths, outputPath) {
          pageCount.current = A.length(svgPaths);
          yield* fs.writeFileString(outputPath, `%PDF-1.6 fake ${A.length(svgPaths)} pages`);
        }, Effect.orDie),
        inspect: Effect.fnUntraced(function* () {
          return PdfFacts.make({
            headerVersion: "1.6",
            // `A.makeBy(0, f)` still yields one element, so the empty case is explicit
            pages: pageCount.current === 0 ? [] : A.makeBy(pageCount.current, () => letter),
            fonts: [],
            annotationCount: 0,
            hasOptionalContent: false,
            encrypted: false,
          });
        }),
        measurePage: Effect.fnUntraced(function* ({ dpi, antiAlias }) {
          return cleanMetrics(dpi, antiAlias);
        }),
        pageText: Effect.fnUntraced(function* () {
          return "";
        }),
      });
    })
  );

const body = { name: "body", add: [{ kind: "box", min: [0, 0, 0], max: [10, 5, 5] }] };

const spec = (
  figures: ReadonlyArray<{ view: string; description: string }>,
  omissions: ReadonlyArray<unknown> = [],
  extra: Readonly<Record<string, string>> = {},
  part: Readonly<Record<string, unknown>> = body
) =>
  JSON.stringify({
    ...extra,
    title: "Synthetic block",
    model: { parts: [part] },
    figures,
    omissions,
  });

const makeLayer = () => {
  const pages = { current: 0 };
  return FigureSet.layer.pipe(
    Layer.provide(Layer.merge(fakeEngine, fakeBackend(pages))),
    Layer.provideMerge(NodeServices.layer)
  );
};

describe("@beep/technical-drawing", () => {
  describe("pure sheet and rule helpers", () => {
    it.effect(
      "composeSheet is deterministic and keeps every mark inside the sight",
      Effect.fnUntraced(function* () {
        const options = SheetOptions.make({});
        const a = composeSheet({ segments: square, shading: [], figure: 3, sheet: 3, sheets: 8, scale: 20, options });
        const b = composeSheet({ segments: square, shading: [], figure: 3, sheet: 3, sheets: 8, scale: 20, options });
        expect(a).toBe(b);
        expect(a).toContain('width="612.000pt"');
        const coords = A.map(
          [...a.matchAll(/[ML](-?\d+\.\d+) (-?\d+\.\d+)/g)],
          (m) => [Number(m[1]), Number(m[2])] as const
        );
        expect(A.length(coords)).toBeGreaterThan(20);
        for (const [x, y] of coords) {
          expect(x).toBeGreaterThanOrEqual(2.5 * 28.3464);
          expect(x).toBeLessThanOrEqual(612 - 1.5 * 28.3464);
          expect(y).toBeGreaterThanOrEqual(2.5 * 28.3464);
          expect(y).toBeLessThanOrEqual(792 - 1.0 * 28.3464);
        }
      })
    );

    it.effect(
      "composeSheet adds a dashed broken layer only when broken lines exist",
      Effect.fnUntraced(function* () {
        const options = SheetOptions.make({});
        const base = { segments: square, figure: 1, sheet: 1, sheets: 1, scale: 20, options } as const;
        const plain = composeSheet({ ...base, shading: [] });
        // an empty broken layer leaves the sheet byte-identical
        expect(composeSheet({ ...base, shading: [], broken: [] })).toBe(plain);
        expect(plain).not.toContain('id="broken"');
        expect(plain).not.toContain("stroke-dasharray");
        const withBroken = composeSheet({ ...base, shading: [[1, 1, 4, 4]], broken: [[2, 1, 8, 1]] });
        // 3 mm dashes, 1.5 mm gaps, the outline weight, between shading and figure
        expect(withBroken).toContain(
          'stroke-width="0.992" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="8.504 4.252"/>'
        );
        const order = A.map(['id="labels"', 'id="shading"', 'id="broken"', 'id="figure"'], (id) =>
          withBroken.indexOf(id)
        );
        expect(order).toEqual(A.sort(order, Order.Number));
        expect(A.every(order, (index) => index > 0)).toBe(true);
        const custom = composeSheet({
          ...base,
          shading: [],
          broken: [[2, 1, 8, 1]],
          options: SheetOptions.make({ brokenDashMm: 2, brokenGapMm: 1 }),
        });
        expect(custom).toContain('stroke-dasharray="5.669 2.835"');
        // broken lines inside the outline do not move it; outside it they re-centre the view
        const figureOf = (svg: string) => svg.slice(svg.indexOf('<path id="figure"'));
        expect(figureOf(withBroken)).toBe(figureOf(plain));
        expect(figureOf(composeSheet({ ...base, shading: [], broken: [[-10, 0, 0, 0]] }))).not.toBe(figureOf(plain));
        expect(SheetOptions.make({}).brokenGapMm).toBe(1.5);
        expect(() => SheetOptions.make({ brokenDashMm: 0.5 })).toThrow();
        expect(() => SheetOptions.make({ brokenGapMm: 0.5 })).toThrow();
      })
    );

    it.effect(
      "segment comparison is order- and direction-insensitive; mirroring is about the view centre",
      Effect.fnUntraced(function* () {
        expect(
          sameSegments({ left: square, right: A.reverse(A.map(square, ([a, b, c, d]) => [c, d, a, b] as const)) })
        ).toBe(true);
        expect(sameSegments({ left: square, right: shifted })).toBe(false);
        expect(sameSegments({ left: mirrorSegments(square), right: square })).toBe(true);
        expect(
          sameSegments({
            left: mirrorSegments([
              [0, 0, 4, 0],
              [4, 0, 4, 2],
            ]),
            right: [
              [0, 0, 4, 0],
              [0, 0, 0, 2],
            ],
          })
        ).toBe(true);
      })
    );

    it.effect(
      "cameras: elevations are orthographic, perspectives carry a focus scaled to the box",
      Effect.fnUntraced(function* () {
        const box = BoundingBox.make({ min: [0, 0, 0], max: [40, 30, 20] });
        expect(cameraForView({ view: "front", box })).toEqual(Camera.make({ eye: [0, -1, 0], up: [0, 0, 1] }));
        const persp = cameraForView({ view: "bottom-perspective", box });
        expect(persp.eye[2]).toBeLessThan(0);
        expect(persp.target).toEqual([20, 15, 10]);
        assertSome(
          O.map(persp.focus, (f) => Math.round(f)),
          Math.round(2.5 * Math.hypot(40, 30, 20))
        );
      })
    );

    it.effect(
      "structural rules flag version, encryption, layers, annotations, fonts, page count, sizes",
      Effect.fnUntraced(function* () {
        const facts = PdfFacts.make({
          headerVersion: "1.7",
          pages: [
            letter,
            PdfPageSize.make({ widthPt: 595.3, heightPt: 841.9 }),
            PdfPageSize.make({ widthPt: 500, heightPt: 500 }),
          ],
          fonts: [
            PdfFontFact.make({ name: "Helvetica", embedded: false }),
            PdfFontFact.make({ name: "ABCDEF+Foo", embedded: true }),
          ],
          annotationCount: 2,
          hasOptionalContent: true,
          encrypted: true,
        });
        const codes = A.map(
          structuralFindings({ facts, options: ValidationOptions.make({ expectedPages: O.some(8) }) }),
          (f) => f.code
        );
        expect(codes).toEqual([
          "pdf-version",
          "encrypted",
          "optional-content",
          "annotations",
          "font-not-embedded",
          "page-count",
          "page-size",
          "page-size-mixed",
        ]);
        const clean = PdfFacts.make({
          headerVersion: "1.6",
          pages: [letter],
          fonts: [],
          annotationCount: 0,
          hasOptionalContent: false,
          encrypted: false,
        });
        expect(
          structuralFindings({ facts: clean, options: ValidationOptions.make({ expectedPages: O.some(1) }) })
        ).toEqual([]);
      })
    );

    it.effect(
      "raster rules flag margins, blank pages, impurity, and solid black",
      Effect.fnUntraced(function* () {
        const tight = PageMetrics.make({
          width: 2550,
          height: 3300,
          dpi: 300,
          antiAliased: true,
          inkBounds: O.some(InkBounds.make({ minX: 200, minY: 200, maxX: 2500, maxY: 3250 })),
          inkPixels: 1,
          impurePixels: 0,
          largestBlackSquare: 0,
        });
        expect(A.map(marginFindings({ page: 2, metrics: tight }), (f) => f.code)).toEqual([
          "margin-top",
          "margin-left",
          "margin-right",
          "margin-bottom",
        ]);
        expect(A.map(marginFindings({ page: 1, metrics: cleanMetrics(300, true) }), (f) => f.code)).toEqual([]);
        const blank = PageMetrics.make({
          width: 1,
          height: 1,
          dpi: 300,
          antiAliased: true,
          inkBounds: O.none(),
          inkPixels: 0,
          impurePixels: 0,
          largestBlackSquare: 0,
        });
        expect(A.map(marginFindings({ page: 1, metrics: blank }), (f) => f.code)).toEqual(["blank-page"]);
        const dirty = PageMetrics.make({
          width: 1,
          height: 1,
          dpi: 300,
          antiAliased: false,
          inkBounds: O.none(),
          inkPixels: 0,
          impurePixels: 3,
          largestBlackSquare: 40,
        });
        expect(
          A.map(
            purityFindings({ page: 1, metrics: dirty, options: ValidationOptions.make({ expectedPages: O.none() }) }),
            (f) => f.code
          )
        ).toEqual(["impure-pixels", "solid-black-area"]);
      })
    );
  });

  describe("render through fake ports", () => {
    it.layer(makeLayer(), { timeout: "30 seconds" })((it) => {
      it.effect(
        "renders sheets, proves omissions, writes a manifest, and validates",
        Effect.fnUntraced(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const dir = yield* fs.makeTempDirectoryScoped();
          const specPath = path.join(dir, "spec.json");
          yield* fs.writeFileString(
            specPath,
            spec(
              [
                { view: "front", description: "is a front elevation view" },
                { view: "top-plan", description: "is a top plan view" },
              ],
              [
                { omitted: "left", shown: "front", relation: "identical" },
                { omitted: "right", shown: "front", relation: "mirror" },
              ]
            )
          );
          const out = path.join(dir, "out");
          const service = yield* FigureSet;
          const manifest = yield* service.render(RenderRequest.make({ specPath, outputDir: out }));
          expect(A.map(manifest.figures, (f) => [f.figure, f.view, f.svgFile])).toEqual([
            [1, "front", "fig-1.svg"],
            [2, "top-plan", "fig-2.svg"],
          ]);
          expect(A.map(manifest.omissions, (o) => o.proven)).toEqual([true, true]);
          expect(manifest.pdfSha256).toMatch(/^[0-9a-f]{64}$/);
          assertSome(
            O.map(manifest.validation, (v) => [v.pageCount, v.findings.length]),
            [2, 0]
          );
          const files = yield* fs.readDirectory(out);
          expect(A.sort(files, (a: string, b: string) => (a < b ? -1 : 1))).toEqual([
            "fig-1.svg",
            "fig-2.svg",
            "manifest.json",
            "sheets.pdf",
          ]);
          // the written manifest decodes back to the returned one (it feeds `drawings sign`)
          const written = yield* fs.readFileString(path.join(out, "manifest.json"));
          const decoded = yield* S.decodeEffect(RenderManifestJson)(written);
          expect(decoded).toEqual(manifest);
          const again = yield* service.render(RenderRequest.make({ specPath, outputDir: out }));
          expect(again.figures).toEqual(manifest.figures);
        })
      );

      it.effect(
        "adds a thinner shading layer only when shading is requested",
        Effect.fnUntraced(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const dir = yield* fs.makeTempDirectoryScoped();
          const specPath = path.join(dir, "spec.json");
          yield* fs.writeFileString(specPath, spec([{ view: "front", description: "is a front elevation view" }]));
          const service = yield* FigureSet;
          const plain = yield* service.render(
            RenderRequest.make({ specPath, outputDir: path.join(dir, "plain"), validate: false })
          );
          const shaded = yield* service.render(
            RenderRequest.make({ specPath, outputDir: path.join(dir, "shaded"), validate: false, shade: true })
          );
          expect(plain.shaded).toBe(false);
          expect(shaded.shaded).toBe(true);
          expect(A.map(plain.figures, (f) => f.shadingSegments)).toEqual([0]);
          expect(A.map(shaded.figures, (f) => f.shadingSegments)).toEqual([1]);
          const plainSvg = yield* fs.readFileString(path.join(dir, "plain", "fig-1.svg"));
          const shadedSvg = yield* fs.readFileString(path.join(dir, "shaded", "fig-1.svg"));
          expect(plainSvg).not.toContain('id="shading"');
          expect(shadedSvg).toContain('<path id="shading"');
          // 0.2 mm shading under 0.35 mm outlines
          expect(shadedSvg).toContain('stroke-width="0.567"');
          expect(shadedSvg).toContain('stroke-width="0.992"');
        })
      );

      it.effect(
        "draws broken-line parts as a dashed layer, counts them, and proves omissions over both layers",
        Effect.fnUntraced(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const dir = yield* fs.makeTempDirectoryScoped();
          const service = yield* FigureSet;
          const figures = [{ view: "front", description: "is a front elevation view" }];
          const omissions = [{ omitted: "left", shown: "front", relation: "identical" }];
          const render = Effect.fnUntraced(function* (name: string, text: string) {
            const specPath = path.join(dir, `${name}.json`);
            yield* fs.writeFileString(specPath, text);
            const out = path.join(dir, name);
            const manifest = yield* service.render(RenderRequest.make({ specPath, outputDir: out, validate: false }));
            return { manifest, svg: yield* fs.readFileString(path.join(out, "fig-1.svg")) };
          });
          const solid = yield* render("solid", spec(figures, omissions));
          const broken = yield* render("broken", spec(figures, omissions, {}, { ...body, lineStyle: "broken" }));
          expect(A.map(solid.manifest.figures, (f) => f.brokenSegments)).toEqual([0]);
          expect(A.map(broken.manifest.figures, (f) => f.brokenSegments)).toEqual([1]);
          expect(solid.svg).not.toContain('id="broken"');
          expect(broken.svg).toContain('<path id="broken"');
          expect(broken.svg).toContain('stroke-dasharray="8.504 4.252"');
          expect(A.map(broken.manifest.omissions, (o) => o.proven)).toEqual([true]);
          // the broken segment lies inside the outline, so the scale is unchanged
          expect(broken.manifest.scale).toBe(solid.manifest.scale);
        })
      );

      it.effect(
        "refuses an omission claim the projections disprove",
        Effect.fnUntraced(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const dir = yield* fs.makeTempDirectoryScoped();
          const specPath = path.join(dir, "spec.json");
          yield* fs.writeFileString(
            specPath,
            spec(
              [{ view: "front", description: "is a front elevation view" }],
              [{ omitted: "rear", shown: "front", relation: "identical" }]
            )
          );
          const service = yield* FigureSet;
          const error = yield* Effect.flip(
            service.render(RenderRequest.make({ specPath, outputDir: path.join(dir, "out") }))
          );
          assertInstanceOf(error, DrawingError);
          expect(error.reason).toBe("omission");
        })
      );

      it.effect(
        "rejects a spec that repeats a view or lacks a description",
        Effect.fnUntraced(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const dir = yield* fs.makeTempDirectoryScoped();
          const specPath = path.join(dir, "spec.json");
          const service = yield* FigureSet;
          yield* fs.writeFileString(
            specPath,
            spec([
              { view: "front", description: "a" },
              { view: "front", description: "b" },
            ])
          );
          const dup = yield* Effect.flip(service.render(RenderRequest.make({ specPath, outputDir: dir })));
          expect(dup.reason).toBe("spec");
          yield* fs.writeFileString(specPath, spec([{ view: "front", description: "   " }]));
          const empty = yield* Effect.flip(service.render(RenderRequest.make({ specPath, outputDir: dir })));
          expect(empty.reason).toBe("spec");
        })
      );
    });
  });
});

// Keep the geometry vocabulary exercised at the type level: the spec decodes
// into these classes.
void Box;
void ModelSpec;
void Part;

describe("@beep/technical-drawing approver binding and empty documents", () => {
  it.layer(makeLayer(), { timeout: "30 seconds" })((it) => {
    it.effect(
      "reports an empty document instead of rasterising a page that is not there",
      Effect.fnUntraced(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const dir = yield* fs.makeTempDirectoryScoped();
        const pdfPath = path.join(dir, "empty.pdf");
        yield* fs.writeFileString(pdfPath, "%PDF-1.6 no pages");
        // the fake backend reports zero pages until a render sets the count
        const service = yield* FigureSet;
        const report = yield* service.validate(pdfPath, ValidationOptions.make({ expectedPages: O.none() }));
        expect(report.pageCount).toBe(0);
        expect(report.ok).toBe(false);
        expect(A.map(report.findings, (f) => [f.code, f.message])).toEqual([["page-count", "The PDF has no pages."]]);
      })
    );
  });

  it.layer(makeLayer(), { timeout: "30 seconds" })((it) => {
    it.effect(
      "carries the spec's approver into the manifest, and omits the key when the spec names none",
      Effect.fnUntraced(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const dir = yield* fs.makeTempDirectoryScoped();
        const service = yield* FigureSet;
        const figures = [{ view: "front", description: "is a front elevation view thereof" }];
        const render = Effect.fnUntraced(function* (name: string, text: string) {
          const specPath = path.join(dir, `${name}.json`);
          yield* fs.writeFileString(specPath, text);
          const out = path.join(dir, name);
          const manifest = yield* service.render(RenderRequest.make({ specPath, outputDir: out }));
          return { manifest, written: yield* fs.readFileString(path.join(out, "manifest.json")) };
        });
        const bound = yield* render("bound", spec(figures, [], { approver: "Attorney@Example.com" }));
        expect(O.getOrUndefined(bound.manifest.approver)).toBe("attorney@example.com");
        const decoded = yield* S.decodeEffect(RenderManifestJson)(bound.written);
        expect(O.getOrUndefined(decoded.approver)).toBe("attorney@example.com");
        const unbound = yield* render("unbound", spec(figures));
        expect(O.isNone(unbound.manifest.approver)).toBe(true);
        expect(unbound.written).not.toContain("approver");
      })
    );
  });
});
