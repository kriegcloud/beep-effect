import { describe } from "bun:test";
import { Document } from "@beep/documents-domain/entities";
import type { SerializedEditorStateEnvelope } from "@beep/documents-domain/value-objects";
import { DocumentRepo } from "@beep/documents-server/db";
import { OrganizationRepo, UserRepo } from "@beep/iam-server/db";
import { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
import { Organization, User } from "@beep/shared-domain/entities";
import { assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import { setTestTenant } from "@beep/testkit/rls";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { PgTest } from "./container";

const TEST_TIMEOUT = 120000;

const makeTestEmail = (prefix: string): BS.Email.Type => BS.Email.make(`${prefix}-${crypto.randomUUID()}@example.com`);

const makeMockUser = (overrides?: undefined | Partial<{ readonly email: BS.Email.Type; readonly name: string }>) =>
  User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("doc-test"),
    name: overrides?.name ?? "Document Test User",
  });

const makeMockOrganization = (ownerUserId: SharedEntityIds.UserId.Type) =>
  Organization.Model.jsonCreate.make({
    name: "Test Organization",
    slug: `test-org-${crypto.randomUUID().slice(0, 8)}`,
    ownerUserId,
  });

const makeMockDocument = (
  organizationId: SharedEntityIds.OrganizationId.Type,
  userId: SharedEntityIds.UserId.Type,
  overrides?: Partial<{
    readonly contentRich: SerializedEditorStateEnvelope.Type;
    readonly title: string;
  }>
) =>
  S.decodeUnknownSync(Document.Model.jsonCreate)({
    organizationId,
    userId,
    ...(overrides?.title !== undefined && { title: overrides.title }),
    ...(overrides?.contentRich !== undefined && { contentRich: overrides.contentRich }),
  });

/**
 * Creates prerequisite user + organization, sets tenant context, and returns
 * the IDs needed for document operations.
 */
const setupTestContext = Effect.gen(function* () {
  const userRepo = yield* UserRepo;
  const orgRepo = yield* OrganizationRepo;

  const user = yield* userRepo.insert(
    makeMockUser({ email: makeTestEmail("doc-content-rich"), name: "ContentRich Test User" })
  );
  const org = yield* orgRepo.insert(makeMockOrganization(user.id));

  yield* setTestTenant(org.id);

  return { userId: user.id, organizationId: org.id };
});

/**
 * Unwraps an Option that is expected to be Some, failing the test if None.
 * Uses O.getOrThrowWith so the return type is inferred without casts.
 */
const unwrapSome = <A>(opt: O.Option<A>, label: string): A =>
  O.getOrThrowWith(opt, () => new Error(`Expected Some for ${label}, got None`));

