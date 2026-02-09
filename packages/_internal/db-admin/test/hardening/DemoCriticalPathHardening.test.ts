/**
 * Demo-Critical Hardening Tests (Phase P2)
 *
 * Purpose:
 * - Fail loud on cross-org leakage for the demo critical path (documents, knowledge, embeddings, meeting prep).
 * - Validate evidence resolvability against immutable document versions using UTF-16 JS offsets (C-05).
 * - Validate meeting-prep citations are durable and resolvable without fragile optional joins (D-08 / C-02).
 */

import { EmbeddingRepo } from "@beep/knowledge-server/db";
import { Handler as EvidenceListHandler } from "@beep/knowledge-server/rpc/v1/evidence/list";
import { DocumentsEntityIds, KnowledgeEntityIds, Policy, SharedEntityIds } from "@beep/shared-domain";
import { Organization, Session, User } from "@beep/shared-domain/entities";
import { layer, strictEqual } from "@beep/testkit";
import { assertTenantIsolation, clearTestTenant, withTestTenant } from "@beep/testkit/rls";
import * as SqlClient from "@effect/sql/SqlClient";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { PgTest } from "../container";

const TEST_TIMEOUT = 120000;

const mkVec = (hotIndex: number): ReadonlyArray<number> => A.makeBy(768, (i) => (i === hotIndex ? 1 : 0));

const mkAuthContext = (organizationId: SharedEntityIds.OrganizationId.Type, userId: SharedEntityIds.UserId.Type) =>
  Policy.AuthContext.of({
    user: { ...User.Model.MockOne(), id: userId },
    session: { ...Session.Model.MockOne(), userId, activeOrganizationId: organizationId },
    organization: { ...Organization.Model.MockOne(), id: organizationId, ownerUserId: userId },
    oauth: {
      getAccessToken: (_params) => Effect.succeed(O.none()),
      getProviderAccount: (_params) => Effect.succeed(O.none()),
      listProviderAccounts: (_params) => Effect.succeed([]),
    },
  });

const seedTenant = (orgId: SharedEntityIds.OrganizationId.Type, userId: SharedEntityIds.UserId.Type, email: string) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    // These inserts intentionally run under the org's tenant context because
    // shared_organization has tenant isolation policies.
    yield* sql`
      INSERT INTO shared_user (id, name, email)
      VALUES (${userId}, 'Test User', ${email})
      ON CONFLICT (id) DO NOTHING
    `;

    yield* sql`
      INSERT INTO shared_organization (id, name, slug, owner_user_id)
      VALUES (${orgId}, 'Test Org', ${`org-${orgId}`}, ${userId})
      ON CONFLICT (id) DO NOTHING
    `;
  });

