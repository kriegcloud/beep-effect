import * as Either from "effect/Either";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as Str from "effect/String";
import type { URIComponents, URIOptions, URISchemeHandler } from "../uri.ts";

const typeIssue = (ast: AST.AST | undefined, actual: unknown, message: string): ParseResult.ParseIssue =>
  new ParseResult.Type(ast ?? S.String.ast, actual, message);

const handler: URISchemeHandler = {
  scheme: "http",

  domainHost: true,

  parse(
    components: URIComponents.Type,
    _options: URIOptions,
    ast
  ): Either.Either<URIComponents.Type, ParseResult.ParseIssue> {
    return components.host
      ? Either.right(components)
      : Either.left(typeIssue(ast, components, "HTTP URIs must have a host."));
  },

  serialize(
    components: URIComponents.Type,
    _options: URIOptions
  ): Either.Either<URIComponents.Type, ParseResult.ParseIssue> {
    const secure = Str.toLowerCase(String(components.scheme)) === "https";

    if (components.port === (secure ? 443 : 80)) {
      components.port = undefined;
    }

    if (!components.path) {
      components.path = "/";
    }

    return Either.right(components);
  },
};

export default handler;
