/**
 * Docker image version resolver.
 *
 * Parses `docker-compose.yml` for `image:` fields and optionally resolves
 * latest tags from Docker Hub.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, FileSystem, Order, Path, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { HttpClient, HttpClientResponse } from "effect/unstable/http";
import { parseDocument } from "yaml";
import {
  NetworkUnavailableError,
  type VersionCategoryReport,
  type VersionDriftItem,
  VersionSyncError,
} from "../types.js";

// ── Docker Hub API ──────────────────────────────────────────────────────────

/**
 * @since 0.0.0
 * @category Validation
 */
const DockerTagResult = S.Struct({
  name: S.String,
});

/**
 * @since 0.0.0
 * @category Validation
 */
const DockerTagsResponse = S.Struct({
  results: S.Array(DockerTagResult),
});

// ── Types ───────────────────────────────────────────────────────────────────

/**
 * A Docker image reference parsed from docker-compose.yml.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
 */
export interface DockerImageState {
  readonly images: ReadonlyArray<DockerImageRef & { readonly latest: O.Option<string> }>;
}

// ── Semver-like sorting ─────────────────────────────────────────────────────

const SEMVER_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)$/;

const parseSemver = (tag: string): O.Option<readonly [number, number, number]> =>
  O.map(
    O.fromNullishOr(Str.match(SEMVER_PATTERN)(tag)),
    (m) => [Number.parseInt(m[1], 10), Number.parseInt(m[2], 10), Number.parseInt(m[3], 10)] as const
  );

const semverCompare = (a: readonly [number, number, number], b: readonly [number, number, number]): number => {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];
  return a[2] - b[2];
};

const toOrdering = (n: number): -1 | 0 | 1 => (n < 0 ? -1 : n > 0 ? 1 : 0);

const isRecord = (value: unknown): value is Record<string, unknown> => P.isObject(value) && !A.isArray(value);

// ── Helpers ─────────────────────────────────────────────────────────────────

