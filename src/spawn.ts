/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { spawn } from 'child_process'

export interface SpawnOptions {
  npmRegistry: URL
  foundryToken: string
  args: string[]
}

export function spawnMcp({ npmRegistry, foundryToken, args }: SpawnOptions): void {
  const authTokenEnvVar = `NPM_CONFIG_//${npmRegistry.host + npmRegistry.pathname}:_authToken`

  const child = spawn('npx', ['-y', '@palantir/mcp@latest', ...args], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NPM_CONFIG_REGISTRY: npmRegistry.toString(),
      [authTokenEnvVar]: foundryToken,
    },
  })

  process.on('SIGINT', () => {
    child.kill('SIGINT')
  })

  process.on('SIGTERM', () => {
    child.kill('SIGTERM')
  })
}
