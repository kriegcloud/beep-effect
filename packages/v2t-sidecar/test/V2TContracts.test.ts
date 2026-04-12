import { describe, expect, it } from "@effect/vitest";
import { NonEmptyTrimmedStr, NonNegativeInt, UUID } from "@beep/schema";
import { DateTime } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  CompleteVt2CaptureInput,
  CreateVt2SessionInput,
  defaultVt2DesktopPreferences,
  defaultVt2WorkspaceSeams,
  ResolveVt2RecoveryCandidateInput,
  RunVt2CompositionInput,
  Vt2CaptureSegment,
  Vt2CompositionProfile,
  Vt2CompositionRun,
  Vt2MemoryContextPacket,
  Vt2RecoveryCandidate,
  Vt2Session,
  Vt2SessionResource,
  Vt2Transcript,
  Vt2TranscriptRuntime,
  type Vt2SessionSource,
} from "../src/index.ts";

const makeUtc = (value: number): DateTime.Utc => DateTime.toUtc(DateTime.makeUnsafe(value));
const decodeCreateSessionInput = S.decodeUnknownSync(CreateVt2SessionInput);
const decodeCompleteCaptureInput = S.decodeUnknownSync(CompleteVt2CaptureInput);
const decodeResolveRecoveryCandidateInput = S.decodeUnknownSync(ResolveVt2RecoveryCandidateInput);
const decodeRunCompositionInput = S.decodeUnknownSync(RunVt2CompositionInput);

