import * as Either from "effect/Either";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as Str from "effect/String";
import type { URIComponents, URIOptions, URISchemeHandler } from "../uri.ts";
import { SCHEMES } from "../uri.ts";

export interface URNComponents extends URIComponents.Type {
  nid?: undefined | string;
  nss?: undefined | string;
}

export interface URNOptions extends URIOptions {
  nid?: undefined | string;
}

const URN_PARSE = /^([^:]+):(.*)/;

const typeIssue = (ast: AST.AST | undefined, actual: unknown, message: string): ParseResult.ParseIssue =>
  new ParseResult.Type(ast ?? S.String.ast, actual, message);

const handler: URISchemeHandler<URNComponents, URNOptions> = {
  scheme: "urn",

  parse(
    components: URIComponents.Type,
    options: URNOptions,
    ast
  ): Either.Either<URNComponents, ParseResult.ParseIssue> {
    const matchesOpt = components.path ? Str.match(URN_PARSE)(components.path) : O.none();
    let urnComponents: URNComponents = { ...components };

    if (O.isSome(matchesOpt)) {
      const matches = matchesOpt.value;
      const scheme = options.scheme || urnComponents.scheme || "urn";
      const nid = Str.toLowerCase(matches[1] || "");
      const nss = matches[2];
      const urnScheme = `${scheme}:${options.nid || nid}`;
      const schemeHandler = SCHEMES[urnScheme];

      urnComponents = {
        ...urnComponents,
        nid,
        nss,
        path: "",
      };

      if (schemeHandler) {
        const r = schemeHandler.parse(urnComponents, options, ast);
        if (r._tag === "Left") return r;
        urnComponents = { ...urnComponents, ...r.right };
      }
    } else {
      return Either.left(typeIssue(ast, components.path ?? "", "URN can not be parsed."));
    }

    return Either.right(urnComponents);
  },

  serialize(
    urnComponents: URNComponents,
    options: URNOptions,
    ast
  ): Either.Either<URIComponents.Type, ParseResult.ParseIssue> {
    const scheme = options.scheme || urnComponents.scheme || "urn";
    const nid = urnComponents.nid;
    const urnScheme = `${scheme}:${options.nid || nid}`;
    const schemeHandler = SCHEMES[urnScheme];

    if (schemeHandler) {
      const r = schemeHandler.serialize(urnComponents, options, ast);
      if (r._tag === "Left") return r;
      urnComponents = { ...urnComponents, ...r.right };
    }

    const nss = urnComponents.nss;
    const uriComponents: URIComponents.Type = {
      ...urnComponents,
      path: `${nid || options.nid}:${nss}`,
    };

    return Either.right(uriComponents);
  },
};

export default handler;
