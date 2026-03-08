/*
  Classes and constants common to all shex{,map}{simple,worker}.
 */
const START_SHAPE_LABEL = "START";
const INPUTAREA_TIMEOUT = 250;
const NO_MANIFEST_LOADED = "no manifest loaded";

const START_SHAPE_INDEX_ENTRY = "- start -"; // specificially not a JSON-LD @id form.
const LOG_PROGRESS = false;
const EXTENSION_sparql = "http://www.w3.org/ns/shex#Extensions-sparql";
const SPARQL_get_items_limit = 50;
const MENU_ITEM_materialize = "- materialize -"

const DefaultBase = location.origin + location.pathname;
let SharedForTests = null; // testing global used by browser-test

function ldToTurtle (ld, termToLex) {
  return typeof ld === "object"
    ? lit(ld)
    : termToLex(
      ld.startsWith("_:")
        ? RdfJs.DataFactory.blankNode(ld.substr(2))
        : RdfJs.DataFactory.namedNode(ld)
    );
  function lit (o) {
    let ret = "\""+o["@value"].replace(/["\r\n\t]/g, (c) => {
      return {'"': "\\\"", "\r": "\\r", "\n": "\\n", "\t": "\\t"}[c];
    }) +"\"";
    if ("@type" in o)
      ret += "^^<" + o["@type"] + ">";
    if ("@language" in o)
      ret += "@" + o["@language"];
    return ret;
  }
}

class InterfaceCache {
  // caches for textarea parsers
  constructor (selection, onLoad) {
    this._dirty = true;
    this.selection = selection;
    this.onLoad = onLoad;
    this.parsed = null; // a Promise
    this.url = undefined; // only set if inputarea caches some web resource.
    this.meta = { prefixes: {}, base: DefaultBase };
  }

  dirty (newVal) {
    const ret = this._dirty;
    this._dirty = newVal;
    return ret;
  }

  get () {
    return this.selection.val();
  }

  async set (text, base) {
    this._dirty = true;
    this.selection.val(text);
    this.meta.base = base;
    if (base !== this.base) {
      this.url = base; // @@crappyHack1 -- parms should differntiate:
      // working base: base for URL resolution.
      // loaded base: place where you can GET current doc.
      // Note that this.Caches.manifest.set takes a 3rd parm.
    }
  }

  async refresh () {
    if (!this._dirty)
      return this.parsed;
    this.parsed = await this.parse(this.selection.val(), this.meta.base);
    await this.parsed;
    this._dirty = false;
    return this.parsed;
  }

  async asyncGet (url) {
    url = new URL(url, window.location).href
    const _cache = this;
    let resp
    try {
      resp = await fetch(url, {headers: {
        accept: 'text/shex,text/turtle,*/*;q=0.9, test/html;q=0.8',
        // cache: 'no-cache' -- breaks CORS, so user has to open in new page and force reload there
      }})
    } catch (e) {
      throw Error("unable to fetch <" + url + ">: " + '\n' + e.message);
    }
    if (!resp.ok)
      throw Error("fetch <" + url + "> got error response " + resp.status + ": " + resp.statusText);
    const data = await resp.text();
    _cache.meta.base = url;
    try {
      await _cache.set(data, url, undefined, resp.headers.get('content-type'));
    } catch (e) {
      throw Error("error setting " + this.queryStringParm + " with <" + url + ">: " + '\n' + e.message);
    }
    $("#loadForm").dialog("close");
    return { url: url, data: data };
  }

  callOnLoad () {
    if (this.onLoad)
      this.onLoad();
  }
}

class SchemaCache extends InterfaceCache {
  constructor (selection, onLoad, shexcParser, turtleParser) {
    super(selection, onLoad);
    this.shexcParser = shexcParser;
    this.turtleParser = turtleParser;
    this.graph = null;
    this.language = null;

    this.meta.termToLex = (trm) => trm === ShExWebApp.Validator.Start
      ? START_SHAPE_LABEL
      : ShExWebApp.ShExTerm.shExJsTerm2Turtle(trm, this.meta, true);
    this.meta.lexToTerm = (lex) => lex === START_SHAPE_LABEL
      ? ShExWebApp.Validator.Start
      : turtleParser.termToLd(lex, new IRIResolver(this.meta));
  }

  async parse (text, base) {
    const parseShExR = () => {
      const graphParser = new ShExWebApp.Validator(
        this.shexcParser.parseString(ShExRSchema, {}, base), // !! do something useful with the meta parm (prefixes and base)
        ShExWebApp.RdfJsDb(this.graph),
        {}
      );
      const schemaRoot = this.graph.getQuads(null, ShExWebApp.Util.RDF.type, "http://www.w3.org/ns/shex#Schema")[0].subject; // !!check
      const val = graphParser.validateNodeShapePair(schemaRoot, ShExWebApp.Validator.Start); // start shape
      return ShExWebApp.Util.ShExJtoAS(ShExWebApp.Util.ShExRtoShExJ(ShExWebApp.Util.valuesToSchema(ShExWebApp.Util.valToValues(val))));
    }

    const isJSON = text.match(/^\s*\{/);
    const isDCTAP = text.match(/\s*shapeID/)
    this.graph = isJSON ? null : this.tryN3(text);
    this.language =
      isJSON ? "ShExJ" :
      isDCTAP ? "DCTAP":
      this.graph ? "ShExR" :
      "ShExC";
    $("#results .status").text("parsing "+this.language+" schema...").show();
    const schema =
          isJSON ? ShExWebApp.Util.ShExJtoAS(JSON.parse(text)) :
          isDCTAP ? await parseDcTap(text) :
          this.graph ? parseShExR() :
          this.shexcParser.parseString(text, this.meta, base);
    $("#results .status").hide();
    this.callOnLoad();
    return schema;

    async function parseDcTap (text) {
      const dctap = new ShExWebApp.DcTap();
      return await new Promise((resolve, reject) => {
        $.csv.toArrays(text, {}, (err, data) => {
          if (err) reject(err)
          dctap.parseRows(data, base)
          resolve(dctap.toShEx())
        })
      })
    }
  }

  async getItems () {
    const obj = await this.refresh();
    const start = "start" in obj ? [START_SHAPE_LABEL] : [];
    const rest = "shapes" in obj ? obj.shapes.map(se => this.meta.termToLex(se.id)) : [];
    return start.concat(rest);
  }

  tryN3 (text) {
    try {
      if (text.match(/^\s*$/))
        return null;
      const db = this.turtleParser.parseString (text, this.meta, this.base); // interpret empty schema as ShExC
      if (db.getQuads().length === 0)
        return null;
      return db;
    } catch (e) {
      return null; // signal caller that text isn't Turtle
    }
  }
}

class TurtleCache extends InterfaceCache {
  constructor (selection, onLoad, turtleParser, queryTrackerController) {
    super(selection, onLoad);
    this.turtleParser = turtleParser;
    this.queryTrackerController = queryTrackerController;
    this.meta.termToLex = (trm) => ShExWebApp.ShExTerm.rdfJsTerm2Turtle(trm, this.meta);
    this.meta.lexToTerm = (lex) => turtleParser.termToLd(lex, new IRIResolver(this.meta));
  }

  async parse (text, base) {
    var m = text.match(/^\s*#?\s*Endpoint\s*:\s*(https?:\/\/.*?)(\s+|$)/si);
    if (m) {
      this.endpoint = m[1];
      if ($("#slurp").length === 0) {
        // Add a #slurp checkbox
        $("#load-data-button").append(
          $("<span/>", {id: "slurpSpan",
                        style: "float:right",
                        title: "fill data pane with data queried from <" + this.endpoint + ">"})
            .append(
              $("<input/>", {id: "slurp", type: "checkbox"}),
              $("<label/>", {for: "slurp"}).text("slurp")
            ).on("click", () => {
              // HACK: disable propagation and toggle after handler is done.
              setTimeout(() => {
                $("#slurp").prop("checked", !$("#slurp").prop("checked"));
              }, 0);
              return false; // don't pass to load data button
            })
        );
      }
    } else {
      delete this.endpoint; // make sure it's not set
      $("#slurpSpan").remove();
    }
    const res = this.endpoint
      ? ShExWebApp.SparqlDb(this.endpoint, this.queryTrackerController.queryTracker)
      : ShExWebApp.RdfJsDb(this.turtleParser.parseString(text, this.meta, base));
    this.callOnLoad();
    return res;
  }

  async getItems () {
    const m = this.get().match(/^[\s]*Endpoint:[\s]*(https?:\/\/.*?)[\s]*$/i);
    if (m) {
      const q = "SELECT DISTINCT ?s { ?s ?p ?o } LIMIT " + SPARQL_get_items_limit;
      return [MENU_ITEM_materialize]
        .concat(ShEx.Util.executeQuery(q, m[1], RdfJs.DataFactory).map(this.lexifyFirstColumn));
    } else {
      const data = await this.refresh();
      return data.getQuads().map(t => {
        return this.meta.termToLex(t.subject); // !!check
      });
    }
  }

  lexifyFirstColumn (row) {
    return this.meta.termToLex(row[0]); // row[0] is the first column.
  }
}

class ManifestCache extends InterfaceCache {
  constructor (selection, caches, resultsWidget) {
    super(selection, null);
    this.caches = caches;
    this.resultsWidget = resultsWidget;
  }

  async set (textOrObj, url, source) {
    $("#inputSchema .manifest li").remove();
    $("#inputData .passes li, #inputData .fails li").remove();
    if (typeof textOrObj !== "object") {
      if (url !== this.base) {
        this.url = url; // @@crappyHack1 -- parms should differntiate:
      }
      try {
        // exceptions pass through to caller (asyncGet)
        try {
          textOrObj = JSON.parse(textOrObj);
        } catch (eJson) {
          try {
            textOrObj = ShExWebApp.JsYaml.load(textOrObj);
          } catch (eYaml) {
            throw url.endsWith(".yaml")
              ? eYaml
              : eJson;
          }
        }
      } catch (e) {
        $("#inputSchema .manifest").append($("<li/>").text(NO_MANIFEST_LOADED));
        const throwMe = Error(e + '\n' + textOrObj);
        throwMe.action = 'load manifest'
        throw throwMe
        // @@DELME(2017-12-29)
        // transform deprecated examples.js structure
        // textOrObj = eval(textOrObj).reduce((acc, schema) => {
        //   function x (data, status) {
        //     return {
        //       schemaLabel: schema.name,
        //       schema: schema.schema,
        //       dataLabel: data.name,
        //       data: data.data,
        //       queryMap: data.queryMap,
        //       status: status
        //     };
        //   }
        //   return acc.concat(
        //     schema.passes.map(data => x(data, "conformant")),
        //     schema.fails.map(data => x(data, "nonconformant"))
        //   );
        // }, []);
      }
    }
    if (!Array.isArray(textOrObj))
      textOrObj = [textOrObj];
    const demos = textOrObj.reduce((acc, elt) => {
      if ("action" in elt) { // TODO: move to ShExUtil
        // compatibility with test suite structure.

        const action = elt.action;
        let schemaLabel = action.schema.substr(action.schema.lastIndexOf('/')+1);
        let dataLabel = elt["@id"];
        let match = null;
        const emptyGraph = "-- empty graph --";
        if ("comment" in elt) {
          if ((match = elt.comment.match(/^(.*?) \/ { (.*?) }$/))) {
            schemaLabel = match[1]; dataLabel = match[2] || emptyGraph;
          } else if ((match = elt.comment.match(/^(.*?) on { (.*?) }$/))) {
            schemaLabel = match[1]; dataLabel = match[2] || emptyGraph;
          } else if ((match = elt.comment.match(/^(.*?) as { (.*?) }$/))) {
            schemaLabel = match[2]; dataLabel = match[1] || emptyGraph;
          }
        }
        const queryMap = "map" in action ?
              null :
              ldToTurtle(action.focus, this.caches.inputData.meta.termToLex)
              + "@"
              + ("shape" in action ? this.caches.inputSchema.meta.termToLex(action.shape, false) : START_SHAPE_LABEL);
        const queryMapURL = "map" in action ?
              action.map :
              null;
        elt = Object.assign(
          {
            '@id': new URL(elt['@id'], url).href,
            schemaLabel: schemaLabel,
            schemaURL: action.schema || url,
            // dataLabel: "comment" in elt ? elt.comment : (queryMap || dataURL),
            dataLabel: dataLabel,
            dataURL: action.data || url
          },
          (queryMap ? { queryMap: queryMap } : { queryMapURL: queryMapURL }),
          { status: elt["@type"] === "sht:ValidationFailure" ? "nonconformant" : "conformant" }
        );
        if ("termResolver" in action || "termResolverURL" in action) {
          elt.meta = action.termResolver;
          elt.metaURL = action.termResolverURL || url;
        }
      }
      ["schemaURL", "dataURL", "queryMapURL"].forEach(parm => {
        if (parm in elt) {
          elt[parm] = new URL(elt[parm], url).href;
        } else {
          delete elt[parm];
        }
      });
      return acc.concat(elt);
    }, []);
    await this.prepareManifest(demos, url);
    $("#manifestDrop").show(); // may have been hidden if no manifest loaded.
  }

