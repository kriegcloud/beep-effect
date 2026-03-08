/**
 * RFC 3986-oriented URI schemas and normalization helpers.
 *
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { makeSemanticSchemaMetadata } from "./semantic-schema-metadata.ts";

const $I = $SemanticWebId.create("uri");

const SCHEME_PREFIX = /^[A-Za-z][A-Za-z0-9+.-]*:/;
const UNRESERVED = /^[A-Za-z0-9._~-]$/;

const uriReferenceMetadata = makeSemanticSchemaMetadata({
  kind: "identifier",
  canonicalName: "URIReference",
  overview: "RFC 3986 URI reference syntax, including absolute and relative forms.",
  status: "stable",
  specifications: [{ name: "RFC 3986", section: "4.1", disposition: "normative" }],
  equivalenceBasis: "String equality after URI-family normalization when callers opt into normalization helpers.",
  canonicalizationRequired: true,
  representations: [{ kind: "JSON-LD", note: "Used as a transport-oriented identifier companion to IRI values." }],
});

const relativeUriReferenceMetadata = makeSemanticSchemaMetadata({
  kind: "identifier",
  canonicalName: "RelativeURIReference",
  overview: "RFC 3986 relative URI reference syntax.",
  status: "stable",
  specifications: [{ name: "RFC 3986", section: "4.2", disposition: "normative" }],
  equivalenceBasis: "String equality after percent-encoding normalization.",
  canonicalizationRequired: true,
});

const absoluteUriMetadata = makeSemanticSchemaMetadata({
  kind: "identifier",
  canonicalName: "AbsoluteURI",
  overview: "RFC 3986 absolute URI without a fragment component.",
  status: "stable",
  specifications: [{ name: "RFC 3986", section: "4.3", disposition: "normative" }],
  equivalenceBasis: "Scheme-aware normalized string equality.",
  canonicalizationRequired: true,
});

const uriMetadata = makeSemanticSchemaMetadata({
  kind: "identifier",
  canonicalName: "URI",
  overview: "RFC 3986 URI syntax including optional fragment components.",
  status: "stable",
  specifications: [{ name: "RFC 3986", section: "3", disposition: "normative" }],
  equivalenceBasis: "Scheme-aware normalized string equality.",
  canonicalizationRequired: true,
});

const makeReferenceChecks = (
  identifier: string,
  title: string,
  description: string,
  message: string,
  predicate: (value: string) => boolean
) =>
  S.makeFilterGroup(
    [
      S.isTrimmed({
        identifier: $I.create(identifier).make("TrimmedCheck"),
        title: `${title} Trimmed`,
        description: `${description} Values must not contain leading or trailing whitespace.`,
        message: `${title} values must not contain leading or trailing whitespace`,
      }),
      S.makeFilter(predicate, {
        identifier: $I.create(identifier).make("FormatCheck"),
        title,
        description,
        message,
      }),
    ],
    {
      identifier: $I.create(identifier).make("Checks"),
      title,
      description,
    }
  );

const makeNonEmptyReferenceChecks = (
  identifier: string,
  title: string,
  description: string,
  message: string,
  predicate: (value: string) => boolean
) =>
  S.makeFilterGroup(
    [
      S.isNonEmpty({
        identifier: $I.create(identifier).make("NonEmptyCheck"),
        title: `${title} Non Empty`,
        description: `${description} Values must not be empty.`,
        message: `${title} values must not be empty`,
      }),
      S.isTrimmed({
        identifier: $I.create(identifier).make("TrimmedCheck"),
        title: `${title} Trimmed`,
        description: `${description} Values must not contain leading or trailing whitespace.`,
        message: `${title} values must not contain leading or trailing whitespace`,
      }),
      S.makeFilter(predicate, {
        identifier: $I.create(identifier).make("FormatCheck"),
        title,
        description,
        message,
      }),
    ],
    {
      identifier: $I.create(identifier).make("Checks"),
      title,
      description,
    }
  );

const normalizePercentEncoding = (value: string): string =>
  value.replace(/%[0-9a-fA-F]{2}/g, (token) => {
    const decoded = String.fromCharCode(Number.parseInt(token.slice(1), 16));
    return UNRESERVED.test(decoded) ? decoded : token.toUpperCase();
  });

const normalizeAbsoluteUri = (value: string): string => {
  const url = new URL(value);
  const scheme = url.protocol.toLowerCase();
  const host = url.host.toLowerCase();
  const pathname = normalizePercentEncoding(url.pathname);
  const search = normalizePercentEncoding(url.search);
  const hash = normalizePercentEncoding(url.hash);

  if (scheme === "mailto:") {
    return `${scheme}${normalizePercentEncoding(url.pathname)}${search}${hash}`;
  }

  const normalizedHost =
    (scheme === "http:" && host.endsWith(":80")) || (scheme === "https:" && host.endsWith(":443"))
      ? host.replace(/:(80|443)$/, "")
      : host;

  return `${scheme}//${normalizedHost}${pathname}${search}${hash}`;
};

const looksLikeAbsoluteUri = (value: string): boolean => SCHEME_PREFIX.test(value);

const isUriReference = (value: string): boolean => value === "" || URL.canParse(value, "https://example.invalid");

const isRelativeUriReference = (value: string): boolean =>
  value === "" || (isUriReference(value) && !looksLikeAbsoluteUri(value));

const isAbsoluteUri = (value: string): boolean =>
  value.length > 0 && looksLikeAbsoluteUri(value) && URL.canParse(value) && !value.includes("#");

const isUri = (value: string): boolean => value.length > 0 && looksLikeAbsoluteUri(value) && URL.canParse(value);

const uriReferenceChecks = makeReferenceChecks(
  "URIReference",
  "URI Reference",
  "An RFC 3986 URI reference.",
  "Expected a valid RFC 3986 URI reference",
  isUriReference
);

const relativeUriReferenceChecks = makeReferenceChecks(
  "RelativeURIReference",
  "Relative URI Reference",
  "An RFC 3986 relative URI reference.",
  "Expected a valid RFC 3986 relative URI reference",
  isRelativeUriReference
);

const absoluteUriChecks = makeNonEmptyReferenceChecks(
  "AbsoluteURI",
  "Absolute URI",
  "An RFC 3986 absolute URI without a fragment component.",
  "Expected a valid RFC 3986 absolute URI",
  isAbsoluteUri
);

const uriChecks = makeNonEmptyReferenceChecks("URI", "URI", "An RFC 3986 URI.", "Expected a valid RFC 3986 URI", isUri);

/**
 * RFC 3986 `URI-reference` schema, including absolute and relative forms.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const URIReference = S.String.check(uriReferenceChecks).pipe(
  S.brand("URIReference"),
  S.annotate(
    $I.annote("URIReference", {
      description: "RFC 3986 URI reference syntax, including both absolute and relative forms.",
      semanticSchemaMetadata: uriReferenceMetadata,
    })
  )
);

/**
 * Type for {@link URIReference}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type URIReference = typeof URIReference.Type;

/**
 * RFC 3986 `relative-ref` schema.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RelativeURIReference = S.String.check(relativeUriReferenceChecks).pipe(
  S.brand("RelativeURIReference"),
  S.annotate(
    $I.annote("RelativeURIReference", {
      description: "RFC 3986 relative URI reference syntax (`relative-ref`).",
      semanticSchemaMetadata: relativeUriReferenceMetadata,
    })
  )
);

/**
 * Type for {@link RelativeURIReference}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RelativeURIReference = typeof RelativeURIReference.Type;

/**
 * RFC 3986 `absolute-URI` schema without a fragment component.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const AbsoluteURI = S.String.check(absoluteUriChecks).pipe(
  S.brand("AbsoluteURI"),
  S.annotate(
    $I.annote("AbsoluteURI", {
      description: "RFC 3986 absolute URI syntax without a fragment component.",
      semanticSchemaMetadata: absoluteUriMetadata,
    })
  )
);

/**
 * Type for {@link AbsoluteURI}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type AbsoluteURI = typeof AbsoluteURI.Type;

/**
 * RFC 3986 `URI` schema.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const URI = S.String.check(uriChecks).pipe(
  S.brand("URI"),
  S.annotate(
    $I.annote("URI", {
      description: "RFC 3986 URI syntax.",
      semanticSchemaMetadata: uriMetadata,
    })
  )
);

/**
 * Type for {@link URI}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type URI = typeof URI.Type;

/**
 * Normalize a URI or URI reference for transport-oriented comparisons.
 *
 * @param value - URI or URI reference text.
 * @returns Normalized URI text.
 * @since 0.0.0
 * @category Utility
 */
export const normalizeUriReference = (value: URIReference | string): string =>
  looksLikeAbsoluteUri(value) && URL.canParse(value) ? normalizeAbsoluteUri(value) : normalizePercentEncoding(value);

/**
 * Resolve a URI reference against an absolute base URI.
 *
 * @param base - Absolute base URI.
 * @param reference - Relative or absolute URI reference.
 * @returns Resolved absolute URI string.
 * @since 0.0.0
 * @category Utility
 */
export const resolveUriReference = (base: AbsoluteURI | string, reference: URIReference | string): string =>
  normalizeAbsoluteUri(new URL(reference, base).href);

/**
 * Compare two URI values using URI-family normalization rules.
 *
 * @param left - Left URI value.
 * @param right - Right URI value.
 * @returns `true` when both normalized forms are equal.
 * @since 0.0.0
 * @category Utility
 */
export const areUrisEquivalent = (left: URIReference | string, right: URIReference | string): boolean =>
  normalizeUriReference(left) === normalizeUriReference(right);
