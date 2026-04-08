/**
 * Local JSON-LD context adapter backing.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, Layer, Order } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { IRIReference } from "../iri.ts";
import { JsonLdContext } from "../jsonld.ts";
import {
  CompactJsonLdIriResult,
  ExpandJsonLdTermResult,
  JsonLdContextError,
  JsonLdContextService,
  type JsonLdContextServiceShape,
} from "../services/jsonld-context.ts";

const schemePrefix = /^[A-Za-z][A-Za-z0-9+.-]*:/;

const decodeIriReference = S.decodeUnknownSync(IRIReference);
const decodeNonEmptyString = S.decodeUnknownSync(S.NonEmptyString);

const byTermAscending: Order.Order<readonly [string, string | { readonly "@id": string }]> = Order.mapInput(
  Order.String,
  ([term]) => term
);

const makeContextError = (
  reason: JsonLdContextError["reason"],
  message: string,
  subject?: string
): JsonLdContextError =>
  new JsonLdContextError({
    reason,
    message,
    subject: subject === undefined ? O.none() : O.some(subject),
  });

const bindingIdentifier = (binding: string | { readonly "@id": string }): string =>
  typeof binding === "string" ? binding : binding["@id"];

const mergeContextTerms = (left: JsonLdContext["terms"], right: JsonLdContext["terms"]) =>
  R.fromEntries([...R.toEntries(left), ...R.toEntries(right)]);

const expandCompactIdentifier = (context: JsonLdContext, value: string): string => {
  if (value.startsWith("@") || schemePrefix.test(value)) {
    return value;
  }

  const curieParts = value.split(":");
  if (curieParts.length === 2) {
    const [prefix, suffix] = curieParts;
    const prefixBinding = context.terms[prefix];
    if (prefixBinding !== undefined) {
      return `${bindingIdentifier(prefixBinding)}${suffix}`;
    }
  }

  const directBinding = context.terms[value];
  if (directBinding !== undefined) {
    return bindingIdentifier(directBinding);
  }

  if (O.isSome(context["@vocab"])) {
    return `${context["@vocab"].value}${value}`;
  }

  if (O.isSome(context["@base"])) {
    return new URL(value, context["@base"].value).href;
  }

  return value;
};

const compactIdentifier = (context: JsonLdContext, iri: string): string => {
  for (const [term, binding] of R.toEntries(context.terms)) {
    const identifier = bindingIdentifier(binding);
    if (identifier === iri) {
      return term;
    }
    if (iri.startsWith(identifier)) {
      return `${term}:${iri.slice(identifier.length)}`;
    }
  }

  if (O.isSome(context["@vocab"]) && iri.startsWith(context["@vocab"].value)) {
    return iri.slice(context["@vocab"].value.length);
  }

  return iri;
};

/**
 * JSON-LD context service live layer.
 *
 * @since 0.0.0
 * @category Layers
 */
export const JsonLdContextServiceLive = Layer.succeed(
  JsonLdContextService,
  JsonLdContextService.of({
    normalize: Effect.fn((request) =>
      Effect.succeed(
        JsonLdContext.make({
          "@base": request.context["@base"],
          "@vocab": request.context["@vocab"],
          terms: R.fromEntries(A.sort(R.toEntries(request.context.terms), byTermAscending)),
        })
      )
    ),
    expandTerm: Effect.fn(function* (request) {
      const iri = expandCompactIdentifier(request.context, request.term);
      if (!schemePrefix.test(iri)) {
        return yield* makeContextError("unknownTerm", `Unable to expand JSON-LD term: ${request.term}`, request.term);
      }

      return ExpandJsonLdTermResult.make({
        term: request.term,
        iri: decodeIriReference(iri),
      });
    }),
    compactIri: Effect.fn(function* (request) {
      const term = compactIdentifier(request.context, request.iri);
      if (term === request.iri) {
        return yield* makeContextError(
          "compactionFailure",
          `Unable to compact JSON-LD IRI: ${request.iri}`,
          request.iri
        );
      }

      return CompactJsonLdIriResult.make({
        iri: request.iri,
        term: decodeNonEmptyString(term),
      });
    }),
    merge: Effect.fn((request) =>
      Effect.succeed(
        JsonLdContext.make({
          "@base": O.isSome(request.right["@base"]) ? request.right["@base"] : request.left["@base"],
          "@vocab": O.isSome(request.right["@vocab"]) ? request.right["@vocab"] : request.left["@vocab"],
          terms: mergeContextTerms(request.left.terms, request.right.terms),
        })
      )
    ),
  } satisfies JsonLdContextServiceShape)
);