describe("@beep/v2t-sidecar first-slice contracts", () => {
  it("accepts both record and import session sources through the shared input contract", () => {
    const sources = ["record", "import"] as const satisfies ReadonlyArray<Vt2SessionSource>;
    const decoded = A.map(sources, (source) =>
      decodeCreateSessionInput({
        source,
        title: source === "record" ? "Recorded conversation" : "Imported conversation",
      }).source
    );

    expect(decoded).toEqual(["record", "import"]);
  });

  it("keeps desktop defaults separate from project artifacts and provider seams explicit", () => {
    const preferences = defaultVt2DesktopPreferences();
    const seams = defaultVt2WorkspaceSeams();

    expect(preferences.preferredSessionSource).toBe("record");
    expect(O.isNone(preferences.workspaceDirectory)).toBe(true);
    expect(seams.transcriptProvider).toBe("local");
    expect(seams.memoryProvider).toBe("local");
    expect(seams.compositionProvider).toBe("local");
    expect(seams.exportProvider).toBe("local");
  });

  it("accepts a native capture-complete payload and explicit recovery resolution without widening the contract", () => {
    const complete = decodeCompleteCaptureInput({
      durationMs: 9_500,
      artifactPath: "/tmp/v2t/segment-1.json",
      interrupted: true,
      interruptionReason: "Simulated interruption from the native shell",
    });
    const resolution = decodeResolveRecoveryCandidateInput({
      disposition: "recover",
    });

    expect(complete.interrupted).toBe(true);
    expect(
      O.match(complete.interruptionReason, {
        onNone: () => null,
        onSome: (value) => value,
      })
    ).toBe("Simulated interruption from the native shell");
    expect(resolution.disposition).toBe("recover");
  });

  it("accepts a composition-run payload that keeps export formats and destination explicit", () => {
    const run = decodeRunCompositionInput({
      profileId: "550e8400-e29b-41d4-a716-446655440010",
      targetFormats: ["markdown", "json"],
      destinationDirectory: "/tmp/v2t-exports",
    });

    expect(run.targetFormats).toEqual(["markdown", "json"]);
    expect(
      O.match(run.destinationDirectory, {
        onNone: () => null,
        onSome: (value) => value,
      })
    ).toBe("/tmp/v2t-exports");
  });

  it("keeps transcript bodies, failure detail, and runtime health explicit in the shared contracts", () => {
    const sessionId = UUID.make("550e8400-e29b-41d4-a716-446655440020");
    const transcript = new Vt2Transcript({
      sessionId,
      status: "ready",
      text: O.some(NonEmptyTrimmedStr.make("Hello from the full transcript artifact.")),
      excerpt: O.some(NonEmptyTrimmedStr.make("Hello from the full transcript artifact.")),
      language: O.some(NonEmptyTrimmedStr.make("en")),
      wordCount: NonNegativeInt.make(6),
      failureReason: O.none(),
    });
    const runtime = new Vt2TranscriptRuntime({
      status: "ready",
      providerMode: "local",
      commandSource: "system",
      resolvedCommand: NonEmptyTrimmedStr.make("python3"),
      whisperModel: NonEmptyTrimmedStr.make("tiny.en"),
      detail: NonEmptyTrimmedStr.make("System Whisper runtime will use python3 from PATH."),
    });

    expect(O.getOrNull(transcript.text)).toBe("Hello from the full transcript artifact.");
    expect(O.getOrNull(transcript.failureReason)).toBeNull();
    expect(runtime.commandSource).toBe("system");
    expect(runtime.status).toBe("ready");
  });

  it("models recovery-ready session resources without reopening the record or import contract", () => {
    const sessionId = UUID.make("550e8400-e29b-41d4-a716-446655440000");
    const segmentId = UUID.make("550e8400-e29b-41d4-a716-446655440001");
    const profileId = UUID.make("550e8400-e29b-41d4-a716-446655440002");
    const capturedAt = makeUtc(1_706_000_000_000);

    const resource = new Vt2SessionResource({
      session: new Vt2Session({
        id: sessionId,
        projectId: O.none(),
        source: "import",
        status: "recoverable",
        title: NonEmptyTrimmedStr.make("Imported conversation"),
        workingDirectory: O.none(),
        createdAt: capturedAt,
        updatedAt: capturedAt,
        transcriptStatus: "pending",
        captureSegmentCount: NonNegativeInt.make(1),
        recoveryCandidateCount: NonNegativeInt.make(1),
        exportArtifactCount: NonNegativeInt.make(0),
      }),
      transcript: new Vt2Transcript({
        sessionId,
        status: "pending",
        text: O.none(),
        excerpt: O.none(),
        language: O.none(),
        wordCount: NonNegativeInt.make(0),
        failureReason: O.none(),
      }),
      captureSegments: A.make(
        new Vt2CaptureSegment({
          id: segmentId,
          sessionId,
          status: "recoverable",
          sequence: NonNegativeInt.make(0),
          durationMs: NonNegativeInt.make(12_000),
          artifactPath: O.none(),
          persistedAt: O.some(capturedAt),
        })
      ),
      recoveryCandidates: A.make(
        new Vt2RecoveryCandidate({
          id: UUID.make("550e8400-e29b-41d4-a716-446655440003"),
          sessionId,
          segmentId,
          reason: NonEmptyTrimmedStr.make("Unexpected shutdown while importing media"),
          disposition: "recover",
          discoveredAt: capturedAt,
        })
      ),
      memoryContextPackets: A.make(
        new Vt2MemoryContextPacket({
          id: UUID.make("550e8400-e29b-41d4-a716-446655440004"),
          sessionId,
          providerLabel: NonEmptyTrimmedStr.make("local-graphiti-seam"),
          query: NonEmptyTrimmedStr.make("Memory context for Imported conversation"),
          references: [NonEmptyTrimmedStr.make("Transcript status: pending")],
          createdAt: capturedAt,
        })
      ),
      compositionProfiles: A.make(
        new Vt2CompositionProfile({
          id: profileId,
          label: NonEmptyTrimmedStr.make("Default local-first profile"),
          includeMemoryContext: true,
          preferredProviderMode: "local",
          aspectRatio: NonEmptyTrimmedStr.make("16:9"),
          outputTone: NonEmptyTrimmedStr.make("clear and grounded"),
        })
      ),
      compositionRuns: A.make(
        new Vt2CompositionRun({
          id: UUID.make("550e8400-e29b-41d4-a716-446655440005"),
          sessionId,
          profileId,
          status: "exported",
          packet: {
            sessionId,
            source: "import",
            transcriptExcerpt: O.some(NonEmptyTrimmedStr.make("Imported transcript excerpt")),
            includeMemoryContext: true,
            targetFormats: ["markdown"],
          },
          memoryContextPacketId: O.some(UUID.make("550e8400-e29b-41d4-a716-446655440004")),
          exportArtifactIds: [UUID.make("550e8400-e29b-41d4-a716-446655440006")],
          createdAt: capturedAt,
        })
      ),
      exportArtifacts: A.empty(),
    });

    expect(resource.session.source).toBe("import");
    expect(A.length(resource.captureSegments)).toBe(1);
    expect(A.length(resource.recoveryCandidates)).toBe(1);
    expect(A.length(resource.memoryContextPackets)).toBe(1);
    expect(A.length(resource.compositionRuns)).toBe(1);
    expect(resource.recoveryCandidates[0]?.disposition).toBe("recover");
  });
});
