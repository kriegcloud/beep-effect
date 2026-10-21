/**
 * Schema boundary for the committed source hashes and exact expected spans.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LejeuneBoltWorkbenchId } from "@beep/identity/packages";
import { LiteralKit, Sha256Hex } from "@beep/schema";
import * as A from "effect/Array";
import { identity } from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { CanonicalNormalizedFixtures, ExtractedField } from "@/domain/Bundle";

const $I = $LejeuneBoltWorkbenchId.create("fixtures/FixtureManifest");

const FrozenFixtureSourceId = LiteralKit([
  "rfq-a-outlook-body",
  "rfq-a-xlsx-takeoff",
  "rfq-b-prose-email",
  "rfq-b-pdf-schedule",
]).pipe(
  $I.annoteSchema("FrozenFixtureSourceId", {
    description: "The exact four source identities authorized by fixture-manifest contract v1.",
  })
);

/**
 * One frozen source identity and content hash.
 *
 * **Example** (Inspect the digest field)
 *
 * ```ts
 * import { FrozenSourceHash } from "@/fixtures/FixtureManifest"
 *
 * console.log(FrozenSourceHash.fields.sha256 !== undefined)
 * ```
 *
 * @category fixtures
 * @since 0.0.0
 */
export class FrozenSourceHash extends S.Opaque<FrozenSourceHash, { readonly brand: unique symbol }>()(
  S.Struct({ id: FrozenFixtureSourceId, sha256: Sha256Hex }).pipe(
    $I.annoteSchema("FrozenSourceHash", {
      description: "A committed source identifier and deterministic SHA-256 digest.",
    })
  )
) {}

const CanonicalFixtureSources = A.flatMap(CanonicalNormalizedFixtures, (fixture) => fixture.sources);
const CanonicalFixtureExtractions = A.flatMap(CanonicalNormalizedFixtures, (fixture) => fixture.extractedFields);
const extractedFieldEquivalence = S.toEquivalence(ExtractedField);

const FrozenFixtureManifestFields = S.Struct({
  extractedFields: S.Tuple([
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
    ExtractedField,
  ]),
  missingFields: S.Tuple([S.Literal("rfq-a|certificationRequirement"), S.Literal("rfq-b|domesticOrigin")]),
  schemaVersion: S.tag("lejeune-fixture-manifest/v1"),
  sources: S.Tuple([FrozenSourceHash, FrozenSourceHash, FrozenSourceHash, FrozenSourceHash]),
});

type FrozenFixtureManifestFields = typeof FrozenFixtureManifestFields.Type;

const manifestSourceHashesAreExact = (manifest: FrozenFixtureManifestFields): boolean =>
  A.every(
    A.zip(manifest.sources, CanonicalFixtureSources),
    ([actual, expected]) => Str.Equivalence(actual.id, expected.id) && Str.Equivalence(actual.sha256, expected.sha256)
  );

const manifestExtractionsAreExact = (manifest: FrozenFixtureManifestFields): boolean =>
  A.every(A.zip(manifest.extractedFields, CanonicalFixtureExtractions), ([actual, expected]) =>
    extractedFieldEquivalence(actual, expected)
  );

const FrozenFixtureManifestChecks = S.makeFilterGroup(
  [
    S.makeFilter(manifestSourceHashesAreExact, {
      identifier: $I`FrozenFixtureManifestSourceHashCheck`,
      title: "Frozen Fixture Manifest Source Hashes",
      description: "Requires the exact ordered source identities and SHA-256 digests frozen by manifest v1.",
      message: "Fixture manifest source identities and hashes must match the committed v1 corpus.",
    }),
    S.makeFilter(manifestExtractionsAreExact, {
      identifier: $I`FrozenFixtureManifestExtractionCheck`,
      title: "Frozen Fixture Manifest Extractions",
      description: "Requires the exact ordered extraction identity graph and self-consistent anchored values.",
      message: "Fixture manifest extraction identities and anchored values must match contract v1.",
    }),
  ],
  {
    identifier: $I`FrozenFixtureManifestChecks`,
    title: "Frozen Fixture Manifest",
    description: "Closes every source, digest, extraction, and missing-field identity in fixture-manifest v1.",
  }
);

/**
 * Committed fixture hash, exact-span, and missing-field manifest.
 *
 * **Example** (Inspect the extraction collection)
 *
 * ```ts
 * import { FrozenFixtureManifest } from "@/fixtures/FixtureManifest"
 *
 * console.log(FrozenFixtureManifest.fields.extractedFields !== undefined) // true
 * ```
 *
 * @category fixtures
 * @since 0.0.0
 */
export class FrozenFixtureManifest extends S.Opaque<FrozenFixtureManifest, { readonly brand: unique symbol }>()(
  FrozenFixtureManifestFields.mapFields(identity)
    .check(FrozenFixtureManifestChecks)
    .pipe(
      $I.annoteSchema("FrozenFixtureManifest", {
        description: "The committed acceptance oracle for fixture bytes, exact spans, and deliberate unknowns.",
      })
    )
) {}
