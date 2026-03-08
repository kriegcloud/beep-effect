/**
 * Local JSON-LD document adapter backing.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, flow, Layer, Match, Order, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { IRIReference } from "../iri.ts";
import {
  type JsonLdContext,
  JsonLdDocument,
  JsonLdLiteralValue,
  JsonLdNodeIdentifier,
  JsonLdNodeObject,
  type JsonLdPropertyValue,
  JsonLdReferenceValue,
} from "../jsonld.ts";
import {
  makeBlankNode,
  makeDataset,
  makeLiteral,
  makeNamedNode,
  makeQuad,
  type ObjectTerm,
  type Quad,
  type Subject,
} from "../rdf.ts";
import {
  JsonLdDocumentError,
  JsonLdDocumentResult,
  JsonLdDocumentService,
  type JsonLdDocumentServiceShape,
  JsonLdToRdfResult,
} from "../services/jsonld-document.ts";
import { RDF_TYPE } from "../vocab/rdf.ts";
import { XSD_BOOLEAN, XSD_DOUBLE, XSD_INTEGER, XSD_STRING } from "../vocab/xsd.ts";

const schemePrefix = /^[A-Za-z][A-Za-z0-9+.-]*:/;

const decodeIriReference = S.decodeUnknownSync(IRIReference);
const decodeJsonLdNodeIdentifier = S.decodeUnknownSync(JsonLdNodeIdentifier);
const isReferenceValue = S.is(JsonLdReferenceValue);

type MutableNode = {
  readonly id: typeof JsonLdNodeIdentifier.Type;
  readonly types: ReadonlyArray<typeof IRIReference.Type>;
  readonly properties: Record<string, ReadonlyArray<JsonLdPropertyValue>>;
};

const byNodeIdentifierAscending: Order.Order<JsonLdNodeObject> = Order.mapInput(Order.String, (node) =>
  O.isSome(node["@id"]) ? node["@id"].value : ""
);

const byMutableNodeIdAscending: Order.Order<MutableNode> = Order.mapInput(Order.String, (node) => node.id);

const bindingIdentifier = (binding: string | { readonly "@id": string }): string =>
  P.isString(binding) ? binding : binding["@id"];

const compactIriReference = (context: ContextOption) => (identifier: string) =>
  decodeIriReference(compactIdentifier(context, identifier));

const compactNodeIdentifier = (context: ContextOption) => (identifier: string) =>
  decodeJsonLdNodeIdentifier(compactIdentifier(context, identifier));

const compactIriReferenceValues = (context: ContextOption) =>
  flow(A.map((value: typeof IRIReference.Type) => compactIriReference(context)(value)));

const makeDocumentError = (
  reason: JsonLdDocumentError["reason"],
  message: string,
  subject?: string
): JsonLdDocumentError =>
  new JsonLdDocumentError({
    reason,
    message,
    subject: subject === undefined ? O.none() : O.some(subject),
  });

type ContextOption = O.Option<JsonLdContext>;

const expandCompactIdentifier = (context: ContextOption, value: string): string => {
  if (
    pipe(value, Str.startsWith("@")) ||
    pipe(value, Str.startsWith("_:")) ||
    schemePrefix.test(value) ||
    O.isNone(context)
  ) {
    return value;
  }

  const currentContext = context.value;
  const expandedCurie = pipe(
    value,
    Str.split(":"),
    A.match({
      onEmpty: O.none,
      onNonEmpty: ([prefix, ...suffix]) =>
        suffix.length === 1
          ? pipe(
              currentContext.terms,
              R.get(prefix),
              O.map((binding) => `${bindingIdentifier(binding)}${suffix[0]}`)
            )
          : O.none(),
    })
  );

  if (O.isSome(expandedCurie)) {
    return expandedCurie.value;
  }

  const directBinding = pipe(currentContext.terms, R.get(value), O.map(bindingIdentifier));
  if (O.isSome(directBinding)) {
    return directBinding.value;
  }

  if (O.isSome(currentContext["@vocab"])) {
    return `${currentContext["@vocab"].value}${value}`;
  }

  if (O.isSome(currentContext["@base"])) {
    return new URL(value, currentContext["@base"].value).href;
  }

  return value;
};

const compactIdentifier = (context: ContextOption, iri: string): string => {
  if (O.isNone(context) || pipe(iri, Str.startsWith("_:"))) {
    return iri;
  }

  const currentContext = context.value;
  const compactedTerm = pipe(
    currentContext.terms,
    R.toEntries,
    A.findFirst(([_, binding]) => {
      const identifier = bindingIdentifier(binding);
      return identifier === iri || pipe(iri, Str.startsWith(identifier));
    }),
    O.map(([term, binding]) => {
      const identifier = bindingIdentifier(binding);
      return identifier === iri ? term : `${term}:${pipe(iri, Str.slice(identifier.length))}`;
    })
  );

  if (O.isSome(compactedTerm)) {
    return compactedTerm.value;
  }

  if (O.isSome(currentContext["@vocab"]) && pipe(iri, Str.startsWith(currentContext["@vocab"].value))) {
    return pipe(iri, Str.slice(currentContext["@vocab"].value.length));
  }

  return iri;
};

const resolveIdentifier = (value: string, base: O.Option<string>): string => {
  if (pipe(value, Str.startsWith("_:")) || schemePrefix.test(value)) {
    return value;
  }

  return O.isSome(base) ? new URL(value, base.value).href : value;
};

const resolveJsonLdIdentifier = (value: string, context: ContextOption, base: O.Option<string>): string =>
  resolveIdentifier(expandCompactIdentifier(context, value), base);

const subjectFromIdentifier = (value: string): Subject =>
  pipe(value, Str.startsWith("_:")) ? makeBlankNode(pipe(value, Str.slice(2))) : makeNamedNode(value);

const objectFromIdentifier = (value: string): ObjectTerm =>
  pipe(value, Str.startsWith("_:")) ? makeBlankNode(pipe(value, Str.slice(2))) : makeNamedNode(value);

const datatypeFromScalar = (value: string | number | boolean): string => {
  return Match.value(value).pipe(
    Match.when(P.isBoolean, () => XSD_BOOLEAN.value),
    Match.when(
      (scalar): scalar is number => P.isNumber(scalar) && Number.isInteger(scalar),
      () => XSD_INTEGER.value
    ),
    Match.when(P.isNumber, () => XSD_DOUBLE.value),
    Match.orElse(() => XSD_STRING.value)
  );
};

const literalLexicalForm = (value: string | number | boolean): string =>
  Match.value(value).pipe(
    Match.when(P.isString, (scalar) => scalar),
    Match.when(P.isBoolean, (scalar) => (scalar ? "true" : "false")),
    Match.orElse((scalar) => `${scalar}`)
  );

const literalFromValue = (value: JsonLdLiteralValue, context: ContextOption, base: O.Option<string>): ObjectTerm => {
  const scalar = value["@value"];
  const datatype = O.isSome(value["@type"])
    ? resolveJsonLdIdentifier(value["@type"].value, context, base)
    : datatypeFromScalar(scalar);
  const language = O.isSome(value["@language"]) ? value["@language"].value : undefined;
  return makeLiteral(literalLexicalForm(scalar), datatype, language);
};

const compactLiteralValue = (value: JsonLdLiteralValue, context: ContextOption): JsonLdLiteralValue =>
  JsonLdLiteralValue.makeUnsafe({
    "@value": value["@value"],
    "@type": pipe(
      value["@type"],
      O.map((identifier) => decodeIriReference(compactIdentifier(context, identifier)))
    ),
    "@language": value["@language"],
  });

const compactPropertyValues = (
  values: ReadonlyArray<JsonLdPropertyValue>,
  context: ContextOption
): Array<JsonLdPropertyValue> =>
  pipe(
    values,
    A.map((value) =>
      isReferenceValue(value)
        ? JsonLdReferenceValue.makeUnsafe({
            "@id": decodeJsonLdNodeIdentifier(compactIdentifier(context, value["@id"])),
          })
        : compactLiteralValue(value, context)
    )
  );

const compactPropertyEntry = (
  key: string,
  values: ReadonlyArray<JsonLdPropertyValue>,
  context: JsonLdContext
): readonly [string, Array<JsonLdPropertyValue>] => [
  compactIdentifier(O.some(context), key),
  compactPropertyValues(values, O.some(context)),
];

const compactNode = (node: JsonLdNodeObject, context: JsonLdContext): JsonLdNodeObject =>
  JsonLdNodeObject.makeUnsafe({
    "@id": pipe(node["@id"], O.map(compactNodeIdentifier(O.some(context)))),
    "@type": pipe(node["@type"], O.map(compactIriReferenceValues(O.some(context)))),
    properties: R.fromEntries(
      pipe(
        node.properties,
        R.toEntries,
        A.map(([key, values]) => compactPropertyEntry(key, values, context))
      )
    ),
  });

const matchesFrameType = (node: JsonLdNodeObject, frameType: string, context: ContextOption): boolean =>
  pipe(
    node["@type"],
    O.exists(flow(A.some((value) => value === frameType || compactIdentifier(context, value) === frameType)))
  );

const filterNodeProperties = (node: JsonLdNodeObject, allowed: ReadonlyArray<string>): JsonLdNodeObject =>
  JsonLdNodeObject.makeUnsafe({
    "@id": node["@id"],
    "@type": node["@type"],
    properties: R.fromEntries(
      pipe(
        node.properties,
        R.toEntries,
        A.filter(([key]) => pipe(allowed, A.contains(key)))
      )
    ),
  });

const ensureNamedNodeIdentifier = (
  value: string,
  reason: JsonLdDocumentError["reason"]
): Effect.Effect<string, JsonLdDocumentError> =>
  pipe(value, Str.startsWith("_:"))
    ? Effect.fail(
        makeDocumentError(reason, "Blank node identifiers are outside the bounded JSON-LD document surface.", value)
      )
    : Effect.succeed(value);

const emptyPropertyValues: ReadonlyArray<JsonLdPropertyValue> = [];

const makeMutableNode = (identifier: string): MutableNode => ({
  id: decodeJsonLdNodeIdentifier(identifier),
  types: [],
  properties: {},
});

const getMutableNode = (nodes: Record<string, MutableNode>, identifier: string): MutableNode =>
  pipe(
    nodes,
    R.get(identifier),
    O.getOrElse(() => makeMutableNode(identifier))
  );

const appendMutableNodeType = (node: MutableNode, value: string): MutableNode => ({
  ...node,
  types: pipe(node.types, A.append(decodeIriReference(value))),
});

const appendMutableNodePropertyValue = (
  node: MutableNode,
  propertyKey: string,
  value: JsonLdPropertyValue
): MutableNode => ({
  ...node,
  properties: R.set(
    node.properties,
    propertyKey,
    pipe(
      node.properties,
      R.get(propertyKey),
      O.getOrElse(() => emptyPropertyValues),
      A.append(value)
    )
  ),
});

const identifierFromSubject = (subject: Subject): string =>
  subject.termType === "BlankNode" ? `_:${subject.value}` : subject.value;

const identifierFromObject = (object: Extract<ObjectTerm, { readonly termType: "NamedNode" | "BlankNode" }>): string =>
  object.termType === "BlankNode" ? `_:${object.value}` : object.value;

const literalValueFromRdf = (quad: Quad, context: ContextOption): JsonLdLiteralValue => {
  if (quad.object.termType !== "Literal") {
    return JsonLdLiteralValue.makeUnsafe({
      "@value": "",
      "@type": O.none(),
      "@language": O.none(),
    });
  }

  const scalar =
    quad.object.datatype.value === XSD_BOOLEAN.value
      ? quad.object.value === "true"
      : quad.object.datatype.value === XSD_INTEGER.value || quad.object.datatype.value === XSD_DOUBLE.value
        ? Number(quad.object.value)
        : quad.object.value;

  return JsonLdLiteralValue.makeUnsafe({
    "@value": scalar,
    "@type":
      quad.object.datatype.value === XSD_STRING.value
        ? O.none()
        : O.some(decodeIriReference(compactIdentifier(context, quad.object.datatype.value))),
    "@language": O.isSome(quad.object.language) ? O.some(quad.object.language.value) : O.none(),
  });
};

/**
 * JSON-LD document service live layer.
 *
 * @since 0.0.0
 * @category Layers
 */
