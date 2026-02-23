import * as Either from "effect/Either";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as Str from "effect/String";
import type { URIOptions, URISchemeHandler } from "../uri.ts";
import type { URNComponents } from "./urn.ts";

export interface UUIDComponents extends URNComponents {
  uuid?: undefined | string;
}

const UUID = /^[0-9A-Fa-f]{8}(?:-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}$/;

const typeIssue = (ast: AST.AST | undefined, actual: unknown, message: string): ParseResult.ParseIssue =>
  new ParseResult.Type(ast ?? S.String.ast, actual, message);

const handler: URISchemeHandler<UUIDComponents, URIOptions, URNComponents> = {
  scheme: "urn:uuid",

  parse(urnComponents: URNComponents, options: URIOptions, ast): Either.Either<UUIDComponents, ParseResult.ParseIssue> {
    const uuid = urnComponents.nss;
    const uuidComponents: UUIDComponents = { ...urnComponents, uuid, nss: undefined };

    if (!options.tolerant && (!uuid || !UUID.test(uuid))) {
      return Either.left(typeIssue(ast, uuid ?? "", "UUID is not valid."));
    }

    return Either.right(uuidComponents);
  },

  serialize(uuidComponents: UUIDComponents): Either.Either<URNComponents, ParseResult.ParseIssue> {
    const urnComponents: URNComponents = { ...uuidComponents, nss: Str.toLowerCase(uuidComponents.uuid || "") };
    return Either.right(urnComponents);
  },
};

export default handler;
