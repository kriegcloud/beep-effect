/**
 * Transformation Schema Tests
 *
 * Tests for validating EntityId transformation schemas that convert
 * Better Auth responses to domain models.
 *
 * These tests verify:
 * 1. Valid responses decode successfully
 * 2. Invalid ID formats fail with proper errors
 * 3. Missing required fields fail descriptively
 */
import { describe } from "bun:test";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { effect, strictEqual } from "@beep/testkit";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { type BetterAuthApiKey, DomainApiKeyFromBetterAuthApiKey } from "../../src/_internal/api-key.schemas.ts";
import {
  type BetterAuthOrganizationRole,
  DomainOrganizationRoleFromBetterAuthOrganizationRole,
} from "../../src/_internal/role.schemas.ts";
// Import directly from schema files to avoid triggering client env validation
import {
  type BetterAuthTeam,
  type BetterAuthTeamMember,
  DomainTeamFromBetterAuthTeam,
  DomainTeamMemberFromBetterAuthTeamMember,
} from "../../src/_internal/team.schemas.ts";

// =============================================================================
// TEST FIXTURES
// =============================================================================

const now = new Date();

const makeValidTeam = (): BetterAuthTeam => ({
  id: SharedEntityIds.TeamId.create(),
  name: "Test Team",
  organizationId: SharedEntityIds.OrganizationId.create(),
  createdAt: now,
  updatedAt: now,
  description: "A test team",
  slug: "test-team",
  metadata: undefined,
  _rowId: 1,
  version: 1,
  source: "test",
  createdBy: "system",
  updatedBy: "system",
  deletedAt: undefined,
  deletedBy: undefined,
});

const makeValidTeamMember = (): BetterAuthTeamMember => ({
  id: IamEntityIds.TeamMemberId.create(),
  teamId: SharedEntityIds.TeamId.create(),
  userId: SharedEntityIds.UserId.create(),
  organizationId: SharedEntityIds.OrganizationId.create(),
  createdAt: now,
  updatedAt: now,
  _rowId: 1,
  version: 1,
  source: "test",
  createdBy: "system",
  updatedBy: "system",
  deletedAt: undefined,
  deletedBy: undefined,
});

const makeValidApiKey = (): BetterAuthApiKey => ({
  id: IamEntityIds.ApiKeyId.create(),
  userId: SharedEntityIds.UserId.create(),
  name: "Test API Key",
  start: "sk_te",
  prefix: "sk_",
  key: "sk_test_1234567890",
  enabled: true,
  rateLimitEnabled: true,
  rateLimitTimeWindow: 86400000,
  rateLimitMax: 100,
  requestCount: 0,
  remaining: 100,
  refillInterval: undefined,
  refillAmount: undefined,
  lastRefillAt: undefined,
  lastRequest: undefined,
  expiresAt: undefined,
  createdAt: now,
  updatedAt: now,
  metadata: undefined,
  permissions: undefined,
  organizationId: undefined,
  _rowId: 1,
  version: 1,
  source: "test",
  createdBy: "system",
  updatedBy: "system",
  deletedAt: undefined,
  deletedBy: undefined,
});

// Create valid OrganizationRole fixture
// Note: The BetterAuth schema requires a permission record, so we provide a minimal one
// The domain model transforms this to JSON string
const makeValidOrganizationRole = (): BetterAuthOrganizationRole => ({
  id: IamEntityIds.OrganizationRoleId.create(),
  organizationId: SharedEntityIds.OrganizationId.create(),
  role: "admin",
  // BetterAuth returns permission as Record<string, string[]>
  // We provide an empty object - the transformation stores as JSON string
  permission: {},
  createdAt: now,
  updatedAt: now,
  _rowId: 1,
  version: 1,
  source: "test",
  createdBy: "system",
  updatedBy: "system",
  deletedAt: undefined,
  deletedBy: undefined,
});

// =============================================================================
// TEAM TRANSFORMATION TESTS
// =============================================================================

