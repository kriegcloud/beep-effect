#!/usr/bin/env node

import * as fs from 'fs'
import path from 'path'
import program from 'commander'
import formats from '@rdfjs/formats-common'
import pkgUp from 'pkg-up'
import debug from 'debug'

const log = debug('rdfine')
const error = log.extend('error')
error.enabled = true

function assignDefined(target: any, ...sources: any[]) {
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const val = source[key]
      if (val !== undefined) {
        target[key] = val
      }
    }
  }
  return target
}

program
  .requiredOption('--format <format>', 'Media type of parser to use')
  .option('--namespace <namespace>', 'Namespace URI')
  .option('--prefix <prefix>', 'prefix')
  .option('--outDir <outDir>', 'Output directory', '.')
  .option('--verbose')
  .action(async ({ format, namespace, prefix, outDir, verbose }) => {
    const { generate } = await import('@rdfine/generator')
    const stream = formats.parsers.import(format, process.stdin)
    if (!stream) {
      error(`Failed to parse standard input as ${format}`)
      process.exit(1)
    }

    if (verbose) {
      log.enabled = true
    }

    const defaultOptions = {
      outDir: process.cwd(),
      exclude: [],
    }

    let options = {
      namespace,
      stream,
      outDir,
      prefix,
    }
    const packageJsonPath = await pkgUp()
    if (packageJsonPath) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString())
      if ('rdfine' in packageJson) {
        options = assignDefined({}, defaultOptions, packageJson.rdfine, options)
      }
    }

    options.outDir = path.resolve(process.cwd(), options.outDir)

    await generate(options, log)
  })

program.parseAsync(process.argv).catch((e) => {
  error(e)
  process.exit(1)
})
