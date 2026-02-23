/**
 * Docker image version resolver.
 *
 * Parses `docker-compose.yml` for `image:` fields and optionally resolves
 * latest tags from Docker Hub.
 *
 * @since 0.0.0
 * @module
 */

import { FileSystem, Path } from "effect";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Schema from "effect/Schema";
import { parseDocument } from "yaml";
import { HttpClient, HttpClientResponse } from "effect/unstable/http";
import { NetworkUnavailableError, type VersionCategoryReport, type VersionDriftItem, VersionSyncError } from "../types.js";

// ── Docker Hub API ──────────────────────────────────────────────────────────

/**
 * @since 0.0.0
 * @category schemas
 */
const DockerTagResult = Schema.Struct({
  name: Schema.String,
});

/**
 * @since 0.0.0
 * @category schemas
 */
const DockerTagsResponse = Schema.Struct({
  results: Schema.Array(DockerTagResult),
});

// ── Types ───────────────────────────────────────────────────────────────────

/**
 * A Docker image reference parsed from docker-compose.yml.
 *
 * @since 0.0.0
 * @category models
 */
export interface DockerImageRef {
  readonly service: string;
  readonly fullImage: string;
  readonly registry: string;
  readonly repository: string;
  readonly tag: string;
  readonly yamlPath: ReadonlyArray<string | number>;
}

/**
 * Resolved Docker image state.
 *
 * @since 0.0.0
 * @category models
 */
export interface DockerImageState {
  readonly images: ReadonlyArray<DockerImageRef & { readonly latest: O.Option<string> }>;
}

// ── Semver-like sorting ─────────────────────────────────────────────────────

const SEMVER_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)$/;

const parseSemver = (tag: string): O.Option<readonly [number, number, number]> => {
  const match = tag.match(SEMVER_PATTERN);
  if (match === null) return O.none();
  return O.some([parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)] as const);
};

const semverCompare = (a: readonly [number, number, number], b: readonly [number, number, number]): number => {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];
  return a[2] - b[2];
};

// ── Helpers ─────────────────────────────────────────────────────────────────

const parseImageRef = (service: string, image: string, yamlPath: ReadonlyArray<string | number>): DockerImageRef => {
  const colonIdx = image.lastIndexOf(":");
  const slashIdx = image.indexOf("/");

  let repository: string;
  let tag: string;

  if (colonIdx > 0 && (slashIdx < 0 || colonIdx > slashIdx)) {
    repository = image.substring(0, colonIdx);
    tag = image.substring(colonIdx + 1);
  } else {
    repository = image;
    tag = "latest";
  }

  // Detect official images (no slash) vs namespaced
  const registry = slashIdx < 0 ? "library" : "";

  return { service, fullImage: image, registry, repository, tag, yamlPath };
};

const dockerHubTagsUrl = (repository: string): string => {
  const hasNamespace = repository.includes("/");
  const repo = hasNamespace ? repository : `library/${repository}`;
  return `https://hub.docker.com/v2/repositories/${repo}/tags/?page_size=100&ordering=last_updated`;
};

const isStableTag = (tag: string): boolean => {
  const lower = tag.toLowerCase();
  return (
    tag !== "latest" &&
    !lower.includes("rc") &&
    !lower.includes("beta") &&
    !lower.includes("alpha") &&
    !lower.includes("nightly") &&
    !lower.includes("dev") &&
    !lower.includes("snapshot")
  );
};

// ── Tag resolution strategies ───────────────────────────────────────────────

const findLatestForRedis = (tags: ReadonlyArray<string>): O.Option<string> => {
  // Find latest semver tag without alpine/bookworm/etc suffixes
  let best: O.Option<readonly [number, number, number]> = O.none();
  let bestTag = "";

  for (const tag of tags) {
    if (!isStableTag(tag)) continue;
    // Pure semver tags only (no suffix)
    const sv = parseSemver(tag);
    if (O.isSome(sv)) {
      if (O.isNone(best) || semverCompare(sv.value, best.value) > 0) {
        best = sv;
        bestTag = tag;
      }
    }
  }

  return bestTag !== "" ? O.some(bestTag) : O.none();
};

const findLatestForPgvector = (tags: ReadonlyArray<string>, currentTag: string): O.Option<string> => {
  // Current tag is like "pg17" — find latest "pg17-v*" or similar
  const prefix = currentTag.match(/^(pg\d+)/)?.[1] ?? currentTag;
  const candidates: Array<{ tag: string; version: readonly [number, number, number] }> = [];

  for (const tag of tags) {
    if (!tag.startsWith(prefix)) continue;
    if (!isStableTag(tag)) continue;
    // Pattern: pg17-v0.8.0 or similar with version suffix
    const versionMatch = tag.match(/v?(\d+)\.(\d+)\.(\d+)/);
    if (versionMatch !== null) {
      candidates.push({
        tag,
        version: [parseInt(versionMatch[1], 10), parseInt(versionMatch[2], 10), parseInt(versionMatch[3], 10)],
      });
    }
  }

  if (candidates.length === 0) return O.none();

  candidates.sort((a, b) => semverCompare(b.version, a.version));
  return O.some(candidates[0].tag);
};

