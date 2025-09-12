import type { EnvValue } from "@beep/constants";
import type { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain/EntityIds";
import * as IamEntityIds from "@beep/shared-domain/EntityIds/iam";
import { File } from "@beep/shared-domain/entities";
import type * as Organization from "@beep/shared-domain/Organization";
import { describe, expect, it } from "@effect/vitest";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const { UploadPath, ShardPrefix, ShardPrefixDecoded } = File;

describe("File.UploadPath", () => {
  describe("ShardPrefix", () => {
    it("should generate consistent shard prefix from fileId", () => {
      const fileId = "file__12345678-1234-1234-1234-123456789012" as SharedEntityIds.FileId.Type;

      const shardPrefix1 = ShardPrefix.fromFileId(fileId);
      const shardPrefix2 = ShardPrefix.fromFileId(fileId);

      expect(shardPrefix1).toEqual(shardPrefix2);
    });

    it("should generate different shard prefixes for different fileIds", () => {
      const fileId1 = "file__12345678-1234-1234-1234-123456789012" as SharedEntityIds.FileId.Type;
      const fileId2 = "file__87654321-4321-4321-4321-210987654321" as SharedEntityIds.FileId.Type;

      const shardPrefix1 = ShardPrefix.fromFileId(fileId1);
      const shardPrefix2 = ShardPrefix.fromFileId(fileId2);

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

  describe("UploadPath bidirectional transformation", () => {
    const mockUploadPathDecoded: File.UploadPathDecoded.Type = {
      env: "dev" as EnvValue.Type,
      fileId: "file__12345678-1234-1234-1234-123456789012" as SharedEntityIds.FileId.Type,
      organizationType: "individual" as Organization.OrganizationType.Type,
      organizationId: "organization__87654321-4321-4321-4321-210987654321" as SharedEntityIds.OrganizationId.Type,
      entityKind: "user" as const,
      entityIdentifier: IamEntityIds.UserId.make(`user__87654321-4321-4321-4321-210987654321`),
      entityAttribute: "avatar",
      fileItemExtension: "jpg" as BS.FileExtension.Type,
    };

    it("should decode UploadPathDecoded to UploadPathEncoded", () => {
      return Effect.gen(function* () {
        const encoded = yield* S.decode(UploadPath)(mockUploadPathDecoded);

        // Verify the encoded path has the expected structure
        expect(encoded).toMatch(
          /^\/dev\/tenants\/[a-f0-9]{2}\/individual\/organization__[a-f0-9-]+\/user\/user__87654321-4321-4321-4321-210987654321\/avatar\/\d{4}\/\d{1,2}\/file__[a-f0-9-]+\.jpg$/
        );

        // Verify it contains the expected components
        expect(encoded).toContain("/dev/tenants/"); //"" as IamEntityIds.UserId.Type,
        expect(encoded).toContain("/individual/");
        expect(encoded).toContain("/user/user__87654321-4321-4321-4321-210987654321/avatar/");
        expect(encoded).toContain(".jpg");
      }).pipe(Effect.runPromise);
    });

    it("should encode UploadPathEncoded back to UploadPathDecoded", () => {
      return Effect.gen(function* () {
        // First encode to get a valid path
        const encoded = yield* S.decode(UploadPath)(mockUploadPathDecoded);

        // Then decode it back
        const decoded = yield* S.encode(UploadPath)(encoded);

        // Verify all fields match the original (except we can't predict year/month)
        expect(decoded.env).toBe(mockUploadPathDecoded.env);
        expect(decoded.fileId).toBe(mockUploadPathDecoded.fileId);
        expect(decoded.organizationType).toBe(mockUploadPathDecoded.organizationType);
        expect(decoded.organizationId).toBe(mockUploadPathDecoded.organizationId);
        expect(decoded.entityKind).toBe(mockUploadPathDecoded.entityKind);
        expect(decoded.entityIdentifier).toBe(mockUploadPathDecoded.entityIdentifier);
        expect(decoded.entityAttribute).toBe(mockUploadPathDecoded.entityAttribute);
        expect(decoded.fileItemExtension).toBe(mockUploadPathDecoded.fileItemExtension);
      }).pipe(Effect.runPromise);
    });

    it("should handle round-trip transformation correctly", () => {
      return Effect.gen(function* () {
        // Decode to encoded format
        const encoded = yield* S.decode(UploadPath)(mockUploadPathDecoded);

        // Encode back to decoded format
        const decoded = yield* S.encode(UploadPath)(encoded);

        // Decode again to encoded format
        const encodedAgain = yield* S.decode(UploadPath)(decoded);

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

        const encoded = yield* S.decode(UploadPath)(mockUploadPathDecoded);

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
        const encoded1 = yield* S.decode(UploadPath)(mockUploadPathDecoded);
        const encoded2 = yield* S.decode(UploadPath)(mockUploadPathDecoded);

        // Extract shard prefix from both paths
        const shardPrefix1 = encoded1.split("/")[3];
        const shardPrefix2 = encoded2.split("/")[3];

        expect(shardPrefix1).toBe(shardPrefix2);
        expect(shardPrefix1).toMatch(/^[a-f0-9]{2}$/);
      }).pipe(Effect.runPromise);
    });
  });

  describe("UploadPath validation", () => {
    it("should reject invalid environment values", () => {
      const invalidDecoded = {
        env: "invalid",
        fileId: "file__12345678-1234-1234-1234-123456789012" as SharedEntityIds.FileId.Type,
        organizationType: "individual" as Organization.OrganizationType.Type,
        organizationId: "organization__87654321-4321-4321-4321-210987654321" as SharedEntityIds.OrganizationId.Type,
        entityKind: "user" as const,
        entityIdentifier: "user__87654321-4321-4321-4321-210987654321" as IamEntityIds.UserId.Type,
        entityAttribute: "avatar",
        fileItemExtension: "jpg" as BS.FileExtension.Type,
      };

      return Effect.gen(function* () {
        // @ts-expect-error
        const result = yield* Effect.either(S.decode(UploadPath)(invalidDecoded));
        expect(result._tag).toBe("Left");
      }).pipe(Effect.runPromise);
    });

    it("should reject invalid file extensions", () => {
      const invalidDecoded = {
        env: "dev" as EnvValue.Type,
        fileId: "file__12345678-1234-1234-1234-123456789012" as SharedEntityIds.FileId.Type,
        organizationType: "individual" as Organization.OrganizationType.Type,
        organizationId: "organization__87654321-4321-4321-4321-210987654321" as SharedEntityIds.OrganizationId.Type,
        entityKind: "user" as const,
        entityIdentifier: "user__87654321-4321-4321-4321-210987654321" as IamEntityIds.UserId.Type,
        entityAttribute: "avatar",
        fileItemExtension: "invalid",
      };

      return Effect.gen(function* () {
        // @ts-expect-error
        const result = yield* Effect.either(S.decode(UploadPath)(invalidDecoded));
        expect(result._tag).toBe("Left");
      }).pipe(Effect.runPromise);
    });

    it("should reject malformed encoded paths", () => {
      const invalidEncodedPath = "/invalid/path/structure" as File.UploadPathEncoded.Type;

      return Effect.gen(function* () {
        const result = yield* Effect.either(S.encode(UploadPath)(invalidEncodedPath));
        expect(result._tag).toBe("Left");
      }).pipe(Effect.runPromise);
    });
  });

  describe("UploadPath edge cases", () => {
    it("should handle different entity kinds", () => {
      const entityKinds = ["organization", "user", "team"] as const;

      return Effect.gen(function* () {
        for (const entityKind of entityKinds) {
          const decoded = {
            ...{
              env: "dev" as EnvValue.Type,
              fileId: "file__12345678-1234-1234-1234-123456789012" as SharedEntityIds.FileId.Type,
              organizationType: "individual" as Organization.OrganizationType.Type,
              organizationId:
                "organization__87654321-4321-4321-4321-210987654321" as SharedEntityIds.OrganizationId.Type,
              entityKind: "user" as const,
              entityIdentifier: "user__87654321-4321-4321-4321-210987654321" as IamEntityIds.UserId.Type,
              entityAttribute: "avatar",
              fileItemExtension: "jpg" as BS.FileExtension.Type,
            },
            entityKind,
          };

          const encoded = yield* S.decode(UploadPath)(decoded);
          expect(encoded).toContain(`/${entityKind}/`);

          const decodedBack = yield* S.encode(UploadPath)(encoded);
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
            fileId: "file__12345678-1234-1234-1234-123456789012" as SharedEntityIds.FileId.Type,
            organizationType: organizationType as Organization.OrganizationType.Type,
            organizationId: "organization__87654321-4321-4321-4321-210987654321" as SharedEntityIds.OrganizationId.Type,
            entityKind: "user" as const,
            entityIdentifier: "user__87654321-4321-4321-4321-210987654321" as IamEntityIds.UserId.Type,
            entityAttribute: "avatar",
            fileItemExtension: "jpg" as BS.FileExtension.Type,
          };

          const encoded = yield* S.decode(UploadPath)(decoded);
          expect(encoded).toContain(`/${organizationType}/`);

          const decodedBack = yield* S.encode(UploadPath)(encoded);
          expect(decodedBack.organizationType).toBe(organizationType);
        }
      }).pipe(Effect.runPromise);
    });

    it("should handle different environments", () => {
      const environments = ["dev", "staging", "prod"] as const;

      return Effect.gen(function* () {
        for (const env of environments) {
          const decoded = {
            env: env as EnvValue.Type,
            fileId: "file__12345678-1234-1234-1234-123456789012" as SharedEntityIds.FileId.Type,
            organizationType: "individual" as Organization.OrganizationType.Type,
            organizationId: "organization__87654321-4321-4321-4321-210987654321" as SharedEntityIds.OrganizationId.Type,
            entityKind: "user" as const,
            entityIdentifier: "user__87654321-4321-4321-4321-210987654321" as IamEntityIds.UserId.Type,
            entityAttribute: "avatar",
            fileItemExtension: "jpg" as BS.FileExtension.Type,
          };

          const encoded = yield* S.decode(UploadPath)(decoded);
          expect(encoded.startsWith(`/${env}/`)).toBe(true);

          const decodedBack = yield* S.encode(UploadPath)(encoded);
          expect(decodedBack.env).toBe(env);
        }
      }).pipe(Effect.runPromise);
    });
  });
});
