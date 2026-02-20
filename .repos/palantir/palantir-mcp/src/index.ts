#!/usr/bin/env node

/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { parseArguments } from './command.js'
import {
  checkNodeVersion,
  checkNetworkConnectivity,
  validateFoundryToken,
  checkPackageAvailability,
} from './preflightChecks.js'
import { buildNpmRegistryUrl } from './registry.js'
import { spawnMcp } from './spawn.js'

async function main() {
  const { foundryToken, foundryApiUrl } = parseArguments(process.argv)
  const npmRegistry: URL = buildNpmRegistryUrl(foundryApiUrl)

  let validatedFoundryToken: string

  try {
    checkNodeVersion()
    await checkNetworkConnectivity(foundryApiUrl)
    validatedFoundryToken = await validateFoundryToken(foundryApiUrl, foundryToken)
    // important for child processes spawned later
    process.env.FOUNDRY_TOKEN = validatedFoundryToken

    await checkPackageAvailability(npmRegistry, validatedFoundryToken)
  } catch (error) {
    console.error(error) // TODO should this be a console.log to expose in Claude Code?
    process.exit(1)
  }

  spawnMcp({
    npmRegistry,
    foundryToken: validatedFoundryToken,
    args: process.argv.slice(2),
  })
}

main()
