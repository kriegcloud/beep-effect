import { provideScopedLayer } from "@beep/test-utils";
import { normalizeUsptoApplicationNumber, normalizeUsptoPatentNumber, Uspto, UsptoConfigInput } from "@beep/uspto";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Redacted } from "effect";
import * as O from "effect/Option";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";

const applicationEnvelope = JSON.stringify({
  count: 1,
  patentFileWrapperDataBag: [
    {
      applicationMetaData: {
        applicationStatusDescriptionText: "Patented Case",
        filingDate: "2018-09-21",
        firstApplicantName: "Precision Widgets LLC",
        firstInventorName: "Ada Lovelace",
        grantDate: "2020-09-15",
        inventionTitle: "Adjustable widget assembly",
        patentNumber: "10772255",
      },
      applicationNumberText: "16138242",
    },
  ],
});

const continuityEnvelope = JSON.stringify({
  patentFileWrapperDataBag: [
    {
      childContinuityBag: [{ childApplicationNumberText: "17999999" }],
      parentContinuityBag: [{ parentApplicationNumberText: "15111111" }],
    },
  ],
});

const documentsEnvelope = JSON.stringify({
  documentBag: [
    {
      documentCode: "SPEC",
      documentCodeDescriptionText: "Specification",
      documentIdentifier: "DOC123",
      downloadOptionBag: [{ downloadUrl: "https://api.uspto.gov/docs/DOC123.pdf", mimeTypeIdentifier: "PDF" }],
      officialDate: "2018-09-21",
    },
    { documentCode: "IDS" },
  ],
});

const respondWith = (body: string, status = 200, seenUrls?: Array<string>): Layer.Layer<HttpClient.HttpClient> =>
  Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request) =>
      Effect.sync(() => {
        seenUrls?.push(request.url);
        return HttpClientResponse.fromWeb(
          request,
          new Response(body, { headers: { "content-type": "application/json" }, status })
        );
      })
    )
  );

const usptoLayer = (http: Layer.Layer<HttpClient.HttpClient>): Layer.Layer<Uspto> =>
  Uspto.makeLayer(UsptoConfigInput.make({ apiKey: Redacted.make("test-key") })).pipe(Layer.provide(http));

describe("Uspto service", () => {
  it.effect("resolves application metadata from a file wrapper envelope", () =>
    Effect.gen(function* () {
      const seenUrls: Array<string> = [];
      const uspto = yield* Uspto;
      const metadata = yield* uspto.getApplication("16138242");

      expect(metadata.applicationNumberText).toBe("16138242");
      expect(metadata.inventionTitle).toBe("Adjustable widget assembly");
      expect(metadata.patentNumber).toBe("10772255");
      expect(metadata.firstApplicantName).toBe("Precision Widgets LLC");
      expect(seenUrls).toHaveLength(0);
    }).pipe(provideScopedLayer(usptoLayer(respondWith(applicationEnvelope))))
  );

  it.effect("sends the application request to the open data portal path", () =>
    Effect.gen(function* () {
      const seenUrls: Array<string> = [];
      const layer = usptoLayer(respondWith(applicationEnvelope, 200, seenUrls));
      yield* Uspto.pipe(
        Effect.flatMap((uspto) => uspto.getApplication("16138242")),
        provideScopedLayer(layer)
      );
      expect(seenUrls).toStrictEqual(["https://api.uspto.gov/api/v1/patent/applications/16138242"]);
    })
  );

  it.effect("maps 404 responses to not-found", () =>
    Effect.gen(function* () {
      const uspto = yield* Uspto;
      const error = yield* uspto.getApplication("99999999").pipe(Effect.flip);
      expect(error.reason).toBe("not-found");
    }).pipe(provideScopedLayer(usptoLayer(respondWith("{}", 404))))
  );

  it.effect("maps 429 responses to rate-limited", () =>
    Effect.gen(function* () {
      const uspto = yield* Uspto;
      const error = yield* uspto.getApplication("16138242").pipe(Effect.flip);
      expect(error.reason).toBe("rate-limited");
    }).pipe(provideScopedLayer(usptoLayer(respondWith("{}", 429))))
  );

  it.effect("extracts continuity parents and children", () =>
    Effect.gen(function* () {
      const uspto = yield* Uspto;
      const continuity = yield* uspto.getContinuity("16138242");
      expect(continuity.parentApplicationNumbers).toStrictEqual(["15111111"]);
      expect(continuity.childApplicationNumbers).toStrictEqual(["17999999"]);
    }).pipe(provideScopedLayer(usptoLayer(respondWith(continuityEnvelope))))
  );

  it.effect("extracts document references with download urls and skips id-less rows", () =>
    Effect.gen(function* () {
      const uspto = yield* Uspto;
      const documents = yield* uspto.getDocuments("16138242");
      expect(documents).toHaveLength(1);
      expect(documents[0]?.documentIdentifier).toBe("DOC123");
      expect(documents[0]?.downloadUrl).toBe("https://api.uspto.gov/docs/DOC123.pdf");
    }).pipe(provideScopedLayer(usptoLayer(respondWith(documentsEnvelope))))
  );

  it.effect("searches applications and projects each wrapper", () =>
    Effect.gen(function* () {
      const uspto = yield* Uspto;
      const results = yield* uspto.searchApplications('applicationMetaData.patentNumber:"10772255"');
      expect(results).toHaveLength(1);
      expect(results[0]?.patentNumber).toBe("10772255");
    }).pipe(provideScopedLayer(usptoLayer(respondWith(applicationEnvelope))))
  );
});

describe("Uspto identifier normalization", () => {
  it("normalizes application numbers", () => {
    expect(normalizeUsptoApplicationNumber("16/138,242")).toStrictEqual(O.some("16138242"));
    expect(normalizeUsptoApplicationNumber("16-138-242")).toStrictEqual(O.some("16138242"));
    expect(O.isNone(normalizeUsptoApplicationNumber("12345"))).toBe(true);
    expect(O.isNone(normalizeUsptoApplicationNumber("not a number"))).toBe(true);
  });

  it("normalizes patent numbers", () => {
    expect(normalizeUsptoPatentNumber("US 10,772,255 B2")).toStrictEqual(O.some("10772255"));
    expect(normalizeUsptoPatentNumber("10772255")).toStrictEqual(O.some("10772255"));
    expect(normalizeUsptoPatentNumber("RE46,604")).toStrictEqual(O.some("RE46604"));
    expect(O.isNone(normalizeUsptoPatentNumber("ABC"))).toBe(true);
  });
});
