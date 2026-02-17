import { PgTest } from "@/db/pg-live";
import { describe, expect, it } from "@effect/vitest";
import { type UserId } from "@example/domain/policy";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { randomUUID } from "node:crypto";
import { FilesRepo } from "./files-repo.js";

const Live = FilesRepo.DefaultWithoutDependencies.pipe(Layer.provideMerge(PgTest));

const makeUserId = () => randomUUID() as UserId;

it.layer(Live, { timeout: "30 seconds" })("FilesRepo", (it) => {
  describe("insertFolder", () => {
    it.effect(
      "creates a folder with generated id and timestamps",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId = makeUserId();

        const folder = yield* repo.insertFolder({
          userId,
          name: "Documents",
        });

        expect(folder.name).toBe("Documents");
        expect(folder.id).toBeDefined();
        expect(folder.createdAt).toBeDefined();
        expect(folder.updatedAt).toBeDefined();
      }),
    );
  });

  describe("insertFile", () => {
    it.effect(
      "creates a file in a folder",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId = makeUserId();

        const folder = yield* repo.insertFolder({
          userId,
          name: "Images",
        });

        const file = yield* repo.insertFile({
          userId,
          folderId: folder.id,
          uploadthingKey: "abc123",
          uploadthingUrl: "https://uploadthing.com/abc123",
          name: "photo.jpg",
          size: "1024000",
          mimeType: "image/jpeg",
          uploadedByUserId: userId,
        });

        expect(file.name).toBe("photo.jpg");
        expect(file.folderId).toBe(folder.id);
        expect(file.uploadthingKey).toBe("abc123");
        expect(file.uploadthingUrl).toBe("https://uploadthing.com/abc123");
        expect(file.size).toBe("1024000");
        expect(file.mimeType).toBe("image/jpeg");
        expect(file.id).toBeDefined();
        expect(file.createdAt).toBeDefined();
        expect(file.updatedAt).toBeDefined();
      }),
    );

    it.effect(
      "creates a root-level file when folderId is null",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId = makeUserId();

        const file = yield* repo.insertFile({
          userId,
          folderId: null,
          uploadthingKey: "xyz789",
          uploadthingUrl: "https://uploadthing.com/xyz789",
          name: "readme.txt",
          size: "512",
          mimeType: "text/plain",
          uploadedByUserId: userId,
        });

        expect(file.name).toBe("readme.txt");
        expect(file.folderId).toBeNull();
      }),
    );
  });

  describe("listPaginated", () => {
    it.effect(
      "returns empty results for user with no data",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId = makeUserId();

        const result = yield* repo.listPaginated({
          userId,
          offset: 0,
          limit: 10,
        });

        expect(result.rootFiles).toHaveLength(0);
        expect(result.folders).toHaveLength(0);
        expect(result.total).toBe(0);
        expect(result.hasNext).toBe(false);
      }),
    );

    it.effect(
      "returns folders with nested files ordered by updated_at DESC",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId = makeUserId();

        const folder = yield* repo.insertFolder({
          userId,
          name: "Photos",
        });

        yield* repo.insertFile({
          userId,
          folderId: folder.id,
          uploadthingKey: "photo1",
          uploadthingUrl: "https://uploadthing.com/photo1",
          name: "sunset.jpg",
          size: "2000000",
          mimeType: "image/jpeg",
          uploadedByUserId: userId,
        });

        yield* repo.insertFile({
          userId,
          folderId: folder.id,
          uploadthingKey: "photo2",
          uploadthingUrl: "https://uploadthing.com/photo2",
          name: "beach.jpg",
          size: "3000000",
          mimeType: "image/jpeg",
          uploadedByUserId: userId,
        });

        const result = yield* repo.listPaginated({
          userId,
          offset: 0,
          limit: 10,
        });

        expect(result.folders).toHaveLength(1);
        expect(result.folders[0]?.name).toBe("Photos");
        expect(result.folders[0]?.files).toHaveLength(2);
        expect(result.total).toBe(1);
        expect(result.hasNext).toBe(false);

        const fileNames = result.folders[0]!.files.map((f) => f.name);
        expect(fileNames).toContain("sunset.jpg");
        expect(fileNames).toContain("beach.jpg");
      }),
    );

    it.effect(
      "returns root files separately from folders",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId = makeUserId();

        yield* repo.insertFile({
          userId,
          folderId: null,
          uploadthingKey: "root1",
          uploadthingUrl: "https://uploadthing.com/root1",
          name: "config.json",
          size: "100",
          mimeType: "application/json",
          uploadedByUserId: userId,
        });

        const result = yield* repo.listPaginated({
          userId,
          offset: 0,
          limit: 10,
        });

        expect(result.rootFiles).toHaveLength(1);
        expect(result.rootFiles[0]?.name).toBe("config.json");
        expect(result.rootFiles[0]?.folderId).toBeNull();
        expect(result.folders).toHaveLength(0);
      }),
    );

    it.effect(
      "paginates folders correctly",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId = makeUserId();

        for (let i = 0; i < 5; i++) {
          yield* repo.insertFolder({
            userId,
            name: `Folder ${i + 1}`,
          });
        }

        const firstPage = yield* repo.listPaginated({
          userId,
          offset: 0,
          limit: 2,
        });
        expect(firstPage.folders).toHaveLength(2);
        expect(firstPage.total).toBe(5);
        expect(firstPage.hasNext).toBe(true);

        const lastPage = yield* repo.listPaginated({
          userId,
          offset: 4,
          limit: 2,
        });
        expect(lastPage.folders).toHaveLength(1);
        expect(lastPage.total).toBe(5);
        expect(lastPage.hasNext).toBe(false);
      }),
    );

    it.effect(
      "isolates data between users",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId1 = makeUserId();
        const userId2 = makeUserId();

        yield* repo.insertFolder({ userId: userId1, name: "User1 Folder" });
        yield* repo.insertFolder({ userId: userId2, name: "User2 Folder" });

        const user1Result = yield* repo.listPaginated({
          userId: userId1,
          offset: 0,
          limit: 10,
        });
        expect(user1Result.folders).toHaveLength(1);
        expect(user1Result.folders[0]?.name).toBe("User1 Folder");

        const user2Result = yield* repo.listPaginated({
          userId: userId2,
          offset: 0,
          limit: 10,
        });
        expect(user2Result.folders).toHaveLength(1);
        expect(user2Result.folders[0]?.name).toBe("User2 Folder");
      }),
    );
  });

  describe("deleteFiles", () => {
    it.effect(
      "removes files and returns their uploadthing keys",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId = makeUserId();

        const file = yield* repo.insertFile({
          userId,
          folderId: null,
          uploadthingKey: "root123",
          uploadthingUrl: "https://uploadthing.com/root123",
          name: "root.txt",
          size: "100",
          mimeType: "text/plain",
          uploadedByUserId: userId,
        });

        const uploadthingKeys = yield* repo.deleteFiles({
          fileIds: [file.id],
          userId,
        });

        expect(uploadthingKeys).toEqual(["root123"]);

        const result = yield* repo.listPaginated({
          userId,
          offset: 0,
          limit: 10,
        });
        expect(result.rootFiles).toHaveLength(0);
      }),
    );

    it.effect(
      "does not delete files belonging to other users",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId1 = makeUserId();
        const userId2 = makeUserId();

        const file = yield* repo.insertFile({
          userId: userId1,
          folderId: null,
          uploadthingKey: "protected123",
          uploadthingUrl: "https://uploadthing.com/protected123",
          name: "secret.txt",
          size: "200",
          mimeType: "text/plain",
          uploadedByUserId: userId1,
        });

        const uploadthingKeys = yield* repo.deleteFiles({
          fileIds: [file.id],
          userId: userId2,
        });

        expect(uploadthingKeys).toEqual([]);

        const result = yield* repo.listPaginated({
          userId: userId1,
          offset: 0,
          limit: 10,
        });
        expect(result.rootFiles).toHaveLength(1);
        expect(result.rootFiles[0]?.id).toBe(file.id);
      }),
    );
  });

  describe("deleteFolders", () => {
    it.effect(
      "removes folder and returns uploadthing keys of contained files",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId = makeUserId();

        const folder = yield* repo.insertFolder({
          userId,
          name: "ToDelete",
        });

        yield* repo.insertFile({
          userId,
          folderId: folder.id,
          uploadthingKey: "file1",
          uploadthingUrl: "https://uploadthing.com/file1",
          name: "file1.txt",
          size: "100",
          mimeType: "text/plain",
          uploadedByUserId: userId,
        });

        yield* repo.insertFile({
          userId,
          folderId: folder.id,
          uploadthingKey: "file2",
          uploadthingUrl: "https://uploadthing.com/file2",
          name: "file2.txt",
          size: "200",
          mimeType: "text/plain",
          uploadedByUserId: userId,
        });

        const uploadthingKeys = yield* repo.deleteFolders({
          folderIds: [folder.id],
          userId,
        });

        expect(uploadthingKeys.sort()).toEqual(["file1", "file2"]);

        const result = yield* repo.listPaginated({
          userId,
          offset: 0,
          limit: 10,
        });
        expect(result.folders).toHaveLength(0);
      }),
    );
  });

  describe("moveFiles", () => {
    it.effect(
      "moves files between folders",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId = makeUserId();

        const sourceFolder = yield* repo.insertFolder({
          userId,
          name: "Source",
        });

        const destFolder = yield* repo.insertFolder({
          userId,
          name: "Destination",
        });

        const file = yield* repo.insertFile({
          userId,
          folderId: sourceFolder.id,
          uploadthingKey: "move1",
          uploadthingUrl: "https://uploadthing.com/move1",
          name: "file.txt",
          size: "100",
          mimeType: "text/plain",
          uploadedByUserId: userId,
        });

        yield* repo.moveFiles({
          fileIds: [file.id],
          folderId: destFolder.id,
          userId,
        });

        const result = yield* repo.listPaginated({
          userId,
          offset: 0,
          limit: 10,
        });

        const source = result.folders.find((f) => f.id === sourceFolder.id);
        const dest = result.folders.find((f) => f.id === destFolder.id);

        expect(source?.files).toHaveLength(0);
        expect(dest?.files).toHaveLength(1);
        expect(dest?.files[0]?.id).toBe(file.id);
      }),
    );

    it.effect(
      "moves files to root level when folderId is null",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId = makeUserId();

        const folder = yield* repo.insertFolder({
          userId,
          name: "Source",
        });

        const file = yield* repo.insertFile({
          userId,
          folderId: folder.id,
          uploadthingKey: "toroot1",
          uploadthingUrl: "https://uploadthing.com/toroot1",
          name: "file.txt",
          size: "100",
          mimeType: "text/plain",
          uploadedByUserId: userId,
        });

        yield* repo.moveFiles({
          fileIds: [file.id],
          folderId: null,
          userId,
        });

        const result = yield* repo.listPaginated({
          userId,
          offset: 0,
          limit: 10,
        });

        const source = result.folders.find((f) => f.id === folder.id);
        expect(source?.files).toHaveLength(0);
        expect(result.rootFiles).toHaveLength(1);
        expect(result.rootFiles[0]?.id).toBe(file.id);
      }),
    );
  });

  describe("getFilesByKeys", () => {
    it.effect(
      "returns files matching the provided keys",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId = makeUserId();

        const file1 = yield* repo.insertFile({
          userId,
          folderId: null,
          uploadthingKey: "test-key-123",
          uploadthingUrl: "https://uploadthing.com/test-key-123",
          name: "test-file-1.pdf",
          size: "50000",
          mimeType: "application/pdf",
          uploadedByUserId: userId,
        });

        const file2 = yield* repo.insertFile({
          userId,
          folderId: null,
          uploadthingKey: "test-key-456",
          uploadthingUrl: "https://uploadthing.com/test-key-456",
          name: "test-file-2.pdf",
          size: "75000",
          mimeType: "application/pdf",
          uploadedByUserId: userId,
        });

        const result = yield* repo.getFilesByKeys({
          uploadthingKeys: ["test-key-123", "test-key-456"],
          userId,
        });

        expect(result).toHaveLength(2);
        expect(result[0]?.id).toBe(file1.id);
        expect(result[1]?.id).toBe(file2.id);
      }),
    );

    it.effect(
      "returns null for non-existent keys while preserving order",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId = makeUserId();

        const file = yield* repo.insertFile({
          userId,
          folderId: null,
          uploadthingKey: "existing-key",
          uploadthingUrl: "https://uploadthing.com/existing-key",
          name: "existing-file.pdf",
          size: "50000",
          mimeType: "application/pdf",
          uploadedByUserId: userId,
        });

        const result = yield* repo.getFilesByKeys({
          uploadthingKeys: ["nonexistent-key", "existing-key", "another-missing"],
          userId,
        });

        expect(result).toHaveLength(3);
        expect(result[0]).toBeNull();
        expect(result[1]?.id).toBe(file.id);
        expect(result[2]).toBeNull();
      }),
    );

    it.effect(
      "returns empty array for empty input",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId = makeUserId();

        const result = yield* repo.getFilesByKeys({
          uploadthingKeys: [],
          userId,
        });

        expect(result).toEqual([]);
      }),
    );

    it.effect(
      "returns null for files belonging to other users",
      Effect.fn(function* () {
        const repo = yield* FilesRepo;
        const userId1 = makeUserId();
        const userId2 = makeUserId();

        yield* repo.insertFile({
          userId: userId1,
          folderId: null,
          uploadthingKey: "private-key",
          uploadthingUrl: "https://uploadthing.com/private-key",
          name: "private-file.txt",
          size: "1000",
          mimeType: "text/plain",
          uploadedByUserId: userId1,
        });

        const result = yield* repo.getFilesByKeys({
          uploadthingKeys: ["private-key"],
          userId: userId2,
        });

        expect(result).toHaveLength(1);
        expect(result[0]).toBeNull();
      }),
    );
  });
});
