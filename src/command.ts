/*
 * Copyright (c) 2025 Palantir Technologies
 *
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import { Command, InvalidArgumentError, Option } from 'commander'
import { getPackageVersion } from './utils/packageInfoUtils.js'

export interface CliOptions {
  foundryToken: string
  foundryApiUrl: URL
}

export function parseUrl(value: string): URL {
  try {
    return new URL(value)
  } catch {
    throw new InvalidArgumentError(
      `Invalid URL: ${value}. It should be of the format https://<enrollment>.palantirfoundry.com`,
    )
  }
}

export function createProgram(): Command {
  const program = new Command()
  program.version(getPackageVersion())

  const foundryApiUrlOption = new Option(
    '--foundry-api-url <url>',
    'Your Foundry domain (e.g. https://<enrollment>.palantirfoundry.com)',
  )
    .argParser(parseUrl)
    .makeOptionMandatory(true)

  const foundryTokenOption = new Option(
    '--foundry-token <token>',
    'Foundry user token to be used by the server to interact with foundry APIs',
  )
    .env('FOUNDRY_TOKEN')
    .makeOptionMandatory(true)

  program
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .addOption(foundryApiUrlOption)
    .addOption(foundryTokenOption)

  return program
}

export function parseArguments(argv: string[]): CliOptions {
  const program = createProgram()
  program.parse(argv)

  const options = program.opts()

  return {
    foundryToken: options.foundryToken,
    foundryApiUrl: options.foundryApiUrl,
  }
}
