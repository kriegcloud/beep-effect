// Test shex-simple browser interface.

"use strict";
const TEST_browser = "TEST_browser" in process.env ? JSON.parse(process.env["TEST_browser"]) : false;
const STARTUP_TIMEOUT = 10000
const SCRIPT_CALLBACK_TIMEOUT = 40000
const SHEX_SIMPLE = 'packages/shex-webapp/doc/shex-simple.html'
const SHEX_WORKER = 'packages/shex-webapp/doc/shex-worker.html'
const SHEXMAP_SIMPLE = 'packages/extension-map/doc/shexmap-simple.html'
const SHEXMAP_WORKER = 'packages/extension-map/doc/shexmap-worker.html'
const TESTS = [ // page and the labels on the top-most buttons on the default manifest
  {page: SHEX_SIMPLE, schemaLabel: "clinical observation", dataLabel: "with birthdate"},
  // {page: SHEX_WORKER, schemaLabel: "clinical observation", dataLabel: "with birthdate"},
  {page: SHEXMAP_SIMPLE, schemaLabel: "BP", dataLabel: "simple"},
  // {page: SHEXMAP_WORKER, schemaLabel: "BP", dataLabel: "simple"},
]
let Fs = require('fs')
let Path = require('path')
let expect = require("chai").expect
const node_fetch = require("node-fetch")
const jsdom = require("jsdom")
const { JSDOM } = jsdom
// JsDom only accepts it's own implementation of Blob
const Blob = require('jsdom/lib/jsdom/living/generated/Blob')
const ShExParser = require('@shexjs/parser')
let SharedForTests = null // gets set by shex-simple.js

const [[GitRootServer]] = require('../../../tools/testServer')
      .startServer(
        [ { url: 'http://localhost:9999/shex.js/',
            fromDir: Path.join(__dirname, '../../..') }
        ],
        [ { url: 'https://cdnjs.cloudflare.com/ajax/libs/jquery-csv/1.0.21/jquery.csv.js',
            file: Path.join(__dirname, 'static/jquery.csv-1.0.21.js') }
        ]
      )