layer(PgTest, { timeout: Duration.seconds(120) })("Demo Critical Path Hardening", (it) => {
  it.effect(
    "cross-org leakage: documents_document_source is tenant isolated",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        const orgA = SharedEntityIds.OrganizationId.create();
        const orgB = SharedEntityIds.OrganizationId.create();
        const userA = SharedEntityIds.UserId.create();
        const userB = SharedEntityIds.UserId.create();

        // Seed tenants
        yield* withTestTenant(orgA, seedTenant(orgA, userA, "a@example.com"));
        yield* withTestTenant(orgB, seedTenant(orgB, userB, "b@example.com"));

        const docA = DocumentsEntityIds.DocumentId.create();
        const docB = DocumentsEntityIds.DocumentId.create();
        const docvA = DocumentsEntityIds.DocumentVersionId.create();
        const docvB = DocumentsEntityIds.DocumentVersionId.create();

        // Seed minimal documents + versions for each org (required FK target).
        yield* withTestTenant(
          orgA,
          Effect.all([
            sql`INSERT INTO documents_document (id, organization_id, user_id, title, content)
                VALUES (${docA}, ${orgA}, ${userA}, 'A', 'A')
                ON CONFLICT (id) DO NOTHING`,
            sql`INSERT INTO documents_document_version (id, organization_id, document_id, user_id, title, content)
                VALUES (${docvA}, ${orgA}, ${docA}, ${userA}, 'A', 'A')
                ON CONFLICT (id) DO NOTHING`,
          ])
        );
        yield* withTestTenant(
          orgB,
          Effect.all([
            sql`INSERT INTO documents_document (id, organization_id, user_id, title, content)
                VALUES (${docB}, ${orgB}, ${userB}, 'B', 'B')
                ON CONFLICT (id) DO NOTHING`,
            sql`INSERT INTO documents_document_version (id, organization_id, document_id, user_id, title, content)
                VALUES (${docvB}, ${orgB}, ${docB}, ${userB}, 'B', 'B')
                ON CONFLICT (id) DO NOTHING`,
          ])
        );

        // Insert document_source mapping rows per org (demo-critical: mapping is evidence-adjacent provenance).
        const docSourceA = DocumentsEntityIds.DocumentSourceId.create();
        yield* withTestTenant(
          orgA,
          sql`INSERT INTO documents_document_source (
                id, organization_id, document_id, user_id, provider_account_id, source_type, source_id, source_hash
              ) VALUES (
                ${docSourceA}, ${orgA}, ${docA}, ${userA}, 'acct_a', 'gmail', 'msg_a', 'hash_a'
              )`
        );
        yield* withTestTenant(
          orgB,
          sql`INSERT INTO documents_document_source (
                id, organization_id, document_id, user_id, provider_account_id, source_type, source_id, source_hash
              ) VALUES (
                ${DocumentsEntityIds.DocumentSourceId.create()}, ${orgB}, ${docB}, ${userB}, 'acct_b', 'gmail', 'msg_b', 'hash_b'
              )`
        );

        yield* assertTenantIsolation(
          orgA,
          orgB,
          Effect.gen(function* () {
            const rows = yield* sql`
              SELECT organization_id as "organizationId", id, source_id as "sourceId"
              FROM documents_document_source
              ORDER BY id
            `;
            return rows as ReadonlyArray<{ organizationId: string; id: string; sourceId: string }>;
          })
        );
      }),
    TEST_TIMEOUT
  );

  it.effect(
    "cross-org leakage: embeddings similarity search is org-scoped (vector search)",
    () =>
      Effect.gen(function* () {
        const repo = yield* EmbeddingRepo;

        const orgA = SharedEntityIds.OrganizationId.create();
        const orgB = SharedEntityIds.OrganizationId.create();
        const userA = SharedEntityIds.UserId.create();
        const userB = SharedEntityIds.UserId.create();

        yield* withTestTenant(orgA, seedTenant(orgA, userA, "ea@example.com"));
        yield* withTestTenant(orgB, seedTenant(orgB, userB, "eb@example.com"));

        const vec = mkVec(0);

        const embAId = KnowledgeEntityIds.EmbeddingId.create();
        const embBId = KnowledgeEntityIds.EmbeddingId.create();

        const embA = yield* withTestTenant(
          orgA,
          repo.insert({
            id: embAId,
            source: O.none(),
            deletedAt: O.none(),
            createdBy: O.none(),
            updatedBy: O.none(),
            deletedBy: O.none(),
            organizationId: orgA,
            entityType: "entity",
            entityId: KnowledgeEntityIds.KnowledgeEntityId.create(),
            ontologyId: O.none(),
            embedding: vec,
            contentText: O.some("alpha"),
            model: "nomic-embed-text-v1.5",
          })
        );

        const embB = yield* withTestTenant(
          orgB,
          repo.insert({
            id: embBId,
            source: O.none(),
            deletedAt: O.none(),
            createdBy: O.none(),
            updatedBy: O.none(),
            deletedBy: O.none(),
            organizationId: orgB,
            entityType: "entity",
            entityId: KnowledgeEntityIds.KnowledgeEntityId.create(),
            ontologyId: O.none(),
            embedding: vec,
            contentText: O.some("bravo"),
            model: "nomic-embed-text-v1.5",
          })
        );

        const resA = yield* withTestTenant(orgA, repo.findSimilar(vec, orgA, 10, 0.0));
        const resB = yield* withTestTenant(orgB, repo.findSimilar(vec, orgB, 10, 0.0));

        // Fail loud if results include an unexpected embedding id.
        strictEqual(
          resA.some((r) => r.id === embB.id),
          false
        );
        strictEqual(
          resB.some((r) => r.id === embA.id),
          false
        );
      }),
    TEST_TIMEOUT
  );

  it.effect(
    "cross-org leakage: Evidence.List returns no evidence for other-org ids (entity/relation/bullet/document filters)",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        const orgA = SharedEntityIds.OrganizationId.create();
        const orgB = SharedEntityIds.OrganizationId.create();
        const userA = SharedEntityIds.UserId.create();
        const userB = SharedEntityIds.UserId.create();

        yield* withTestTenant(orgA, seedTenant(orgA, userA, "ela@example.com"));
        yield* withTestTenant(orgB, seedTenant(orgB, userB, "elb@example.com"));

        const authA = mkAuthContext(orgA, userA);
        const authB = mkAuthContext(orgB, userB);

        const runAsOrgA = (payload: Parameters<typeof EvidenceListHandler>[0]) =>
          withTestTenant(orgA, EvidenceListHandler(payload).pipe(Effect.provideService(Policy.AuthContext, authA)));

        const runAsOrgB = (payload: Parameters<typeof EvidenceListHandler>[0]) =>
          withTestTenant(orgB, EvidenceListHandler(payload).pipe(Effect.provideService(Policy.AuthContext, authB)));

        // Seed evidence only in orgB.
        const docB = DocumentsEntityIds.DocumentId.create();
        const docvB = DocumentsEntityIds.DocumentVersionId.create();
        const content = "B🙂"; // include surrogate pair to exercise UTF-16 validations in Evidence.List

        yield* withTestTenant(
          orgB,
          Effect.all([
            sql`INSERT INTO documents_document (id, organization_id, user_id, title, content)
                VALUES (${docB}, ${orgB}, ${userB}, 'B', ${content})
                ON CONFLICT (id) DO NOTHING`,
            sql`INSERT INTO documents_document_version (id, organization_id, document_id, user_id, title, content)
                VALUES (${docvB}, ${orgB}, ${docB}, ${userB}, 'B', ${content})
                ON CONFLICT (id) DO NOTHING`,
          ])
        );

        const entityB = KnowledgeEntityIds.KnowledgeEntityId.create();
        yield* withTestTenant(
          orgB,
          sql`INSERT INTO knowledge_mention (
                id, organization_id, entity_id, document_id, document_version_id,
                text, start_char, end_char, is_primary
              ) VALUES (
                ${KnowledgeEntityIds.MentionId.create()}, ${orgB}, ${entityB}, ${docB}, ${docvB},
                '🙂', 1, 3, true
              )`
        );

        const relationB = KnowledgeEntityIds.RelationId.create();
        yield* withTestTenant(
          orgB,
          sql`INSERT INTO knowledge_relation (id, organization_id, subject_id, predicate, object_id, ontology_id)
              VALUES (${relationB}, ${orgB}, ${entityB}, 'p', ${KnowledgeEntityIds.KnowledgeEntityId.create()}, 'default')`
        );
        yield* withTestTenant(
          orgB,
          sql`INSERT INTO knowledge_relation_evidence (
                id, organization_id, relation_id, document_id, document_version_id,
                start_char, end_char, text
              ) VALUES (
                ${KnowledgeEntityIds.RelationEvidenceId.create()}, ${orgB}, ${relationB}, ${docB}, ${docvB},
                1, 3, '🙂'
              )`
        );

        const bulletB = KnowledgeEntityIds.MeetingPrepBulletId.create();
        yield* withTestTenant(
          orgB,
          sql`INSERT INTO knowledge_meeting_prep_bullet (id, organization_id, meeting_prep_id, bullet_index, text)
              VALUES (${bulletB}, ${orgB}, 'run_b', 0, 'B')`
        );
        yield* withTestTenant(
          orgB,
          sql`INSERT INTO knowledge_meeting_prep_evidence (
                id, organization_id, bullet_id, source_type,
                document_id, document_version_id, start_char, end_char, text
              ) VALUES (
                ${KnowledgeEntityIds.MeetingPrepEvidenceId.create()}, ${orgB}, ${bulletB}, 'document_span',
                ${docB}, ${docvB}, 1, 3, '🙂'
              )`
        );

        // Positive smoke: orgB can resolve its own evidence (ensures the seed is valid).
        const okEntity = yield* runAsOrgB({ organizationId: orgB, entityId: entityB });
        strictEqual(okEntity.items.length > 0, true);

        // Leak checks: orgA must never see orgB evidence even if it knows the ids.
        const leakEntity = yield* runAsOrgA({ organizationId: orgA, entityId: entityB });
        strictEqual(leakEntity.items.length, 0);

        const leakRelation = yield* runAsOrgA({ organizationId: orgA, relationId: relationB });
        strictEqual(leakRelation.items.length, 0);

        const leakBullet = yield* runAsOrgA({ organizationId: orgA, meetingPrepBulletId: bulletB });
        strictEqual(leakBullet.items.length, 0);

        const leakDocument = yield* runAsOrgA({ organizationId: orgA, documentId: docB });
        strictEqual(leakDocument.items.length, 0);
      }),
    TEST_TIMEOUT
  );

  it.effect(
    "evidence resolvability: meeting-prep citations resolve to immutable doc version content with UTF-16 offsets",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        const orgA = SharedEntityIds.OrganizationId.create();
        const userA = SharedEntityIds.UserId.create();
        yield* withTestTenant(orgA, seedTenant(orgA, userA, "ev@example.com"));

        const documentId = DocumentsEntityIds.DocumentId.create();
        const documentVersionId = DocumentsEntityIds.DocumentVersionId.create();
        const content = "A🙂B"; // emoji is 2 UTF-16 code units

        yield* withTestTenant(
          orgA,
          Effect.all([
            sql`INSERT INTO documents_document (id, organization_id, user_id, title, content)
                VALUES (${documentId}, ${orgA}, ${userA}, 'EV', ${content})
                ON CONFLICT (id) DO NOTHING`,
            sql`INSERT INTO documents_document_version (id, organization_id, document_id, user_id, title, content)
                VALUES (${documentVersionId}, ${orgA}, ${documentId}, ${userA}, 'EV', ${content})
                ON CONFLICT (id) DO NOTHING`,
          ])
        );

        // Mention evidence span for the emoji (UTF-16: start=1, end=3)
        const mentionId = KnowledgeEntityIds.MentionId.create();
        const evEntityId = KnowledgeEntityIds.KnowledgeEntityId.create();
        yield* withTestTenant(
          orgA,
          sql`INSERT INTO knowledge_mention (
                id, organization_id, entity_id, document_id, document_version_id,
                text, start_char, end_char, is_primary
              ) VALUES (
                ${mentionId}, ${orgA}, ${evEntityId}, ${documentId}, ${documentVersionId},
                '🙂', 1, 3, true
              )`
        );

        // Relation + relation_evidence pinned directly to doc + version (no extraction join required)
        const relationId = KnowledgeEntityIds.RelationId.create();
        const evObjectId = KnowledgeEntityIds.KnowledgeEntityId.create();
        yield* withTestTenant(
          orgA,
          sql`INSERT INTO knowledge_relation (
                id, organization_id, subject_id, predicate, object_id, ontology_id
              ) VALUES (
                ${relationId}, ${orgA}, ${evEntityId}, 'http://example.org/p', ${evObjectId}, 'default'
              )`
        );
        yield* withTestTenant(
          orgA,
          sql`INSERT INTO knowledge_relation_evidence (
                id, organization_id, relation_id, document_id, document_version_id,
                start_char, end_char, text
              ) VALUES (
                ${KnowledgeEntityIds.RelationEvidenceId.create()}, ${orgA}, ${relationId}, ${documentId}, ${documentVersionId},
                1, 3, '🙂'
              )`
        );

        // Meeting prep output + citations (durable)
        const bulletId = KnowledgeEntityIds.MeetingPrepBulletId.create();
        yield* withTestTenant(
          orgA,
          sql`INSERT INTO knowledge_meeting_prep_bullet (
                id, organization_id, meeting_prep_id, bullet_index, text
              ) VALUES (
                ${bulletId}, ${orgA}, 'mprun_1', 0, 'Bullet cites emoji'
              )`
        );
        yield* withTestTenant(
          orgA,
          sql`INSERT INTO knowledge_meeting_prep_evidence (
                id, organization_id, bullet_id, source_type, mention_id
              ) VALUES (
                ${KnowledgeEntityIds.MeetingPrepEvidenceId.create()}, ${orgA}, ${bulletId}, 'mention', ${mentionId}
              )`
        );

        // Resolve meeting-prep evidence -> mention -> doc version content and validate slice.
        const rows = yield* withTestTenant(
          orgA,
          sql`
            SELECT
              mpe.id as "evidenceId",
              m.document_version_id as "documentVersionId",
              m.start_char as "startChar",
              m.end_char as "endChar",
              dv.content as "content",
              m.text as "text"
            FROM knowledge_meeting_prep_evidence mpe
            JOIN knowledge_mention m ON m.id = mpe.mention_id
            JOIN documents_document_version dv ON dv.id = m.document_version_id
            WHERE mpe.bullet_id = ${bulletId}
          `
        );

        strictEqual(rows.length, 1);
        const row = rows[0] as {
          evidenceId: string;
          documentVersionId: string;
          startChar: number;
          endChar: number;
          content: string;
          text: string;
        };

        // C-05 / offset semantics: JS UTF-16 indices, 0-indexed, end-exclusive.
        strictEqual(row.documentVersionId, documentVersionId);
        strictEqual(row.content.slice(row.startChar, row.endChar), row.text);
      }),
    TEST_TIMEOUT
  );

  it.effect(
    "cross-org leakage: knowledge evidence tables are tenant isolated (mentions, relation_evidence, meeting_prep)",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        const orgA = SharedEntityIds.OrganizationId.create();
        const orgB = SharedEntityIds.OrganizationId.create();
        const userA = SharedEntityIds.UserId.create();
        const userB = SharedEntityIds.UserId.create();

        yield* withTestTenant(orgA, seedTenant(orgA, userA, "ia@example.com"));
        yield* withTestTenant(orgB, seedTenant(orgB, userB, "ib@example.com"));

        const docIsoA = DocumentsEntityIds.DocumentId.create();
        const docvIsoA = DocumentsEntityIds.DocumentVersionId.create();
        const docIsoB = DocumentsEntityIds.DocumentId.create();
        const docvIsoB = DocumentsEntityIds.DocumentVersionId.create();

        // Minimal docs/versions for each org (FK targets)
        yield* withTestTenant(
          orgA,
          Effect.all([
            sql`INSERT INTO documents_document (id, organization_id, user_id, title, content)
                VALUES (${docIsoA}, ${orgA}, ${userA}, 'A', 'A')
                ON CONFLICT (id) DO NOTHING`,
            sql`INSERT INTO documents_document_version (id, organization_id, document_id, user_id, title, content)
                VALUES (${docvIsoA}, ${orgA}, ${docIsoA}, ${userA}, 'A', 'A')
                ON CONFLICT (id) DO NOTHING`,
          ])
        );
        yield* withTestTenant(
          orgB,
          Effect.all([
            sql`INSERT INTO documents_document (id, organization_id, user_id, title, content)
                VALUES (${docIsoB}, ${orgB}, ${userB}, 'B', 'B')
                ON CONFLICT (id) DO NOTHING`,
            sql`INSERT INTO documents_document_version (id, organization_id, document_id, user_id, title, content)
                VALUES (${docvIsoB}, ${orgB}, ${docIsoB}, ${userB}, 'B', 'B')
                ON CONFLICT (id) DO NOTHING`,
          ])
        );

        // Insert one row in each evidence table per org.

        yield* withTestTenant(
          orgA,
          sql`INSERT INTO knowledge_mention (
                id, organization_id, entity_id, document_id, document_version_id,
                text, start_char, end_char, is_primary
              ) VALUES (
                ${KnowledgeEntityIds.MentionId.create()}, ${orgA}, ${KnowledgeEntityIds.KnowledgeEntityId.create()}, ${docIsoA}, ${docvIsoA},
                'A', 0, 1, true
              )`
        );
        yield* withTestTenant(
          orgB,
          sql`INSERT INTO knowledge_mention (
                id, organization_id, entity_id, document_id, document_version_id,
                text, start_char, end_char, is_primary
              ) VALUES (
                ${KnowledgeEntityIds.MentionId.create()}, ${orgB}, ${KnowledgeEntityIds.KnowledgeEntityId.create()}, ${docIsoB}, ${docvIsoB},
                'B', 0, 1, true
              )`
        );

        const relIsoA = KnowledgeEntityIds.RelationId.create();
        const relIsoB = KnowledgeEntityIds.RelationId.create();

        yield* withTestTenant(
          orgA,
          sql`INSERT INTO knowledge_relation (id, organization_id, subject_id, predicate, object_id, ontology_id)
              VALUES (${relIsoA}, ${orgA}, ${KnowledgeEntityIds.KnowledgeEntityId.create()}, 'p', ${KnowledgeEntityIds.KnowledgeEntityId.create()}, 'default')`
        );
        yield* withTestTenant(
          orgB,
          sql`INSERT INTO knowledge_relation (id, organization_id, subject_id, predicate, object_id, ontology_id)
              VALUES (${relIsoB}, ${orgB}, ${KnowledgeEntityIds.KnowledgeEntityId.create()}, 'p', ${KnowledgeEntityIds.KnowledgeEntityId.create()}, 'default')`
        );

        yield* withTestTenant(
          orgA,
          sql`INSERT INTO knowledge_relation_evidence (
                id, organization_id, relation_id, document_id, document_version_id,
                start_char, end_char, text
              ) VALUES (
                ${KnowledgeEntityIds.RelationEvidenceId.create()}, ${orgA}, ${relIsoA}, ${docIsoA}, ${docvIsoA},
                0, 1, 'A'
              )`
        );
        yield* withTestTenant(
          orgB,
          sql`INSERT INTO knowledge_relation_evidence (
                id, organization_id, relation_id, document_id, document_version_id,
                start_char, end_char, text
              ) VALUES (
                ${KnowledgeEntityIds.RelationEvidenceId.create()}, ${orgB}, ${relIsoB}, ${docIsoB}, ${docvIsoB},
                0, 1, 'B'
              )`
        );

        const bulletIsoA = KnowledgeEntityIds.MeetingPrepBulletId.create();
        const bulletIsoB = KnowledgeEntityIds.MeetingPrepBulletId.create();

        yield* withTestTenant(
          orgA,
          sql`INSERT INTO knowledge_meeting_prep_bullet (id, organization_id, meeting_prep_id, bullet_index, text)
              VALUES (${bulletIsoA}, ${orgA}, 'run_a', 0, 'A')`
        );
        yield* withTestTenant(
          orgB,
          sql`INSERT INTO knowledge_meeting_prep_bullet (id, organization_id, meeting_prep_id, bullet_index, text)
              VALUES (${bulletIsoB}, ${orgB}, 'run_b', 0, 'B')`
        );

        // meeting_prep_evidence is demo-critical (citations). Validate it is tenant isolated too.
        yield* withTestTenant(
          orgA,
          sql`INSERT INTO knowledge_meeting_prep_evidence (id, organization_id, bullet_id, source_type)
              VALUES (${KnowledgeEntityIds.MeetingPrepEvidenceId.create()}, ${orgA}, ${bulletIsoA}, 'document_span')`
        );
        yield* withTestTenant(
          orgB,
          sql`INSERT INTO knowledge_meeting_prep_evidence (id, organization_id, bullet_id, source_type)
              VALUES (${KnowledgeEntityIds.MeetingPrepEvidenceId.create()}, ${orgB}, ${bulletIsoB}, 'document_span')`
        );

        yield* assertTenantIsolation(
          orgA,
          orgB,
          Effect.gen(function* () {
            const rows = yield* sql`SELECT organization_id as "organizationId", id FROM knowledge_mention ORDER BY id`;
            return rows as ReadonlyArray<{ organizationId: string; id: string }>;
          })
        );

        yield* assertTenantIsolation(
          orgA,
          orgB,
          Effect.gen(function* () {
            const rows = yield* sql`
              SELECT organization_id as "organizationId", id FROM knowledge_relation_evidence ORDER BY id
            `;
            return rows as ReadonlyArray<{ organizationId: string; id: string }>;
          })
        );

        yield* assertTenantIsolation(
          orgA,
          orgB,
          Effect.gen(function* () {
            const rows = yield* sql`
              SELECT organization_id as "organizationId", id FROM knowledge_meeting_prep_bullet ORDER BY id
            `;
            return rows as ReadonlyArray<{ organizationId: string; id: string }>;
          })
        );

        yield* assertTenantIsolation(
          orgA,
          orgB,
          Effect.gen(function* () {
            const rows = yield* sql`
              SELECT organization_id as "organizationId", id FROM knowledge_meeting_prep_evidence ORDER BY id
            `;
            return rows as ReadonlyArray<{ organizationId: string; id: string }>;
          })
        );
      }),
    TEST_TIMEOUT
  );

  it.effect(
    "restart-safety smoke: persisted meeting-prep bullets/evidence still resolve after clearing tenant context",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        const orgA = SharedEntityIds.OrganizationId.create();
        const userA = SharedEntityIds.UserId.create();
        yield* withTestTenant(orgA, seedTenant(orgA, userA, "rs@example.com"));

        const documentId = DocumentsEntityIds.DocumentId.create();
        const documentVersionId = DocumentsEntityIds.DocumentVersionId.create();
        const content = "Restart-safe";

        yield* withTestTenant(
          orgA,
          Effect.all([
            sql`INSERT INTO documents_document (id, organization_id, user_id, title, content)
                VALUES (${documentId}, ${orgA}, ${userA}, 'RS', ${content})
                ON CONFLICT (id) DO NOTHING`,
            sql`INSERT INTO documents_document_version (id, organization_id, document_id, user_id, title, content)
                VALUES (${documentVersionId}, ${orgA}, ${documentId}, ${userA}, 'RS', ${content})
                ON CONFLICT (id) DO NOTHING`,
          ])
        );

        const rsMentionId = KnowledgeEntityIds.MentionId.create();
        const rsBulletId = KnowledgeEntityIds.MeetingPrepBulletId.create();
        const rsEvidenceId = KnowledgeEntityIds.MeetingPrepEvidenceId.create();

        yield* withTestTenant(
          orgA,
          sql`INSERT INTO knowledge_mention (
                id, organization_id, entity_id, document_id, document_version_id,
                text, start_char, end_char, is_primary
              ) VALUES (
                ${rsMentionId}, ${orgA}, ${KnowledgeEntityIds.KnowledgeEntityId.create()}, ${documentId}, ${documentVersionId},
                'Restart', 0, 7, true
              )`
        );
        yield* withTestTenant(
          orgA,
          sql`INSERT INTO knowledge_meeting_prep_bullet (id, organization_id, meeting_prep_id, bullet_index, text)
              VALUES (${rsBulletId}, ${orgA}, 'run_rs', 0, 'Bullet')`
        );
        yield* withTestTenant(
          orgA,
          sql`INSERT INTO knowledge_meeting_prep_evidence (id, organization_id, bullet_id, source_type, mention_id)
              VALUES (
                ${rsEvidenceId},
                ${orgA},
                ${rsBulletId},
                'mention',
                ${rsMentionId}
              )`
        );

        // Simulate a "restart" by clearing tenant context explicitly, then querying again in a fresh scope.
        yield* clearTestTenant();

        const resolved = yield* withTestTenant(
          orgA,
          sql`
            SELECT
              dv.content as "content",
              m.start_char as "startChar",
              m.end_char as "endChar",
              m.text as "text"
            FROM knowledge_meeting_prep_evidence mpe
            JOIN knowledge_mention m ON m.id = mpe.mention_id
            JOIN documents_document_version dv ON dv.id = m.document_version_id
            WHERE mpe.id = ${rsEvidenceId}
          `
        );

        strictEqual(resolved.length, 1);
        const row = resolved[0] as { content: string; startChar: number; endChar: number; text: string };
        strictEqual(row.content.slice(row.startChar, row.endChar), row.text);
      }),
    TEST_TIMEOUT
  );
});
