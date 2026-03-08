const VERBOSE = "VERBOSE" in process.env
const TESTS = "TESTS" in process.env ? process.env["TESTS"].split(/,/) : null

const ShExUtil = require("@shexjs/util")
const { ctor: RdfJsDb } = require('@shexjs/neighborhood-rdfjs')
const {ShExValidator, resultMapToShapeExprTest} = require("@shexjs/validator")
const ShExParser = require("@shexjs/parser")
const ShapeMapParser = require("shape-map").Parser
const ShExTerm = require("@shexjs/term")
const Extensions = [
  // http://shex.io/extensions/javascript/
  require("@shexjs/extension-eval")
]
const Fs = require('fs')
const N3 = require('n3')
const URL = require('url').URL
const expect = require('chai').expect
const findPath = require('./findPath.js')
const Base = new URL('http://localhost/')

const TestSchemasPath = findPath('schemas')
const SemActsTestDir = __dirname + '/../test/SemActs/'
const ManifestFile = SemActsTestDir + 'Manifest.json'
const ManifestBase = new URL(ManifestFile, Base)

describe('Invoking SemActs', function () {
  const schemaParser = ShExParser.construct(ManifestBase.href, null, {index: true})

  // Load manifest
  const manifest = parseJSON(Fs.readFileSync(ManifestFile, 'utf8'))
  if (TESTS)
    manifest.actions = manifest.actions.filter(function (t) {
      return TESTS.indexOf(t.from) !== -1 || TESTS.indexOf(t.expect) !== -1
    })

  manifest.actions.forEach(function (test) {

    // Resolve and parse schema.
    const schemaFile = (test.schemaURL.startsWith("./") ? SemActsTestDir : TestSchemasPath) + test.schemaURL
    const schemaBase = new URL(schemaFile, Base)
    const schemaStr = Fs.readFileSync(schemaFile + (test.schemaURL.endsWith(".json") ? "" : ".shex"), 'utf8')
    const schema = test.schemaURL.endsWith(".json")
          ? JSON.parse(schemaStr)
          : schemaParser.parse(schemaStr);
    const schemaMeta = {
      base: schema._base,
      prefixes: schema._prefixes || {}
    }
    // Resolve and parse data.
    const dataFile = (test.dataURL.startsWith("./") ? SemActsTestDir : datasPath) + test.dataURL
    const dataBase = new URL(dataFile, Base)
    const dataStr = Fs.readFileSync(dataFile + ".ttl", 'utf8')
    const dataParser = new N3.Parser({
      format: 'text/n3',
      baseIRI: dataBase.href
    })
    const data = new N3.Store()
    data.addQuads(dataParser.parse(dataStr))
    const dataMeta = {
      base: dataParser._base,
      prefixes: Object.assign({}, dataParser._prefixes)
    }

    // Resolve and parse expected results.
    const expectedFile = (test.expectURL.startsWith("./") ? SemActsTestDir : expectsPath) + test.expectURL
    const expected = JSON.parse(Fs.readFileSync(expectedFile, 'utf8'))

    // Parse ShapeMap and validate.
    const validator = new ShExValidator(schema, RdfJsDb(data))
    Extensions.forEach(ext => ext.register(validator, {ShExTerm}))
    const smParser = ShapeMapParser.construct(ManifestBase.href, schemaMeta, dataMeta)
    const sm = smParser.parse(test.queryMap)
    const res = resultMapToShapeExprTest(validator.validateShapeMap(sm))

    // Test results
    const blurb = ''
          + (VERBOSE ? schemaFile : test.schemaURL)
          + (VERBOSE ? dataFile : test.dataURL)
    it(blurb + ' should fail with ' +
       (VERBOSE ? expectURL : test.expect), function () {
         if (VERBOSE) console.log("schema: ", schemaBase)
         if (VERBOSE) console.log("data: ", dataBase)
         if (VERBOSE) console.log("expect: ", expectURL)
         expect(res).to.deep.equal(expected)
       })
  })
})

// Parses a JSON object, restoring `undefined` values
function parseJSON(string) {
  const object = JSON.parse(string)
  return /"\{undefined\}"/.test(string) ? restoreUndefined(object) : object
}

