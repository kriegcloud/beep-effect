import * as Str from "effect/String";
import type { URIComponents, URIOptions, URISchemeHandler } from "../uri.ts";

const handler: URISchemeHandler = {
  scheme: "http",

  domainHost: true,

  parse(components: URIComponents, _options: URIOptions): URIComponents {
    if (!components.host) {
      components.error = components.error || "HTTP URIs must have a host.";
    }
    return components;
  },

  serialize(components: URIComponents, _options: URIOptions): URIComponents {
    const secure = Str.toLowerCase(String(components.scheme)) === "https";

    if (components.port === (secure ? 443 : 80) || components.port === "") {
      components.port = undefined;
    }

    if (!components.path) {
      components.path = "/";
    }

    return components;
  },
};

export default handler;