const parseImageRef = (service: string, image: string, yamlPath: ReadonlyArray<string | number>): DockerImageRef => {
  const colonIdx = O.getOrElse(O.fromUndefinedOr(Str.lastIndexOf(":")(image)), () => -1);
  const slashIdx = O.getOrElse(O.fromUndefinedOr(Str.indexOf("/")(image)), () => -1);

  let repository: string;
  let tag: string;

  if (colonIdx > 0 && (slashIdx < 0 || colonIdx > slashIdx)) {
    repository = Str.substring(0, colonIdx)(image);
    tag = Str.substring(colonIdx + 1)(image);
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
  const lower = Str.toLowerCase(tag);
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

const VERSION_PATTERN = /v?(\d+)\.(\d+)\.(\d+)/;

const findLatestForPgvector = (tags: ReadonlyArray<string>, currentTag: string): O.Option<string> => {
  // Current tag is like "pg17" — find latest "pg17-v*" or similar
  const prefix = O.getOrElse(
    O.flatMap(O.fromNullishOr(Str.match(/^(pg\d+)/)(currentTag)), (m) => O.fromNullishOr(m[1])),
    () => currentTag
  );

  let candidates = A.empty<{ tag: string; version: readonly [number, number, number] }>();

  for (const tag of tags) {
    if (!tag.startsWith(prefix)) continue;
    if (!isStableTag(tag)) continue;
    // Pattern: pg17-v0.8.0 or similar with version suffix
    const versionMatch = Str.match(VERSION_PATTERN)(tag);
    if (versionMatch !== null) {
      candidates = A.append(candidates, {
        tag,
        version: [
          Number.parseInt(versionMatch[1], 10),
          Number.parseInt(versionMatch[2], 10),
          Number.parseInt(versionMatch[3], 10),
        ] as const,
      });
    }
  }

  if (A.isArrayEmpty(candidates)) return O.none();

  type Candidate = { tag: string; version: readonly [number, number, number] };
  const sorted = A.sort(
    candidates,
    Order.make<Candidate>((a, b) => toOrdering(semverCompare(b.version, a.version)))
  );
  return O.map(A.get(sorted, 0), (c) => c.tag);
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
 * @category Utility
 */
export const resolveDockerImages: (
  repoRoot: string,
  skipNetwork: boolean
) => Effect.Effect<DockerImageState, VersionSyncError, FileSystem.FileSystem | Path.Path | HttpClient.HttpClient> =
  Effect.fn(function* (repoRoot, skipNetwork) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const composePath = path.join(repoRoot, "docker-compose.yml");
    const composeExists = yield* fs.exists(composePath).pipe(Effect.orElseSucceed(() => false));

    if (!composeExists) {
      return { images: A.empty() };
    }

    const content = yield* fs.readFileString(composePath).pipe(
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

    if (!isRecord(root) || !("services" in root)) {
      return { images: A.empty() };
    }

    const services = root.services;
    if (!isRecord(services)) {
      return { images: A.empty() };
    }

    let images = A.empty<DockerImageRef & { readonly latest: O.Option<string> }>();

    for (const serviceName of R.keys(services)) {
      const service = services[serviceName];
      if (!isRecord(service) || !("image" in service)) {
        continue;
      }

      const imageStr = String(service.image);
      const yamlPath = ["services", serviceName, "image"] as const;
      const ref = parseImageRef(serviceName, imageStr, yamlPath);

      if (skipNetwork) {
        images = A.append(images, { ...ref, latest: O.none() });
        continue;
      }

      // Fetch latest tag from Docker Hub
      const latest = yield* fetchLatestDockerTag(ref).pipe(
        Effect.map(O.some),
        Effect.orElseSucceed(() => O.none<string>())
      );

      images = A.append(images, { ...ref, latest });
    }

    return { images };
  });

/**
 * Fetch the latest appropriate tag for a Docker image from Docker Hub.
 *
 * @since 0.0.0
 * @category Utility
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
        (e) =>
          new NetworkUnavailableError({ message: `Docker Hub API request failed for ${ref.repository}: ${String(e)}` })
      )
    );

  const body = yield* HttpClientResponse.schemaBodyJson(DockerTagsResponse)(response).pipe(
    Effect.mapError(
      (e) =>
        new NetworkUnavailableError({
          message: `Failed to parse Docker Hub response for ${ref.repository}: ${String(e)}`,
        })
    )
  );

  const tagNames = A.map(body.results, (r) => r.name);

  // Strategy depends on image
  const repoLower = Str.toLowerCase(ref.repository);
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
 * @category Utility
 * @param state - The resolved Docker image state.
 * @returns The version category report for Docker images.
 */
export const buildDockerReport: (state: DockerImageState) => VersionCategoryReport = (state) => {
  let items = A.empty<VersionDriftItem>();
  let hasUnpinned = false;

  for (const img of state.images) {
    const isUnpinnedTag = img.tag === "latest";
    const isMajorOnly = /^\d+$/.test(img.tag);

    if (isUnpinnedTag) {
      hasUnpinned = true;
    }

    if (O.isSome(img.latest) && img.tag !== img.latest.value) {
      items = A.append(items, {
        file: "docker-compose.yml",
        field: `image (${img.service})`,
        current: img.fullImage,
        expected: `${img.repository}:${img.latest.value}`,
        line: O.none(),
      });
    } else if (isUnpinnedTag && O.isNone(img.latest)) {
      // Tag is "latest" but we couldn't resolve — still report as unpinned
      items = A.append(items, {
        file: "docker-compose.yml",
        field: `image (${img.service})`,
        current: img.fullImage,
        expected: `${img.repository}:<pin to specific version>`,
        line: O.none(),
      });
    } else if (isMajorOnly && O.isNone(img.latest)) {
      items = A.append(items, {
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
