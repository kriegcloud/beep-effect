/**
 * Server adapter of the `UsptoClaims` port over the `@beep/uspto` driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { normalizePatentClaims } from "@beep/law-practice-domain/values/PatentDocument";
import {
  UsptoClaimSet,
  UsptoClaimSource,
  UsptoClaims,
  UsptoClaimsError,
} from "@beep/law-practice-use-cases/ClaimSelfCheck";
import { decodeXmlTextAs } from "@beep/schema/Xml";
import { Uspto } from "@beep/uspto";
import * as O from "@beep/utils/Option";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Order from "effect/Order";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { UsptoClaimsFailureReason } from "@beep/law-practice-use-cases/ClaimSelfCheck";
import type { UsptoDocumentReference, UsptoError, UsptoShape } from "@beep/uspto";

type ApplicationSource = Extract<UsptoClaimSource, { readonly kind: "application" }>;

const CLAIMS_DOCUMENT_CODE = "CLM";

// A `<claim>` element (not `<claims>` or `<claim-text>`), its attributes and its markup.
const claimElementPattern = /<claim(?=[\s>])([^>]*)>([\s\S]*?)<\/claim>/gu;
const claimNumberAttributePattern = /\bnum="([0-9]+)"/u;
const claimTextTagPattern = /<\/?claim-text\b[^>]*>/gu;
const anyTagPattern = /<[^>]*>/gu;
const leadingClaimNumberPattern = /^\s*[0-9]+\s*\.\s*/u;

// The flattened claim text is wrapped in one element so the shared XML decoder resolves its entities.
const decodeClaimText = decodeXmlTextAs(S.Struct({ "claim-text": S.String }));

const portError =
  (reason: UsptoClaimsFailureReason) =>
  (message: string): UsptoClaimsError =>
    UsptoClaimsError.make({ message, reason });

const fromDriver = (error: UsptoError): UsptoClaimsError =>
  portError(error.reason === "not-found" ? "not-found" : "unavailable")(
    `The USPTO request failed with ${error.reason}.`
  );

const latestFirst = Order.flip(
  Order.combine(
    Order.mapInput(Order.String, ({ officialDate }: UsptoDocumentReference) => officialDate ?? ""),
    Order.mapInput(Order.String, ({ documentIdentifier }: UsptoDocumentReference) => documentIdentifier)
  )
);

// The named claims document, or the latest one by official date.
const claimsDocumentOf = (
  documents: ReadonlyArray<UsptoDocumentReference>,
  documentIdentifier: O.Option<string>
): O.Option<UsptoDocumentReference> => {
  const claimsDocuments = A.filter(documents, ({ documentCode }) => documentCode === CLAIMS_DOCUMENT_CODE);
  return O.match(documentIdentifier, {
    onNone: () => A.head(A.sort(claimsDocuments, latestFirst)),
    onSome: (identifier) => A.findFirst(claimsDocuments, (document) => document.documentIdentifier === identifier),
  });
};

const utf8Text = (bytes: Uint8Array): Effect.Effect<string, UsptoClaimsError> =>
  Effect.try({
    try: () => new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    catch: () =>
      portError("no-full-text-claims")("The claims document is not UTF-8 text, so it has no full-text claims."),
  });

// Nested `<claim-text>` boundaries become spaces; inline markup such as `<claim-ref>` is dropped.
const numberedClaim = Effect.fnUntraced(function* ([
  ,
  attributes = "",
  markup = "",
]: RegExpMatchArray): Effect.fn.Return<readonly [claimNumber: string, claimText: string], UsptoClaimsError> {
  const claimNumber = yield* Effect.fromOption(
    O.flatMap(Str.match(claimNumberAttributePattern)(attributes), A.get(1)),
    () => portError("malformed-claims")("A claim element has no numeric num attribute.")
  );
  const flattened = pipe(markup, Str.replace(claimTextTagPattern, " "), Str.replace(anyTagPattern, ""));
  const decoded = yield* decodeClaimText(`<claim-text>${flattened}</claim-text>`).pipe(
    Effect.mapError(() => portError("malformed-claims")(`Claim ${claimNumber} is not well-formed XML text.`))
  );
  return [claimNumber, Str.replace(leadingClaimNumberPattern, "")(decoded["claim-text"])];
});