const findLatestSemver = (tags: ReadonlyArray<string>): O.Option<string> => {
  let best: O.Option<readonly [number, number, number]> = O.none();
  let bestTag = "";

  for (const tag of tags) {
    if (!isStableTag(tag)) continue;
    const sv = parseSemver(tag);
    if (O.isSome(sv)) {
      if (O.isNone(best) || semverCompare(sv.value, best.value) > 0) {
        best = sv;
        bestTag = tag;
      }
    }
  }

  return bestTag !== "" ? O.some(bestTag) : O.none();
};

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Resolve Docker image state from docker-compose.yml.
 *
 * @since 0.0.0
 * @category functions
 */
export const resolveDockerImages: (
  repoRoot: string,
  skipNetwork: boolean
) => Effect.Effect<
  DockerImageState,
  VersionSyncError,
  FileSystem.FileSystem | Path.Path | HttpClient.HttpClient
> = Effect.fn(function* (repoRoot, skipNetwork) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const composePath = path.join(repoRoot, "docker-compose.yml");
  const composeExists = yield* fs.exists(composePath).pipe(Effect.orElseSucceed(() => false));

  if (!composeExists) {
    return { images: A.empty() };
  }

  const content = yield* fs
    .readFileString(composePath)
    .pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to read docker-compose.yml: ${String(e)}`,
            file: "docker-compose.yml",
          })
      )
    );

  const doc = parseDocument(content);
  const root = doc.toJSON();

  if (typeof root !== "object" || root === null || !("services" in root)) {
    return { images: A.empty() };
  }

  const services = root.services;
  if (typeof services !== "object" || services === null) {
    return { images: A.empty() };
  }

  const images: Array<DockerImageRef & { readonly latest: O.Option<string> }> = [];

  for (const serviceName of Object.keys(services)) {
    const service = services[serviceName];
    if (typeof service !== "object" || service === null || !("image" in service)) {
      continue;
    }

    const imageStr = String(service.image);
    const yamlPath = ["services", serviceName, "image"] as const;
    const ref = parseImageRef(serviceName, imageStr, yamlPath);

    if (skipNetwork) {
      images.push({ ...ref, latest: O.none() });
      continue;
    }

    // Fetch latest tag from Docker Hub
    const latest = yield* fetchLatestDockerTag(ref).pipe(
      Effect.map(O.some),
      Effect.orElseSucceed(() => O.none<string>())
    );

    images.push({ ...ref, latest });
  }

  return { images };
});

/**
 * Fetch the latest appropriate tag for a Docker image from Docker Hub.
 *
 * @since 0.0.0
 * @category functions
 */
const fetchLatestDockerTag: (
  ref: DockerImageRef
) => Effect.Effect<string, NetworkUnavailableError, HttpClient.HttpClient> = Effect.fn(function* (ref) {
  const client = yield* HttpClient.HttpClient;
  const url = dockerHubTagsUrl(ref.repository);

  const response = yield* client
    .get(url, { headers: { "User-Agent": "beep-cli/0.0.0" } })
    .pipe(
      Effect.mapError(
        (e) => new NetworkUnavailableError({ message: `Docker Hub API request failed for ${ref.repository}: ${String(e)}` })
      )
    );

  const body = yield* HttpClientResponse
    .schemaBodyJson(DockerTagsResponse)(response)
    .pipe(
      Effect.mapError(
        (e) =>
          new NetworkUnavailableError({
            message: `Failed to parse Docker Hub response for ${ref.repository}: ${String(e)}`,
          })
      )
    );

  const tagNames = A.map(body.results, (r) => r.name);

  // Strategy depends on image
  const repoLower = ref.repository.toLowerCase();
  let result: O.Option<string>;

  if (repoLower === "redis" || repoLower === "library/redis") {
    result = findLatestForRedis(tagNames);
  } else if (repoLower.includes("pgvector")) {
    result = findLatestForPgvector(tagNames, ref.tag);
  } else {
    result = findLatestSemver(tagNames);
  }

  if (O.isNone(result)) {
    return yield* new NetworkUnavailableError({
      message: `No suitable tag found for ${ref.repository}`,
    });
  }

  return result.value;
});

/**
 * Build the Docker category report from resolved state.
 *
 * @since 0.0.0
 * @category functions
 */
export const buildDockerReport: (state: DockerImageState) => VersionCategoryReport = (state) => {
  const items: Array<VersionDriftItem> = [];
  let hasUnpinned = false;

  for (const img of state.images) {
    const isUnpinnedTag = img.tag === "latest";
    const isMajorOnly = !img.tag.includes(".") && img.tag !== "latest";

    if (isUnpinnedTag) {
      hasUnpinned = true;
    }

    if (O.isSome(img.latest) && img.tag !== img.latest.value) {
      items.push({
        file: "docker-compose.yml",
        field: `image (${img.service})`,
        current: img.fullImage,
        expected: `${img.repository}:${img.latest.value}`,
        line: O.none(),
      });
    } else if (isUnpinnedTag && O.isNone(img.latest)) {
      // Tag is "latest" but we couldn't resolve — still report as unpinned
      items.push({
        file: "docker-compose.yml",
        field: `image (${img.service})`,
        current: img.fullImage,
        expected: `${img.repository}:<pin to specific version>`,
        line: O.none(),
      });
    } else if (isMajorOnly && O.isNone(img.latest)) {
      items.push({
        file: "docker-compose.yml",
        field: `image (${img.service})`,
        current: img.fullImage,
        expected: `${img.repository}:<pin to specific tag>`,
        line: O.none(),
      });
    }
  }

  return {
    category: "docker" as const,
    status: A.length(items) > 0 ? (hasUnpinned ? "unpinned" : "drift") : "ok",
    items,
    latest: O.none(),
    error: O.none(),
  };
};