if (!TEST_browser) {
  console.warn("Skipping browser-tests; to activate these tests, set environment variable TEST_browser=true");

} else {
  // Some manifests to play with:
  const WebAppExamplesDir = 'packages/shex-webapp/examples/'
  const Manifest_Example = WebAppExamplesDir + 'manifest.json'
  const Manifest_ShExMap = 'packages/extension-map/examples/manifest.json'
  const Manifest_InlineOne = 'packages/shex-webapp/test/browser/manifest-inline-one.json'
  const Manifest_UrlTwo = 'packages/shex-webapp/test/browser/manifest-URL-two.json'
  const ToProjectRoot = '../../..'

  function rel (file) { return Path.join(ToProjectRoot, file) }

  function abs (file) { return Path.join('/shex.js', file) }

  async function set (jquery, selector, value) {
    jquery(selector).val(value)
    jquery(selector).trigger("change")
    await SharedForTests.promise
  }

  async function wait (timeout) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(timeout)
      }, timeout)
    })
  }

  TESTS.forEach(test => {

    describe(`WEBapp ${test.page}`, function () {
      const {page, schemaLabel, dataLabel} = test

      describe('no URL parameters', function () {
        this.timeout(SCRIPT_CALLBACK_TIMEOUT);
        let dom, $, loaded
        before(async () => {
          ({ dom, $, loaded } = await loadPage(page, ''))
          expect(loaded.manifest).to.have.property('fromUrl') // shex-simple.js defaults to some URL
        })

        describe('validation output', function () {
          it("should have empty schema", function () {
            $('#inputSchema textarea').val()
          })

          it("should have empty data", function () {
            $('#inputData textarea').val()
          })

          it("should load first example from default manifest", async function () {
            let schema, data

            schema = $('#manifestDrop').find('button').slice(0, 1)
            expect(schema.text()).to.equal(schemaLabel)
            schema.click()
            await SharedForTests.promise

            data = $('.passes').find('button').slice(0, 1)
            expect(data.text()).to.equal(dataLabel)
            data.click()
            await SharedForTests.promise // following tests need data
          }).timeout(STARTUP_TIMEOUT)
        })
      })

      describe('schema translation', function () {
        this.timeout(SCRIPT_CALLBACK_TIMEOUT);
        const ClinObs = 'ClinObs'
        const base = 'http://a.example/'

        let dom, $, loaded, shexc, shexj, shexr
        before(async () => {
          ({ dom, $, loaded } = await loadPage(page, `?manifest=[]`)); // force empty manifest
          shexc = Fs.readFileSync(Path.join(WebAppExamplesDir, ClinObs + '.shex'), 'utf8')
          shexj = Fs.readFileSync(Path.join(WebAppExamplesDir, ClinObs + '.json'), 'utf8')
          shexr = Fs.readFileSync(Path.join(WebAppExamplesDir, ClinObs + '.ttl' ), 'utf8')
          expect(loaded.manifest).not.to.have.property('fromUrl')
        })

        it("from ShExC to ShExJ ", async function () {
          // await set($, "#inputSchema textarea.schema", shexc)
          SharedForTests.Caches.inputSchema.set(shexc, base + 'foo/') // will also mark as dirty
          $("#validate").trigger('click')
          await SharedForTests.promise
          const fromShExC = $("#results pre").text()
          expect(JSON.parse(fromShExC)).to.deep.equal(JSON.parse(shexj));
        }).timeout(STARTUP_TIMEOUT)

        it("from ShExR to ShExJ ", async function () {
          // await set($, "#inputSchema textarea.schema", shexr)
          SharedForTests.Caches.inputSchema.set(shexr, base + 'bar/')
          $("#validate").trigger('click')
          await SharedForTests.promise
          const fromShExR = $("#results pre").text()
          expect(JSON.parse(fromShExR)).to.deep.equal(JSON.parse(shexj));
        }).timeout(STARTUP_TIMEOUT)

        it("from ShExJ to ShExC ", async function () {
          // await set($, "#inputSchema textarea.schema", shexj)
          SharedForTests.Caches.inputSchema.set(shexj, base + 'baz/')
          $("#validate").trigger('click')
          await SharedForTests.promise
          const fromShExJ = $("#results pre").text()
          const p = ShExParser.construct(base + 'bip/')
          expect(p.parse(fromShExJ)).to.deep.equal(p.parse(shexc))
        }).timeout(STARTUP_TIMEOUT)
      })

      describe('explicit manifest URL', function () {
        this.timeout(SCRIPT_CALLBACK_TIMEOUT);
        let dom, $, loaded
        before(async () => {
          ({ dom, $, loaded } = await loadPage(page, `?manifestURL=${rel(Manifest_Example)}`));
          expect(loaded.manifest).to.have.property('fromUrl')
        })

        it("should load manifest", function () {
          let buttons = $('#manifestDrop').find('button');
          expect(loaded).to.have.property('manifest')
          expect(loaded.manifest).to.have.key('fromUrl')
        }).timeout(STARTUP_TIMEOUT)


        it("should load clinical observation example", async function () {
          let schema, data

          schema = $('#manifestDrop').find('button').slice(0, 1)
          expect(schema.text()).to.equal('clinical observation')
          schema.click()
          await SharedForTests.promise

          data = $('.passes').find('button').slice(0, 1)
          expect(data.text()).to.equal('with birthdate')
          data.click()
          await SharedForTests.promise
        }).timeout(STARTUP_TIMEOUT)

        describe('should set query map to', function () {
          it("empty", async function () {
            await set($, "#textMap", "")
            expect($("#editMap .pair").length).to.equal(1)
            expect($("#fixedMap .pair").length).to.equal(0)
            expect(mapToText($("#editMap"))).to.equal("@")
            expect(mapToText($("#fixedMap"))).to.equal("")
          })

          it("one entry", async function () {
            await set($, "#textMap", "{FOCUS :subject _}@START")
            expect($("#editMap .pair").length).to.equal(1)
            expect($("#fixedMap .pair").length).to.equal(1)
            expect(mapToText($("#editMap"))).to.equal("{FOCUS :subject _}@START")
            expect(mapToText($("#fixedMap"))).to.equal("<Obs1>@START")
          })

          it("one entry with trailing comma", async function () {
            await set($, "#textMap", "{FOCUS :subject _}@START,")
            expect($("#editMap .pair").length).to.equal(1)
            expect($("#fixedMap .pair").length).to.equal(1)
            expect(mapToText($("#editMap"))).to.equal("{FOCUS :subject _}@START")
            expect(mapToText($("#fixedMap"))).to.equal("<Obs1>@START")
          })

          it("two entries with produce one fixed map entry", async function () {
            await set($, "#textMap", "{FOCUS :subject _}@START,{FOCUS :lalala _}@START")
            expect($("#editMap .pair").length).to.equal(2)
            expect($("#fixedMap .pair").length).to.equal(1)
            expect(mapToText($("#editMap"))).to.equal("{FOCUS :subject _}@START,{FOCUS :lalala _}@START")
            expect(mapToText($("#fixedMap"))).to.equal("<Obs1>@START")
          })

          function mapToText (map) {
            return map.find(".pair").map((idx, pair) => fixedMapPairToText(pair)).get().join(',')
          }
          function fixedMapPairToText (pair) {
            return $(pair).find(".focus").val() + $(pair).find(".shapeMap-joiner").text() + $(pair).find(".inputShape").val()
          }
        })

        it("validation should generate human output", async function () {
          $("#interface").val("human");
          const valResp = await validationResults($, {
            name: "human", selector: "> div", contents: [
              { shapeMap: "<Obs1>@START"                  , classes: ["human", "passes"] },
              { shapeMap: "<Patient2>@!<ObservationShape>", classes: ["human", "passes"] },
            ]
          })
          expect(valResp.validationResults.length).to.equal(2)
        })

        it("validation should generate minimal output", async function () {
          $("#interface").val("minimal");
          await validationResults($, {
            name: "minimal", selector: "> pre", contents: [
              { shapeMap: /"node": "[^"]+Obs1"/, classes: ["passes"] },
              { shapeMap: /"node": "[^"]+Patient2"/, classes: ["passes"] },
            ]
          })
        })

        it("validation should generate matched graph output", async function () {
          $("#interface").val("human");
          $("#success").val("query");
          await validationResults($, {
            name: "human", selector: "> *", contents: [
              { shapeMap: ":name \"Bob\""                 , classes: ["passes"] },
              { shapeMap: "<Patient2>@!<ObservationShape>", classes: ["human", "passes"] },
            ]
          })
        })
      })

      describe('bad manifest URL', function () {
        this.timeout(SCRIPT_CALLBACK_TIMEOUT);
        let dom, $, loaded
        before(async () => {
          ({ dom, $, loaded } = await loadPage(page, '?manifestURL=doesNotExist'));
          expect(loaded.manifest).to.have.property('loadFailure')
        })

        it("should fail to load manifest", function () {
          let buttons = $('#manifestDrop').find('button')
          expect(loaded).to.have.property('manifest')
          expect(loaded.manifest).to.have.key('loadFailure')
        }).timeout(STARTUP_TIMEOUT)

        it("should have no manifest", function () {
          let buttons = $('#manifestDrop').find('button')
          expect(buttons.length).to.equal(0)
        }).timeout(STARTUP_TIMEOUT)
      })

      describe('inline schema and data', function () {
        this.timeout(SCRIPT_CALLBACK_TIMEOUT);
        let dom, $, loaded
        before(async () => {
          ({ dom, $, loaded } = await loadPage(page, `?manifestURL=${abs(Manifest_InlineOne)}`));
          expect(loaded.manifest).to.have.property('fromUrl')
        })

        it("should load simple example", async function () {
          const schema = $('#manifestDrop').find('button').slice(0, 1)
          expect(schema.text()).to.equal('1dotOr2dot_pass_p1')
          schema.click()
          await SharedForTests.promise

          const data = $('.passes').find('button').slice(0, 1)
          expect(data.text()).to.equal('p1.ttl')
          data.click()
          await SharedForTests.promise

          await validationResults($, {
            name: "human", selector: "> *", contents: [
              { shapeMap: "✓<x>@:S1", classes: ["passes"] },
            ]
          })
        }).timeout(STARTUP_TIMEOUT)
      })

      describe('URL refs to schema and data', function () {
        this.timeout(SCRIPT_CALLBACK_TIMEOUT);
        let dom, $, loaded
        before(async () => {
          ({ dom, $, loaded } = await loadPage(page, `?manifestURL=${abs(Manifest_UrlTwo)}`));
          expect(loaded.manifest).to.have.property('fromUrl')
        })

        it("should load simple example", async function () {
          const schema = $('#manifestDrop').find('button').slice(0, 1)
          expect(schema.text()).to.equal('1dotOr2dot_pass_p1')
          schema.click()
          await SharedForTests.promise

          const data = $('.passes').find('button').slice(0, 1)
          expect(data.text()).to.equal('p1.ttl')
          data.click()
          await SharedForTests.promise

          await validationResults($, {
            name: "human", selector: "> *", contents: [
              { shapeMap: "✓<x>@:S1", classes: ["passes"] },
            ]
          })
        }).timeout(STARTUP_TIMEOUT)

        it("should load imports example", async function () {
          const  schema = $('#manifestDrop').find('button').slice(1, 2)
          expect(schema.text()).to.equal('imports schema')
          schema.click()
          await SharedForTests.promise

          const data = $('.passes').find('button').slice(0, 1)
          expect(data.text()).to.equal('passing data')
          data.click()
          await SharedForTests.promise

          await validationResults($, {
            name: "human", selector: "> *", contents: [
              { shapeMap: "✓<//a.example/n1>@<//a.example/S1>", classes: ["passes"] },
            ]
          })
        }).timeout(STARTUP_TIMEOUT)
      })

      describe('no manifest', function () {
        this.timeout(SCRIPT_CALLBACK_TIMEOUT);
        let dom, $, loaded
        before(async () => {
          ({ dom, $, loaded } = await loadPage(page, '?manifestURL='));
          expect(loaded.manifest).to.have.property('skipped')
        })

        it("should load no schemas", async function () {
          let buttons = $('#manifestDrop').find('button')
          expect(buttons.length).to.equal(0)
        }).timeout(STARTUP_TIMEOUT)
      })

      describe('GET dialog', function () {
        this.timeout(SCRIPT_CALLBACK_TIMEOUT);
        let dom, $, loaded
        before(async () => {
          ({ dom, $, loaded } = await loadPage(page, '?manifestURL='));
          expect(loaded.manifest).to.have.property('skipped')
        })

        it("should load no schemas", async function () {
          expect($('#manifestDrop').find('button').length).to.equal(0)
          $("#load-manifest-button").trigger('click')
          $("#loadForm").attr("class", "manifest").find("span.whatToLoad").text('manifest')
          $("#loadInput").val(rel(Manifest_UrlTwo))
          $('div[aria-describedBy=loadForm] button:contains("GET")').trigger('click')
          const loaded = await SharedForTests.promise
          let buttons = $('#manifestDrop').find('button')
          expect($('#manifestDrop').find('button').length).to.equal(2)
        }).timeout(STARTUP_TIMEOUT)
      })

      describe('drag and drop', function () {
        this.timeout(SCRIPT_CALLBACK_TIMEOUT);
        let dom, $, loaded
        before(async () => {
          ({ dom, $, loaded } = await loadPage(page, '?manifestURL='));
          expect(loaded.manifest).to.have.property('skipped')
        })

        it("test manifest with URLs as simple object", async function () {
          await dropData("#manifestDrop", { "application/json": JSON.stringify(testEx1, null, 2) })
          let buttons = $('#manifestDrop').find('button')
          expect(buttons.length).to.equal(1)
          expect(buttons.slice(0, 1).text()).to.equal('I2 I3 <S1> { <p1> ., <p2> @<S2>? } | I3 <S2> { <p3> @<S3> } | <S3> { <p4> @<S1> }')
        })

        it("test manifest with URLs as array of one object", async function () {
          await dropData("#manifestDrop", { "application/json": JSON.stringify([testEx1], null, 2) })
          let buttons = $('#manifestDrop').find('button')
          expect(buttons.length).to.equal(1)
          expect(buttons.slice(0, 1).text()).to.equal('I2 I3 <S1> { <p1> ., <p2> @<S2>? } | I3 <S2> { <p3> @<S3> } | <S3> { <p4> @<S1> }')
        })

        it("test manifest with URLs array of two objects", async function () {
          await dropData("#manifestDrop", { "application/json": JSON.stringify([testEx1, testEx2], null, 2) })
          let buttons = $('#manifestDrop').find('button')
          expect(buttons.length).to.equal(2)
          expect(buttons.slice(0, 1).text()).to.equal('I2 I3 <S1> { <p1> ., <p2> @<S2>? } | I3 <S2> { <p3> @<S3> } | <S3> { <p4> @<S1> }')
          expect(buttons.slice(1, 2).text()).to.equal('1dot-relative.shex')
        })

        it("single test without URLs as simple object", async function () {
          // Construction of JsDom's internal Blob is idiomatic. Have fun in the debugger!
          const manifest = Blob.create(dom.window, [
            [Fs.readFileSync(Manifest_InlineOne)],
            {type: "application/json"}
          ])
          manifest.name = Path.parse(Manifest_InlineOne).name
          await dropFiles("#manifestDrop", [manifest])
          const schema = $('#manifestDrop').find('button').slice(0, 1)
          expect(schema.text()).to.equal('1dotOr2dot_pass_p1')
          schema.click()
          await SharedForTests.promise

          const data = $('.passes').find('button').slice(0, 1)
          expect(data.text()).to.equal('p1.ttl')
          data.click()
          await SharedForTests.promise

          await validationResults($, {
            name: "human", selector: "> *", contents: [
              { shapeMap: "✓<x>@:S1", classes: ["passes"] },
            ]
          })
        })

        async function dropData (selector, data) { await drop(selector, data, []) }
        async function dropFiles (selector, files) { await drop(selector, undefined, files) }

        async function drop (selector, data, files) {
          const event = dom.window.document.createEvent("MouseEvents")
          event.initMouseEvent( "drop", true, true )
          event.dataTransfer = {
            data: data,
            setData: function(type, val) { this.data[type] = val },
            getData: function(type) { return this.data[type] },
	    dropEffect: 'none',
	    effectAllowed: 'all',
            files: files,
 	    items: {},
	    types: [],
          }
          $(selector).get(0).dispatchEvent( event )
          await SharedForTests.promise
        }
      })

      let testEx1 = {
        "@id": "#3circRefS1-IS2-IS3-IS3",
        "@type": "sht:ValidationTest",
        "trait": [ "Import" ],
        "action": {
          "schema": "https://shex.io/shexTest/main/schemas/3circRefS1-IS2-IS3-IS3.shex",
          "shape": "http://a.example/S1",
          "data": "https://shex.io/shexTest/main/validation/3circRefPlus1_pass-open.ttl",
          "focus": "http://a.example/n1"
        },
        "extensionResults": [],
        "name": "3circRefS1-IS2-IS3-IS3",
        "comment": "I2 I3 <S1> { <p1> ., <p2> @<S2>? } | I3 <S2> { <p3> @<S3> } | <S3> { <p4> @<S1> } on { <n1> <p1> \"X\" ; <p2> <n2> . <n2> <p3> <n3> . <n3> <p4> <n5> . <n5> <p1> \"X\" }",
        "status": "mf:proposed",
        "result": "3circRefPlus1_pass-open.val"
      }

      const testEx2 = {
        "@id": "#1dot-relative_pass-short-shape",
        "@type": "sht:ValidationTest",
        "trait": [ "relativeIRI" ],
        "action": {
          "schema": "http://localhost/checkouts/shexSpec/shexTest/validation/1dot-relative.shex",
          "shape": "S1",
          "data": "http://localhost/checkouts/shexSpec/shexTest/validation/Is1_Ip1_Io1-relative.ttl",
          "focus": "s1"
        },
        "extensionResults": [],
        "name": "1dot-relative_pass-short-shape",
        "comment": "<S1> { <p1> [<o1>] } on <S1> in { <s1> <p1> <o1> }",
        "status": "mf:Approved"
      }

      const notCurrentlyUsed1 = {
        "@id": "#1NOTRefOR1dot_pass-inOR",
        "@type": "sht:ValidationTest",
        "action": {
          "schema": "http://localhost/checkouts/shexSpec/shexTest/schemas/1NOTRefOR1dot.shex",
          "shape": "http://a.example/S1",
          "data": "http://localhost/checkouts/shexSpec/shexTest/validation/In1_Ip1_In2.In2_Ip2_LX.ttl",
          "focus": "http://a.example/n1"
        },
        "extensionResults": [],
        "name": "1NOTRefOR1dot_pass-inOR",
        "comment": "<S1> { <p1> NOT @<S2> OR { <p2> . } } <S2> { <p3> . } in { <n1> <p1> <n2> . <n2> <p2> \"X\" }",
        "status": "mf:Proposed"
      }
    })
  })


  describe(`WEBapp ${SHEXMAP_SIMPLE}'s synthesis interface}`, function () {
    const page = SHEXMAP_SIMPLE

    describe('another manifest', function () {
      this.timeout(SCRIPT_CALLBACK_TIMEOUT);
      let dom, $, loaded
      before(async () => {
        ({ dom, $, loaded } = await loadPage(page, `?manifestURL=${abs(Manifest_ShExMap)}`));
          expect(loaded.manifest).to.have.property('fromUrl')
      })

      it("should load the BP example", async function () {
        const schema = $('#manifestDrop').find('button').slice(0, 1)
        expect(schema.text()).to.equal('BP')
        schema.click()
        await SharedForTests.promise

        const data = $('.passes').find('button').slice(0, 1)
        expect(data.text()).to.equal('simple')
        data.click()
        await SharedForTests.promise

        await validationResults($, {
          name: "human", selector: "> *", contents: [
            { shapeMap: "✓<tag:BPfhir123>@START", classes: ["passes"] },
          ]
        })

        await materializationResults($, {
          name: "human", selector: "> *", contents: [
            { shapeMap: "<tag:b0>@<BPunitsDAM>", classes: ["passes"] },
          ]
        })
      }).timeout(STARTUP_TIMEOUT)

      it("should load the BPPatient 2 level example", async function () {
        const  schema = $('#manifestDrop').find('button').slice(3, 4)
        expect(schema.text()).to.equal('BPPatient 2 levels')
        schema.click()
        await SharedForTests.promise

        const data = $('.passes').find('button').slice(0, 1)
        expect(data.text()).to.equal('simple')
        data.click()
        await SharedForTests.promise

        await validationResults($, {
          name: "human", selector: "> *", contents: [
            { shapeMap: "<PatientX>@START", classes: ["passes"] },
          ]
        })

        await materializationResults($, {
          name: "human", selector: "> *", contents: [
            { shapeMap: "<tag:BPfhir123>@<collector>", classes: ["passes"] },
          ]
        })
      }).timeout(STARTUP_TIMEOUT)
    })
  })
}