  async parse (text, base) {
    throw Error("should not try to parse manifest cache");
  }

  async getItems () {
    throw Error("should not try to get manifest cache items");
  }

  maybeGET (obj, base, key, accept) { // !!not used
    if (obj[key] != null) {
      // Take the passed data, guess base if not provided.
      if (!(key + "URL" in obj))
        obj[key + "URL"] = base;
      obj[key] = Promise.resolve(obj[key]);
    } else if (key + "URL" in obj) {
      // absolutize the URL
      obj[key + "URL"] = this.meta.lexToTerm("<"+obj[key + "URL"]+">");
      // Load the remote resource.
      obj[key] = new Promise((resolve, reject) => {
        $.ajax({
          accepts: {
            mycustomtype: accept
          },
          url: this.meta.lexToTerm("<"+obj[key + "URL"]+">"),
          dataType: "text"
        }).then(text => {
          resolve(text);
        }).fail(e => {
          this.resultsWidget.append($("<pre/>").text(
            "Error " + e.status + " " + e.statusText + " on GET " + obj[key + "URL"]
          ).addClass("error"));
          reject(e);
        });
      });
    } else {
      // Ignore this parameter.
      obj[key] = Promise.resolve(obj[key]);
    }
  }

  async prepareManifest (demoList, base) {
    const listItems = Object.keys(this.caches).reduce((acc, k) => {
      acc[k] = {};
      return acc;
    }, {});
    const nesting = demoList.reduce((acc, elt, idx) => {
      const defaultLabel = "title" in elt
            ? elt.title
            : `manifest[${idx}]`;
      const schemaLabel = elt.schemaLabel || defaultLabel;
      const key = schemaLabel + "|" + elt.schema;
      if (!(key in acc)) {
        // first entry with this schema
        acc[key] = {
          label: schemaLabel,
          text: elt.schema,
          url: elt.schemaURL || (elt.schema ? base : undefined)
        };
      } else {
        // nth entry with this schema
      }

      if ("dataLabel" in elt || "data" in elt || "dataURL" in elt) {
        const dataLabel = elt.dataLabel || defaultLabel;
        const dataEntry = this.makeDataEntry(dataLabel, idx, elt, base);
        const target = elt.status === "nonconformant"
              ? "fails"
              : elt.status === "conformant" ? "passes" : "indeterminant";
        if (!(target in acc[key])) {
          // first entry with this data
          acc[key][target] = [dataEntry];
        } else {
          // n'th entry with this data
          acc[key][target].push(dataEntry);
        }
      } else {
        // this is a schema-only example
      }

      return acc;
    }, {});
    const nestingAsList = Object.keys(nesting).map(e => nesting[e]);
    await this.paintManifest("#inputSchema .manifest ul", nestingAsList, this.pickSchema.bind(this), listItems, "inputSchema");
  }


  // controls for manifest buttons
  async paintManifest (selector, list, func, listItems, side) {
    $(selector).empty();
    await Promise.all(list.map(async entry => {
      // build button disabled and with leading "..." to indicate that it's being loaded
      const button = $("<button/>").text("..." + entry.label.substr(3)).attr("disabled", "disabled");
      const li = $("<li/>").append(button);
      $(selector).append(li);
      if (entry.text === undefined) {
        entry.text = await this.fetchOK(entry.url).catch(responseOrError => {
          // leave a message in the schema or data block
          return "# " + this.renderErrorMessage(
            responseOrError instanceof Error
              ? { url: entry.url, status: -1, statusText: responseOrError.message }
            : responseOrError,
            side);
        })
        textLoaded();
      } else {
        textLoaded();
      }

      function textLoaded () {
        li.on("click", async () => {
          SharedForTests.promise = func(entry.name, entry, li, listItems, side);
        });
        listItems[side][ManifestCache.sum(entry.text)] = li;
        // enable and get rid of the "..." in the label now that it's loaded
        button.text(entry.label).removeAttr("disabled");
      }
    }))
    this.setTextAreaHandlers(listItems);
  }

  setTextAreaHandlers (listItems) {
    const timeouts = Object.keys(this.caches).reduce((acc, k) => {
      acc[k] = undefined;
      return acc;
    }, {});

    Object.keys(this.caches).forEach((cache) => {
      this.caches[cache].selection.keyup((e) => { // keyup to capture backspace
        const code = e.keyCode || e.charCode;
        // if (!(e.ctrlKey)) {
        //   this.resultsWidget.clear();
        // }
        if (!(e.ctrlKey && (code === 10 || code === 13))) {
          later(e.target, cache, this.caches[cache]);
        }
      });
    });

    function later (target, side, cache) {
      cache.dirty(true);
      if (timeouts[side])
        clearTimeout(timeouts[side]);

      timeouts[side] = setTimeout(() => {
        timeouts[side] = undefined;
        const curSum = ManifestCache.sum($(target).val());
        if (curSum in listItems[side])
          listItems[side][curSum].addClass("selected");
        else
          $("#"+side+" .selected").removeClass("selected");
        delete cache.url;
      }, INPUTAREA_TIMEOUT);
    }
  }

  makeDataEntry (dataLabel, idx, elt, base) {
    return {
      label: dataLabel || idx.toString(),
      text: elt.data,
      url: elt.dataURL || (elt.data ? base : undefined),
      entry: elt
    };
  }

  async pickSchema (name, schemaTest, elt, listItems, side) {
    if ($(elt).hasClass("selected")) {
      await this.clearAll();
    } else {
      await this.caches.inputSchema.set(schemaTest.text, new URL((schemaTest.url || ""), DefaultBase).href);
      this.caches.inputSchema.url = undefined; // @@ crappyHack1
      $("#inputSchema .status").text(name);

      this.clearData();
      const headings = {
        "passes": "Passing:",
        "fails": "Failing:",
        "indeterminant": "Data:"
      };
      await Promise.all(Object.keys(headings).map(async key => {
        if (key in schemaTest) {
          $("#inputData ." + key + "").show();
          $("#inputData ." + key + " p:first").text(headings[key]);
          await this.paintManifest("#inputData ." + key + " ul", schemaTest[key], this.pickData.bind(this), listItems, "inputData");
        } else {
          $("#inputData ." + key + " ul").empty();
        }
      }));

      $("#inputSchema li.selected").removeClass("selected");
      $(elt).addClass("selected");
      try {
        await this.caches.inputSchema.refresh();
      } catch (e) {
        this.resultsWidget.failMessage(e, "parsing schema");
      }
    }
  }

  async pickData (name, dataTest, elt, listItems, side) {
    this.clearData();
    if ($(elt).hasClass("selected")) {
      $(elt).removeClass("selected");
    } else {
      // Update data pane.
      await this.caches.inputData.set(dataTest.text, new URL((dataTest.url || ""), DefaultBase).href);
      this.caches.inputData.url = undefined; // @@ crappyHack1
      $("#inputData .status").text(name);
      $("#inputData li.selected").removeClass("selected");
      $(elt).addClass("selected");
      try {
        await this.caches.inputData.refresh();
      } catch (e) {
        this.resultsWidget.failMessage(e, "parsing data");
      }

      // Update ShapeMap pane.
      this.caches.shapeMap.removeEditMapPair(null);
      if (dataTest.entry.queryMap !== undefined) {
        await this.queryMapLoaded(dataTest, dataTest.entry.queryMap);
      } else if (dataTest.entry.queryMapURL !== undefined) {
        try {
          const resp = await this.fetchOK(dataTest.entry.queryMapURL)
          ManifestCache.queryMapLoaded(dataTest, resp);
        } catch (e) {
          this.renderErrorMessage(e, "queryMap");
        }
      } else {
        this.resultsWidget.append($("<div/>").text("No queryMap or queryMapURL supplied in manifest").addClass("warning"));
      }
    }
  }

  async queryMapLoaded (dataTest, text) {
    dataTest.entry.queryMap = text;
    try {
      $("#textMap").val(JSON.parse(dataTest.entry.queryMap).map(entry => `<${entry.node}>@<${entry.shape}>`).join(",\n"));
    } catch (e) {
      $("#textMap").val(dataTest.entry.queryMap);
    }
    await this.caches.shapeMap.copyTextMapToEditMap();
    // callValidator();
  }

  fetchOK (url) {
    return fetch(url).then(responseOrError => {
      if (!responseOrError.ok) {
        throw responseOrError;
      }
      return responseOrError.text()
    });
  }

  renderErrorMessage (response, what) {
    const message = "failed to load " + "queryMap" + " from <" + response.url + ">, got: " + response.status + " " + response.statusText;
    this.resultsWidget.append($("<pre/>").text(message).addClass("error"));
    return message;
  }

  async clearData () {
    // Clear out data textarea.
    await this.caches.inputData.set("", DefaultBase);
    $("#inputData .status").text(" ");
    delete this.caches.inputData.endpoint;

    // Clear out every form of ShapeMap.
    $("#textMap").val("").removeClass("error");
    this.caches.shapeMap.makeFreshEditMap();
    $("#fixedMap").empty();

    this.resultsWidget.clear();
  }

  async clearAll () {
    $("#results .status").hide();
    await this.caches.inputSchema.set("", DefaultBase);
    $(".inputShape").val("");
    $("#inputSchema .status").text(" ");
    $("#inputSchema li.selected").removeClass("selected");
    this.clearData();
    $("#inputData .passes, #inputData .fails").hide();
    $("#inputData .passes p:first").text("");
    $("#inputData .fails p:first").text("");
    $("#inputData .passes ul, #inputData .fails ul").empty();
  }

