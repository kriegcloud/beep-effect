#!/usr/bin/env node

import { resolve } from 'path'
import Mocha from 'mocha'

async function main () {
  const tests = new Mocha()

  global.rdf = (await import(resolve(process.argv[2] || ''))).default

  tests.files.push((new URL('../test/index.js', import.meta.url)).pathname)
  await tests.loadFilesAsync()

  tests.run(failures => {
    process.on('exit', () => {
      process.exit(failures)
    })
  })
}

main()
