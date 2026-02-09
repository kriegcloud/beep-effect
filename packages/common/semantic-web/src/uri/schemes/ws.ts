import * as P from "effect/Predicate";
import * as Str from "effect/String";
import type { URIComponents, URIOptions, URISchemeHandler } from "../uri.ts";

export interface WSComponents extends URIComponents {
  resourceName?: undefined | string;
  secure?: undefined | boolean;
}

function isSecure(wsComponents: WSComponents): boolean {
  return P.isBoolean(wsComponents.secure)
    ? wsComponents.secure
    : Str.toLowerCase(String(wsComponents.scheme)) === "wss";
}

const handler: URISchemeHandler = {
  scheme: "ws",

  domainHost: true,

  parse(components: URIComponents, _options: URIOptions): WSComponents {
    const wsComponents = components as WSComponents;

    wsComponents.secure = isSecure(wsComponents);

    wsComponents.resourceName =
      `${wsComponents.path || "/"}${wsComponents.query ? `?${wsComponents.query}` : ""}`;
    wsComponents.path = undefined;
    wsComponents.query = undefined;

    return wsComponents;
  },

  serialize(wsComponents: WSComponents, _options: URIOptions): URIComponents {
    if (wsComponents.port === (isSecure(wsComponents) ? 443 : 80) || wsComponents.port === "") {
      wsComponents.port = undefined;
    }

    if (P.isBoolean(wsComponents.secure)) {
      wsComponents.scheme = wsComponents.secure ? "wss" : "ws";
      wsComponents.secure = undefined;
    }

    if (wsComponents.resourceName) {
      const parts = Str.split(wsComponents.resourceName, "?");
      const path = parts[0];
      const query = parts[1];
      wsComponents.path = path && path !== "/" ? path : undefined;
      wsComponents.query = query;
      wsComponents.resourceName = undefined;
    }

    wsComponents.fragment = undefined;

    return wsComponents;
  },
};

export default handler;
