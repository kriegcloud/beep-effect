import { createHash, randomUUID } from "node:crypto";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import { describe, expect, test } from "bun:test";
import * as Effect from "effect/Effect";
import { loadCuratedDocuments, readCuratedInfo, syncCuratedCache } from "@beep/repo-cli/commands/enron/cache";
import { formatEnronInfoOutput, serializeCuratedDocumentsNdjson } from "@beep/repo-cli/commands/enron/index";
import {
  ENRON_CURATED_DOCUMENTS_URI,
  ENRON_CURATED_MANIFEST_URI,
  ENRON_CURATED_THREADS_URI,
  EnronS3ObjectNotFoundError,
  S3DataSource,
  type S3DataSource as S3DataSourceService,
} from "@beep/repo-cli/commands/enron/s3-client";

interface CuratedFixture {
  readonly threadsJson: string;
  readonly documentsJson: string;
  readonly manifestJson: string;
}

const sha256Hex = (value: string): string => createHash("sha256").update(value, "utf8").digest("hex");

const utf8Bytes = (value: string): number => Buffer.byteLength(value, "utf8");

const toJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

const buildFixture = (params?: { readonly datasetHash?: string; readonly generatedAt?: string }): CuratedFixture => {
  const threadsJson = toJson([
    {
      threadId: "thread:02",
      score: 98,
      categories: ["financial"],
      breakdown: {},
      participants: ["one@enron.com", "two@enron.com"],
      depth: 1,
      messageCount: 1,
      dateRange: {
        start: "2001-01-01T00:00:00.000Z",
        end: "2001-01-01T00:00:00.000Z",
      },
      messages: [],
    },
  ]);

  const documentsJson = toJson([
    {
      id: "email:b",
      title: "Second",
      body: "Body B",
      metadata: {
        sender: "two@enron.com",
        recipients: ["one@enron.com"],
        threadId: "thread:02",
        messageId: "<b@enron.com>",
        originalDate: "2001-01-02T00:00:00.000Z",
        folder: "inbox",
        user: "test",
        references: [],
      },
      spans: [
        {
          label: "body",
          start: 0,
          end: 6,
        },
      ],
    },
    {
      id: "email:a",
      title: "First",
      body: "Body A",
      metadata: {
        sender: "one@enron.com",
        recipients: ["two@enron.com"],
        threadId: "thread:01",
        messageId: "<a@enron.com>",
        originalDate: "2001-01-01T00:00:00.000Z",
        folder: "inbox",
        user: "test",
        references: [],
      },
      spans: [
        {
          label: "body",
          start: 0,
          end: 6,
        },
      ],
    },
  ]);

  const manifestJson = toJson({
    version: 1,
    generatedAt: params?.generatedAt ?? "2026-02-15T03:22:05.011Z",
    source: "fixture://enron-cache",
    selectedThreadCount: 2,
    selectedMessageCount: 2,
    scoredThreadCount: 2,
    datasetHash: params?.datasetHash ?? "dataset-hash-v1",
    artifacts: [
      {
        fileName: "threads.json",
        bytes: utf8Bytes(threadsJson),
        sha256: sha256Hex(threadsJson),
      },
      {
        fileName: "documents.json",
        bytes: utf8Bytes(documentsJson),
        sha256: sha256Hex(documentsJson),
      },
    ],
  });

  return {
    threadsJson,
    documentsJson,
    manifestJson,
  };
};

interface MockS3 {
  readonly service: S3DataSourceService;
  readonly calls: Array<string>;
  readonly objects: Map<string, string>;
}

const makeMockS3 = (fixture: CuratedFixture): MockS3 => {
  const calls: Array<string> = [];
  const objects = new Map<string, string>([
    [ENRON_CURATED_MANIFEST_URI, fixture.manifestJson],
    [ENRON_CURATED_THREADS_URI, fixture.threadsJson],
    [ENRON_CURATED_DOCUMENTS_URI, fixture.documentsJson],
  ]);

  const service: S3DataSourceService = {
    downloadText: (uri) =>
      Effect.suspend(() => {
        calls.push(uri);
        const value = objects.get(uri);
        if (value === undefined) {
          return Effect.fail(
            new EnronS3ObjectNotFoundError({
              uri,
              message: `Missing mock object for ${uri}`,
            })
          );
        }

        return Effect.succeed(value);
      }),
  };

  return {
    service,
    calls,
    objects,
  };
};

const runWithDeps = <A, E>(effect: Effect.Effect<A, E>, s3: S3DataSourceService): Promise<A> =>
  Effect.runPromise(effect.pipe(Effect.provideService(S3DataSource, s3), Effect.provide(NodeFileSystem.layer)));