  static sum (s) { // cheap way to identify identical strings
    return s.replace(/\s/g, "").split("").reduce((a,b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a
    }, 0);
  }
}

const ShExJsUrl = 'https://github.com/shexSpec/shex.js'
class ExtensionCache extends InterfaceCache {
  constructor (selection, resultsWidget) {
    super(selection, null);
    this.resultsWidget = resultsWidget;
  }

  async set (code, url, source, mediaType) {
    this.url = url; // @@crappyHack1 -- parms should differntiate:
    try {
      // exceptions pass through to caller (asyncGet)

      // const resp = await fetch('http://localhost/checkouts/shexSpec/extensions/Eval/')
      // const text = await resp.text();
      if (mediaType.startsWith('text/html'))
        return this.grepHtmlIndexForPackage(code, url, source)

      const extension = Function(`"use strict";
const module = {exports: {}};
${code}
return module.exports;
`)()
      const name = extension.name;
      const id = "extension_" + name;

      // Delete any old li associated with this extension.
      const old = $(`.extensionControl[data-url="${extension.url}"]`)
      if (old.length) {
        this.resultsWidget.append($("<div/>").append(
          $("<span/>").text(`removing old ${old.attr('data-name')} extension`)
        ));
        old.parent().remove();
      }

      // Create a new li.
      const elt = $("<li/>", { class: "menuItem", title: extension.description }).append(
        $("<input/>", {
          type: "checkbox",
          checked: "checked",
          class: "extensionControl",
          id: id,
          "data-name": name,
          "data-url": extension.url
        }),
        $("<label/>", { for: id }).append(
          $("<a/>", {href: extension.url, text: name})
        )
      );
      elt.insertBefore("#load-extension-button");
      $("#" + id).data("code", extension);

      this.Caches.extension.url = url; // @@ cheesy hack that only works to remember one extension URL
      this.resultsWidget.append($("<div/>").append(
        $("<span/>").text(`extension ${name} loaded from <${url}>`)
      ));
    } catch (e) {
      // $("#inputSchema .extension").append($("<li/>").text(NO_EXTENSION_LOADED));
      const throwMe = Error(e + '\n' + code);
      throwMe.action = 'load extension'
      throw throwMe
    }
    // $("#extensionDrop").show(); // may have been hidden if no extension loaded.
  }

  /* Poke around in HTML for a PACKAGE link in
     <table class="implementations">
     <td property="code:softwareAgent" resource="https://github.com/shexSpec/shex.js">shexjs</td>
     <td><a property="shex:package" href="PACKAGE"/>...</td>...
     </table>
  */
  async grepHtmlIndexForPackage (code, url, source)  {
    const jq = $(code);
    const impls = $(jq.find('table.implementations'))
    if (impls.length !== 1) {
      this.resultsWidget.append($("<div/>").append(
        $("<span/>").text("unparsable extension index at " + url)
      ).addClass("error"));
      return;
    }
    const tr = $(impls).find(`tr td[resource="${ShExJsUrl}"]`).parent()
    if (tr.length !== 1) {
      this.resultsWidget.append($("<div/>").append(
        $("<span/>").text("no entry for shexjs in index HTML at " + url)
      ).addClass("error"));
      return;
    }
    const href = tr.find('[property="shex:package"]').attr('href')
    if (!href) {
      this.resultsWidget.append($("<div/>").append(
        $("<span/>").text("no package for shexjs in index HTML at " + url)
      ).addClass("error"));
      return;
    }
    const refd = await fetch(href);
    if (!refd.ok) {
      this.resultsWidget.append($("<div/>").append(
        $("<span/>").text(`error fetching implementation: ${refd.status} (${refd.statusText}) for URL <${href}>`)
      ).addClass("error"));
    } else {
      code = await refd.text();
      await this.set(code, url, source, refd.headers.get('content-type'));
    }
  }

  async parse (text, base) {
    throw Error("should not try to parse extension cache");
  }

  async getItems () {
    throw Error("should not try to get extension cache items");
  }
}

class ShapeMapCache extends InterfaceCache {
  constructor (selection, caches, turtleParser, resultsWidget) {
    super(selection, null);
    this.caches = caches;
    this.resultsWidget = resultsWidget;
    this.meta.termToLex = (trm) => ShExWebApp.ShExTerm.rdfJsTerm2Turtle(trm, this.meta);
    this.meta.lexToTerm = (lex) => turtleParser.termToLd(lex, new IRIResolver(this.meta));
  }

  async parse (text) {
    this.removeEditMapPair(null);
    $("#textMap").val(text);
    this.copyTextMapToEditMap();
    await this.copyEditMapToFixedMap();
  };

  async getItems () {
    throw Error("should not try to get manifest cache items");
  }

  /**
   * @return list of errors encountered
   */
  async copyEditMapToTextMap () {
    if ($("#editMap").attr("data-dirty") === "true") {
      const text = $("#editMap .pair").get().reduce((acc, queryPair) => {
        const node = $(queryPair).find(".focus").val();
        const shape = $(queryPair).find(".inputShape").val();
        if (!node || !shape)
          return acc;
        const status = $(queryPair).find(".shapeMap-joiner").hasClass("nonconformant") ? "!" : "";
        return acc.concat([node+"@"+status+shape]);
      }, []).join(",\n");
      $("#textMap").empty().val(text);
      const ret = await this.copyEditMapToFixedMap();
      this.markEditMapClean();
      return ret;
    } else {
      return []; // no errors
    }
  }

  /**
   * Parse query map to populate #editMap and #fixedMap.
   * @returns list of errors. ([] means everything was good.)
   */
  async copyTextMapToEditMap () {
    $("#textMap").removeClass("error");
    const shapeMap = $("#textMap").val();
    this.resultsWidget.clear();
    try {
      await this.caches.inputSchema.refresh();
      await this.caches.inputData.refresh();
      const smparser = ShExWebApp.ShapeMapParser.construct(
        this.meta.base, this.caches.inputSchema.meta, this.caches.inputData.meta);
      const sm = smparser.parse(shapeMap);
      this.removeEditMapPair(null);
      this.addEditMapPairs(sm.length ? sm : null);
      const ret = await this.copyEditMapToFixedMap();
      this.markEditMapClean();
      this.resultsWidget.clear();
      return ret;
    } catch (e) {
      $("#textMap").addClass("error");
      this.resultsWidget.failMessage(e, "parsing Query Map");
      this.makeFreshEditMap()
      return [e];
    }
  }

  makeFreshEditMap () {
    this.removeEditMapPair(null);
    this.addEditMapPairs(null, null);
    this.markEditMapClean();
    return [];
  }

  addEmptyEditMapPair (evt) {
    this.addEditMapPairs(null, $(evt.target).parent().parent());
    this.markEditMapDirty();
    return false;
  }

