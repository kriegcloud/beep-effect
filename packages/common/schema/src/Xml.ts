/**
 * XML parsing and schema transforms.
 *
 * @module @beep/schema/Xml
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { Effect, flow, SchemaIssue, SchemaTransformation } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { XMLParser, XMLValidator } from "fast-xml-parser";

const $I = $SchemaId.create("Xml");

const encodeUnsupported = (value: unknown): Effect.Effect<string, SchemaIssue.Issue> =>
  Effect.fail(
    new SchemaIssue.InvalidValue(O.some(value), {
      message: "Encoding unknown values to XML text is not supported by XmlTextToUnknown.",
    })
  );

const makeXmlParser = () =>
  new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseAttributeValue: false,
    parseTagValue: false,
    textNodeName: "text",
    trimValues: true,
  });

const invalidXmlInput = (content: string, message: string): SchemaIssue.InvalidValue =>
  new SchemaIssue.InvalidValue(O.some(content), {
    message,
  });

const decodeXmlUnknown = Effect.fn("Xml.decodeXmlUnknown")(function* (content: string) {
  const validation = XMLValidator.validate(content);

  if (validation !== true) {
    const details = validation.err;

    return yield* Effect.fail(
      invalidXmlInput(content, `Invalid XML input (${details.msg} at ${details.line}:${details.col}).`)
    );
  }

  return yield* Effect.try({
    try: () => makeXmlParser().parse(content),
    catch: (cause) =>
      invalidXmlInput(content, P.isError(cause) ? `Invalid XML input (${cause.message}).` : "Invalid XML input."),
  });
});

/**
 * Effectful schema transformation from XML text to unknown document values.
 *
 * @category Validation
 * @since 0.0.0
 */
export const XmlTextToUnknown = S.String.pipe(
  S.decodeTo(
    S.Unknown,
    SchemaTransformation.transformOrFail({
      decode: decodeXmlUnknown,
      encode: encodeUnsupported,
    })
  ),
  S.annotate(
    $I.annote("XmlTextToUnknown", {
      description: "Schema transformation that parses XML text into unknown values.",
    })
  )
);

/**
 * Decode XML text into a target schema using schema-backed parsing and decoding.
 *
 * @param schema - Target schema to decode parsed XML document into.
 * @returns Decoder function from XML text to the target schema type.
 * @category Utility
 * @since 0.0.0
 */
export const decodeXmlTextAs = <Schema extends S.Top>(schema: Schema) => {
  const decodeXmlUnknownText = S.decodeUnknownEffect(XmlTextToUnknown);
  const decodeTarget = S.decodeUnknownEffect(schema);

  return flow(decodeXmlUnknownText, Effect.flatMap(decodeTarget));
};
