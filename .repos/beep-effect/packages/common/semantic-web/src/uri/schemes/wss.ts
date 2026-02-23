import type { URISchemeHandler } from "../uri.ts";
import ws from "./ws.ts";

const handler: URISchemeHandler = {
  scheme: "wss",
  domainHost: ws.domainHost,
  parse: ws.parse,
  serialize: ws.serialize,
};

export default handler;