describe("Document contentRich round-trip", () => {
  // ==========================================================================
  // Test 1: Insert and retrieve document with complex contentRich
  // ==========================================================================
  layer(PgTest, { timeout: Duration.seconds(120) })("insert and retrieve", (it) => {
    it.effect(
      "should preserve complex contentRich through JSONB round-trip",
      () =>
        Effect.gen(function* () {
          const { userId, organizationId } = yield* setupTestContext;
          const docRepo = yield* DocumentRepo;

          // Children of root are SerializedLexicalNodeEnvelopeFrom: { type, version, $? }
          // Extra node-specific data goes into the $ field (NodeState).
          const contentRich: SerializedEditorStateEnvelope.Type = {
            root: {
              type: "root",
              version: 1,
              children: [
                {
                  type: "paragraph",
                  version: 1,
                  $: {
                    text: "Hello World",
                    format: 3,
                    detail: 0,
                    mode: "normal",
                    style: "color: red",
                  },
                },
                {
                  type: "heading",
                  version: 1,
                  $: { collapsed: true },
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
            },
          };

          const docInsert = makeMockDocument(organizationId, userId, {
            title: "Complex ContentRich Test",
            contentRich,
          });

          const inserted = yield* docRepo.insert(docInsert);
          assertTrue(S.is(Document.Model)(inserted));

          const found = unwrapSome(yield* docRepo.findById(inserted.id), "document findById");

          const retrievedContentRich = unwrapSome(found.contentRich, "contentRich");

          strictEqual(retrievedContentRich.root.type, "root");
          strictEqual(retrievedContentRich.root.version, 1);
          strictEqual(retrievedContentRich.root.direction, "ltr");
          strictEqual(retrievedContentRich.root.format, "");
          strictEqual(retrievedContentRich.root.indent, 0);

          // Verify children survived the round-trip
          assertTrue(A.length(retrievedContentRich.root.children) >= 2);

          // Verify paragraph node
          const paragraph = unwrapSome(A.get(retrievedContentRich.root.children, 0), "paragraph child");
          strictEqual(paragraph.type, "paragraph");
          strictEqual(paragraph.version, 1);
          assertTrue(paragraph.$ !== undefined);
          if (paragraph.$ !== undefined) {
            strictEqual(paragraph.$.text, "Hello World");
            strictEqual(paragraph.$.format, 3);
          }

          // Verify heading node
          const heading = unwrapSome(A.get(retrievedContentRich.root.children, 1), "heading child");
          strictEqual(heading.type, "heading");
          strictEqual(heading.version, 1);
          assertTrue(heading.$ !== undefined);
          if (heading.$ !== undefined) {
            strictEqual(heading.$.collapsed, true);
          }
        }),
      TEST_TIMEOUT
    );
  });

  // ==========================================================================
  // Test 2: Insert document with null/undefined contentRich
  // ==========================================================================
  layer(PgTest, { timeout: Duration.seconds(120) })("null contentRich", (it) => {
    it.effect(
      "should handle document with omitted contentRich",
      () =>
        Effect.gen(function* () {
          const { userId, organizationId } = yield* setupTestContext;
          const docRepo = yield* DocumentRepo;

          const docInsert = makeMockDocument(organizationId, userId, {
            title: "No ContentRich Test",
          });

          const inserted = yield* docRepo.insert(docInsert);
          const found = unwrapSome(yield* docRepo.findById(inserted.id), "document findById");

          // contentRich should be None when not provided
          assertTrue(O.isNone(found.contentRich));
        }),
      TEST_TIMEOUT
    );
  });

  // ==========================================================================
  // Test 3: Update contentRich on existing document
  // ==========================================================================
  layer(PgTest, { timeout: Duration.seconds(120) })("update contentRich", (it) => {
    it.effect(
      "should update contentRich from None to Some",
      () =>
        Effect.gen(function* () {
          const { userId, organizationId } = yield* setupTestContext;
          const docRepo = yield* DocumentRepo;

          // Insert without contentRich
          const docInsert = makeMockDocument(organizationId, userId, {
            title: "Update ContentRich Test",
          });
          const inserted = yield* docRepo.insert(docInsert);
          assertTrue(O.isNone(inserted.contentRich));

          const newContentRich: SerializedEditorStateEnvelope.Type = {
            root: {
              type: "root",
              version: 1,
              children: [
                {
                  type: "paragraph",
                  version: 1,
                  $: { text: "Updated content", format: 0 },
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
            },
          };

          // Update with contentRich
          const updated = yield* docRepo.update({
            ...inserted,
            contentRich: O.some(newContentRich),
          });

          assertTrue(O.isSome(updated.contentRich));

          // Verify the update persisted
          const found = unwrapSome(yield* docRepo.findById(inserted.id), "document findById");
          assertTrue(O.isSome(found.contentRich));

          if (O.isSome(found.contentRich)) {
            strictEqual(found.contentRich.value.root.type, "root");
            assertTrue(A.length(found.contentRich.value.root.children) >= 1);
            const firstChild = unwrapSome(A.get(found.contentRich.value.root.children, 0), "first child");
            strictEqual(firstChild.type, "paragraph");
          }
        }),
      TEST_TIMEOUT
    );
  });

  // ==========================================================================
  // Test 4: JSONB-specific edge cases
  // ==========================================================================
  layer(PgTest, { timeout: Duration.seconds(120) })("JSONB edge cases", (it) => {
    it.effect(
      "should preserve $ (NodeState) field through round-trip",
      () =>
        Effect.gen(function* () {
          const { userId, organizationId } = yield* setupTestContext;
          const docRepo = yield* DocumentRepo;

          const contentWithNodeState: SerializedEditorStateEnvelope.Type = {
            root: {
              type: "root",
              version: 1,
              children: [
                {
                  type: "collapsible-heading",
                  version: 1,
                  $: { collapsed: true, customProp: "value" },
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
            },
          };

          const docInsert = makeMockDocument(organizationId, userId, {
            title: "NodeState $ Field Test",
            contentRich: contentWithNodeState,
          });

          const inserted = yield* docRepo.insert(docInsert);
          const found = unwrapSome(yield* docRepo.findById(inserted.id), "document findById");
          const retrievedRich = unwrapSome(found.contentRich, "contentRich");

          const child = unwrapSome(A.get(retrievedRich.root.children, 0), "collapsible-heading child");
          assertTrue(child.$ !== undefined);
          if (child.$ !== undefined) {
            deepStrictEqual(child.$, { collapsed: true, customProp: "value" });
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should preserve empty children array through round-trip",
      () =>
        Effect.gen(function* () {
          const { userId, organizationId } = yield* setupTestContext;
          const docRepo = yield* DocumentRepo;

          const contentWithEmptyChildren: SerializedEditorStateEnvelope.Type = {
            root: {
              type: "root",
              version: 1,
              children: [],
              direction: "ltr",
              format: "",
              indent: 0,
            },
          };

          const docInsert = makeMockDocument(organizationId, userId, {
            title: "Empty Children Test",
            contentRich: contentWithEmptyChildren,
          });

          const inserted = yield* docRepo.insert(docInsert);
          const found = unwrapSome(yield* docRepo.findById(inserted.id), "document findById");
          const retrievedRich = unwrapSome(found.contentRich, "contentRich");

          assertTrue(A.isEmptyReadonlyArray(retrievedRich.root.children));
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should preserve deeply nested structure in $ through round-trip",
      () =>
        Effect.gen(function* () {
          const { userId, organizationId } = yield* setupTestContext;
          const docRepo = yield* DocumentRepo;

          // Deep nesting is represented via the $ field on base nodes
          const deeplyNested: SerializedEditorStateEnvelope.Type = {
            root: {
              type: "root",
              version: 1,
              children: [
                {
                  type: "list",
                  version: 1,
                  $: {
                    listType: "bullet",
                    items: [
                      {
                        type: "listitem",
                        text: "Item 1",
                        nested: {
                          type: "list",
                          items: [
                            { type: "listitem", text: "Nested Item 1.1" },
                            { type: "listitem", text: "Nested Item 1.2" },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  type: "table",
                  version: 1,
                  $: {
                    rows: [
                      { cells: [{ text: "Cell 1,1" }, { text: "Cell 1,2" }] },
                      { cells: [{ text: "Cell 2,1" }, { text: "Cell 2,2" }] },
                    ],
                  },
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
            },
          };

          const docInsert = makeMockDocument(organizationId, userId, {
            title: "Deeply Nested Test",
            contentRich: deeplyNested,
          });

          const inserted = yield* docRepo.insert(docInsert);
          const found = unwrapSome(yield* docRepo.findById(inserted.id), "document findById");
          const retrievedRich = unwrapSome(found.contentRich, "contentRich");

          strictEqual(A.length(retrievedRich.root.children), 2);

          // Verify list node with $ state
          const listNode = unwrapSome(A.get(retrievedRich.root.children, 0), "list child");
          strictEqual(listNode.type, "list");
          assertTrue(listNode.$ !== undefined);
          if (listNode.$ !== undefined) {
            strictEqual(listNode.$.listType, "bullet");
            assertTrue(A.isArray(listNode.$.items));
          }

          // Verify table node with $ state
          const tableNode = unwrapSome(A.get(retrievedRich.root.children, 1), "table child");
          strictEqual(tableNode.type, "table");
          assertTrue(tableNode.$ !== undefined);
          if (tableNode.$ !== undefined) {
            assertTrue(A.isArray(tableNode.$.rows));
            if (A.isArray(tableNode.$.rows)) {
              strictEqual(tableNode.$.rows.length, 2);
            }
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should preserve null direction in root node",
      () =>
        Effect.gen(function* () {
          const { userId, organizationId } = yield* setupTestContext;
          const docRepo = yield* DocumentRepo;

          const contentWithNullDirection: SerializedEditorStateEnvelope.Type = {
            root: {
              type: "root",
              version: 1,
              children: [{ type: "paragraph", version: 1 }],
              direction: null,
              format: "",
              indent: 0,
            },
          };

          const docInsert = makeMockDocument(organizationId, userId, {
            title: "Null Direction Test",
            contentRich: contentWithNullDirection,
          });

          const inserted = yield* docRepo.insert(docInsert);
          const found = unwrapSome(yield* docRepo.findById(inserted.id), "document findById");
          const retrievedRich = unwrapSome(found.contentRich, "contentRich");

          strictEqual(retrievedRich.root.direction, null);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should preserve numeric format values in root node",
      () =>
        Effect.gen(function* () {
          const { userId, organizationId } = yield* setupTestContext;
          const docRepo = yield* DocumentRepo;

          const contentWithNumericFormat: SerializedEditorStateEnvelope.Type = {
            root: {
              type: "root",
              version: 1,
              children: [{ type: "paragraph", version: 1 }],
              direction: "ltr",
              format: 5,
              indent: 0,
            },
          };

          const docInsert = makeMockDocument(organizationId, userId, {
            title: "Numeric Format Test",
            contentRich: contentWithNumericFormat,
          });

          const inserted = yield* docRepo.insert(docInsert);
          const found = unwrapSome(yield* docRepo.findById(inserted.id), "document findById");
          const retrievedRich = unwrapSome(found.contentRich, "contentRich");

          strictEqual(retrievedRich.root.format, 5);
        }),
      TEST_TIMEOUT
    );
  });
});
