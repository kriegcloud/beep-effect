// Full-schema conformance (W4-b): every document the emitter produces from a
// valid input validates against the whole vendored CycloneDX 1.6 schema, not
// only the derived subset `conformance.test.ts` checks.
//
// Two gaps are pinned rather than hidden. A timestamp is passed through
// verbatim, so an unparseable one emits a document the schema rejects; that is
// deliberate, because `NtiaReport` is where an unusable timestamp is reported.
// An empty `bomRef` is refused at construction, since the schema's `refType`
// has `minLength: 1`.

import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { Component, Contact, ExternalReference, NtiaReport, Sbom, SbomInput, SbomMetadata, Supplier } from "@beep/sbom";
import { assert, describe, it } from "@effect/vitest";
import { assertFalse, assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import { cycloneDxViolations } from "./support/cyclonedx.ts";

const parseJson = S.decodeUnknownResult(S.fromJsonString(S.Unknown));

const emitted = (input: SbomInput.Admitted): unknown => Result.getOrThrow(parseJson(Sbom.toJson(Sbom.generate(input))));

/** A document exercising every field the emitter can produce. */
const full: SbomInput.Admitted = {
  root: Component.make({
    type: "library",
    name: "@acme/kit",
    version: "0.1.0",
    purl: "pkg:npm/%40acme/kit@0.1.0",
    bomRef: "@acme/kit@0.1.0",
    description: "supply-chain artifacts",
    licenses: ["MIT"],
    tags: ["sbom", "cyclonedx"],
    publisher: "Acme",
    copyright: "Copyright 2026 Acme",
    authors: [Contact.make({ name: "Dee", email: "dee@example.com", phone: "+1 555 0100" })],
    externalReferences: [
      ExternalReference.make({ type: "vcs", url: "https://github.com/acme/kit" }),
      ExternalReference.make({ type: "issue-tracker", url: "https://github.com/acme/kit/issues" }),
      ExternalReference.make({ type: "website", url: "https://acme.example" }),
      ExternalReference.make({ type: "documentation", url: "https://acme.example/docs" }),
    ],
  }),
  components: [
    Component.make({ type: "library", name: "dep", version: "1.0.0", licenses: ["MIT OR Apache-2.0"] }),
    Component.make({ type: "framework", name: "named", licenses: ["Proprietary", "MIT"] }),
  ],
  metadata: SbomMetadata.make({
    timestamp: "2026-07-25T00:00:00.000Z",
    authors: [Contact.make({ name: "Ray" })],
    supplier: Supplier.make({ name: "Acme", url: ["https://acme.example"], contact: [Contact.make({ name: "Ops" })] }),
  }),
};

/** Epoch milliseconds from 1970 through 2099, the range a four-digit RFC 3339 year covers. */
const EpochMillis = S.Int.check(S.isGreaterThanOrEqualTo(0), S.isLessThan(4_102_444_800_000));

const sameComponent = S.toEquivalence(Component);

const isComponentsDocument = S.is(S.Struct({ components: S.Array(S.Record(S.String, S.Unknown)) }));

/**
 * A seeded input made valid where the model is deliberately lenient: its
 * timestamp, when it has metadata, is a real RFC 3339 instant, and exact
 * duplicate components are dropped (the schema's top-level `components` is
 * `uniqueItems`; the emitter passes a caller's list through as given).
 */
const validInput = Arbitrary.map(
  Arbitrary.all([Arbitrary.schema(SbomInput), Arbitrary.schema(EpochMillis)]),
  ([input, millis]): SbomInput.Admitted => ({
    ...input,
    components: A.dedupeWith(input.components, sameComponent),
    ...(input.metadata !== undefined && {
      metadata: { ...input.metadata, timestamp: DateTime.formatIso(DateTime.makeUnsafe(millis)) },
    }),
  })
);

describe("CycloneDX 1.6 conformance — the whole vendored schema", () => {
  it("validates the document exercising every emitted field", () => {
    assert.deepStrictEqual(cycloneDxViolations(emitted(full)), []);
  });

  it.effect.prop(
    "validates every document generated from a valid input",
    [validInput],
    ([input]) =>
      Effect.sync(() => {
        assert.deepStrictEqual(cycloneDxViolations(emitted(input)), []);
      }),
    { arbitrary: fcRuns(200) }
  );

  it("the validator is live: a document without a component name fails", () => {
    // The control. A validator that accepts everything would pass the property.
    const document = emitted(full);
    assertTrue(isComponentsDocument(document));
    const broken = { ...document, components: A.map(document.components, ({ name: _name, ...rest }) => rest) };
    assert.include(cycloneDxViolations(broken), "/components/0 required");
  });

  it("pins the timestamp gap: an unparseable timestamp emits an invalid document, and NTIA reports it", () => {
    const input: SbomInput.Admitted = {
      ...full,
      metadata: SbomMetadata.make({ ...full.metadata, timestamp: "last tuesday" }),
    };
    assert.include(cycloneDxViolations(emitted(input)), "/metadata/timestamp format");
    assertFalse(NtiaReport.of(Sbom.generate(input)).compliant);
    assert.include(NtiaReport.of(Sbom.generate(input)).missing, "timestamp");
  });

  it("pins the duplicate gap: exact duplicate components emit an invalid document", () => {
    const dep = Component.make({ type: "library", name: "dep", version: "1.0.0" });
    assert.include(
      cycloneDxViolations(emitted({ root: full.root, components: [dep, dep] })),
      "/components uniqueItems"
    );
  });

  it("refuses an empty bomRef at construction, as the schema's refType does", () => {
    assert.throws(() => Component.make({ type: "library", name: "x", bomRef: "" }));
    assertFalse(S.is(Component)({ type: "library", name: "x", bomRef: "" }));
  });
});