  addEditMapPairs (pairs, target) {
    const renderTP = (tp) => {
      const ret = ["subject", "predicate", "object"].map(k => {
        const ld = tp[k];
        if (ld === ShExWebApp.ShapeMap.Focus)
          return "FOCUS";
        if (!ld) // ?? ShExWebApp.Uti.any
          return "_";
        return ldToTurtle(ld, this.caches.inputData.meta.termToLex);
      });
      return "{" + ret.join(" ") + "}";
    }

    const startOrLdToTurtle = (term) => {
      return term === ShExWebApp.Validator.Start ? START_SHAPE_LABEL : ShExWebApp.ShExTerm.shExJsTerm2Turtle(term, this.caches.inputSchema.meta);
    }

    (pairs || [{node: {type: "empty"}}]).forEach(pair => {
      const nodeType = (typeof pair.node !== "object" || "@value" in pair.node)
            ? "node"
            : pair.node.type;
      let skip = false;
      let node, shape;
      switch (nodeType) {
      case "empty": node = shape = ""; break;
      case "node": node = ldToTurtle(pair.node, this.caches.inputData.meta.termToLex); shape = startOrLdToTurtle(pair.shape); break;
      case "TriplePattern": node = renderTP(pair.node); shape = startOrLdToTurtle(pair.shape); break;
      case "Extension":
        if (pair.node.language === EXTENSION_sparql) {
          node = "SPARQL '''" + (pair.node.lexical.replace(/'''/g, "''\\'")) + "'''";
          shape = startOrLdToTurtle(pair.shape);
        } else {
          this.resultsWidget.failMessage(Error("unsupported extension: <" + pair.node.language + ">"),
                                         "parsing Query Map", pair.node.lexical);
          skip = true; // skip this entry.
        }
        break;
      default:
        this.resultsWidget.append($("<div/>").append(
          $("<span/>").text("unrecognized ShapeMap:"),
          $("<pre/>").text(JSON.stringify(pair))
        ).addClass("error"));
        skip = true; // skip this entry.
        break;
      }
      if (!skip) {

        const spanElt = $("<tr/>", {class: "pair"});
        const focusElt = $("<textarea/>", {
          rows: '1',
          type: 'text',
          class: 'data focus'
        }).text(node).on("change", this.markEditMapDirty);
        const joinerElt = $("<span>", {
          class: 'shapeMap-joiner'
        }).append("@").addClass(pair.status);
        joinerElt.append(
          $("<input>", {style: "border: none; width: .2em;", readonly: "readonly"}).val(pair.status === "nonconformant" ? "!" : " ").on("click", function (evt) {
            const status = $(this).parent().hasClass("nonconformant") ? "conformant" : "nonconformant";
            $(this).parent().removeClass("conformant nonconformant");
            $(this).parent().addClass(status);
            $(this).val(status === "nonconformant" ? "!" : "");
            this.markEditMapDirty();
            evt.preventDefault();
          })
        );
        // if (pair.status === "nonconformant") {
        //   joinerElt.append("!");
        // }
        const shapeElt = $("<input/>", {
          type: 'text',
          value: shape,
          class: 'schema inputShape'
        }).on("change", this.markEditMapDirty);
        const addElt = $("<button/>", {
          class: "addPair",
          title: "add a node/shape pair"}).text("+");
        const removeElt = $("<button/>", {
          class: "removePair",
          title: "remove this node/shape pair"}).text("-");
        addElt.on("click", this.addEmptyEditMapPair);
        removeElt.on("click", this.removeEditMapPair);
        spanElt.append([focusElt, joinerElt, shapeElt, addElt, removeElt].map(elt => {
          return $("<td/>").append(elt);
        }));
        if (target) {
          target.after(spanElt);
        } else {
          $("#editMap").append(spanElt);
        }
      }
    });
    if ($("#editMap .removePair").length === 1)
      $("#editMap .removePair").css("visibility", "hidden");
    else
      $("#editMap .removePair").css("visibility", "visible");
    $("#editMap .pair").each(idx => {
      this.addContextMenus("#editMap .pair:nth("+idx+") .focus", this.caches.inputData);
      this.addContextMenus(".pair:nth("+idx+") .inputShape", this.caches.inputSchema);
    });
    return false;
  }

  removeEditMapPair (evt) {
    this.markEditMapDirty();
    if (evt) {
      $(evt.target).parent().parent().remove();
    } else {
      $("#editMap .pair").remove();
    }
    if ($("#editMap .removePair").length === 1)
      $("#editMap .removePair").css("visibility", "hidden");
    return false;
  }

  markEditMapDirty () {
    $("#editMap").attr("data-dirty", true);
  }

  markEditMapClean () {
    $("#editMap").attr("data-dirty", false);
  }

  /* context menus */
  addContextMenus (inputSelector, cache) {
    const _ShapeMapCache = this;
    // !!! terribly stateful; only one context menu at a time!
    const DATA_HANDLE = 'runCallbackThingie'
    let terms = null, nodeLex = null, target, scrollLeft, m, addSpace = "";
    $(inputSelector).on('contextmenu', rightClickHandler)
    $.contextMenu({
      trigger: 'none',
      selector: inputSelector,
      build: ($trigger, e) => {
        // return callback set by the mouseup handler
        return $trigger.data(DATA_HANDLE)();
      }
    });

    async function buildMenuItemsPromise (elt, evt) {
      if (elt.hasClass("data")) {
        nodeLex = elt.val();
        const shapeLex = elt.parent().parent().find(".schema").val()

        // Would like to use SMParser but that means users can't fix bad SMs.
        /*
          const sm = smparser.parse(nodeLex + '@START')[0];
          const m = typeof sm.node === "string" || "@value" in sm.node
          ? null
          : tpToM(sm.node);
        */

        m = nodeLex.match(RegExp("^"+ParseTriplePattern()+"$"));
        if (m) {
          target = evt.target;
          const selStart = target.selectionStart;
          scrollLeft = target.scrollLeft;
          terms = [0, 1, 2].reduce((acc, ord) => {
            if (m[(ord+1)*2-1] !== undefined) {
              const at = acc.start + m[(ord+1)*2-1].length;
              const len = m[(ord+1)*2] ? m[(ord+1)*2].length : 0;
              return {
                start: at + len,
                tz: acc.tz.concat([[at, len]]),
                match: acc.match === null && at + len >= selStart ?
                  ord :
                  acc.match
              };
            } else {
              return acc;
            }
          }, {start: 0, tz: [], match: null });
          function norm (tz) {
            return tz.map(t => {
              return typeof t === "string" && t.startsWith('!')
                ? "- " + t.substr(1) + " -"
                : _ShapeMapCache.caches.inputData.meta.termToLex(t); // !!check
            });
          }
          const store = await _ShapeMapCache.caches.inputData.refresh();
          const queryMapKeywords = ["FOCUS", "_"];
          const getTermsFunctions = [
            () => { return queryMapKeywords.concat(norm(store.getSubjects())); },
            () => { return norm(store.getPredicates()); },
            () => { return queryMapKeywords.concat(norm(store.getObjects())); },
          ];
          if (terms.match === null)
            return false; // prevent contextMenu from whining about an empty list
          return listToCTHash(getTermsFunctions[terms.match]())
        } else if (nodeLex && shapeLex) {
          try {
            var smparser = ShExWebApp.ShapeMapParser.construct(
              _ShapeMapCache.meta.base, _ShapeMapCache.caches.inputSchema.meta, _ShapeMapCache.caches.inputData.meta);
            var sm = smparser.parse(nodeLex + '@' + shapeLex)[0];
            if (sm.node.language === EXTENSION_sparql) {
              let q = sm.node.lexical;
              let obj = {}
              obj[MENU_ITEM_materialize] = { name: MENU_ITEM_materialize };
              return {
                items: ShExWebApp.Util.executeQuery(q, _ShapeMapCache.caches.inputData.endpoint, RdfJs.DataFactory).reduce(
                  (ret, row) => {
                    let name = _ShapeMapCache.caches.inputData.lexifyFirstColumn(row);
                    ret[name] = { name: name };
                    return ret;
                  }, obj
                )
              }
            }
          } catch (e) {
            _ShapeMapCache.resultsWidget.failMessage(e, "query");
            return false
          }
        }
      }
      terms = nodeLex = null;
      try {
        return listToCTHash(await cache.getItems())
      } catch (e) {
        this.resultsWidget.failMessage(e, cache === _ShapeMapCache.caches.inputSchema ? "parsing schema" : "parsing data");
        let items = {};
        const failContent = "no choices found";
        items[failContent] = failContent;
        return items
      }

      // hack to emulate regex parsing product
      /*
        function tpToM (tp) {
        return [nodeLex, '{', lex(tp.subject), " ", lex(tp.predicate), " ", lex(tp.object), "", "}", ""];
        function lex (node) {
        return node === ShExWebApp.ShapeMap.Focus
        ? "FOCUS"
        : node === null
        ? "_"
        : _ShapeMapCache.caches.inputData.meta.termToLex(node);
        }
        }
      */
    }

    function ParseTriplePattern () {
      const uri = "<[^>]*>|[a-zA-Z0-9_-]*:[a-zA-Z0-9_-]*";
      const literal = "((?:" +
            "'(?:[^'\\\\]|\\\\')*'" + "|" +
            "\"(?:[^\"\\\\]|\\\\\")*\"" + "|" +
            "'''(?:(?:'|'')?[^'\\\\]|\\\\')*'''" + "|" +
            "\"\"\"(?:(?:\"|\"\")?[^\"\\\\]|\\\\\")*\"\"\"" +
            ")" +
            "(?:@[a-zA-Z-]+|\\^\\^(?:" + uri + "))?)";
      const uriOrKey = uri + "|FOCUS|_";
      // const termOrKey = uri + "|" + literal + "|FOCUS|_";

      return "(\\s*{\\s*)("+
        uriOrKey+")?(\\s*)("+
        uri+"|a)?(\\s*)("+
        uriOrKey+"|" + literal + ")?(\\s*)(})?(\\s*)";
    };

    function rightClickHandler (e) {
      e.preventDefault();
      const $this = $(this);
      $this.off('contextmenu', rightClickHandler);

      // when the items are ready,
      const p = buildMenuItemsPromise($this, e)
      p.then(items => {

        // store a callback on the trigger
        $this.data(DATA_HANDLE, () => {
          return {
            callback: menuCallback,
            items: items
          };
        });
        const _offset = $this.offset();
        $this.contextMenu({
          x: _offset.left + 10,
          y: _offset.top + 10
        })
        $this.on('contextmenu', rightClickHandler)
      });
    }

    const menuCallback = (key, options) => {
      cache.onLoad();
      if (key === MENU_ITEM_materialize) {
        var toAdd = Object.keys(options.items).filter(k => {
          return k !== MENU_ITEM_materialize;
        });
        $(options.selector).val(toAdd.shift());
        var shape = $(options.selector.replace(/focus/, "inputShape")).val();
        this.addEditMapPairs(toAdd.map(
          node => {
            return {
              node: _ShapeMapCache.caches.inputData.meta.lexToTerm(node),
              shape: _ShapeMapCache.caches.inputSchema.meta.lexToTerm(shape)
            };
          }), null);
      } else if (options.items[key].ignore) { // ignore the event
      } else if (terms) {
        const term = terms.tz[terms.match];
        let val = nodeLex.substr(0, term[0]) +
            key + addSpace +
            nodeLex.substr(term[0] + term[1]);
        if (terms.match === 2 && !m[9])
          val = val + "}";
        else if (term[0] + term[1] === nodeLex.length)
          val = val + " ";
        $(options.selector).val(val);
        // target.scrollLeft = scrollLeft + val.length - nodeLex.length;
        target.scrollLeft = target.scrollWidth;
      } else {
        $(options.selector).val(key);
      }
    }

    function listToCTHash (items) {
      return items.reduce((acc, item) => {
        acc[item] = { name: item }
        return acc
      }, {})
    }
  }

  /** getShapeMap -- zip a node list and a shape list into a ShapeMap
   * use {this.caches.inputData,this.caches.inputSchema}.meta.{prefix,base} to complete IRIs
   * @return array of encountered errors
   */
  async copyEditMapToFixedMap () {
    const getQuads = async (s, p, o) => {
      const get = s === ShExWebApp.ShapeMap.Focus ? "subject" : "object";
      return (await this.caches.inputData.refresh()).getQuads(mine(s), mine(p), mine(o)).map(t => {
        return this.caches.inputData.meta.termToLex(t[get]); // count on unpublished N3.js id API
      });
      function mine (term) {
        return term === ShExWebApp.ShapeMap.Focus || term === ShExWebApp.ShapeMap.Wildcard
          ? null
          : term;
      }
    }

    $("#fixedMap tbody").empty(); // empty out the fixed map.
    const fixedMapTab = $("#shapeMap-tabs").find('[href="#fixedMap-tab"]');
    const restoreText = fixedMapTab.text();
    fixedMapTab.text("resolving Fixed Map").addClass("running");
    $("#fixedMap .pair").remove(); // clear out existing edit map (make optional?)
    const nodeShapePromises = $("#editMap .pair").get().reduce((acc, queryPair) => {
      $(queryPair).find(".error").removeClass("error"); // remove previous error markers
      const node = $(queryPair).find(".focus").val();
      const shape = $(queryPair).find(".inputShape").val();
      const status = $(queryPair).find(".shapeMap-joiner").hasClass("nonconformant") ? "nonconformant" : "conformant";
      if (!node || !shape)
        return acc;
      const smparser = ShExWebApp.ShapeMapParser.construct(
        this.meta.base, this.caches.inputSchema.meta, this.caches.inputData.meta);
      try {
        const sm = smparser.parse(node + '@' + shape)[0];
        const added = typeof sm.node === "string" || "@value" in sm.node
              ? Promise.resolve({nodes: [node], shape: shape, status: status})
              : sm.node.language === EXTENSION_sparql
              ? ShExWebApp.Util.executeQueryPromise(sm.node.lexical, this.caches.inputData.endpoint, RdfJs.DataFactory)
                .then(rows => Promise.resolve({nodes: rows.map(row => this.caches.inputData.lexifyFirstColumn(row)), shape: shape}))
              : getQuads(sm.node.subject, sm.node.predicate, sm.node.object)
              .then(nodes => Promise.resolve({nodes: nodes, shape: shape, status: status}));
        return acc.concat(added);
      } catch (e) {
        // find which cell was broken
        try { smparser.parse(node + '@' + "START"); } catch (e) {
          $(queryPair).find(".focus").addClass("error");
        }
        try { smparser.parse("<>" + '@' + shape); } catch (e) {
          $(queryPair).find(".inputShape").addClass("error");
        }
        this.resultsWidget.failMessage(e, "parsing Edit Map", node + '@' + shape);
        throw new FlowControlError("handled ShapeMap error");
      }
    }, []);

    const pairs = await Promise.all(nodeShapePromises)
    pairs.reduce((acc, pair) => {
      pair.nodes.forEach(node => {
        const nodeTerm = this.caches.inputData.meta.lexToTerm(node + " "); // for langcode lookahead
        let shapeTerm = this.caches.inputSchema.meta.lexToTerm(pair.shape);
        if (shapeTerm === ShExWebApp.Validator.Start)
          shapeTerm = START_SHAPE_INDEX_ENTRY;
        const key = nodeTerm + "|" + shapeTerm;
        if (key in acc)
          return;

        const spanElt = createEntry(node, nodeTerm, pair.shape, shapeTerm, pair.status);
        acc[key] = spanElt; // just needs the key so far.
      });

      return acc;
    }, {})
    // scroll inputs to right
    $("#fixedMap input").each((idx, focusElt) => {
      focusElt.scrollLeft = focusElt.scrollWidth;
    });
    fixedMapTab.text(restoreText).removeClass("running");
    return []; // no errors

    function createEntry (node, nodeTerm, shape, shapeTerm, status) {
      const spanElt = $("<tr/>", {class: "pair"
                                  ,"data-node": nodeTerm
                                  ,"data-shape": shapeTerm
                                 });
      const focusElt = $("<input/>", {
        type: 'text',
        value: node,
        class: 'data focus',
        disabled: "disabled"
      });
      const joinerElt = $("<span>", {
        class: 'shapeMap-joiner'
      }).append("@").addClass(status);
      if (status === "nonconformant") {
        joinerElt.addClass("negated");
        joinerElt.append("!");
      }
      const shapeElt = $("<input/>", {
        type: 'text',
        value: shape,
        class: 'schema inputShape',
        disabled: "disabled"
      });
      const removeElt = $("<button/>", {
        class: "removePair",
        title: "remove this node/shape pair"}).text("-");
      removeElt.on("click", evt => {
        // Remove related result.
        let href, result;
        if ((href = $(evt.target).closest("tr").find("a").attr("href"))
            && (result = document.getElementById(href.substr(1))))
          $(result).remove();
        // Remove FixedMap entry.
        $(evt.target).closest("tr").remove();
      });
      spanElt.append([focusElt, joinerElt, shapeElt, removeElt, $("<a/>")].map(elt => {
        return $("<td/>").append(elt);
      }));

      $("#fixedMap").append(spanElt);
      return spanElt;
    }
  }
}

class ShExCParser {
  constructor () {
    this.shexParserOptions = {index: true, duplicateShape: "abort"};
    this.shexParser = ShExWebApp.Parser.construct(DefaultBase, null, this.shexParserOptions);
  }
  parseString (text, meta, base) {
    this.shexParserOptions.duplicateShape = $("#duplicateShape").val();
    this.shexParser._setBase(base);
    const ret = this.shexParser.parse(text);
    // ret = ShExWebApp.Util.canonicalize(ret, DefaultBase);
    meta.base = ret._base; // base set above.
    meta.prefixes = ret._prefixes || {}; // @@ revisit after separating shexj from meta and indexes
    return ret;
  }
}

class TurtleParser {
  constructor () {
    this.blankNodeId;
    // Re-use BNode IDs for good(-enough) user experience. Recipe from:
    // https://github.com/rdfjs/N3.js/blob/520054a9fb45ef48b5b58851449942493c57dace/test/N3Parser-test.js#L6-L11
    RdfJs.Parser.prototype._blankNode = name => RdfJs.DataFactory.blankNode(name || `b${this.blankNodeId++}`);
  }
  parseString (text, meta, base) {
    const ret = new RdfJs.Store();
    this.blankNodeId = 0;
    RdfJs.Parser._resetBlankNodePrefix();
    const parser = new RdfJs.Parser({
      baseIRI: base,
      format: "text/turtle",
      blankNodePrefix: ""
    });
    const quads = parser.parse(text);
    if (quads !== undefined)
      ret.addQuads(quads);
    meta.base = parser._base;
    meta.prefixes = parser._prefixes;
    return ret;
  }
  termToLd (lex, resolver) { // returns ShExJ objectValue
    const nz = new RdfJs.Lexer().tokenize(lex + " ");
    switch (nz[0].type) {
    case "IRI": return resolver._resolveAbsoluteIRI(nz[0]);
    case "prefixed": return expand(nz[0]);
    case "blank": return "_:" + nz[0].value;
    case "literal": {
      const ret = { value: nz[0].value };
      switch (nz[1].type) {
      case "typeIRI":  ret.type = resolver._resolveAbsoluteIRI(nz[1]); break;
      case "type":     ret.type = expand(nz[1]); break;
      case "langcode": ret.language = nz[1].value; break;
      default: throw Error(`unknow N3Lexer literal term type ${nz[1].type}`);
      }
      return ret;
    }
    default: throw Error(`unknow N3Lexer term type ${nz[0].type}`);
    }

    function expand (token) {
      if (!(token.prefix in resolver.meta.prefixes))
        throw Error(`unknown prefix ${token.prefix} in ${lex}`);
      return resolver.meta.prefixes[token.prefix] + token.value;
    }
  }
}

class DirectShExValidator {
  constructor (loaded, inputData, renderer) {
    this.validator = new ShExWebApp.Validator(
      loaded.schema,
      inputData,
      {
        results: "api",
        regexModule: ShExWebApp[$("#regexpEngine").val()],
        ignoreClosed: $("#ignoreClosed").is(":checked"),
      });
    $(".extensionControl:checked").each(() => {
      $(this).data("code").register(validator, ShExWebApp);
    });
    this.renderer = renderer;
  }
  async invoke (fixedMap, validationTracker, time, _done, _currentAction) {
    const ret = this.validator.validateShapeMap(fixedMap, validationTracker);
    time = new Date() - time;
    $("#shapeMap-tabs").attr("title", "last validation: " + time + " ms");
    $("#results .status").text("rendering results...").show();

    await Promise.all(ret.map(entry => this.renderer.entry(entry)));
    this.renderer.finish();
    return {validationResults: ret}; // for tester or whoever is awaiting this promise
  }
}

// Root error class to signal to ResultsWidget that is an expected error.
class FlowControlError extends Error {  }

// Control results area content.
let LastFailTime = 0;
class ResultsWidget {
  constructor () {
    this.resultsElt = document.querySelector("#results div");
    this.resultsSel = $("#results div");
  }
  replace (text) {
    return this.resultsSel.text(text);
  }
  append (text) {
    return this.resultsSel.append(text);
  }
  clear () {
    this.resultsSel.removeClass("passes fails error");
    $("#results .status").text("").hide();
    $("#shapeMap-tabs").removeAttr("title");
    return this.resultsSel.text("");
  }
  start () {
    this.resultsSel.removeClass("passes fails error");
    $("#results").addClass("running");
  }
  finish () {
    $("#results").removeClass("running");
    const height = this.resultsSel.height();
    this.resultsSel.height(1);
    this.resultsSel.animate({height:height}, 100);
  }
  text () {
    return $(this.resultsElt).text();
  }

  failMessage (e, action, text) {
    if (e instanceof FlowControlError)
      return;
    console.error(e);
    $("#results .status").empty().text("Errors encountered:").show()
    const div = $("<div/>").addClass("error");
    div.append($("<h3/>").text("error " + action + ":\n"));
    div.append($("<pre/>").text(e.message));
    if (text)
      div.append($("<pre/>").text(text));
    this.append(div);
    LastFailTime = new Date().getTime();
  }
}

class ShExResultsRenderer {
  constructor (resultsWidget, caches) {
    this.resultsWidget = resultsWidget;
    this.caches = caches;
  }

  async entry (entry) {
    const fails = entry.status === "nonconformant";

    // locate FixedMap entry
    const shapeString = entry.shape === ShExWebApp.Validator.Start ? START_SHAPE_INDEX_ENTRY : entry.shape;
    const fixedMapEntry = $("#fixedMap .pair"+
                          "[data-node='"+entry.node+"']"+
                          "[data-shape='"+shapeString+"']");

    const klass = (fails ^ fixedMapEntry.find(".shapeMap-joiner").hasClass("nonconformant")) ? "fails" : "passes";
    const resultStr = fails ? "✗" : "✓";
    let elt = null;

    if (!fails) {
      if ($("#success").val() === "query" || $("#success").val() === "remainder") {
        const proofStore = new RdfJs.Store();
        ShExWebApp.Util.getProofGraph(entry.appinfo, proofStore, RdfJs.DataFactory);
        entry.graph = proofStore.getQuads();
      }
      if ($("#success").val() === "remainder") {
        const remainder = new RdfJs.Store();
        remainder.addQuads((await this.caches.inputData.refresh()).getQuads());
        entry.graph.forEach(q => remainder.removeQuad(q));
        entry.graph = remainder.getQuads();
      }
    }

    if (entry.graph) {
      const wr = new RdfJs.Writer(this.caches.inputData.meta);
      wr.addQuads(entry.graph);
      wr.end((error, results) => {
        if (error)
          throw error;
        entry.turtle = ""
          + "# node: " + entry.node + "\n"
          + "# shape: " + entry.shape + "\n"
          + results.trim();
        elt = $("<pre/>").text(entry.turtle).addClass(klass);
      });
      delete entry.graph;
    } else {
      let renderMe = entry
      switch ($("#interface").val()) {
      case "human":
        elt = $("<div class='human'/>").append(
          $("<span/>").text(resultStr),
          $("<span/>").text(
            `${ldToTurtle(entry.node, this.caches.inputData.meta.termToLex)}@${fails ? "!" : ""}${this.caches.inputSchema.meta.termToLex(entry.shape)}`
          )).addClass(klass);
        if (fails)
          elt.append($("<pre>").text(ShExWebApp.Util.errsToSimple(entry.appinfo).join("\n")));
        break;

      case "minimal":
        if (fails)
          entry.reason = ShExWebApp.Util.errsToSimple(entry.appinfo).join("\n");
        renderMe = Object.keys(entry).reduce((acc, key) => {
          if (key !== "appinfo")
            acc[key] = entry[key];
          return acc
        }, {});
        // falling through to default covers the appinfo case
      default:
        elt = $("<pre/>").text(JSON.stringify(renderMe, null, "  ")).addClass(klass);
      }
    }
    this.resultsWidget.append(elt);

    // update the FixedMap
    fixedMapEntry.addClass(klass).find("a").text(resultStr);
    const nodeLex = fixedMapEntry.find("input.focus").val();
    const shapeLex = fixedMapEntry.find("input.inputShape").val();
    const anchor = encodeURIComponent(nodeLex) + "@" + encodeURIComponent(shapeLex);
    elt.attr("id", anchor);
    fixedMapEntry.find("a").attr("href", "#" + anchor);
    fixedMapEntry.attr("title", entry.elapsed + " ms")
  }

  finish (done) {
    if ("slurpWriter" in this.caches.inputData) {
      this.caches.inputData.slurpWriter.end((err, chunk) => {
        $("#inputData textarea").val((i, text) => {
          return text + "\n\n# Visited data:\n" + chunk; // cheaper than set() but a pain to maintain...
        });
        $("#slurpSpan").remove();
        // delete this.caches.intputData.endpoint;
        this.caches.inputData.refresh();
        delete this.caches.inputData.slurpWriter;
      });
    }

    $("#results .status").text("rendering results...").show();
    // Add commas to JSON results.
    if ($("#interface").val() !== "human")
      $("#results div *").each((idx, elt) => {
        if (idx === 0)
          $(elt).prepend("[");
        $(elt).append(idx === $("#results div *").length - 1 ? "]" : ",");
      });
    $("#results .status").hide();
    // for debugging values and schema formats:
    // try {
    //   const x = ShExWebApp.Util.valToValues(ret);
    //   // const x = ShExWebApp.Util.ShExJtoAS(valuesToSchema(valToValues(ret)));
    //   res = this.resultsWidget.replace(JSON.stringify(x, null, "  "));
    //   const y = ShExWebApp.Util.valuesToSchema(x);
    //   res = this.resultsWidget.append(JSON.stringify(y, null, "  "));
    // } catch (e) {
    //   console.dir(e);
    // }
    this.resultsWidget.finish();
  }

  failure (e, action, text) {
    this.resultsWidget.failMessage(e, action, text);
  }
}

const ShExLoader = ShExWebApp.Loader({
  fetch: window.fetch.bind(window), rdfjs: RdfJs, jsonld: null
})
class ShExBaseApp {
  constructor (base) {
    this.base = base;
    this.resultsWidget = new ResultsWidget();

    // make parser/serializers available to extending classes
    this.shexcParser = new ShExCParser();
    this.turtleParser = new TurtleParser();
    this.queryTrackerController = { queryTracker: null };

    const inputSchema = new SchemaCache($("#inputSchema textarea.schema"), this.onDataLoad.bind(this), this.shexcParser, this.turtleParser);
    const inputData = new TurtleCache($("#inputData textarea"), this.onDataLoad.bind(this), this.turtleParser, this.queryTrackerController);
    const extension = new ExtensionCache($("#extensionDrop"), this.resultsWidget);
    const shapeMap = new ShapeMapCache($("#textMap"), {inputSchema, inputData}, this.turtleParser, this.resultsWidget); // @@ rename to #shapeMap

    this.Caches = { inputSchema, inputData, extension, shapeMap };
    this.Getables = [
      {queryStringParm: "schema",       location: this.Caches.inputSchema.selection, cache: this.Caches.inputSchema},
      {queryStringParm: "data",         location: this.Caches.inputData.selection,   cache: this.Caches.inputData  },
      {queryStringParm: "extension",    location: this.Caches.extension.selection,   cache: this.Caches.extension  },
      {queryStringParm: "shape-map",    location: $("#textMap"),                     cache: this.Caches.shapeMap   },
    ];
    this.QueryParams = this.Getables.concat([
      {queryStringParm: "interface",    location: $("#interface"),       deflt: "human"     },
      {queryStringParm: "success",      location: $("#success"),         deflt: "proof"     },
      {queryStringParm: "regexpEngine", location: $("#regexpEngine"),    deflt: "eval-threaded-nerr" },
    ]);
    this.keyDownHandlers = [
      this.validateKeyDown.bind(this),
      this.navigateManifestKeyDown.bind(this),
    ];

    ShExWebApp.ShapeMap.Start = ShExWebApp.Validator.Start;
  }
  async start () {
    SharedForTests = {Caches: this.Caches, /*DefaultBase*/} // an object to share state with a test harness
    this.prepareControls();
    const dndPromise = this.prepareDragAndDrop(); // async 'cause it calls Cache.X.set("")
    const loads = this.loadSearchParameters();
    const ready = Promise.all([ dndPromise, loads ]);
    if ('_testCallback' in window) {
      SharedForTests.promise = ready.then(ab => ({drop: ab[0], loads: ab[1]}));
      window._testCallback(SharedForTests);
    }
    ready.then(resolves => {
      if (!('_testCallback' in window))
        console.log('search parameters:', resolves[1]);
      // Update UI to say we're done loading everything?
    }, e => {
      console.error(e);
      // Drop catch on the floor presuming thrower updated the UI.
    });
  }

  onDataLoad () {
    this.Caches.shapeMap.markEditMapDirty();
  }

  // abstract getValidator (_validator) { } // overriden for ShExMap

  /**
   * resolve node and shape against input data and schema base and prefixes
   */
  fixValidationShapeMapEntry (node, shape) {
    return {
      node: this.Caches.inputData.meta.lexToTerm(node),
      shape: this.Caches.inputSchema.meta.lexToTerm(shape) // resolve with this.Caches.outputSchema
    }
  }

  /* UI setup */
  /**
   * set up UI buttons handlers
   */
  prepareControls () {
    $("#menu-button").on("click", this.toggleControls.bind(this));
    $("#interface").on("change", this.setInterface.bind(this));
    $("#success").on("change", this.setInterface.bind(this));
    $("#regexpEngine").on("change", this.toggleControls.bind(this));
    $("#validate").on("click", this.disableResultsAndValidate.bind(this));
    $("#download-results-button").on("click", this.downloadResults.bind(this));

    $("#loadForm").dialog({
      autoOpen: false,
      modal: true,
      buttons: {
        "GET": (evt, ui) => {
          this.resultsWidget.clear();
          const target = this.Getables.find(g => g.queryStringParm === $("#loadForm span.whatToLoad").text());
          const url = $("#loadInput").val();
          const tips = $(".validateTips");
          function updateTips (t) {
            tips
              .text( t )
              .addClass( "ui-state-highlight" );
            setTimeout(() => {
              tips.removeClass( "ui-state-highlight", 1500 );
            }, 500 );
          }
          if (url.length < 5) {
            $("#loadInput").addClass("ui-state-error");
            updateTips("URL \"" + url + "\" is way too short.");
            return;
          }
          tips.removeClass("ui-state-highlight").text();
          SharedForTests.promise = target.cache.asyncGet(url)
            // .then(ret => {
            //   this.toggleControls();
            //   return ret;
            // })
            .catch((e) => {
              updateTips(e.message);
            });
        },
        "Cancel": () => {
          $("#loadInput").removeClass("ui-state-error");
          $("#loadForm").dialog("close");
          this.toggleControls();
        }
      },
      close: () => {
        $("#loadInput").removeClass("ui-state-error");
        $("#loadForm").dialog("close");
        this.toggleControls();
      }
    });
    this.Getables.forEach(target => {
      const type = target.queryStringParm
      $("#load-"+type+"-button").click(evt => {
        const prefillURL = target.url ? target.url :
              target.cache.meta.base && target.cache.meta.base !== DefaultBase ? target.cache.meta.base :
              "";
        $("#loadInput").val(prefillURL);
        $("#loadForm").attr("class", type).find("span.whatToLoad").text(type);
        $("#loadForm").dialog("open");
      });
    });

    $("#about").dialog({
      autoOpen: false,
      modal: true,
      width: "50%",
      buttons: {
        "Dismiss": dismissModal
      },
      close: dismissModal
    });

    $("#about-button").click(evt => {
      $("#about").dialog("open");
    });

    $("#shapeMap-tabs").tabs({
      activate: async (event, ui) => {
        if (ui.oldPanel.get(0) === $("#editMap-tab").get(0))
          await this.Caches.shapeMap.copyEditMapToTextMap();
        else if (ui.oldPanel.get(0) === $("#textMap").get(0))
          await this.Caches.shapeMap.copyTextMapToEditMap()
      }
    });
    $("#textMap").on("change", evt => {
      this.resultsWidget.clear();
      SharedForTests.promise = this.Caches.shapeMap.copyTextMapToEditMap();
    });
    this.Caches.inputData.selection.on("change", this.dataInputHandler.bind(this)); // input + paste?
    // $("#copyEditMapToFixedMap").on("click", copyEditMapToFixedMap); // may add this button to tutorial

    function dismissModal (evt) {
      // $.unblockUI();
      $("#about").dialog("close");
      this.toggleControls();
      return true;
    }

    // Prepare file uploads
    $("input.inputfile").each((idx, elt) => {
      $(elt).on("change", (evt) => {
        const reader = new FileReader();

        reader.onload = (evt) => {
          if(evt.target.readyState != 2) return;
          if(evt.target.error) {
            alert("Error while reading file");
            return;
          }
          $($(elt).attr("data-target")).val(evt.target.result);
        };

        reader.readAsText(evt.target.files[0]);
      });
    });
  }

  /**
   * Load URL search parameters
   */
  async loadSearchParameters () {
    // don't overwrite if we arrived here from going back and forth in history
    if (this.Caches.inputSchema.selection.val() !== "" || this.Caches.inputData.selection.val() !== "")
      return Promise.resolve();

    const iface = this.parseQueryString(location.search);

    this.toggleControlsArrow("down");
    $(".manifest li").text("no manifest schemas loaded");
    if ("examples" in iface) { // deprecated ?examples= interface
      iface.manifestURL = iface.examples;
      delete iface.examples;
    }
    if (!("manifest" in iface) && !("manifestURL" in iface)) {
      iface.manifestURL = ["../examples/manifest.json"];
    }

    // Load all known query parameters. Save load results into array like:
    /* [ [ "data", { "skipped": "skipped" } ],
       [ "manifest", { "fromUrl": { "url": "http://...", "data": "..." } } ], ] */
    const loadedAsArray = await Promise.all(this.QueryParams.map(async input => {
      const label = input.queryStringParm;
      const parm = label;
      if (parm + "URL" in iface) {
        const url = iface[parm + "URL"][0];
        if (url.length > 0) { // manifest= loads no manifest
          // !!! set anyways in asyncGet?
          input.cache.url = url; // all fooURL query parms are caches.
          try {
            const got = await input.cache.asyncGet(url);
            return [label, {fromUrl: got}]
          } catch(e) {
            if ("fail" in input) {
              input.fail(e);
            } else {
              input.location.val(e.message);
            }
            this.resultsWidget.append($("<pre/>").text(e).addClass("error"));
            return [label, { loadFailure: e instanceof Error ? e : Error(e) }];
          };
        }
      } else if (parm in iface) {
        const prepend = input.location.prop("tagName") === "TEXTAREA" ?
              input.location.val() :
              "";
        const value = prepend + iface[parm].join("");
        const origValue = input.location.val();

        try {
          if ("cache" in input) {
            await input.cache.set(value, location.href);
          } else {
            input.location.val(prepend + value);
            if (input.location.val() === null)
              throw Error(`Unable to set value to ${prepend + value}`)
          }
          return [label, { literal: value }]
        } catch (e) {
          input.location.val(origValue);
          if ("fail" in input) {
            input.fail(e);
          }
          this.resultsWidget.append($("<pre/>").text(
            "error setting " + label + ":\n" + e + "\n" + value
          ).addClass("error"));
          return [label, { failure: e }]
        }
      } else if ("deflt" in input) {
        input.location.val(input.deflt);
        return [label, { deflt: "deflt" }]; // flag that it was a default
      }
      return [label, { skipped: "skipped" }]
    }));
    // convert loaded array into Object:
    /* { "data": { "skipped": "skipped" },
       "manifest": { "fromUrl": { "url": "http://...", "data": "..." } }, } */
    const loaded = loadedAsArray.reduce((acc, fromArray) => {
      acc[fromArray[0]] = fromArray[1]
      return acc
    }, {});

    // Parse the shape-map using the prefixes and base.
    const shapeMapErrors = $("#textMap").val().trim().length > 0
          ? this.Caches.shapeMap.copyTextMapToEditMap()
          : this.Caches.shapeMap.makeFreshEditMap();

    this.customizeInterface();
    $("body").keydown(e => { // keydown because we need to preventDefault
      const code = e.keyCode || e.charCode; // standards anyone?
      return !this.keyDownHandlers.find(h => h(e, code)); // if we find a handler, stop propagation
    });
    this.Caches.shapeMap.addContextMenus("#focus0", this.Caches.inputData);
    this.Caches.shapeMap.addContextMenus("#inputShape0", this.Caches.inputSchema);
    if ("schemaURL" in iface ||
        // some schema is non-empty
        ("schema" in iface &&
         iface.schema.reduce((r, elt) => { return r+elt.length; }, 0))
        && shapeMapErrors.length === 0) {
      return callValidator();
    }

    if ("output-map" in iface)
      parseShapeMap("output-map", (node, shape) => {
        // only works for one n/s pair
        $("#createNode").val(node);
        $("#outputShape").val(shape);
      });
    this.Caches.shapeMap.addContextMenus("#outputShape", this.Caches.outputSchema);
    return loaded;
  }

  /**
   * parse query string into map of arrays
   * location.search: e.g. "?schema=asdf&data=qwer&shape-map=ab%5Ecd%5E%5E_ef%5Egh"
   */
  parseQueryString (query) {
    if (query[0]==='?') query=query.substr(1); // optional leading '?'
    const map   = {};
    query.replace(/([^&,=]+)=?([^&,]*)(?:[&,]+|$)/g, (match, key, value) => {
      key=decodeURIComponent(key);value=decodeURIComponent(value);
      (map[key] = map[key] || []).push(value);
    });
    return map;
  };

  /* Executions */

  // Validation UI
  disableResultsAndValidate (evt) {
    if (new Date().getTime() - LastFailTime < 100) {
      this.resultsWidget.append(
        $("<div/>").addClass("warning").append(
          $("<h2/>").text("see shape map errors above"),
          $("<button/>").text("validate (ctl-enter)").on("click", this.disableResultsAndValidate.bind(this)),
          " again to continue."
        )
      );
      return; // return if < 100ms since last error.
    }
    this.resultsWidget.clear();
    this.resultsWidget.start();
    SharedForTests.promise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        const errors = await this.Caches.shapeMap.copyEditMapToTextMap(); // will update if #editMap is dirty
        if (errors.length === 0)
          resolve(await this.callValidator());
      }, 0);
    })
  }

