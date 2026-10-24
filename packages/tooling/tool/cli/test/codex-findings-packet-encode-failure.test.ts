import {
  CodexFindingRecord,
  CodexPacketPlan,
  CodexTriageLedgerEncoder,
  renderPacketDocuments,
} from "@beep/repo-cli/test/Codex";
import { A, Str } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

// The triage ledger is built from an already-validated plan, so its encode can
// only fail if the codec itself fails. Swapping the renderer's encoder for one
// whose codec rejects every value is the sole way to reach the ingest-error
// mapping the renderer wraps the encode in.
const rejectEveryLedger = S.encodeUnknownEffect(S.Never);

const planWith = (records: ReadonlyArray<CodexFindingRecord>) =>
  CodexPacketPlan.make({
    slug: "codex-security-findings-2026-08-06",
    branch: "security/codex-findings-2026-08-06",
    capturedAt: "2026-08-06",
    repository: "kriegcloud/beep-effect",
    sourceUrl: "https://chatgpt.com/codex/cloud/security/findings/",
    findingsView: "repo-scoped, status=open",
    expectedCount: A.length(records),
    records,
    severityCounts: { Medium: A.length(records) },
  });

describe("codex findings packet rendering", () => {
  it.effect("maps a failing triage-ledger encode onto a payload-invalid ingest error", () =>
    Effect.gen(function* () {
      const plan = planWith([
        CodexFindingRecord.make({
          id: "CSF-001",
          codexId: Str.padStart(32, "0")("1"),
          title: "Synthetic finding 1",
          severity: "Medium",
          codexStatus: "New",
          commit: Str.padStart(40, "a")("1"),
        }),
      ]);

      const error = yield* renderPacketDocuments({ plan, rawPayloadJson: '{"findings":[]}\n' }).pipe(
        Effect.flip,
        Effect.provideService(CodexTriageLedgerEncoder, rejectEveryLedger)
      );

      expect(error.reason).toBe("payload-invalid");
      expect(error.message).toBe("The generated ops/triage.json ledger could not be encoded.");
    })
  );
});
