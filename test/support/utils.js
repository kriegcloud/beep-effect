import { strictEqual } from 'node:assert'
import ParserN3 from '@rdfjs/parser-n3'
import TermSet from '@rdfjs/term-set'
import grapoi from 'grapoi'
import { it } from 'mocha'
import { datasetEqual } from 'rdf-test/assert.js'
import fromFile from 'rdf-utils-fs/fromFile.js'
import { Readable } from 'readable-stream'
import chunks from 'stream-chunks/chunks.js'
import Validator from '../../Validator.js'
import rdf from './factory.js'
import * as ns from './namespaces.js'

const allowedReportProperties = new TermSet([
  ns.sh.alternativePath,
  ns.sh.inversePath,
  ns.sh.oneOrMorePath,
  ns.sh.zeroOrMorePath,
  ns.sh.zeroOrOnePath,
  ns.rdf.first,
  ns.rdf.rest
])

const keepReportProperties = new TermSet([
  ns.sh.detail
])

async function findTests (manifest) {
  const tests = []

  for (const entryList of manifest.out(ns.mf.entries)) {
    for (const entry of entryList.list()) {
      const action = entry.out(ns.mf.action)
      const shapes = await loadDataset(action.out(ns.sht.shapesGraph))
      const data = await loadDataset(action.out(ns.sht.dataGraph))
      const result = entry.out(ns.mf.result)
      const resultType = result.out(ns.rdf.type).term

      tests.push({
        action,
        data,
        entry,
        result,
        resultType,
        shapes
      })
    }
  }

  return tests
}

async function loadDataset (url, options) {
  if (typeof url.value === 'string') {
    url = url.value
  }

  if (url.toString().startsWith('file:///')) {
    url = new URL(url.toString()).pathname
  }

  const dataset = rdf.dataset()

  for await (const quad of fromFile(url, options)) {
    dataset.add(quad)
  }

  return dataset
}

async function loadManifest (url) {
  const dataset = await loadDataset(url, { baseIRI: url.toString() })
  const manifest = grapoi({ dataset, factory: rdf }).hasOut(ns.rdf.type, ns.mf.Manifest)

  if (!manifest.term) {
    throw new Error(`${url} doesn't contain a manifest`)
  }

  let all = [...dataset]

  for (const include of manifest.out(ns.mf.include)) {
    const child = await loadManifest(include.value)

    all = [...all, ...child.dataset]
  }

  return grapoi({ dataset: rdf.dataset(all), factory: rdf })
}

async function loadTests (url) {
  const manifest = await loadManifest(url)
  const tests = findTests(manifest)

  return tests
}

function normalizeReport (report, expected) {
  // delete messages if expected report doesn't have any
  const resultMessages = expected
    .out(ns.sh.result)
    .out(ns.sh.resultMessage)

  const detailMessages = expected
    .out(ns.sh.result)
    .out(ns.sh.detail)
    .out(ns.sh.resultMessage)

  if (resultMessages.terms.length === 0 && detailMessages.terms.length === 0) {
    grapoi(report.ptr).node().deleteOut(ns.sh.resultMessage)
  }

  expected.node().deleteOut(ns.sh.resultMessage, rdf.literal('false', ns.xsd.boolean))

  // reduce report graph to a defined subset of properties
  return reportSubgraph().match({ dataset: expected.dataset, term: expected.term })
}

async function parseString (mediaType, content) {
  if (mediaType !== 'text/turtle') {
    throw new Error(`unknown media type: ${mediaType}`)
  }

  const parser = new ParserN3()
  const input = Readable.from(content)
  const stream = parser.import(input)

  return rdf.dataset(await chunks(stream))
}

const reportSubgraph = () => {
  const keep = new TermSet()

  return rdf.traverser(({ quad, level }) => {
    if (keepReportProperties.has(quad.predicate)) {
      keep.add(quad.object)
    }

    if (keep.has(quad.subject) || keep.has(quad.object)) {
      return true
    }

    if (allowedReportProperties.has(quad.predicate)) {
      return true
    }

    if (level < 2) {
      return true
    }

    if (level === 0 && quad.subject.termType === 'BlankNode') {
      return true
    }

    return false
  })
}

function runTest (test, { validations, targetResolvers } = {}) {
  const label = test.entry.out(ns.rdfs.label)

  it(label.value, async () => {
    if (ns.sh.ValidationReport.equals(test.resultType)) {
      const coverage = test.result.node(null).out(ns.sh.resultSeverity, ns.shn.Trace).terms.length > 0
      const debug = test.result.out(ns.sh.result).out(ns.sh.resultSeverity, ns.shn.Debug).terms.length > 0
      const details = test.result.out(ns.sh.result).out(ns.sh.detail).terms.length > 0
      const validator = new Validator(test.shapes, { coverage, debug, details, factory: rdf, validations, targetResolvers })
      const report = await validator.validate({ dataset: test.data })
      const expected = normalizeReport(report, test.result)

      datasetEqual(report.dataset, expected)
    } else if (ns.sht.Coverage.equals(test.resultType)) {
      const validator = new Validator(test.shapes, { coverage: true, factory: rdf, validations, targetResolvers })
      const report = await validator.validate({ dataset: test.data })
      const coverage = rdf.dataset(report.coverage())
      const expected = await parseString('text/turtle', test.result.out(ns.sht.coverage).value)

      datasetEqual(coverage, expected)
    } else if (ns.sht.Failure.equals(test.result.term)) {
      const validator = new Validator(test.shapes, { factory: rdf, validations, targetResolvers })
      const report = await validator.validate({ dataset: test.data })

      strictEqual(report.conforms, false)
    } else {
      throw new Error(`unknown test type: ${test.resultType.value}`)
    }
  })
}

function runTests (tests, { validations, targetResolvers } = {}) {
  for (const test of tests) {
    runTest(test, { validations, targetResolvers })
  }
}

export {
  loadDataset,
  loadTests,
  runTests
}
