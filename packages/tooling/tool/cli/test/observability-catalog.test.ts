import {
  AttributeKey,
  AttributeKeyName,
  InstrumentDeclarations,
  PackageName,
  SpanInstrument,
  SpanName,
} from "@beep/observability/catalog";
import {
  buildCatalog,
  familySpanCounts,
  HarvestedSpan,
  harvestedSpanInstrument,
  harvestedSpans,
  harvestSourceFile,
  InstrumentationCatalogDocument,
  packageFamilyOfPath,
  renderCatalogText,
  renderStandardSection,
  SpanHarvest,
  SpanSite,
  STANDARD_SECTION_BEGIN,
  STANDARD_SECTION_END,
  spliceStandardSection,
} from "@beep/repo-cli/commands/Observability";
import { PosixPath } from "@beep/schema/PosixPath";
import { describe, expect, it } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { Project } from "ts-morph";
import { dynamicSpans, literalSpans } from "./fixtures/observability-catalog/sources.ts";

const pkgA = PackageName.make("@beep/a");
const pkgB = PackageName.make("@beep/b");

const harvestFixture = (
  source: string,
  file = "packages/drivers/fixture/src/Fixture.ts",
  owner = pkgA
): SpanHarvest => {
  const project = new Project({ useInMemoryFileSystem: true });
  return harvestSourceFile(project.createSourceFile("Fixture.ts", source), PosixPath.make(file), owner);
};

const site = (name: string, owner: PackageName, file = "packages/drivers/fixture/src/Fixture.ts"): SpanSite =>
  SpanSite.make({
    name,
    owner,
    family: packageFamilyOfPath(file),
    file: PosixPath.make(file),
    line: 1,
    callee: "Effect.fn",
  });

const harvestOf = (sites: ReadonlyArray<SpanSite>): SpanHarvest => SpanHarvest.make({ sites, findings: [] });

describe("packageFamilyOfPath", () => {
  it("derives every family from the path", () => {
    expect(
      A.map(
        [
          "packages/documents/server/src/A.ts",
          "packages/shared/domain/src/A.ts",
          "packages/foundation/capability/observability/src/A.ts",
          "packages/drivers/box/src/A.ts",
          "packages/tooling/tool/cli/src/A.ts",
          "packages/_internal/db-admin/src/A.ts",
          "packages/ecosystem/effect-drizzle/src/A.ts",
          "apps/professional-desktop/src/A.ts",
          "apps/labs/semantica/src/A.ts",
        ],
        packageFamilyOfPath
      )
    ).toEqual(["slice", "slice", "foundation", "driver", "tooling", "tooling", "ecosystem", "app", "lab"]);
  });
});

describe("harvestSourceFile", () => {
  it("records literal and const-bound span names with their callee", () => {
    const harvest = harvestFixture(literalSpans);
    expect(A.map(harvest.sites, ({ name, callee }) => `${callee} ${name}`)).toEqual([
      "Effect.fn Parcels.read",
      "Effect.fnUntraced Parcels.write",
      "Effect.withSpan Parcels.list",
      "Effect.withSpan db.query",
      "Effect.withSpan Parcels.count",
    ]);
    expect(harvest.findings).toEqual([]);
    expect(A.map(harvest.sites, ({ owner, family }) => `${owner} ${family}`)).toEqual(A.replicate("@beep/a driver", 5));
  });

  it("reports interpolated names and non-literal names as findings", () => {
    const harvest = harvestFixture(dynamicSpans);
    expect(harvest.sites).toEqual([]);
    expect(A.map(harvest.findings, ({ kind, text }) => `${kind} ${text}`)).toEqual([
      "interpolated `box.${method}`",
      "non-literal name",
      "interpolated `${prefix}.execute`",
    ]);
  });
});

