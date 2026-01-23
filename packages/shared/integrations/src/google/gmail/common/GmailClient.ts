import { $SharedIntegrationsId } from "@beep/identity/packages";
import type * as Gmail from "@googleapis/gmail";
import * as Context from "effect/Context";

const $I = $SharedIntegrationsId.create("google/gmail/common/GmailClient");

type GmailClientShape = {
  client: Gmail.gmail_v1.Gmail;
};

export class GmailClient extends Context.Tag($I`GmailClient`)<GmailClient, GmailClientShape>() {}
