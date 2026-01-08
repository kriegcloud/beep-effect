import { MailLabel } from "@beep/mock/_mail";
import * as Arbitrary from "effect/Arbitrary";
import * as FC from "effect/FastCheck";
import * as S from "effect/Schema";
import { NextResponse } from "next/server";

// Response schema for labels endpoint
export const LabelsResponse = S.Struct({
  labels: S.Array(MailLabel),
});

// Generate deterministic mock labels
export const mockLabels = FC.sample(Arbitrary.make(S.Array(MailLabel)), { seed: 42, numRuns: 1 })[0] ?? [];

// Add some realistic label names
const labelNames = ["inbox", "sent", "drafts", "spam", "trash", "starred", "important"];
const labelColors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#33FFF5", "#F5FF33", "#A133FF"];

const realisticLabels = labelNames.map((name, index) => ({
  id: `label-${index + 1}`,
  type: index < 5 ? "system" : "custom",
  name,
  color: labelColors[index] ?? "#000000",
  unreadCount: index < 3 ? Math.floor(Math.random() * 10) : undefined,
}));

export async function GET() {
  return NextResponse.json({ labels: realisticLabels });
}