export const JsonLdDocumentServiceLive = Layer.succeed(
  JsonLdDocumentService,
  JsonLdDocumentService.of({
    compact: Effect.fn((request) =>
      Effect.succeed(
        JsonLdDocumentResult.makeUnsafe({
          document: JsonLdDocument.makeUnsafe({
            "@context": O.some(request.context),
            "@graph": pipe(
              request.document["@graph"],
              A.map((node) => compactNode(node, request.context))
            ),
          }),
        })
      )
    ),
    flatten: Effect.fn((request) =>
      Effect.succeed(
        JsonLdDocumentResult.makeUnsafe({
          document: JsonLdDocument.makeUnsafe({
            "@context": request.document["@context"],
            "@graph": A.sort(request.document["@graph"], byNodeIdentifierAscending),
          }),
        })
      )
    ),
    frame: Effect.fn((request) =>
      Effect.succeed(
        JsonLdDocumentResult.makeUnsafe({
          document: JsonLdDocument.makeUnsafe({
            "@context": request.document["@context"],
            "@graph": pipe(
              request.document["@graph"],
              A.filter(
                (node) =>
                  O.isNone(request.frame["@type"]) ||
                  matchesFrameType(node, request.frame["@type"].value, request.document["@context"])
              ),
              A.map((node) =>
                O.isSome(request.frame.includeProperties)
                  ? filterNodeProperties(node, request.frame.includeProperties.value)
                  : node
              )
            ),
          }),
        })
      )
    ),
    toRdf: Effect.fn(function* (request) {
      const context = request.document["@context"];
      const base = O.isSome(context) ? context.value["@base"] : O.none<string>();
      const quads: Array<Quad> = [];
      let anonymousNodeIndex = 0;

      for (const node of request.document["@graph"]) {
        const subject = O.isSome(node["@id"])
          ? subjectFromIdentifier(resolveJsonLdIdentifier(node["@id"].value, context, base))
          : makeBlankNode(`b${anonymousNodeIndex}`);

        anonymousNodeIndex += 1;

        if (O.isSome(node["@type"])) {
          for (const typeValue of node["@type"].value) {
            const typeIri = yield* ensureNamedNodeIdentifier(
              resolveJsonLdIdentifier(typeValue, context, base),
              "invalidNodeReference"
            );
            quads.push(makeQuad(subject, RDF_TYPE, makeNamedNode(typeIri)));
          }
        }

        for (const [key, values] of R.toEntries(node.properties)) {
          const predicateIri = resolveJsonLdIdentifier(key, context, base);
          if (!schemePrefix.test(predicateIri)) {
            return yield* makeDocumentError("unknownPredicate", `Unable to expand JSON-LD property key: ${key}`, key);
          }

          const predicate = makeNamedNode(predicateIri);

          for (const value of values) {
            if (isReferenceValue(value)) {
              const objectIdentifier = resolveJsonLdIdentifier(value["@id"], context, base);
              quads.push(makeQuad(subject, predicate, objectFromIdentifier(objectIdentifier)));
            } else {
              quads.push(makeQuad(subject, predicate, literalFromValue(value, context, base)));
            }
          }
        }
      }

      return JsonLdToRdfResult.makeUnsafe({
        dataset: makeDataset(quads),
      });
    }),
    fromRdf: Effect.fn(function* (request) {
      let nodes: Record<string, MutableNode> = {};

      for (const quad of request.dataset.quads) {
        const subjectIdentifier = identifierFromSubject(quad.subject);
        const node = getMutableNode(nodes, subjectIdentifier);

        if (quad.predicate.value === RDF_TYPE.value) {
          if (quad.object.termType !== "NamedNode") {
            return yield* makeDocumentError(
              "bridgingFailure",
              "rdf:type objects must be named nodes when bridging to JSON-LD.",
              quad.predicate.value
            );
          }

          nodes = R.set(nodes, subjectIdentifier, appendMutableNodeType(node, quad.object.value));
          continue;
        }

        const propertyKey = compactIdentifier(request.context, quad.predicate.value);

        if (quad.object.termType === "NamedNode") {
          nodes = R.set(
            nodes,
            subjectIdentifier,
            appendMutableNodePropertyValue(
              node,
              propertyKey,
              JsonLdReferenceValue.makeUnsafe({
                "@id": decodeJsonLdNodeIdentifier(
                  compactIdentifier(request.context, identifierFromObject(quad.object))
                ),
              })
            )
          );
        } else if (quad.object.termType === "BlankNode") {
          nodes = R.set(
            nodes,
            subjectIdentifier,
            appendMutableNodePropertyValue(
              node,
              propertyKey,
              JsonLdReferenceValue.makeUnsafe({
                "@id": decodeJsonLdNodeIdentifier(
                  compactIdentifier(request.context, identifierFromObject(quad.object))
                ),
              })
            )
          );
        } else {
          nodes = R.set(
            nodes,
            subjectIdentifier,
            appendMutableNodePropertyValue(node, propertyKey, literalValueFromRdf(quad, request.context))
          );
        }
      }

      const graph = pipe(
        nodes,
        R.values,
        A.sort(byMutableNodeIdAscending),
        A.map((node) =>
          JsonLdNodeObject.makeUnsafe({
            "@id": O.some(decodeJsonLdNodeIdentifier(compactIdentifier(request.context, node.id))),
            "@type": pipe(
              node.types,
              A.match({
                onEmpty: O.none,
                onNonEmpty: flow(compactIriReferenceValues(request.context), O.some),
              })
            ),
            properties: node.properties,
          })
        )
      );

      return JsonLdDocumentResult.makeUnsafe({
        document: JsonLdDocument.makeUnsafe({
          "@context": request.context,
          "@graph": graph,
        }),
      });
    }),
  } satisfies JsonLdDocumentServiceShape)
);
