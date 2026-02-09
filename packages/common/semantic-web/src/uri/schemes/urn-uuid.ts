import * as Str from "effect/String";
import type { URIOptions, URISchemeHandler } from "../uri.ts";
import type { URNComponents } from "./urn.ts";

export interface UUIDComponents extends URNComponents {
  uuid?: undefined | string;
}

const UUID = /^[0-9A-Fa-f]{8}(?:-[0-9A-Fa-f]{4}){3}-[0-9A-Fa-f]{12}$/;

const handler: URISchemeHandler<UUIDComponents, URIOptions, URNComponents> = {
  scheme: "urn:uuid",

  parse(urnComponents: URNComponents, options: URIOptions): UUIDComponents {
    const uuidComponents = urnComponents as UUIDComponents;
    uuidComponents.uuid = uuidComponents.nss;
    uuidComponents.nss = undefined;

    if (!options.tolerant && (!uuidComponents.uuid || !UUID.test(uuidComponents.uuid))) {
      uuidComponents.error = uuidComponents.error || "UUID is not valid.";
    }

    return uuidComponents;
  },

  serialize(uuidComponents: UUIDComponents, _options: URIOptions): URNComponents {
    const urnComponents = uuidComponents as URNComponents;
    urnComponents.nss = Str.toLowerCase(uuidComponents.uuid || "");
    return urnComponents;
  },
};

export default handler;