  async callValidator (done) {
    $("#fixedMap .pair").removeClass("passes fails");
    $("#results .status").hide();
    let currentAction = "parsing input schema";
    try {
      await this.Caches.inputSchema.refresh(); // @@ throw away parser stack?
      $("#schemaDialect").text(this.Caches.inputSchema.language);
      if (hasFocusNode()) {
        currentAction = "parsing input data";
        $("#results .status").text("parsing data...").show();
        let inputData = await this.Caches.inputData.refresh(); // need prefixes for ShapeMap
        // $("#shapeMap-tabs").tabs("option", "active", 2); // select fixedMap
        currentAction = "parsing shape map";
        const fixedMap = $("#fixedMap tr").map((idx, tr) =>
          this.fixValidationShapeMapEntry($(tr).find("input.focus").val(), $(tr).find("input.inputShape").val())
        ).get();
        if ($("#slurp").is(":checked")) {
          // .set() sets inputData's dirty bit.
          this.Caches.inputData.set("# Endpoint: " + this.Caches.inputData.endpoint + "\n\n\n", this.Caches.inputData.endpoint);
          this.Caches.inputData.slurpWriter = new RdfJs.Writer({ prefixes: this.Caches.inputSchema.meta.prefixes });
          inputData = ShExWebApp.SparqlDb(this.Caches.inputData.endpoint, this.makeQueryTracker());
        }

        currentAction = "creating validator";
        $("#results .status").text("creating validator...").show();
        try {
          // shex-node loads IMPORTs and tests the schema for structural faults.
          const alreadLoaded = {
            schema: await this.Caches.inputSchema.refresh(),
            url: this.Caches.inputSchema.url || DefaultBase
          };
          const loaded = await ShExLoader.load({shexc: [alreadLoaded]}, null, {
            collisionPolicy: (type, left, right) => {
              const lStr = JSON.stringify(left);
              const rStr = JSON.stringify(right);
              if (lStr === rStr)
                return false; // keep left/old assignment
              throw new Error(`Conflicing definitions: ${lStr} !== ${rStr}`);
            },
            skipCycleCheck: $("#skipCycleCheck").is(":checked"),
          });
          let time;
          const validator = this.getValidator(loaded, alreadLoaded.url, inputData, this.makeRenderer());

          // Some DBs need to be able to inspect the schema to calculate the neighborhood.
          if ("setSchema" in inputData)
            inputData.setSchema(loaded.schema);

          currentAction = "validating";
          $("#results .status").text("validating...").show();
          time = new Date();
          const validationTracker = LOG_PROGRESS ? this.makeConsoleTracker() : undefined; // undefined to trigger default parameter assignment

          // invoke can throw an asynchronous error. Using .catch instead of await so callValidator is usefully async.
          return validator.invoke(fixedMap, validationTracker, time, done, currentAction)
            .catch(e => this.reportValidationError(e, currentAction));
        } catch (e) {
          return this.reportValidationError(e, currentAction);
        }
      } else {
        const outputLanguage = this.Caches.inputSchema.language === "ShExJ" ? "ShExC" : "ShExJ";
        $("#results .status").
          text("parsed "+this.Caches.inputSchema.language+" schema, generated "+outputLanguage+" ").
          append($("<button>(copy to input)</button>").
                 css("border-radius", ".5em").
                 on("click", async () => {
                   await this.Caches.inputSchema.set($("#results div").text(), DefaultBase);
                 })).
          append(":").
          show();
        let parsedSchema;
        if (this.Caches.inputSchema.language === "ShExJ") {
          const opts = {
            simplifyParentheses: false,
            base: this.Caches.inputSchema.meta.base,
            prefixes: this.Caches.inputSchema.meta.prefixes
          }
          new ShExWebApp.Writer(opts).writeSchema(this.Caches.inputSchema.parsed, (error, text) => {
            if (error) {
              $("#results .status").text("unwritable ShExJ schema:\n" + error).show();
              // res.addClass("error");
            } else {
              this.resultsWidget.append($("<pre/>").text(text).addClass("passes"));
            }
          });
        } else {
          const pre = $("<pre/>");
          pre.text(JSON.stringify(ShExWebApp.Util.AStoShExJ(ShExWebApp.Util.canonicalize(this.Caches.inputSchema.parsed)), null, "  ")).addClass("passes");
          this.resultsWidget.append(pre);
        }
        this.resultsWidget.finish();
        return { transformation: {
          from: this.Caches.inputSchema.language,
          to: outputLanguage
        } }
      }
    } catch (e) {
      this.resultsWidget.failMessage(e, currentAction);
      console.error(e); // dump details to console.
      return { inputError: e };
    }

    function hasFocusNode () {
      return $(".focus").map((idx, elt) => {
        return $(elt).val();
      }).get().some(str => {
        return str.length > 0;
      });
    }
  }

