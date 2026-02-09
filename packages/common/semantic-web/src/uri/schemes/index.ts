import { SCHEMES } from "../uri.ts";

import http from "./http.ts";
SCHEMES[http.scheme] = http;

import https from "./https.ts";
SCHEMES[https.scheme] = https;

import ws from "./ws.ts";
SCHEMES[ws.scheme] = ws;

import wss from "./wss.ts";
SCHEMES[wss.scheme] = wss;

import mailto from "./mailto.ts";
SCHEMES[mailto.scheme] = mailto;

import urn from "./urn.ts";
SCHEMES[urn.scheme] = urn;

import uuid from "./urn-uuid.ts";
SCHEMES[uuid.scheme] = uuid;

export type { WSComponents } from "./ws.ts";
export type { MailtoHeaders, MailtoComponents } from "./mailto.ts";
export type { URNComponents, URNOptions } from "./urn.ts";
export type { UUIDComponents } from "./urn-uuid.ts";
