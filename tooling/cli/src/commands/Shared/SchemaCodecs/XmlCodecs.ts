/**
 * Service-backed XML schema codecs.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { Effect, flow, Layer, SchemaIssue, SchemaTransformation, ServiceMap } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { XMLParser, XMLValidator } from "fast-xml-parser";

const $I = $RepoCliId.create("commands/Shared/SchemaCodecs/XmlCodecs");

const encodeUnsupported = (value: unknown): Effect.Effect<string, SchemaIssue.Issue> =>
  Effect.fail(
    new SchemaIssue.InvalidValue(O.some(value), {
      message: "Encoding unknown values to XML text is not supported by XmlTextToUnknown.",
    })
  );

/**
 * Service contract for XML parsing.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type XmlCodecServiceShape = {
  readonly parseUnknown: (content: string) => Effect.Effect<unknown, SchemaIssue.Issue>;
};

/**
 * Service tag for XML parsing.
 *
 * @category PortContract
 * @since 0.0.0
 */
export class XmlCodecService extends ServiceMap.Service<XmlCodecService, XmlCodecServiceShape>()($I`XmlCodecService`) {}

const makeXmlParser = () =>
  new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseAttributeValue: false,
    parseTagValue: false,
    textNodeName: "text",
    trimValues: true,
  });

const parseUnknown: XmlCodecServiceShape["parseUnknown"] = Effect.fn(function* (content: string) {
  const validation = XMLValidator.validate(content);

  if (validation !== true) {
    const details = validation.err;
    return yield* Effect.fail(
      new SchemaIssue.InvalidValue(O.some(content), {
        message: `Invalid XML input (${details.msg} at ${details.line}:${details.col}).`,
      })
    );
  }

  return yield* Effect.try({
    try: () => makeXmlParser().parse(content),
    catch: (cause) =>
      new SchemaIssue.InvalidValue(O.some(content), {
        message: `Invalid XML input (${String(cause)}).`,
      }),
  });
});

/**
 * Live XML codec service layer.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const XmlCodecServiceLive = Layer.succeed(
  XmlCodecService,
  XmlCodecService.of({
    parseUnknown,
  })
);

/**
 * Effectful schema transformation from XML text to unknown document values.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const XmlTextToUnknown = S.String.pipe(
  S.decodeTo(
    S.Unknown,
    SchemaTransformation.transformOrFail({
      decode: (content) => XmlCodecService.use((service) => service.parseUnknown(content)),
      encode: encodeUnsupported,
    })
  ),
  S.annotate(
    $I.annote("XmlTextToUnknown", {
      description: "Service-backed schema transformation that parses XML text into unknown values.",
    })
  )
);

/**
 * Decode XML text into a target schema using effectful parsing and schema decoding.
 *
 * @param schema - Target schema to decode parsed XML document into.
 * @returns Decoder function from XML text to the target schema type.
 * @category Utility
 * @since 0.0.0
 */
export const decodeXmlTextAs = <Schema extends S.Top>(schema: Schema) => {
  const decodeXmlUnknown = S.decodeUnknownEffect(XmlTextToUnknown);
  const decodeTarget = S.decodeUnknownEffect(schema);
  return flow(decodeXmlUnknown, Effect.flatMap(decodeTarget));
};
