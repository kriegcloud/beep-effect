import { Label as CommsLabel } from "@beep/comms-domain/value-objects/mail.values";
import { BS } from "@beep/schema";
import { type IMailLabel, MailLabel } from "@beep/todox/types/mail";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as FC from "effect/FastCheck";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { NextResponse } from "next/server";

// Response schema for labels endpoint
export const LabelsResponse = S.Struct({
  labels: S.Array(MailLabel),
});

// Generate deterministic mock labels using comms-domain Label schema
export const mockCommsLabels = FC.sample(Arbitrary.make(S.Array(CommsLabel)), { seed: 42, numRuns: 1 })[0] ?? [];

// Color mapping for standard mail labels
export class LabelColorFromName extends BS.MappedLiteralKit(
  ["inbox", "#FF5733"],
  ["sent", "#33FF57"],
  ["drafts", "#3357FF"],
  ["spam", "#FF33A1"],
  ["trash", "#33FFF5"],
  ["starred", "#F5FF33"],
  ["important", "#A133FF"]
) {}

export declare namespace LabelColorFromName {
  export type Type = typeof LabelColorFromName.Type;
  export type Encoded = typeof LabelColorFromName.Encoded;
}

// Create realistic labels with predefined names and colors
const realisticLabels: IMailLabel[] = F.pipe(
  LabelColorFromName.From.Options,
  A.map((name, index) => ({
    id: `label-${index + 1}`,
    type: index < 5 ? "system" : "custom",
    name,
    color: LabelColorFromName.DecodedEnum[name] ?? "#000000",
    unreadCount: index < 3 ? Math.floor(Math.random() * 10) : undefined,
  }))
);

export async function GET() {
  return NextResponse.json({ labels: realisticLabels });
}