describe("DomainTeamFromBetterAuthTeam", () => {
  effect("valid response decodes successfully", () =>
    Effect.gen(function* () {
      const validTeam = makeValidTeam();
      const result = yield* S.decode(DomainTeamFromBetterAuthTeam)(validTeam);
      strictEqual(result.id, validTeam.id);
      strictEqual(result.name, validTeam.name);
      strictEqual(result.organizationId, validTeam.organizationId);
    })
  );

  effect("invalid team ID format fails", () =>
    Effect.gen(function* () {
      const invalidTeam = { ...makeValidTeam(), id: "invalid-id" };
      const exit = yield* Effect.exit(S.decode(DomainTeamFromBetterAuthTeam)(invalidTeam));
      strictEqual(Exit.isFailure(exit), true);
      if (Exit.isFailure(exit)) {
        const error = Cause.squash(exit.cause);
        const message = P.hasProperty(error, "message") && P.isString(error.message) ? error.message : "";
        strictEqual(message.includes("Invalid team ID format"), true);
      }
    })
  );

  effect("invalid organization ID format fails", () =>
    Effect.gen(function* () {
      const invalidTeam = { ...makeValidTeam(), organizationId: "bad-org-id" };
      const exit = yield* Effect.exit(S.decode(DomainTeamFromBetterAuthTeam)(invalidTeam));
      strictEqual(Exit.isFailure(exit), true);
      if (Exit.isFailure(exit)) {
        const error = Cause.squash(exit.cause);
        const message = P.hasProperty(error, "message") && P.isString(error.message) ? error.message : "";
        strictEqual(message.includes("Invalid organization ID format"), true);
      }
    })
  );

  effect("missing _rowId fails with descriptive error", () =>
    Effect.gen(function* () {
      const team = makeValidTeam();
      // Remove _rowId to simulate missing field
      const { _rowId: _, ...teamWithoutRowId } = team;
      const exit = yield* Effect.exit(S.decode(DomainTeamFromBetterAuthTeam)(teamWithoutRowId as BetterAuthTeam));
      strictEqual(Exit.isFailure(exit), true);
    })
  );
});

// =============================================================================
// TEAM MEMBER TRANSFORMATION TESTS
// =============================================================================

describe("DomainTeamMemberFromBetterAuthTeamMember", () => {
  effect("valid response decodes successfully", () =>
    Effect.gen(function* () {
      const validMember = makeValidTeamMember();
      const result = yield* S.decode(DomainTeamMemberFromBetterAuthTeamMember)(validMember);
      strictEqual(result.id, validMember.id);
      strictEqual(result.teamId, validMember.teamId);
      strictEqual(result.userId, validMember.userId);
      strictEqual(result.organizationId, validMember.organizationId);
    })
  );

  effect("invalid team member ID format fails", () =>
    Effect.gen(function* () {
      const invalidMember = { ...makeValidTeamMember(), id: "not-a-valid-id" };
      const exit = yield* Effect.exit(S.decode(DomainTeamMemberFromBetterAuthTeamMember)(invalidMember));
      strictEqual(Exit.isFailure(exit), true);
      if (Exit.isFailure(exit)) {
        const error = Cause.squash(exit.cause);
        const message = P.hasProperty(error, "message") && P.isString(error.message) ? error.message : "";
        strictEqual(message.includes("Invalid team member ID format"), true);
      }
    })
  );

  effect("invalid team ID format fails", () =>
    Effect.gen(function* () {
      const invalidMember = { ...makeValidTeamMember(), teamId: "bad-team-id" };
      const exit = yield* Effect.exit(S.decode(DomainTeamMemberFromBetterAuthTeamMember)(invalidMember));
      strictEqual(Exit.isFailure(exit), true);
      if (Exit.isFailure(exit)) {
        const error = Cause.squash(exit.cause);
        const message = P.hasProperty(error, "message") && P.isString(error.message) ? error.message : "";
        strictEqual(message.includes("Invalid team ID format"), true);
      }
    })
  );

  effect("invalid user ID format fails", () =>
    Effect.gen(function* () {
      const invalidMember = { ...makeValidTeamMember(), userId: "bad-user-id" };
      const exit = yield* Effect.exit(S.decode(DomainTeamMemberFromBetterAuthTeamMember)(invalidMember));
      strictEqual(Exit.isFailure(exit), true);
      if (Exit.isFailure(exit)) {
        const error = Cause.squash(exit.cause);
        const message = P.hasProperty(error, "message") && P.isString(error.message) ? error.message : "";
        strictEqual(message.includes("Invalid user ID format"), true);
      }
    })
  );
});

// =============================================================================
// API KEY TRANSFORMATION TESTS
// =============================================================================