  makeQueryTracker () {
    this.queryTrackerController.queryTracker = $("#slurp").is(":checked")
    ? {
      start: (isOut, term, shapeLabel) => {
        const node = this.Caches.inputData.meta.termToLex(WorkerMarshalling.jsonTermToRdfjsTerm(term, RdfJs.DataFactory));
        const shape = this.Caches.inputSchema.meta.termToLex(shapeLabel);
        const slurpStatus = (isOut ? "←" : "→") + " " + node + "@" + shape;
        noScrollAppend($("#inputData textarea"), "# " + slurpStatus);
      },
      end: (triples, time) => {
        noScrollAppend($("#inputData textarea"), " " + triples.length + " triples (" + time + " μs)\n");
        this.Caches.inputData.slurpWriter.addQuads(triples.map(
          t => WorkerMarshalling.jsonTripleToRdfjsTriple(t, RdfJs.DataFactory)
          // t => ShExWebApp.ShExTerm.externalTriple(t, RdfJs.DataFactory)
        ));
      }
    }
    : null;

    /** attempt to disable scrolling if not at bottom of target.
     * tried both selectionState and scrollTop.
     */
    function noScrollAppend (target, toAdd) {
      var e = target.get(0);
      // var oldLen = target.val().length
      // var oldSel = target.prop("selectionStart");
      // var oldScrollTop = e.scrollTop;
      // var oldScrollHeight = e.scrollHeight;
      target.val((i, text) => {
        return text + toAdd;
      });
      // console.log(oldScrollTop, oldScrollHeight);
      // if (oldScrollTop === oldScrollHeight) {
      e.scrollTop = e.scrollHeight;
      //   target.prop("selectionStart", target.val().length);
      // } else {
      //   target.prop("selectionStart", oldScrollTop);
      // }
      // if (oldSel === oldLen) {
      //   e.scrollTop = e.scrollHeight;
      //   target.prop("selectionStart", target.val().length);
      // } else {
      //   target.prop("selectionStart", oldSel);
      // }
    }
  }

