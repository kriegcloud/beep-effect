/**
 * HTTP method literal type kit.
 *
 * @module
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import { HashSet } from "effect";
import * as S from "effect/Schema";
import { LiteralKit } from "../../LiteralKit.ts";
import * as SchemaUtils from "../../SchemaUtils/index.ts";

const $I = $SchemaId.create("http/HttpMethod/HttpMethod");

/**
 * @since 0.0.0
 */
export const HttpMethod_ = LiteralKit(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "TRACE"]);

const NoBodyBase = LiteralKit(HttpMethod_.pickOptions(["GET", "HEAD", "OPTIONS", "TRACE"]));

const NoBody = NoBodyBase.pipe(
  $I.annoteSchema("NoBody", {
    description: "HTTP method literal type for methods that do not have a body.",
  }),
  SchemaUtils.withLiteralKitStatics(NoBodyBase)
);

type NoBody = typeof NoBody.Type;

const WithBodyBase = LiteralKit(HttpMethod_.omitOptions(NoBody.Options));

const WithBody = WithBodyBase.pipe(
  $I.annoteSchema("WithBody", {
    description: "HTTP method literal type for methods that have a body.",
  }),
  SchemaUtils.withLiteralKitStatics(WithBodyBase)
);

type WithBody = typeof WithBody.Type;
type HttpMethodValue = typeof HttpMethod_.Type;
const hasBody: (method: HttpMethodValue) => method is WithBody = S.is(WithBody);

/**
 * @since 0.0.0
 */
export const HttpMethod = HttpMethod_.pipe(
  $I.annoteSchema("HttpMethod", {
    description: "HTTP method literal type.",
  }),
  SchemaUtils.withLiteralKitStatics(HttpMethod_),
  SchemaUtils.withStatics(
    () =>
      ({
        hasBody,
        all: HashSet.fromIterable(HttpMethod_.Options),
        allShort: [
          ["GET", "get"],
          ["POST", "post"],
          ["PUT", "put"],
          ["DELETE", "del"],
          ["PATCH", "patch"],
          ["HEAD", "head"],
          ["OPTIONS", "options"],
          ["TRACE", "trace"],
        ] as const,
        NoBody,
        WithBody,
      }) as const
  )
);

/**
 * @since 0.0.0
 */
export type HttpMethod = typeof HttpMethod.Type;
