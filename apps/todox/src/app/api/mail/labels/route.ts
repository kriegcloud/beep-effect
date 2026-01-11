import { BS } from "@beep/schema";
import { MailLabel } from "@beep/todox/types/mail";
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

// Generate deterministic mock labels
export const mockLabels = FC.sample(Arbitrary.make(S.Array(MailLabel)), { seed: 42, numRuns: 1 })[0] ?? [];

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

// Add some realistic label names
const realisticLabels = F.pipe(
  LabelColorFromName.From.Options,
  A.map((name, index) => ({
    id: `label-${index + 1}`,
    type: index < 5 ? "system" : "custom",
    name,
    // TS2538: Type bigint cannot be used as an index type.
    // TS2538: Type false cannot be used as an index type.
    // TS2538: Type null cannot be used as an index type.
    // TS2538: Type true cannot be used as an index type.
    color: LabelColorFromName.DecodedEnum[name] ?? "#000000",
    unreadCount: index < 3 ? Math.floor(Math.random() * 10) : undefined,
  }))
);

export async function GET() {
  return NextResponse.json({ labels: realisticLabels });
}
