/**
 * Exact-span normalization for the two fixed synthetic RFQ fixture pairs.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LejeuneBoltWorkbenchId } from "@beep/identity/packages";
import { GroundedExtraction } from "@beep/langextract/Extraction";
import { locateGroundedExtractions } from "@beep/langextract/VerifiedSpan";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Tuple from "effect/Tuple";
import { ExtractedField, MissingField, makeNormalizedFixture } from "@/domain/Bundle";
import { Component, EntityId, IsoDate, ProductVariant, Project, QuoteLine, RFQ } from "@/domain/Ontology";
import { FixtureError } from "@/fixtures/Sources";
import { PosInt } from "../domain/PosInt.ts";
import type { NormalizedFixture, SourceDocument } from "@/domain/Bundle";
import type { GeneratedFixtureArtifacts } from "@/fixtures/Sources";

const $I = $LejeuneBoltWorkbenchId.create("workflows/Normalize");

class FieldLocator extends S.Opaque<FieldLocator, { readonly brand: unique symbol }>()(
  S.Struct({ name: S.NonEmptyString, text: S.NonEmptyString }).pipe(
    $I.annoteSchema("FieldLocator", {
      description: "A named literal value to locate verbatim in a frozen source document.",
    })
  )
) {}

const entityId = EntityId.make;
const isoDate = IsoDate.make;

const makeProductVariant = (
  components: NormalizedFixture["components"],
  fields: Pick<ProductVariant, "finishId" | "id" | "label" | "standardId">
) =>
  ProductVariant.make({
    componentIds: A.map(components, (component) => component.id),
    finishId: fields.finishId,
    id: fields.id,
    label: fields.label,
    standardId: fields.standardId,
  });

const sourceById = Effect.fnUntraced(function* (sources: ReadonlyArray<SourceDocument>, id: string) {
  return yield* A.findFirst(sources, (source) => Str.Equivalence(source.id, id)).pipe(
    Effect.fromOption(() => FixtureError.make({ stage: "normalize", message: `Missing frozen source document ${id}.` }))
  );
});

const locateFields = Effect.fnUntraced(function* (source: SourceDocument, fields: ReadonlyArray<FieldLocator>) {
  return yield* Effect.forEach(
    fields,
    Effect.fnUntraced(function* (field) {
      const candidates = [GroundedExtraction.cases.unaligned.make({ label: field.name, text: field.text })];
      const anchors = yield* locateGroundedExtractions(candidates, source.text);
      const anchor = yield* A.head(anchors).pipe(
        Effect.fromOption(() =>
          FixtureError.make({
            stage: "normalize",
            message: `No exact anchor was produced for ${field.name} in ${source.id}.`,
          })
        )
      );
      const rawSlice = Str.slice(anchor.startChar, anchor.endChar)(source.text);
      if (!Str.Equivalence(rawSlice, anchor.quote)) {
        return yield* FixtureError.make({
          stage: "normalize",
          message: `Anchor for ${field.name} does not re-slice ${source.id}.`,
        });
      }
      return ExtractedField.make({
        anchor,
        name: field.name,
        sourceDocumentId: source.id,
        value: field.text,
      });
    }),
    { concurrency: 1 }
  );
});

const normalizeRfqA = Effect.fnUntraced(function* (sources: ReadonlyArray<SourceDocument>) {
  const email = yield* sourceById(sources, "rfq-a-outlook-body");
  const xlsx = yield* sourceById(sources, "rfq-a-xlsx-takeoff");
  const emailFields = yield* locateFields(email, [
    FieldLocator.make({ name: "projectName", text: "North Loop Canopy" }),
    FieldLocator.make({ name: "deliveryDate", text: "2026-09-12" }),
    FieldLocator.make({ name: "domesticOrigin", text: "Domestic required" }),
    FieldLocator.make({ name: "finish", text: "MG B695 Class 55" }),
  ]);
  const xlsxFields = yield* locateFields(xlsx, [
    FieldLocator.make({ name: "product", text: "TC assembly" }),
    FieldLocator.make({ name: "grade", text: "F1852 Type 1" }),
    FieldLocator.make({ name: "diameter", text: "7/8 in" }),
    FieldLocator.make({ name: "length", text: "3-1/4 in" }),
    FieldLocator.make({ name: "quantity", text: "180" }),
    FieldLocator.make({ name: "dti", text: "F959 Type 325" }),
  ]);
  const components = Tuple.make(
    Component.make({
      id: entityId("rfq-a-bolt"),
      kind: "bolt",
      label: "F1852 Type 1 tension-control bolt",
      standardId: entityId("astm-f1852-type-1"),
      strengthClass: "325",
    }),
    Component.make({
      id: entityId("rfq-a-nut"),
      kind: "nut",
      label: "A563 DH nut",
      standardId: entityId("astm-a563-dh"),
      strengthClass: "325-compatible",
    }),
    Component.make({
      id: entityId("rfq-a-washer"),
      kind: "washer",
      label: "F436 Type 1 washer",
      standardId: entityId("astm-f436-type-1"),
      strengthClass: "325-compatible",
    }),
    Component.make({
      id: entityId("rfq-a-dti"),
      kind: "dti",
      label: "F959 Type 325 DTI",
      standardId: entityId("astm-f959-type-325"),
      strengthClass: "325",
    })
  );
  const productVariant = makeProductVariant(components, {
    finishId: entityId("mechanical-galvanized-b695-class-55"),
    id: entityId("rfq-a-tc-assembly"),
    label: "F1852 Type 1 TC assembly, 7/8 in x 3-1/4 in",
    standardId: entityId("astm-f1852-type-1"),
  });
  const project = Project.make({
    deliveryDate: isoDate("2026-09-12"),
    id: entityId("north-loop-canopy"),
    name: "North Loop Canopy",
  });
  const quoteLine = QuoteLine.make({
    id: entityId("rfq-a-line-a-1"),
    productVariantId: productVariant.id,
    quantity: PosInt.make(180),
    rfqId: entityId("rfq-a"),
  });
  const rfq = RFQ.make({
    id: entityId("rfq-a"),
    missingFields: ["certificationRequirement"],
    projectId: project.id,
    quoteLineIds: [quoteLine.id],
    sourceDocumentIds: [entityId(email.id), entityId(xlsx.id)],
  });
  const extractedFields = A.appendAll(emailFields, xlsxFields);
  if (!A.isReadonlyArrayNonEmpty(extractedFields)) {
    return yield* FixtureError.make({ stage: "normalize", message: "RFQ A produced no exact extracted fields." });
  }
  return yield* makeNormalizedFixture({
    components,
    extractedFields,
    missingFields: [
      MissingField.make({
        field: "certificationRequirement",
        question: "RFI: Is a lot certificate required for RFQ A?",
        rfqId: rfq.id,
      }),
    ],
    productVariant,
    project,
    quoteLine,
    rfq,
    sources: [email, xlsx],
  }).pipe(
    Effect.mapError((cause) =>
      FixtureError.make({ cause, stage: "normalize", message: "RFQ A failed the persisted fixture contract." })
    )
  );
});

const normalizeRfqB = Effect.fnUntraced(function* (sources: ReadonlyArray<SourceDocument>) {
  const email = yield* sourceById(sources, "rfq-b-prose-email");
  const pdf = yield* sourceById(sources, "rfq-b-pdf-schedule");
  const emailFields = yield* locateFields(email, [
    FieldLocator.make({ name: "projectName", text: "County Shops Expansion" }),
    FieldLocator.make({ name: "deliveryDate", text: "2026-09-20" }),
    FieldLocator.make({ name: "certificationRequirement", text: "certification is required" }),
  ]);
  const pdfFields = yield* locateFields(pdf, [
    FieldLocator.make({ name: "product", text: "heavy hex bolt only" }),
    FieldLocator.make({ name: "grade", text: "A490 Type 1" }),
    FieldLocator.make({ name: "diameter", text: "3/4 in" }),
    FieldLocator.make({ name: "length", text: "2-1/2 in" }),
    FieldLocator.make({ name: "quantity", text: "860" }),
    FieldLocator.make({ name: "finish", text: "HDG" }),
    FieldLocator.make({ name: "dti", text: "F959 Type 325" }),
  ]);
  const components = Tuple.make(
    Component.make({
      finishId: O.some(entityId("hot-dip-galvanized")),
      id: entityId("rfq-b-bolt"),
      kind: "bolt",
      label: "A490 Type 1 heavy hex bolt",
      standardId: entityId("astm-a490-type-1"),
      strengthClass: "490",
    }),
    Component.make({
      finishId: O.some(entityId("hot-dip-galvanized")),
      id: entityId("rfq-b-dti"),
      kind: "dti",
      label: "F959 Type 325 DTI",
      standardId: entityId("astm-f959-type-325"),
      strengthClass: "325",
    })
  );
  const productVariant = makeProductVariant(components, {
    finishId: entityId("hot-dip-galvanized"),
    id: entityId("rfq-b-a490-heavy-hex"),
    label: "A490 Type 1 heavy hex bolt, 3/4 in x 2-1/2 in",
    standardId: entityId("astm-a490-type-1"),
  });
  const project = Project.make({
    deliveryDate: isoDate("2026-09-20"),
    id: entityId("county-shops-expansion"),
    name: "County Shops Expansion",
  });
  const quoteLine = QuoteLine.make({
    id: entityId("rfq-b-line-b-1"),
    productVariantId: productVariant.id,
    quantity: PosInt.make(860),
    rfqId: entityId("rfq-b"),
  });
  const rfq = RFQ.make({
    id: entityId("rfq-b"),
    missingFields: ["domesticOrigin"],
    projectId: project.id,
    quoteLineIds: [quoteLine.id],
    sourceDocumentIds: [entityId(email.id), entityId(pdf.id)],
  });
  const extractedFields = A.appendAll(emailFields, pdfFields);
  if (!A.isReadonlyArrayNonEmpty(extractedFields)) {
    return yield* FixtureError.make({ stage: "normalize", message: "RFQ B produced no exact extracted fields." });
  }
  return yield* makeNormalizedFixture({
    components,
    extractedFields,
    missingFields: [
      MissingField.make({
        field: "domesticOrigin",
        question: "RFI: Is domestic origin required for RFQ B?",
        rfqId: rfq.id,
      }),
    ],
    productVariant,
    project,
    quoteLine,
    rfq,
    sources: [email, pdf],
  }).pipe(
    Effect.mapError((cause) =>
      FixtureError.make({ cause, stage: "normalize", message: "RFQ B failed the persisted fixture contract." })
    )
  );
});

/**
 * Normalize the two fixed RFQ pairs without inferring either absent required field.
 *
 * **Example** (Build both normalized fixtures)
 *
 * ```ts
 * import { buildNormalizedFixtures } from "@/workflows/Normalize"
 * import * as P from "effect/Predicate"
 *
 * console.log(P.isFunction(buildNormalizedFixtures)) // true
 * ```
 *
 * @category normalization
 * @since 0.0.0
 */
export const buildNormalizedFixtures = Effect.fn("lejeune.fixture.normalize")(function* (
  artifacts: GeneratedFixtureArtifacts
) {
  const [rfqA, rfqB] = yield* Effect.all([normalizeRfqA(artifacts.sources), normalizeRfqB(artifacts.sources)], {
    concurrency: 2,
  });
  return Tuple.make(rfqA, rfqB);
});