const claimsFromXml = Effect.fn("UsptoClaims.claimsFromXml")(function* (xml: string) {
  const numbered = yield* Effect.forEach(A.fromIterable(Str.matchAll(claimElementPattern)(xml)), numberedClaim);
  if (A.isReadonlyArrayEmpty(numbered)) {
    return yield* portError("no-full-text-claims")(
      "The claims document has no XML claim elements; OCR text is not read."
    );
  }
  return yield* normalizePatentClaims(numbered).pipe(
    Effect.mapError((error) => portError("malformed-claims")(`The full-text claims do not normalize: ${error.message}`))
  );
});

const applicationClaims = Effect.fn("UsptoClaims.applicationClaims")(function* (
  uspto: UsptoShape,
  source: ApplicationSource
): Effect.fn.Return<UsptoClaimSet, UsptoClaimsError> {
  const documents = yield* uspto.getDocuments(source.applicationNumber).pipe(Effect.mapError(fromDriver));
  const document = yield* Effect.fromOption(
    claimsDocumentOf(documents, O.fromUndefinedOr(source.documentIdentifier)),
    () => portError("not-found")(`Application ${source.applicationNumber} has no matching claims document.`)
  );
  const downloadUrl = yield* Effect.fromOption(O.fromUndefinedOr(document.downloadUrl), () =>
    portError("no-full-text-claims")(`Claims document ${document.documentIdentifier} has no download.`)
  );
  const bytes = yield* uspto.downloadDocument(downloadUrl).pipe(Effect.mapError(fromDriver));
  const claims = yield* claimsFromXml(yield* utf8Text(bytes));
  return UsptoClaimSet.make({ claims, documentIdentifier: document.documentIdentifier, source });
});

/**
 * `UsptoClaims` adapter over the `@beep/uspto` file-wrapper document listing and download.
 *
 * **Details**
 *
 * - `application`: lists the file wrapper's documents, takes the `CLM`
 *   document named by `documentIdentifier` (or, without one, the latest by
 *   official date), downloads it, and reads its `<claim num>` elements.
 *   Nested `<claim-text>` boundaries become spaces and inline markup is
 *   dropped; the texts then go through the domain claim normalizer.
 * - `publication`: not supported yet and fails with `unavailable`; reading
 *   published claims from ppubs or the bulk XML is the follow-up.
 *
 * A download that is not UTF-8 or has no XML claim elements fails with
 * `no-full-text-claims`: OCR text is never read or repaired. Claims that do
 * not normalize fail with `malformed-claims`. Driver failures become
 * `not-found` for a missing record and `unavailable` otherwise.
 *
 * **Gotchas**
 *
 * The driver keeps only the first download option of a document, without its
 * MIME type. When a `CLM` document lists a PDF before its XML, the adapter
 * reads the PDF and fails with `no-full-text-claims`.
 *
 * **Example** (Provide the adapter over the driver)
 *
 * ```ts
 * import { UsptoClaimsLive } from "@beep/law-practice-server/UsptoClaims"
 * import { Uspto } from "@beep/uspto"
 * import * as Layer from "effect/Layer"
 *
 * const layer = UsptoClaimsLive.pipe(Layer.provide(Uspto.layer))
 * console.log(Layer.isLayer(layer)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const UsptoClaimsLive: Layer.Layer<UsptoClaims, never, Uspto> = Layer.effect(
  UsptoClaims,
  Effect.map(Uspto, (uspto) =>
    UsptoClaims.of({
      claims: Effect.fn("UsptoClaims.claims")((source: UsptoClaimSource) =>
        UsptoClaimSource.match(source, {
          application: (application) => applicationClaims(uspto, application),
          publication: ({ publicationNumber }) =>
            Effect.fail(
              portError("unavailable")(
                `Claims of publication ${publicationNumber} are not supported yet; ppubs or bulk XML is the follow-up.`
              )
            ),
        })
      ),
    })
  )
);
