import { describe, expect, it } from "bun:test";
import { EnvValue } from "@beep/constants";
import { BS } from "@beep/schema";
import { File } from "@beep/shared-domain/entities";
import * as Organization from "@beep/shared-domain/entities/Organization";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const { UploadKey, ShardPrefix, ShardPrefixDecoded } = File;

describe("File.UploadKey", () => {
  describe("ShardPrefix", () => {
    it("should generate consistent shard prefix from fileId", () => {
      const fileId = "shared_file__12345678-1234-1234-1234-123456789012" as SharedEntityIds.FileId.Type;

      const shardPrefix1 = UploadKey.shardPrefixFromFileId(fileId);
      const shardPrefix2 = UploadKey.shardPrefixFromFileId(fileId);

      expect(shardPrefix1).toEqual(shardPrefix2);
    });

    it("should generate different shard prefixes for different fileIds", () => {
      const fileId1 = "shared_file__12345678-1234-1234-1234-123456789012" as SharedEntityIds.FileId.Type;
      const fileId2 = "shared_file__87654321-4321-4321-4321-210987654321" as SharedEntityIds.FileId.Type;

      const shardPrefix1 = UploadKey.shardPrefixFromFileId(fileId1);
      const shardPrefix2 = UploadKey.shardPrefixFromFileId(fileId2);

      expect(shardPrefix1).not.toEqual(shardPrefix2);
    });

    it("should validate ShardPrefixDecoded format", () => {
      const validShardPrefix = "a1";
      const invalidShardPrefix = "gg"; // invalid hex

      expect(() => S.decodeUnknownSync(ShardPrefixDecoded)(validShardPrefix)).not.toThrow();
      expect(() => S.decodeUnknownSync(ShardPrefixDecoded)(invalidShardPrefix)).toThrow();
    });

    it("should transform between encoded and decoded shard prefix", () => {
      const encoded = "2f" as File.ShardPrefixEncoded.Type;
      const decoded = S.decodeUnknownSync(ShardPrefix)(encoded);
      const backToEncoded = S.encodeSync(ShardPrefix)(decoded);

      expect(backToEncoded).toBe(encoded);
    });
  });

  describe("UploadKey bidirectional transformation", () => {
    const mockUploadKeyDecoded: File.UploadKeyDecoded.Type = {
      env: EnvValue.Enum.dev,
      fileId: SharedEntityIds.FileId.make("shared_file__12345678-1234-1234-1234-123456789012"),
      organizationType: Organization.OrganizationType.Enum.individual,
      organizationId: SharedEntityIds.OrganizationId.make("shared_organization__87654321-4321-4321-4321-210987654321"),
      entityKind: SharedEntityIds.UserId.tableName,
      entityIdentifier: SharedEntityIds.UserId.make(`shared_user__87654321-4321-4321-4321-210987654321`),
      entityAttribute: "avatar",
      extension: BS.FileExtension.Enum.jpg,
    };

    it("should decode UploadKeyDecoded to UploadKeyEncoded", () => {
      return Effect.gen(function* () {
        const encoded = yield* S.decode(UploadKey)(mockUploadKeyDecoded);

        // Verify the encoded path has the expected structure

        expect(encoded).toMatch(
          /^\/dev\/tenants\/[a-f0-9]{2}\/individual\/shared_organization__[a-f0-9-]+\/shared_user\/shared_user__87654321-4321-4321-4321-210987654321\/avatar\/\d{4}\/\d{1,2}\/shared_file__[a-f0-9-]+\.jpg$/
        );

        // Verify it contains the expected components
        expect(encoded).toContain("/dev/tenants/"); //"" as SharedEntityIds.UserId.Type,
        expect(encoded).toContain("/individual/");
        expect(encoded).toContain("/shared_user/shared_user__87654321-4321-4321-4321-210987654321/avatar/");
        expect(encoded).toContain(".jpg");
      }).pipe(Effect.runPromise);
    });

    it("should encode UploadKeyEncoded back to UploadKeyDecoded", () => {
      return Effect.gen(function* () {
        // First encode to get a valid path
        const encoded = yield* S.decode(UploadKey)(mockUploadKeyDecoded);

        // Then decode it back
        const decoded = yield* S.encode(UploadKey)(encoded);

        // Verify all fields match the original (except we can't predict year/month)
        expect(decoded.env).toBe(mockUploadKeyDecoded.env);
        expect(decoded.fileId).toBe(mockUploadKeyDecoded.fileId);
        expect(decoded.organizationType).toBe(mockUploadKeyDecoded.organizationType);
        expect(decoded.organizationId).toBe(mockUploadKeyDecoded.organizationId);
        expect(decoded.entityKind).toBe(mockUploadKeyDecoded.entityKind);
        expect(decoded.entityIdentifier).toBe(mockUploadKeyDecoded.entityIdentifier);
        expect(decoded.entityAttribute).toBe(mockUploadKeyDecoded.entityAttribute);
        expect(decoded.extension).toBe(mockUploadKeyDecoded.extension);
      }).pipe(Effect.runPromise);
    });

    it("should handle round-trip transformation correctly", () => {
      return Effect.gen(function* () {
        // Decode to encoded format
        const encoded = yield* S.decode(UploadKey)(mockUploadKeyDecoded);

        // Encode back to decoded format
        const decoded = yield* S.encode(UploadKey)(encoded);

        // Decode again to encoded format
        const encodedAgain = yield* S.decode(UploadKey)(decoded);

        // The two encoded versions should be identical
        expect(encodedAgain).toBe(encoded);
      }).pipe(Effect.runPromise);
    });

    it("should automatically generate current year and zero-padded month", () => {
      return Effect.gen(function* () {
        const now = DateTime.unsafeNow();
        const currentYear = DateTime.getPartUtc(now, "year");
        const currentMonth = DateTime.getPartUtc(now, "month");

        // Convert month number to zero-padded string (01-12)
        const paddedMonth = currentMonth.toString().padStart(2, "0");

        const encoded = yield* S.decode(UploadKey)(mockUploadKeyDecoded);

        expect(encoded).toContain(`/${currentYear}/`);
        expect(encoded).toContain(`/${paddedMonth}/`);

        // Verify the month is always zero-padded (2 digits)
        const monthMatch = encoded.match(/\/(\d{2})\//g);
        const monthFromPath = monthMatch?.find((match) =>
          ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].includes(match.slice(1, -1))
        );
        expect(monthFromPath).toBeDefined();
        expect(monthFromPath?.slice(1, -1)).toBe(paddedMonth);
      }).pipe(Effect.runPromise);
    });

    it("should generate consistent shard prefix for same fileId", () => {
      return Effect.gen(function* () {
        const encoded1 = yield* S.decode(UploadKey)(mockUploadKeyDecoded);
        const encoded2 = yield* S.decode(UploadKey)(mockUploadKeyDecoded);

        // Extract shard prefix from both paths
        const shardPrefix1 = encoded1.split("/")[3];
        const shardPrefix2 = encoded2.split("/")[3];

        expect(shardPrefix1).toBe(shardPrefix2);
        expect(shardPrefix1).toMatch(/^[a-f0-9]{2}$/);
      }).pipe(Effect.runPromise);
    });
  });

  describe("UploadKey validation", () => {
    it("should reject invalid environment values", () => {
      const invalidDecoded = {
        env: "invalid",
        fileId: SharedEntityIds.FileId.make("shared_file__12345678-1234-1234-1234-123456789012"),
        organizationType: Organization.OrganizationType.Enum.individual,
        organizationId: SharedEntityIds.OrganizationId.make(
          "shared_organization__87654321-4321-4321-4321-210987654321"
        ),
        entityKind: SharedEntityIds.UserId.tableName,
        entityIdentifier: SharedEntityIds.UserId.make("shared_user__87654321-4321-4321-4321-210987654321"),
        entityAttribute: "avatar",
        extension: BS.FileExtension.Enum.jpg,
      };

      return Effect.gen(function* () {
        // @ts-expect-error
        const result = yield* Effect.either(S.decode(UploadKey)(invalidDecoded));
        expect(result._tag).toBe("Left");
      }).pipe(Effect.runPromise);
    });

    it("should reject invalid file extensions", () => {
      const invalidDecoded = {
        env: "dev" as EnvValue.Type,
        fileId: SharedEntityIds.FileId.make("shared_file__12345678-1234-1234-1234-123456789012"),
        organizationType: Organization.OrganizationType.Enum.individual,
        organizationId: SharedEntityIds.OrganizationId.make(
          "shared_organization__87654321-4321-4321-4321-210987654321"
        ),
        entityKind: SharedEntityIds.UserId.tableName,
        entityIdentifier: SharedEntityIds.UserId.make("shared_user__87654321-4321-4321-4321-210987654321"),
        entityAttribute: "avatar",
        extension: "invalid",
      };

      return Effect.gen(function* () {
        // @ts-expect-error
        const result = yield* Effect.either(S.decode(UploadKey)(invalidDecoded));
        expect(result._tag).toBe("Left");
      }).pipe(Effect.runPromise);
    });

    it("should reject malformed encoded paths", () => {
      const invalidEncodedPath = "/invalid/path/structure" as File.UploadKeyEncoded.Type;

      return Effect.gen(function* () {
        const result = yield* Effect.either(S.encode(UploadKey)(invalidEncodedPath));
        expect(result._tag).toBe("Left");
      }).pipe(Effect.runPromise);
    });
  });

  describe("UploadKey edge cases", () => {
    it("should handle different entity kinds", () => {
      const entityKinds = ["shared_organization", "shared_user", "shared_team"] as const;

      return Effect.gen(function* () {
        for (const entityKind of entityKinds) {
          const decoded = {
            ...{
              env: "dev" as EnvValue.Type,
              fileId: SharedEntityIds.FileId.make("shared_file__12345678-1234-1234-1234-123456789012"),
              organizationType: Organization.OrganizationType.Enum.individual,
              organizationId: SharedEntityIds.OrganizationId.make(
                "shared_organization__87654321-4321-4321-4321-210987654321"
              ),
              entityKind: SharedEntityIds.UserId.tableName,
              entityIdentifier: SharedEntityIds.UserId.make("shared_user__87654321-4321-4321-4321-210987654321"),
              entityAttribute: "avatar",
              extension: BS.FileExtension.Enum.jpg,
            },
            entityKind,
          };

          const encoded = yield* S.decode(UploadKey)(decoded);
          expect(encoded).toContain(`/${entityKind}/`);

          const decodedBack = yield* S.encode(UploadKey)(encoded);
          expect(decodedBack.entityKind).toBe(entityKind);
        }
      }).pipe(Effect.runPromise);
    });

    it("should handle different organization types", () => {
      const orgTypes = ["individual", "team", "enterprise"] as const;

      return Effect.gen(function* () {
        for (const organizationType of orgTypes) {
          const decoded = {
            env: "dev" as EnvValue.Type,
            fileId: SharedEntityIds.FileId.make("shared_file__12345678-1234-1234-1234-123456789012"),
            organizationType: organizationType as Organization.OrganizationType.Type,
            organizationId: SharedEntityIds.OrganizationId.make(
              "shared_organization__87654321-4321-4321-4321-210987654321"
            ),
            entityKind: SharedEntityIds.UserId.tableName,
            entityIdentifier: SharedEntityIds.UserId.make("shared_user__87654321-4321-4321-4321-210987654321"),
            entityAttribute: "avatar",
            extension: BS.FileExtension.Enum.jpg,
          };

          const encoded = yield* S.decode(UploadKey)(decoded);
          expect(encoded).toContain(`/${organizationType}/`);

          const decodedBack = yield* S.encode(UploadKey)(encoded);
          expect(decodedBack.organizationType).toBe(organizationType);
        }
      }).pipe(Effect.runPromise);
    });

    it("should handle different environments", () => {
      return Effect.gen(function* () {
        for (const env of EnvValue.Options) {
          const decoded = {
            env: env as EnvValue.Type,
            fileId: SharedEntityIds.FileId.make("shared_file__12345678-1234-1234-1234-123456789012"),
            organizationType: Organization.OrganizationType.Enum.individual,
            organizationId: SharedEntityIds.OrganizationId.make(
              "shared_organization__87654321-4321-4321-4321-210987654321"
            ),
            entityKind: SharedEntityIds.UserId.tableName,
            entityIdentifier: SharedEntityIds.UserId.make("shared_user__87654321-4321-4321-4321-210987654321"),
            entityAttribute: "avatar",
            extension: BS.FileExtension.Enum.jpg,
          };

          const encoded = yield* S.decode(UploadKey)(decoded);
          expect(encoded.startsWith(`/${env}/`)).toBe(true);

          const decodedBack = yield* S.encode(UploadKey)(encoded);
          expect(decodedBack.env).toBe(env);
        }
      }).pipe(Effect.runPromise);
    });
  });
});
