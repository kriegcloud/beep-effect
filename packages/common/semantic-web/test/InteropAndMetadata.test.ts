import * as WebAnnotationAdapters from "@beep/semantic-web/adapters/web-annotation";
import * as EvidenceModule from "@beep/semantic-web/evidence";
import { EvidenceAnchor } from "@beep/semantic-web/evidence";
import * as JsonLdModule from "@beep/semantic-web/jsonld";
import * as ProvModule from "@beep/semantic-web/prov";
import { getSemanticSchemaMetadata } from "@beep/semantic-web/semantic-schema-metadata";
import * as CanonicalizationServiceModule from "@beep/semantic-web/services/canonicalization";
import * as JsonLdDocumentServiceModule from "@beep/semantic-web/services/jsonld-document";
import * as JsonLdStreamParseServiceModule from "@beep/semantic-web/services/jsonld-stream-parse";
import * as JsonLdStreamSerializeServiceModule from "@beep/semantic-web/services/jsonld-stream-serialize";
import * as ShaclValidationServiceModule from "@beep/semantic-web/services/shacl-validation";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

const decodeUnknownSync = <Schema extends S.Top>(schema: Schema) =>
  S.decodeUnknownSync(schema as Schema & { readonly DecodingServices: never });

const auditModules = [
  {
    name: "jsonld",
    exports: JsonLdModule,
    exclude: new Set(["JsonLdKeyword", "JsonLdPropertyValue", "JsonLdScalar"]),
  },
  {
    name: "evidence",
    exports: EvidenceModule,
    exclude: new Set(["EvidenceSelector", "EvidenceSelectorKind"]),
  },
  {
    name: "prov",
    exports: ProvModule,
    exclude: new Set(["ProvO", "ProvRecord"]),
  },
  {
    name: "services/jsonld-document",
    exports: JsonLdDocumentServiceModule,
    exclude: new Set(["JsonLdDocumentErrorReason", "JsonLdDocumentNormalizationProfile"]),
  },
  {
    name: "services/canonicalization",
    exports: CanonicalizationServiceModule,
    exclude: new Set(["CanonicalizationAlgorithm"]),
  },
  {
    name: "services/shacl-validation",
    exports: ShaclValidationServiceModule,
    exclude: new Set(["ShaclSeverity"]),
  },
  {
    name: "services/jsonld-stream-parse",
    exports: JsonLdStreamParseServiceModule,
    exclude: new Set(["JsonLdStreamMode", "JsonLdStreamParseErrorReason", "JsonLdStreamParseInput"]),
  },
  {
    name: "services/jsonld-stream-serialize",
    exports: JsonLdStreamSerializeServiceModule,
    exclude: new Set(["JsonLdStreamSerializeErrorReason"]),
  },
  {
    name: "adapters/web-annotation",
    exports: WebAnnotationAdapters,
    exclude: new Set(["WebAnnotationSelector"]),
  },
] as const;

describe("Interop and Metadata", () => {
  it("round-trips EvidenceAnchor values through Web Annotation mappers", () => {
    const anchor = decodeUnknownSync(EvidenceAnchor)({
      id: "https://example.com/annotations/position-1",
      note: "Selected code span",
      target: {
        source: "https://example.com/documents/1",
        selector: {
          kind: "text-position",
          start: 2,
          end: 8,
        },
      },
    });

    const annotation = WebAnnotationAdapters.evidenceAnchorToWebAnnotation(anchor);
    expect(annotation.type).toBe("Annotation");
    expect(annotation.bodyValue).toEqual(anchor.note);
    expect(annotation.target.selector.type).toBe("TextPositionSelector");

    const roundTripped = WebAnnotationAdapters.webAnnotationToEvidenceAnchor(annotation);
    expect(roundTripped.note).toEqual(anchor.note);
    expect(roundTripped.target.source).toBe(anchor.target.source);
    expect(roundTripped.target.selector).toEqual(anchor.target.selector);
  });

  it("audits semantic schema metadata coverage for public schema families", () => {
    for (const moduleAudit of auditModules) {
      const schemaEntries = Object.entries(moduleAudit.exports).filter(
        ([name, value]) => /^[A-Z]/.test(name) && S.isSchema(value) && !moduleAudit.exclude.has(name)
      );

      expect(schemaEntries.length, moduleAudit.name).toBeGreaterThan(0);

      for (const [name, schema] of schemaEntries) {
        const metadata = getSemanticSchemaMetadata(schema);
        expect(metadata, `${moduleAudit.name}.${name}`).toBeDefined();
        expect(metadata?.canonicalName, `${moduleAudit.name}.${name}`).toBe(name);
      }
    }
  });
});
