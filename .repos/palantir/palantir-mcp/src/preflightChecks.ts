/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { NetworkError, NodeVersionError, PackageFetchError } from './errors.js'
import { TokenRefreshUtils } from './utils/tokenRefreshUtils.js'

export function checkNodeVersion(): void {
  const nodeVersion = process.versions.node
  const majorVersion = parseInt(nodeVersion.split('.')[0])
  if (majorVersion < 18) {
    throw new NodeVersionError(nodeVersion)
  }
}

export async function checkNetworkConnectivity(foundryApiUrl: URL): Promise<void> {
  try {
    const resp = await fetch(foundryApiUrl)
    if (!resp.ok) {
      throw new Error(`${foundryApiUrl} responded with unexpected status ${resp.status}`)
    }
  } catch (error) {
    throw new NetworkError(foundryApiUrl, error)
  }
}

export async function validateFoundryToken(
  foundryApiUrl: URL,
  foundryToken: string,
): Promise<string> {
  const newToken: string | undefined = await new TokenRefreshUtils(
    foundryApiUrl,
    foundryToken,
  ).refreshTokenIfExpired()

  return newToken ?? foundryToken
}

export async function checkPackageAvailability(
  npmRegistry: URL,
  foundryToken: string,
): Promise<void> {
  const packageMetadataUrl = new URL(npmRegistry.toString())
  packageMetadataUrl.pathname += encodeURIComponent('@palantir/mcp')

  try {
    const requestOptions = {
      headers: { Authorization: `Bearer ${foundryToken}` },
    }
    const resp = await fetch(packageMetadataUrl, requestOptions)
    if (!resp.ok) {
      console.error(await resp.json())

      throw new Error(
        `Retrieving the Palantir MCP package responded with unexpected status ${resp.status}`,
      )
    }
  } catch (error) {
    throw new PackageFetchError(error)
  }
}
