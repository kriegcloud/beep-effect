import { Entities, Rpc } from "@beep/knowledge-domain";
import type { Evidence } from "@beep/knowledge-domain/rpc/Evidence";
import { MentionRepo, MeetingPrepEvidenceRepo, RelationEvidenceRepo } from "@beep/knowledge-server/db";
import { Policy } from "@beep/shared-domain";
import * as SqlClient from "@effect/sql/SqlClient";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

const DOCUMENT_VERSION_TABLE = "documents_document_version" as const;

type EvidenceItem = typeof Rpc.Evidence.List.EvidenceItem.Type;

const oneOfCount = (payload: Evidence.List.Payload): number =>
  [
    payload.entityId !== undefined,
    payload.relationId !== undefined,
    payload.meetingPrepBulletId !== undefined,
    payload.documentId !== undefined,
  ].filter(Boolean).length;

const validateWithDocumentContent = (
  items: ReadonlyArray<EvidenceItem>,
  organizationId: string
): Effect.Effect<ReadonlyArray<EvidenceItem>, never, SqlClient.SqlClient> =>
  Effect.gen(function* () {
    if (A.isEmptyReadonlyArray(items)) {
      return items;
    }

    // Evidence bounds MUST be validated against JS UTF-16 code units (C-05).
    // Postgres `length()` is codepoint-count and can drift from JS `.length` (emoji/surrogates).
    const sql = (yield* SqlClient.SqlClient).withoutTransforms();
    const uniqueDocVersionIds = Array.from(new Set(items.map((i) => i.documentVersionId)));

    // Fetch canonical persisted content to compute UTF-16 length in-process.
    const rows = yield* sql<{ readonly id: string; readonly content: string }>`
      SELECT id, content
      FROM ${sql(DOCUMENT_VERSION_TABLE)}
      WHERE organization_id = ${organizationId}
        AND id IN ${sql.in(uniqueDocVersionIds)}
    `.pipe(
      // Hardening: Evidence.List must never defect. If we cannot validate bounds due to a DB error,
      // omit spans deterministically rather than leaking invalid offsets.
      Effect.catchAll(() => Effect.succeed([] as const))
    );

    const lenById = new Map(rows.map((r) => [r.id, r.content.length] as const));

    return items.filter((i) => {
      const len = lenById.get(i.documentVersionId);
      if (len === undefined) return false; // dead link => omit deterministically
      const endOk = i.endChar <= len;
      const startOk = i.startChar >= 0;
      const orderOk = i.endChar >= i.startChar;
      return startOk && orderOk && endOk;
    });
  });

