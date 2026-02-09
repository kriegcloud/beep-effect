import { Entities, type Rpc } from "@beep/knowledge-domain";
import type { MeetingPrep } from "@beep/knowledge-domain/rpc/MeetingPrep";
import { MeetingPrepBulletRepo, MeetingPrepEvidenceRepo, RelationEvidenceRepo } from "@beep/knowledge-server/db";
import { KnowledgeEntityIds, Policy } from "@beep/shared-domain";
import * as SqlClient from "@effect/sql/SqlClient";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

const DISCLAIMER =
  "Meeting prep is informational and evidence-backed. It is not investment, tax, or legal advice; verify details against the cited sources.";

const bulletTextFromRelation = (re: Entities.RelationEvidence.Model): string => {
  // Keep copy compliance-safe and avoid guarantees/advice language (D-17).
  return `Evidence-backed relationship: relation ${re.relationId} is supported by the cited source span.`;
};

export const Handler = Effect.fn("meetingprep_generate")(function* (payload: MeetingPrep.Generate.Payload) {
  const { session } = yield* Policy.AuthContext;
  if (session.activeOrganizationId !== payload.organizationId) {
    return { meetingPrepId: "", bullets: [], disclaimer: DISCLAIMER };
  }

  return yield* Effect.gen(function* () {
    const organizationId = payload.organizationId;
    const maxBullets = payload.maxBullets ?? 5;

    const relationEvidenceRepo = yield* RelationEvidenceRepo;
    const bulletRepo = yield* MeetingPrepBulletRepo;
    const evidenceRepo = yield* MeetingPrepEvidenceRepo;
    const sql = yield* SqlClient.SqlClient;

    // Deterministic selection rule: search by snippet text first, fall back to newest evidence.
    const matching = yield* relationEvidenceRepo.searchByText(payload.query, organizationId, maxBullets);
    const chosen = A.isEmptyReadonlyArray(matching)
      ? yield* relationEvidenceRepo.searchByText("", organizationId, maxBullets)
      : matching;

    if (A.isEmptyReadonlyArray(chosen)) {
      return { meetingPrepId: "", bullets: [], disclaimer: DISCLAIMER };
    }

    const meetingPrepId = `meeting_prep__${crypto.randomUUID()}`;
    const actorId = session.userId;

    const bullets = yield* sql.withTransaction(
      Effect.forEach(
        A.take(chosen, maxBullets),
        (re, idx) =>
          Effect.gen(function* () {
            const bulletInsert = Entities.MeetingPrepBullet.Model.insert.make({
              id: KnowledgeEntityIds.MeetingPrepBulletId.create(),
              organizationId,
              meetingPrepId,
              bulletIndex: idx,
              text: bulletTextFromRelation(re),
              source: O.some("meetingprep_generate"),
              deletedAt: O.none(),
              createdBy: actorId,
              updatedBy: actorId,
              deletedBy: O.none(),
            });

            const bullet = yield* bulletRepo.insert(bulletInsert);

            // Persist at least one citation per bullet, sourced from relation_evidence (D-08).
            const evidenceInsert = Entities.MeetingPrepEvidence.Model.insert.make({
              id: KnowledgeEntityIds.MeetingPrepEvidenceId.create(),
              organizationId,
              bulletId: bullet.id,
              sourceType: "relation",
              relationEvidenceId: O.some(re.id),
              extractionId: re.extractionId,
              source: O.some("meetingprep_generate"),
              deletedAt: O.none(),
              createdBy: actorId,
              updatedBy: actorId,
              deletedBy: O.none(),
            });

            yield* evidenceRepo.insertVoid(evidenceInsert);

            return {
              id: bullet.id,
              meetingPrepId: bullet.meetingPrepId,
              bulletIndex: bullet.bulletIndex,
              text: bullet.text,
            } satisfies typeof Rpc.MeetingPrep.Generate.Bullet.Type;
          }),
        { concurrency: 1 }
      )
    );

    // Guardrail: never return bullets without citations (D-10).
    return { meetingPrepId, bullets, disclaimer: DISCLAIMER };
  }).pipe(
    Effect.catchTags({
      DatabaseError: () => Effect.succeed({ meetingPrepId: "", bullets: [], disclaimer: DISCLAIMER }),
      SqlError: () => Effect.succeed({ meetingPrepId: "", bullets: [], disclaimer: DISCLAIMER }),
    })
  );
}, Effect.withSpan("meetingprep_generate"));