const withTestDirectory = async <A>(f: (cacheDirectory: string) => Promise<A>): Promise<A> => {
  const cacheDirectory = join(tmpdir(), `enron-cache-test-${randomUUID()}`);
  try {
    return await f(cacheDirectory);
  } finally {
    await rm(cacheDirectory, { recursive: true, force: true }).catch(() => undefined);
  }
};

const readId = (value: unknown): string => {
  if (typeof value !== "object" || value === null || !("id" in value)) {
    throw new Error("Expected serialized document line with id");
  }

  const id = value.id;
  if (typeof id !== "string") {
    throw new Error("Expected document id to be a string");
  }

  return id;
};

describe("enron/cache", () => {
  test("uses cache-first flow after initial download", async () =>
    withTestDirectory(async (cacheDirectory) => {
      const fixture = buildFixture();
      const mockS3 = makeMockS3(fixture);

      const first = await runWithDeps(syncCuratedCache({ cacheDirectory }), mockS3.service);
      expect(first.status).toBe("miss");
      expect(first.downloadedArtifacts).toEqual(["documents.json", "threads.json"]);

      const second = await runWithDeps(syncCuratedCache({ cacheDirectory }), mockS3.service);
      expect(second.status).toBe("hit");
      expect(second.downloadedArtifacts).toEqual([]);

      expect(mockS3.calls).toEqual([
        ENRON_CURATED_MANIFEST_URI,
        ENRON_CURATED_DOCUMENTS_URI,
        ENRON_CURATED_THREADS_URI,
        ENRON_CURATED_MANIFEST_URI,
      ]);
    }));

  test("invalidates cache when artifact hash mismatches or manifest hash changes", async () =>
    withTestDirectory(async (cacheDirectory) => {
      const fixtureV1 = buildFixture({ datasetHash: "dataset-hash-v1", generatedAt: "2026-02-15T03:22:05.011Z" });
      const mockS3 = makeMockS3(fixtureV1);

      const initial = await runWithDeps(syncCuratedCache({ cacheDirectory }), mockS3.service);
      expect(initial.status).toBe("miss");

      const documentsPath = join(cacheDirectory, "documents.json");
      await writeFile(documentsPath, "{\n  \"corrupt\": true\n}\n", "utf8");

      const afterCorruption = await runWithDeps(syncCuratedCache({ cacheDirectory }), mockS3.service);
      expect(afterCorruption.status).toBe("artifact-mismatch");

      const fixtureV2 = buildFixture({ datasetHash: "dataset-hash-v2", generatedAt: "2026-02-15T04:22:05.011Z" });
      mockS3.objects.set(ENRON_CURATED_MANIFEST_URI, fixtureV2.manifestJson);
      mockS3.objects.set(ENRON_CURATED_DOCUMENTS_URI, fixtureV2.documentsJson);
      mockS3.objects.set(ENRON_CURATED_THREADS_URI, fixtureV2.threadsJson);

      const afterManifestUpdate = await runWithDeps(syncCuratedCache({ cacheDirectory }), mockS3.service);
      expect(afterManifestUpdate.status).toBe("manifest-changed");
      expect(afterManifestUpdate.manifest.datasetHash).toBe("dataset-hash-v2");
    }));

  test("formats info and emits deterministic parse output", async () =>
    withTestDirectory(async (cacheDirectory) => {
      const fixture = buildFixture();
      const mockS3 = makeMockS3(fixture);

      const info = await runWithDeps(readCuratedInfo({ cacheDirectory }), mockS3.service);
      const infoOutput = formatEnronInfoOutput(info);

      expect(infoOutput).toContain("cacheStatus: miss");
      expect(infoOutput).toContain("selectedThreadCount: 2");
      expect(infoOutput).toContain("selectedMessageCount: 2");
      expect(infoOutput).toContain("datasetHash: dataset-hash-v1");

      const loaded = await runWithDeps(loadCuratedDocuments({ cacheDirectory }), mockS3.service);
      const ndjson = serializeCuratedDocumentsNdjson(loaded.documents);

      expect(ndjson.endsWith("\n")).toBe(true);

      const parsedLines = ndjson
        .trim()
        .split("\n")
        .map((line) => readId(JSON.parse(line) as unknown));

      expect(parsedLines).toEqual(["email:a", "email:b"]);

      const limited = serializeCuratedDocumentsNdjson(loaded.documents, 1).trim().split("\n");
      expect(limited.length).toBe(1);
      expect(readId(JSON.parse(limited[0] ?? "{}") as unknown)).toBe("email:a");
    }));
});