  makeRenderer () {
    return new ShExResultsRenderer(this.resultsWidget, this.Caches);
  }

  reportValidationError (validationError, currentAction) {
    if (validationError instanceof FlowControlError)
      return { validationError };
    $("#results .status").text("validation errors:").show();
    this.resultsWidget.failMessage(validationError, currentAction);
    return { validationError };
  }

  makeConsoleTracker () {
    function padding (depth) { return (new Array(depth + 1)).join("  "); } // AKA "  ".repeat(depth)
    function sm (node, shape) {
      return `${this.Caches.inputData.meta.termToLex(node)}@${this.Caches.inputSchema.meta.termToLex(shape)}`;
    }
    const logger = {
      recurse: x => { console.log(`${padding(logger.depth)}↻ ${sm(x.node, x.shape)}`); return x; },
      known: x => { console.log(`${padding(logger.depth)}↵ ${sm(x.node, x.shape)}`); return x; },
      enter: (point, label) => { console.log(`${padding(logger.depth)}→ ${sm(point, label)}`); ++logger.depth; },
      exit: (point, label, ret) => { --logger.depth; console.log(`${padding(logger.depth)}← ${sm(point, label)}`); },
      depth: 0
    };
    return logger;
  }

  /* Mouse events */

  async dataInputHandler (evt) {
    const active = $('#shapeMap-tabs ul li.ui-tabs-active a').attr('href');
    if (active === "#editMap-tab")
      return await this.Caches.shapeMap.copyEditMapToTextMap();
    else // if (active === "#textMap")
      return await this.Caches.shapeMap.copyTextMapToEditMap();
  }

  /* Keyboard events */
  validateKeyDown (e, code) {
    if (!e.ctrlKey || (code !== 10 && code !== 13)) // ctrl-enter
      return false;
    // const at = $(":focus");
    this.dataInputHandler().then(smErrors => {
      if (smErrors.length === 0)
        $("#validate")/*.focus()*/.click();
    })
    return true;
  }

  navigateManifestKeyDown (e, code) {
    if (!e.ctrlKey || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.code) === -1) // ctrl-arrow
      return false;
    let newLi = null;
    if ($(':focus').length !== 1) {
      newLi = $('[data-navColumn="0"] li').first();
    } else if ($('ul[data-navColumn] button:focus').length === 1) {
      newLi = navFrom(e.code, $(':focus').parent());
    }
    if (newLi)
      $(newLi).find('button').focus();
    return true;

