#!/usr/bin/env node

var log              = console.log,
    app              = require('koa')(),
    koaBody          = require('koa-body'),
    port             = process.env.PORT || 4290,
    host             = 'http://localhost',
    fs               = require('fs'),
    ShExValidator    = require("../lib/ShExValidator").ShExValidator,
    ShExLoader       = require("../lib/ShExLoader"),
    N3               = require("n3"),
    NotSupplied      = "-- not supplied --",
    UnknownIRI       = "-- not found --",
    RDF_TYPE         = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    ValidatorOptions = { diagnose: true };

var CLI = require("command-line-args")([
    { name: "help",  alias: "h", type: Boolean },
    { name: "regex-module", type: String },
]);

var cmds = CLI.parse();

function abort (msg, output) {
  output = output || console.error;
  output(msg);
  output(CLI.getUsage({
    title: "validate",
    description: "validate Turtle files with respect to ShEx schemas, for example:\n    validate -n http://a.example/Issue1 -d issues.ttl -s http://b.example/IssueShape -x http://tracker.example/schemas/Issue.shex",
    footer: "Project home: [underline]{https://github.com/shexSpec/shex.js}"
  }));
  process.exit(1);
}

if (cmds.help)
  abort("", console.log);

if ("regex-module" in cmds) {
  try {
    ValidatorOptions.regexModule = require(cmds["regex-module"]);
  } catch (e1) {
    try {
      ValidatorOptions.regexModule = require("../lib/regex/" + cmds["regex-module"]);
    } catch (e2) {
      abort(e1, console.error);
    }
  }
}

function resolveRelativeIRI (baseIri, relativeIri) {
  if (!N3.Util.isIRI(relativeIri))
    return relativeIri; // not really an IRI
  var p = new N3.Parser({ baseIRI: baseIri });
  p._readSubject({type: "IRI", value: relativeIri});
  return p._subject;
}

function resolvePrefixedIRI (prefixedIri, prefixes) {
  var colon = prefixedIri.indexOf(":");
  if (colon === -1)
    return null;
  var prefix = prefixes[prefixedIri.substr(0, colon)];
  return prefix === undefined ? null : prefix + prefixedIri.substr(colon+1);
}

function parsePassedNode (passedValue, meta, deflt, known, prefixes) {
  if (passedValue === undefined || passedValue.length === 0)
    return known && known(meta.base) ? meta.base : deflt ? deflt() : NotSupplied;
  var relIRI = passedValue[0] === "<" && passedValue[passedValue.length-1] === ">";
  if (relIRI)
    passedValue = passedValue.substr(1, passedValue.length-2);
  var t = resolveRelativeIRI(meta.base, passedValue);
  if (known(t))
    return t;
  if (!relIRI) {
    t = resolvePrefixedIRI(passedValue, meta.prefixes);
    if (t !== null && known(t))
      return t;
  }
  return UnknownIRI;
}

app.
  use(koaBody({
    multipart: true,
    formLimit: 15,
    formidable: {
      uploadDir: __dirname + '/uploads'
    }
  })).
  use(function *(next) {
    switch (this.originalUrl) {
    case "/":
      this.body = fs.readFileSync("./index.html", "utf-8");
      break;
    case "/validate":
      var parms = {
        schemaName:null, schemaFile:null, start:null,
        dataName:null,   dataFile:null,   focus:null, focusType:null
      };
      if (this.request.method == 'POST') {
        var body = this.request.body;
        parms.schemaName = body.files.schema.name;
        parms.schemaFile = body.files.schema.path;
        parms.start      = body.fields.start;
        parms.dataName   = body.files.data.name;
        parms.dataFile   = body.files.data.path;
        parms.focus      = body.fields.focus;
        parms.focusType  = body.fields.focusType;
      } else {
        this.throw(500, "only supports POST now");
      }

      var _this = this;
      yield ShExLoader
        .load({shexc: [parms.schemaFile]}, {turtle: [parms.dataFile]}, [])
        .then(function (loaded) {
          function knownShape (label) {
            return label in loaded.schema.shapes;
          }
          function someShape () {
            return Object.keys(loaded.schema.shapes)[0];
          }
          function knownNode (label) {
            return (loaded.data.getQuads(label, null, null).length > 0 ||
                    loaded.data.getQuads(null, null, label).length > 0);
          }
          function knownType (label) {
            return (loaded.data.getQuads(null, RDF_TYPE, label).length > 0);
          }
          function someIRInode () {
            var triples = loaded.data.getQuads(null, null, null);
            for (var i = 0; i < triples.length; ++i)
              if (N3.Util.isIRI(triples[i].subject))
                return triples[i].subject;
            return triples.length > 0 ? triples[0].subject : NotSupplied;
          };
          function someNodeWithType (type) {
            var triples = loaded.data.getQuads(null, RDF_TYPE, type)
            return triples.length > 0 ? triples[0].subject : NotSupplied;
          };
          if (!parms.start && loaded.schema.start)
            parms.start = loaded.schema.start
          else
            parms.start = parsePassedNode(parms.start, loaded.schemaMeta[0],
                                          someShape, knownShape, loaded.schema.prefixes);
          parms.focus = parms.focusType ?
            someNodeWithType(parsePassedNode(parms.focusType, loaded.dataMeta[0],
                                             null, knownType, loaded.data._prefixes)) :
            parsePassedNode(parms.focus, loaded.dataMeta[0], someIRInode,
                            knownNode, loaded.data._prefixes);
          var validator = ShExValidator(loaded.schema, ValidatorOptions);
          var result =
              parms.focus === NotSupplied || parms.focus === UnknownIRI ||
              parms.start === NotSupplied || parms.start === UnknownIRI ?
              { focus: parms.focus, start: parms.start } :
              validator.validate(loaded.data, parms.focus, parms.start);
          if (body.fields.output === "html") {
            _this.body = Object.keys(parms).reduce((r, p) => {
              return r.replace("["+p+"]", parms[p]);
            }, fs.readFileSync("./validate.template", "utf-8")).
              replace(/\[result\]/, JSON.stringify(result, null, 2));
          } else {
            _this.body = JSON.stringify(result, null, 2)+"\n";
          }
          fs.unlink(parms.schemaFile);
          fs.unlink(parms.dataFile);
          return next;
        }).catch(e => {
          _this.body = {
            type: "ParsingError",
            errors: [e]
          };
        })
      break;
    default:
      this.throw(404, "whazzat?");
    }
  }).
  listen(port);


log('Visit %s:%s/ in browser.', host, port);
log();
log('Test with executing this commands:');
log('curl -i %s:%s/validate -F "schema=@../test/cli/1dotOr2dot.shex" -F "start=http://a.example/S1" -F "data=@../test/cli/p2p3.ttl" -F "focus=x"', host, port);
log('Note that start and focus can be relative or prefixed URLs.');
log();
log('Press CTRL+C to stop...');