export const Handler = Effect.fn("evidence_list")(function* (payload: Evidence.List.Payload) {
  const { session } = yield* Policy.AuthContext;
  if (session.activeOrganizationId !== payload.organizationId) {
    // Keep deterministic: return empty on org mismatch rather than leaking anything.
    return { items: [] };
  }

  return yield* Effect.gen(function* () {
    // Enforce one-of filter semantics from C-02.
    if (oneOfCount(payload) > 1) {
      return { items: [] };
    }

    const organizationId = payload.organizationId;
    const mentionRepo = yield* MentionRepo;
    const relationEvidenceRepo = yield* RelationEvidenceRepo;
    const meetingPrepEvidenceRepo = yield* MeetingPrepEvidenceRepo;

    const fromMention = (m: Entities.Mention.Model): EvidenceItem => {
      const extractionId = O.getOrUndefined(m.extractionId);
      const confidence = O.getOrUndefined(m.confidence);
      return {
        documentId: m.documentId,
        documentVersionId: m.documentVersionId,
        startChar: m.startChar,
        endChar: m.endChar,
        text: m.text,
        ...(confidence === undefined ? {} : { confidence }),
        kind: "mention",
        source: {
          mentionId: m.id,
          ...(extractionId === undefined ? {} : { extractionId }),
        },
      };
    };

    const fromRelationEvidence = (re: Entities.RelationEvidence.Model): EvidenceItem => {
      const extractionId = O.getOrUndefined(re.extractionId);
      const confidence = O.getOrUndefined(re.confidence);
      return {
        documentId: re.documentId,
        documentVersionId: re.documentVersionId,
        startChar: re.startChar,
        endChar: re.endChar,
        text: re.text,
        ...(confidence === undefined ? {} : { confidence }),
        kind: "relation",
        source: {
          relationEvidenceId: re.id,
          ...(extractionId === undefined ? {} : { extractionId }),
        },
      };
    };

    const evidenceItems: ReadonlyArray<EvidenceItem> = yield* Effect.gen(function* () {
      if (payload.entityId !== undefined) {
        const mentions = yield* mentionRepo.findByEntityId(payload.entityId, organizationId);
        return mentions.map(fromMention);
      }
      if (payload.relationId !== undefined) {
        const relEvidence = yield* relationEvidenceRepo.findByRelationId(payload.relationId, organizationId);
        return relEvidence.map(fromRelationEvidence);
      }
      if (payload.meetingPrepBulletId !== undefined) {
        const evidenceRows = yield* meetingPrepEvidenceRepo.listByBulletId(payload.meetingPrepBulletId, organizationId);

        // Resolve meeting-prep evidence to version-pinned spans (no optional join dead-ends).
        const mentionIds = evidenceRows.flatMap((r) => (O.isSome(r.mentionId) ? [r.mentionId.value] : []));
        const relationEvidenceIds = evidenceRows.flatMap((r) =>
          O.isSome(r.relationEvidenceId) ? [r.relationEvidenceId.value] : []
        );

        const mentions = yield* mentionRepo.findByIds(mentionIds, organizationId);
        const relEvidence = yield* relationEvidenceRepo.findByIds(relationEvidenceIds, organizationId);

        const mentionById = new Map(mentions.map((m) => [m.id, m] as const));
        const relEvidenceById = new Map(relEvidence.map((r) => [r.id, r] as const));

        const items: Array<EvidenceItem> = [];
        for (const row of evidenceRows) {
          if (row.sourceType === "mention" && O.isSome(row.mentionId)) {
            const meetingPrepBulletId = payload.meetingPrepBulletId;
            const m = mentionById.get(row.mentionId.value);
            if (!m) continue;
            const base = fromMention(m);
            items.push({ ...base, kind: "bullet", source: { ...base.source, meetingPrepBulletId } });
            continue;
          }
          if (row.sourceType === "relation" && O.isSome(row.relationEvidenceId)) {
            const meetingPrepBulletId = payload.meetingPrepBulletId;
            const re = relEvidenceById.get(row.relationEvidenceId.value);
            if (!re) continue;
            const base = fromRelationEvidence(re);
            items.push({ ...base, kind: "bullet", source: { ...base.source, meetingPrepBulletId } });
            continue;
          }
          if (row.sourceType === "document_span") {
            // Inline span, already version-pinned.
            if (
              O.isSome(row.documentId) &&
              O.isSome(row.documentVersionId) &&
              O.isSome(row.startChar) &&
              O.isSome(row.endChar) &&
              O.isSome(row.text)
            ) {
              const meetingPrepBulletId = payload.meetingPrepBulletId;
              const extractionId = O.getOrUndefined(row.extractionId);
              const confidence = O.getOrUndefined(row.confidence);
              items.push({
                documentId: row.documentId.value,
                documentVersionId: row.documentVersionId.value,
                startChar: row.startChar.value,
                endChar: row.endChar.value,
                text: row.text.value,
                ...(confidence === undefined ? {} : { confidence }),
                kind: "bullet",
                source: {
                  meetingPrepBulletId,
                  ...(extractionId === undefined ? {} : { extractionId }),
                },
              });
            }
            continue;
          }
        }

        return items;
      }

      if (payload.documentId !== undefined) {
        const mentions = yield* mentionRepo.findByDocumentId(payload.documentId, organizationId);
        return mentions.map(fromMention);
      }

      return [];
    });

    const validated = yield* validateWithDocumentContent(evidenceItems, organizationId);
    return { items: validated };
  }).pipe(Effect.catchTag("DatabaseError", () => Effect.succeed({ items: [] })));
}, Effect.withSpan("evidence_list"));
