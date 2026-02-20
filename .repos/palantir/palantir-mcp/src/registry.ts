/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

export const NPM_REGISTRY_PATH =
  '/artifacts/api/repositories/ri.artifacts.repository.discovered.foundry-mcp/contents/release/npm/'

export function buildNpmRegistryUrl(foundryApiUrl: URL): URL {
  const npmRegistry = new URL(foundryApiUrl.toString())
  npmRegistry.pathname = NPM_REGISTRY_PATH
  return npmRegistry
}