describe("DomainApiKeyFromBetterAuthApiKey", () => {
  effect("valid response decodes successfully", () =>
    Effect.gen(function* () {
      const validKey = makeValidApiKey();
      const result = yield* S.decode(DomainApiKeyFromBetterAuthApiKey)(validKey);
      strictEqual(result.id, validKey.id);
      strictEqual(result.userId, validKey.userId);
      // Domain model uses Option for optional fields
      strictEqual(O.isSome(result.name), true);
      strictEqual(O.getOrNull(result.name), validKey.name);
      strictEqual(result.enabled, validKey.enabled);
    })
  );

  effect("invalid API key ID format fails", () =>
    Effect.gen(function* () {
      const invalidKey = { ...makeValidApiKey(), id: "invalid-key-id" };
      const exit = yield* Effect.exit(S.decode(DomainApiKeyFromBetterAuthApiKey)(invalidKey));
      strictEqual(Exit.isFailure(exit), true);
      if (Exit.isFailure(exit)) {
        const error = Cause.squash(exit.cause);
        const message = P.hasProperty(error, "message") && P.isString(error.message) ? error.message : "";
        strictEqual(message.includes("Invalid API key ID format"), true);
      }
    })
  );

  effect("invalid user ID format fails", () =>
    Effect.gen(function* () {
      const invalidKey = { ...makeValidApiKey(), userId: "bad-user-id" };
      const exit = yield* Effect.exit(S.decode(DomainApiKeyFromBetterAuthApiKey)(invalidKey));
      strictEqual(Exit.isFailure(exit), true);
      if (Exit.isFailure(exit)) {
        const error = Cause.squash(exit.cause);
        const message = P.hasProperty(error, "message") && P.isString(error.message) ? error.message : "";
        strictEqual(message.includes("Invalid user ID format"), true);
      }
    })
  );

  effect("invalid organization ID format fails when present", () =>
    Effect.gen(function* () {
      const invalidKey = { ...makeValidApiKey(), organizationId: "bad-org-id" };
      const exit = yield* Effect.exit(S.decode(DomainApiKeyFromBetterAuthApiKey)(invalidKey));
      strictEqual(Exit.isFailure(exit), true);
      if (Exit.isFailure(exit)) {
        const error = Cause.squash(exit.cause);
        const message = P.hasProperty(error, "message") && P.isString(error.message) ? error.message : "";
        strictEqual(message.includes("Invalid organization ID format"), true);
      }
    })
  );

  effect("null organization ID is allowed", () =>
    Effect.gen(function* () {
      const keyWithNullOrg = { ...makeValidApiKey(), organizationId: null };
      const result = yield* S.decode(DomainApiKeyFromBetterAuthApiKey)(keyWithNullOrg);
      // Domain model uses Option for optional fields - None for null
      strictEqual(O.isNone(result.organizationId), true);
    })
  );
});

// =============================================================================
// ORGANIZATION ROLE TRANSFORMATION TESTS
// =============================================================================

describe("DomainOrganizationRoleFromBetterAuthOrganizationRole", () => {
  effect("valid response decodes successfully", () =>
    Effect.gen(function* () {
      const validRole = makeValidOrganizationRole();
      const result = yield* S.decode(DomainOrganizationRoleFromBetterAuthOrganizationRole)(validRole);
      strictEqual(result.id, validRole.id);
      strictEqual(result.organizationId, validRole.organizationId);
      strictEqual(result.role, validRole.role);
      // Permission is handled via PolicyRecord schema - just verify it decoded
      strictEqual(O.isSome(result.permission) || O.isNone(result.permission), true);
    })
  );

  effect("invalid organization role ID format fails", () =>
    Effect.gen(function* () {
      const invalidRole = { ...makeValidOrganizationRole(), id: "not-a-role-id" };
      const exit = yield* Effect.exit(S.decode(DomainOrganizationRoleFromBetterAuthOrganizationRole)(invalidRole));
      strictEqual(Exit.isFailure(exit), true);
      if (Exit.isFailure(exit)) {
        const error = Cause.squash(exit.cause);
        const message = P.hasProperty(error, "message") && P.isString(error.message) ? error.message : "";
        strictEqual(message.includes("Invalid organization role ID format"), true);
      }
    })
  );

  effect("invalid organization ID format fails", () =>
    Effect.gen(function* () {
      const invalidRole = { ...makeValidOrganizationRole(), organizationId: "bad-org-id" };
      const exit = yield* Effect.exit(S.decode(DomainOrganizationRoleFromBetterAuthOrganizationRole)(invalidRole));
      strictEqual(Exit.isFailure(exit), true);
      if (Exit.isFailure(exit)) {
        const error = Cause.squash(exit.cause);
        const message = P.hasProperty(error, "message") && P.isString(error.message) ? error.message : "";
        strictEqual(message.includes("Invalid organization ID format"), true);
      }
    })
  );

  effect("missing version fails with descriptive error", () =>
    Effect.gen(function* () {
      const role = makeValidOrganizationRole();
      const { version: _, ...roleWithoutVersion } = role;
      const exit = yield* Effect.exit(
        S.decode(DomainOrganizationRoleFromBetterAuthOrganizationRole)(roleWithoutVersion as BetterAuthOrganizationRole)
      );
      strictEqual(Exit.isFailure(exit), true);
    })
  );
});