    function navFrom (keyCode, fromLi) {
      const fromColumn = fromLi.parent();
      const fromLiNo = fromLi.index();
      const lis = fromColumn.children();
      const columns = $('ul[data-navColumn]:visible').get().sort(
        (l, r) =>
        parseInt($(l).attr('data-navColumn')) - parseInt($(r).attr('data-navColumn'))
      );
      const fromColumnNo = columns.indexOf(fromColumn.get(0)); // index in visible columns

      switch (keyCode) {
      case 'ArrowLeft':
        if (fromColumnNo > 0) {
          const newColumn = $(columns[fromColumnNo - 1]);
          return firstOf(newColumn, '.selected', 'li:first-child');
        }
        break;
      case 'ArrowRight':
        if (fromColumnNo < columns.length - 1) {
          const newColumn = $(columns[fromColumnNo + 1]);
          return firstOf(newColumn, '.selected', 'li:first-child');
        }
        break;
      case 'ArrowUp':
        if (fromLiNo > 0) {
          return lis[fromLiNo - 1];
        }
        break;
      case 'ArrowDown':
        if (fromLiNo < lis.length - 1) {
          return lis[fromLiNo + 1];
        }
        break;
      default: throw Error(e.code);
      }
    }

    function firstOf (node, ...selectors) { // return first successful selector. gotta be an idiom for this in jquery
      for (let i = 0; i < selectors.length; ++i) {
        const ret = node.find(selectors[i]);
        if (ret.length > 0) {
          return ret.get(0);
        }
      }
    }
  }

  /* controls menu */
  async toggleControls (evt) {
    // don't use `return false` 'cause the browser doesn't wait around for a promise before looking at return false to decide the event is handled
    if (evt) evt.preventDefault();

    const revealing = evt && $("#controls").css("display") !== "flex";
    $("#controls").css("display", revealing ? "flex" : "none");
    this.toggleControlsArrow(revealing ? "up" : "down");
    if (revealing) {
      let target = evt.target;
      while (target.tagName !== "BUTTON")
        target = target.parentElement;
      if ($("#menuForm").css("position") === "absolute") {
        $("#controls").
          css("top", 0).
          css("left", $("#menu-button").css("margin-left"));
      } else {
        const bottonBBox = target.getBoundingClientRect();
        const controlsBBox = $("#menuForm").get(0).getBoundingClientRect();
        const left = bottonBBox.right - bottonBBox.width; // - controlsBBox.width;
        $("#controls").css("top", bottonBBox.bottom).css("left", left);
      }
      $("#permalink a").removeAttr("href"); // can't click until ready
      const permalink = await this.getPermalink();
      $("#permalink a").attr("href", permalink);
    }
  }

  toggleControlsArrow (which) {
    // jQuery can't find() a prefixed attribute (xlink:href); fall back to DOM:
    if (document.getElementById("menu-button") === null)
      return;
    const down = $(document.getElementById("menu-button").
                   querySelectorAll('use[*|href="#down-arrow"]'));
    const up = $(document.getElementById("menu-button").
                 querySelectorAll('use[*|href="#up-arrow"]'));

    switch (which) {
    case "down":
      down.show();
      up.hide();
      break;
    case "up":
      down.hide();
      up.show();
      break;
    default:
      throw Error("toggleControlsArrow expected [up|down], got \"" + which + "\"");
    }
  }

  /**
   * update location with a current values of some inputs
   */
  async getPermalink () {
    let parms = [];
    await this.Caches.shapeMap.copyEditMapToTextMap();
    parms = parms.concat(this.QueryParams.reduce((acc, input) => {
      let parm = input.queryStringParm;
      let val = input.location.val();
      if (input.cache && input.cache.url &&
          // Specifically avoid loading from DefaultBase?schema=blah
          // because that will load the HTML page.
          !input.cache.url.startsWith(DefaultBase)) {
        parm += "URL";
        val = input.cache.url;
      }
      return val.length > 0 ?
        acc.concat(parm + "=" + encodeURIComponent(val)) :
        acc;
    }, []));
    const s = parms.join("&");
    return location.origin + location.pathname + "?" + s;
  }

  downloadResults (evt) {
    const typed = [
      { type: "text/plain", name: "results.txt" },
      { type: "application/json", name: "results.json" }
    ][$("#interface").val() === "appinfo" ? 1 : 0];
    const blob = new Blob([this.resultsWidget.text()], {type: typed.type});
    $("#download-results-button")
      .attr("href", window.URL.createObjectURL(blob))
      .attr("download", typed.name);
    this.toggleControls();
    console.log(this.resultsWidget.text());
  }

  setInterface (evt) {
    this.toggleControls();
    this.customizeInterface();
  }

  customizeInterface () {
  if ($("#interface").val() === "minimal") {
    $("#inputSchema .status").html("schema (<span id=\"schemaDialect\">ShEx</span>)").show();
    $("#inputData .status").html("data (<span id=\"dataDialect\">Turtle</span>)").show();
    $("#actions").parent().children().not("#actions").hide();
    $("#title img, #title h1").hide();
    $("#menuForm").css("position", "absolute").css(
      "left",
      $("#inputSchema .status").get(0).getBoundingClientRect().width -
        $("#menuForm").get(0).getBoundingClientRect().width
    );
    $("#controls").css("position", "relative");
  } else {
    $("#inputSchema .status").html("schema (<span id=\"schemaDialect\">ShEx</span>)").hide();
    $("#inputData .status").html("data (<span id=\"dataDialect\">Turtle</span>)").hide();
    $("#actions").parent().children().not("#actions").show();
    $("#title img, #title h1").show();
    $("#menuForm").removeAttr("style");
    $("#controls").css("position", "absolute");
  }
}


  /* drag and drop */
w  /**
   * Prepare drag and drop into text areas
   */
  async prepareDragAndDrop () {
    this.QueryParams.filter(q => {
      return "cache" in q;
    }).map(q => {
      return {
        location: q.location,
        targets: [{
          ext: "",   // Will match any file
          media: "", //   or media type.
          target: q.cache
        }]
      };
    }).concat([
      {location: $("body"), targets: [
        {media: "application/json", target: this.Caches.manifest},
        {media: "application/x-yaml", target: this.Caches.manifest},
        {ext: ".shex", media: "text/shex", target: this.Caches.inputSchema},
        {ext: ".ttl", media: "text/turtle", target: this.Caches.inputData},
        {ext: ".json", media: "application/json", target: this.Caches.manifest},
        {ext: ".smap", media: "text/plain", target: this.Caches.shapeMap}]}
    ]).forEach(desc => {
      const droparea = desc.location;
      // kudos to http://html5demos.com/dnd-upload
      desc.location.
        on("drag dragstart dragend dragover dragenter dragleave drop", (e) => {
          e.preventDefault();
          e.stopPropagation();
        }).
        on("dragover dragenter", (evt) => {
          desc.location.addClass("hover");
        }).
        on("dragend dragleave drop", (evt) => {
          desc.location.removeClass("hover");
        }).
        on("drop", (evt) => {
          evt.preventDefault();
          droparea.removeClass("droppable");
          $("#results .status").removeClass("error");
          this.resultsWidget.clear();
          let xfer = evt.originalEvent.dataTransfer;
          const prefTypes = [
            {type: "files"},
            {type: "application/json"},
            {type: "text/uri-list"},
            {type: "text/plain"}
          ];
          const promises = [];
          if (prefTypes.find(l => {
            if (l.type.indexOf("/") === -1) {
              if (l.type in xfer && xfer[l.type].length > 0) {
                $("#results .status").text("handling "+xfer[l.type].length+" files...").show();
                promises.push(readfiles(xfer[l.type], desc.targets));
                return true;
              }
            } else {
              if (xfer.getData(l.type)) {
                const val = xfer.getData(l.type);
                $("#results .status").text("handling "+l.type+"...").show();
                if (l.type === "application/json") {
                  if (desc.location.get(0) === $("body").get(0)) {
                    let parsed = JSON.parse(val);
                    if (!(Array.isArray(parsed))) {
                      parsed = [parsed];
                    }
                    parsed.map(elt => {
                      const action = "action" in elt ? elt.action: elt;
                      action.schemaURL = action.schema; delete action.schema;
                      action.dataURL = action.data; delete action.data;
                    });
                    promises.push(this.Caches.manifest.set(parsed, DefaultBase, "drag and drop"));
                  } else {
                    promises.push(inject(desc.targets, DefaultBase, val, l.type));
                  }
                } else if (l.type === "text/uri-list") {
                  $.ajax({
                    accepts: {
                      mycustomtype: 'text/shex,text/turtle,*/*'
                    },
                    url: val,
                    dataType: "text"
                  }).fail((jqXHR, textStatus) => {
                    const error = jqXHR.statusText === "OK" ? textStatus : jqXHR.statusText;
                    this.resultsWidget.append($("<pre/>").text("GET <" + val + "> failed: " + error));
                  }).done((data, status, jqXhr) => {
                    try {
                      promises.push(inject(desc.targets, val, data, (jqXhr.getResponseHeader("Content-Type") || "unknown-media-type").split(/[ ;,]/)[0]));
                      $("#loadForm").dialog("close");
                      this.toggleControls();
                    } catch (e) {
                      this.resultsWidget.append($("<pre/>").text("unable to evaluate <" + val + ">: " + (e.stack || e)));
                    }
                  });
                } else if (l.type === "text/plain") {
                  promises.push(inject(desc.targets, DefaultBase, val, l.type));
                }
                $("#results .status").text("").hide();
                // desc.targets.text(xfer.getData(l.type));
                return true;
                async function inject (targets, url, data, mediaType) {
                  const target =
                        targets.length === 1 ? targets[0].target :
                        targets.reduce((ret, elt) => {
                          return ret ? ret :
                            mediaType === elt.media ? elt.target :
                            null;
                        }, null);
                  if (target) {
                    const appendTo = $("#append").is(":checked") ? target.get() : "";
                    await target.set(appendTo + data, url, 'drag and drop', mediaType);
                  } else {
                    this.resultsWidget.append("don't know what to do with " + mediaType + "\n");
                  }
                }
              }
            }
            return false;
          }) === undefined)
            this.resultsWidget.append($("<pre/>").text(
              "drag and drop not recognized:\n" +
                JSON.stringify({
                  dropEffect: xfer.dropEffect,
                  effectAllowed: xfer.effectAllowed,
                  files: xfer.files.length,
                  items: [].slice.call(xfer.items).map(i => {
                    return {kind: i.kind, type: i.type};
                  })
                }, null, 2)
            ));
          SharedForTests.promise = Promise.all(promises);
        });
    });
    const readfiles = /*async*/ (files, targets) => { // returns promise but doesn't use await
      const formData = new FormData();
      let successes = 0;
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i], name = file.name;
        const target = targets.reduce((ret, elt) => {
          return ret ? ret :
            name.endsWith(elt.ext) ? elt.target :
            null;
        }, null);
        if (target) {
          promises.push(new Promise((resolve, reject) => {
            formData.append("file", file);
            const reader = new FileReader();
            reader.onload = ((target) => {
              return async (event) => {
                const appendTo = $("#append").is(":checked") ? target.get() : "";
                await target.set(appendTo + event.target.result, DefaultBase);
                ++successes;
                resolve()
              };
            })(target);
            reader.readAsText(file);
          }))
        } else {
          this.resultsWidget.append("don't know what to do with " + name + "\n");
        }
      }
      return Promise.all(promises).then(() => {
        $("#results .status").text("loaded "+successes+" files.").show();
      })
    }
  }
}
 