async function validationResults ($, expected) {
  $("#validate").trigger('click')
  return await testResults($, expected, 'validationResults')
}

async function materializationResults ($, expected) {
  $("#materialize").trigger('click')
  return await testResults($, expected, 'materializationResults')
}

async function testResults ($, expected, resultsProperty) {
  const validationResponse = await SharedForTests.promise
  expect(validationResponse).to.have.property(resultsProperty)
  const resDiv = $('#results > div')
  expect(resDiv.length).to.equal(1)
  const res = resDiv.find(expected.selector)

  expected.contents.forEach((contents, idx) => {
    const elt = res.get(idx)
    expect(elt).not.to.equal(undefined)
    const classList = [...elt.classList]
    contents.classes.forEach(cls => expect(classList).to.include(cls))
    if (contents.shapeMap.constructor === RegExp)
      expect(elt.textContent).to.match(contents.shapeMap)
    else
      expect(elt.textContent).to.include(contents.shapeMap)
  })

  return validationResponse
}

async function loadPage (page, searchParms) {
  const base = Path.join(__dirname, '../../..', page) // paths relative to repo root
  // let start = Date.now()
  // stamp('start')
  let timer = setTimeout(() => {
    // stamp('script load timeout')
    throw Error(`script load timeout ${SCRIPT_CALLBACK_TIMEOUT}`)
  }, SCRIPT_CALLBACK_TIMEOUT)
  let dom = getDom(page, searchParms)
  // stamp('dom')
  dom.window.fetch = node_fetch

  await new Promise((resolve, reject) => {
    dom.window._testCallback = (parm, results) => {
      if (parm instanceof Error)
        throw parm

      // stamp('callback')
      clearTimeout(timer)
      SharedForTests = parm
      resolve()
    }
  })
  const loaded = (await SharedForTests.promise).loads
  return { dom, $: dom.window.$, loaded }

  // function stamp (message) {
  //   let t = Date.now()
  //   console.warn(message, t, t - start)
  //   start = t
  // }

  function getDom (page, searchParms) {
    let url = GitRootServer.urlFor(page + searchParms)
    return new JSDOM(Fs.readFileSync(base, 'utf8'), {
      url: url,
      runScripts: "dangerously",
      resources: "usable"
    })
  }
}
