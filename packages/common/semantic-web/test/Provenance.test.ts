import { EvidenceAnchor } from "@beep/semantic-web/evidence";
import { ProvO } from "@beep/semantic-web/prov";
import {
  ExportProvenanceRequest,
  ProjectProvenanceRequest,
  ProvenanceService,
  ProvenanceServiceLive,
  SummarizeProvenanceRequest,
} from "@beep/semantic-web/services/provenance";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const decodeUnknownSync = <Schema extends S.Top>(schema: Schema) =>
  S.decodeUnknownSync(schema as Schema & { readonly DecodingServices: never });

const rawAnchor = {
  id: "https://example.com/evidence/1",
  target: {
    source: "https://example.com/documents/1",
    selector: {
      kind: "text-quote",
      exact: "Alice",
    },
  },
} as const;

const rawBundle = {
  lifecycle: {
    observedAt: "2026-03-08T12:00:00Z",
  },
  records: [
    {
      provType: "Entity",
      id: "thing:alice",
    },
    {
      provType: "Activity",
      id: "activity:ingest",
    },
    {
      provType: "SoftwareAgent",
      id: "agent:semantic-web",
    },
  ],
} as const;

const runProvenance = <A>(effect: Effect.Effect<A, unknown, ProvenanceService>) =>
  Effect.runPromise(effect.pipe(Effect.provide(ProvenanceServiceLive)));

describe("Provenance", () => {
  it("decodes the bounded semantic-web ProvO surface", () => {
    const decoded = decodeUnknownSync(ProvO)(rawBundle);

    expect("records" in decoded).toBe(true);
    if ("records" in decoded) {
      expect(decoded.records).toHaveLength(3);
      expect(O.isSome(decoded.lifecycle)).toBe(true);
    }
  });

  it("rejects bounded projections without evidence anchors when records are present", async () => {
    await expect(
      runProvenance(
        Effect.gen(function* () {
          const service = yield* ProvenanceService;
          return yield* service.project(
            decodeUnknownSync(ProjectProvenanceRequest)({
              bundle: rawBundle,
              anchors: [],
              maxItems: 2,
            })
          );
        })
      )
    ).rejects.toThrow("Bounded provenance projections require explicit evidence anchors.");
  });

  it("summarizes record counts and preserves lifecycle fields in bounded projections", async () => {
    const summary = await runProvenance(
      Effect.gen(function* () {
        const service = yield* ProvenanceService;
        return yield* service.summarize(
          decodeUnknownSync(SummarizeProvenanceRequest)({
            bundle: rawBundle,
            anchors: [rawAnchor],
          })
        );
      })
    );

    expect(summary.recordCount).toBe(3);
    expect(summary.entityCount).toBe(1);
    expect(summary.activityCount).toBe(1);
    expect(summary.agentCount).toBe(1);
    expect(summary.anchorCount).toBe(1);

    const projection = await runProvenance(
      Effect.gen(function* () {
        const service = yield* ProvenanceService;
        return yield* service.project(
          decodeUnknownSync(ProjectProvenanceRequest)({
            bundle: rawBundle,
            anchors: [rawAnchor],
            maxItems: 1,
          })
        );
      })
    );

    expect(projection.truncated).toBe(true);
    expect(projection.bundle.records).toHaveLength(1);
    expect(projection.evidence.anchors).toHaveLength(1);
    expect(O.isSome(projection.bundle.lifecycle)).toBe(true);
  });

  it("rejects extension-tier exports from the core-only profile", async () => {
    await expect(
      runProvenance(
        Effect.gen(function* () {
          const service = yield* ProvenanceService;
          return yield* service.exportBundle(
            decodeUnknownSync(ExportProvenanceRequest)({
              bundle: {
                records: [
                  {
                    provType: "Plan",
                    id: "plan:1",
                  },
                ],
              },
              anchors: [rawAnchor],
              profile: "prov-core-v1",
              maxItems: 5,
            })
          );
        })
      )
    ).rejects.toThrow("prov-core-v1 does not include extension-tier provenance records.");
  });

  it("rejects extension-tier relations from the core-only profile", async () => {
    await expect(
      runProvenance(
        Effect.gen(function* () {
          const service = yield* ProvenanceService;
          return yield* service.exportBundle(
            decodeUnknownSync(ExportProvenanceRequest)({
              bundle: {
                records: [
                  {
                    entity: "thing:alice",
                    agent: "agent:semantic-web",
                  },
                ],
              },
              anchors: [rawAnchor],
              profile: "prov-core-v1",
              maxItems: 5,
            })
          );
        })
      )
    ).rejects.toThrow("prov-core-v1 does not include extension-tier provenance records.");
  });

  it("decodes evidence anchors through the public surface", () => {
    const anchor = decodeUnknownSync(EvidenceAnchor)(rawAnchor);

    expect(anchor.id).toBe("https://example.com/evidence/1");
    expect(anchor.target.source).toBe("https://example.com/documents/1");
  });
});
