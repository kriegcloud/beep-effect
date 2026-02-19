import type { URISchemeHandler } from "../uri.ts";
import http from "./http.ts";

const handler: URISchemeHandler = {
  scheme: "https",
  domainHost: http.domainHost,
  parse: http.parse,
  serialize: http.serialize,
};

export default handler;