describe("harvestedSpans", () => {
  it("collapses repeated sites per owner and flags conformance", () => {
    const rows = harvestedSpans(
      harvestOf([
        site("db.query", pkgA),
        site("Parcels.read", pkgB),
        site("db.query", pkgA),
        site("Parcels.read", pkgA),
      ])
    );
    expect(A.map(rows, ({ name, owner, conforms }) => `${name} ${owner} ${conforms}`)).toEqual([
      "Parcels.read @beep/a true",
      "Parcels.read @beep/b true",
      "db.query @beep/a false",
    ]);
  });

  it("turns a non-conforming row into a harvested span instrument", () => {
    const row = HarvestedSpan.make({ name: "db.query", owner: pkgA, family: "driver", conforms: false });
    assertSome(
      O.map(harvestedSpanInstrument(row), ({ origin, conforms, protocol }) => ({ origin, conforms, protocol })),
      { origin: "harvested", conforms: false, protocol: false }
    );
  });
});

describe("buildCatalog", () => {
  it("passes when names are unique and declarations merge", () => {
    const build = buildCatalog(harvestOf([site("Parcels.read", pkgA), site("db.query", pkgA)]), [
      InstrumentDeclarations.make({}),
    ]);
    expect(build.conflicts).toEqual([]);
    expect(build.document.spans.length).toBe(2);
  });

  it("reports a cross-package duplicate name", () => {
    const build = buildCatalog(harvestOf([site("Parcels.read", pkgA), site("Parcels.read", pkgB)]), []);
    expect(build.conflicts).toEqual(["span Parcels.read is declared by @beep/a, @beep/b"]);
  });

  it("lets a declared span carry attributes for its harvested name", () => {
    const key = AttributeKeyName.make("beep.desktop.operation");
    const declarations = InstrumentDeclarations.make({
      attributes: [
        AttributeKey.make({
          key,
          type: "string",
          signals: ["span"],
          cardinality: "static",
          minTier: "shape-only",
          owner: pkgA,
          description: "Operation.",
        }),
      ],
      instruments: [
        SpanInstrument.make({
          name: SpanName.make("Parcels.read"),
          owner: pkgA,
          family: "driver",
          attributes: [key],
          minTier: "shape-only",
          description: "Reads parcels.",
          kind: "internal",
        }),
      ],
    });
    const build = buildCatalog(harvestOf([site("Parcels.read", pkgA)]), [declarations]);
    expect(build.conflicts).toEqual([]);
    expect(build.document.instruments.length).toBe(1);
  });
});

describe("rendering", () => {
  const document = InstrumentationCatalogDocument.make({
    attributes: [],
    instruments: [],
    spans: harvestedSpans(harvestOf([site("db.query", pkgA), site("Parcels.read", pkgB)])),
  });

  it.effect("renders deterministic JSONC with one span per line", () =>
    Effect.gen(function* () {
      const first = yield* renderCatalogText(document);
      const second = yield* renderCatalogText(document);
      expect(first).toBe(second);
      expect(first).toContain(
        '    {"name":"Parcels.read","owner":"@beep/b","family":"driver","conforms":true},\n    {"name":"db.query","owner":"@beep/a","family":"driver","conforms":false}\n'
      );
    })
  );

  it("counts spans per family in family order", () => {
    expect(
      A.map(familySpanCounts(document.spans), ({ family, spans, conforming }) => `${family}:${spans}:${conforming}`)
    ).toEqual(["slice:0:0", "foundation:0:0", "driver:2:1", "tooling:0:0", "ecosystem:0:0", "app:0:0", "lab:0:0"]);
  });

  it("splices the generated section between its markers", () => {
    const section = renderStandardSection(document);
    expect(section).toContain("| driver | 2 | 1 | 1 |");
    expect(section).toContain("| **total** | 2 | 1 | 1 |");
    const doc = `# Title\n\n${STANDARD_SECTION_BEGIN}\nold\n${STANDARD_SECTION_END}\n\nrest\n`;
    assertSome(spliceStandardSection(doc, section), `# Title\n\n${section}\n\nrest\n`);
    assertNone(spliceStandardSection("# no markers\n", section));
  });
});
