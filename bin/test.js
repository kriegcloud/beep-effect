#!/usr/bin/env node

const path = require('path')
const Mocha = require('mocha')

const mocha = new Mocha()

global.rdf = require(path.resolve(process.argv[2] || ''))

mocha.addFile(path.join(__dirname, '../test/index.js')).run(failures => {
  process.on('exit', () => {
    process.exit(failures)
  })
})
