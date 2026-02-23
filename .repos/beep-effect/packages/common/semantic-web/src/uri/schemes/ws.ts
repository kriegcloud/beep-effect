import * as Either from "effect/Either";
import type * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import type { URIComponents, URIOptions, URISchemeHandler } from "../uri.ts";

export interface WSComponents extends URIComponents.Type {
  resourceName?: undefined | string;
  secure?: undefined | boolean;
}

function isSecure(wsComponents: WSComponents): boolean {
  return P.isBoolean(wsComponents.secure)
    ? wsComponents.secure
    : Str.toLowerCase(String(wsComponents.scheme)) === "wss";
}

const handler: URISchemeHandler<WSComponents> = {
  scheme: "ws",

  domainHost: true,

  parse(components: URIComponents.Type, _options: URIOptions): Either.Either<WSComponents, ParseResult.ParseIssue> {
    const secure = isSecure(components);
    const resourceName = `${components.path || "/"}${components.query ? `?${components.query}` : ""}`;
    const wsComponents: WSComponents = {
      ...components,
      secure,
      resourceName,
      path: "",
      query: undefined,
    };
    return Either.right(wsComponents);
  },

  serialize(
    wsComponents: WSComponents,
    _options: URIOptions
  ): Either.Either<URIComponents.Type, ParseResult.ParseIssue> {
    const secure = isSecure(wsComponents);
    const components: WSComponents = { ...wsComponents };

    if (components.port === (secure ? 443 : 80)) {
      components.port = undefined;
    }

    if (P.isBoolean(components.secure)) {
      components.scheme = components.secure ? "wss" : "ws";
      components.secure = undefined;
    }

    if (components.resourceName) {
      const parts = Str.split(components.resourceName, "?");
      const path = parts[0];
      const query = parts[1];
      components.path = path && path !== "/" ? path : "";
      components.query = query;
      components.resourceName = undefined;
    }

    components.fragment = undefined;

    return Either.right(components);
  },
};

export default handler;
