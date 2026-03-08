class WorkerMarshalling {
  static indexKey (node, shape) {
    return node+'@'+shape;
  }

  static indexShapeMap (fixedMap) {
    return fixedMap.reduce((ret, ent) => {
      ret[WorkerMarshalling.indexKey(ent.node, ent.shape)] = ent;
      return ret;
    }, {});
  }

  static createResults () {
    var _shapeMap = [];
    var known = {};
    return {
      // Get results ShapeMap.
      getShapeMap: function () {
        return _shapeMap.length === 0 ?
          null :
          _shapeMap.length === 1 ?
          _shapeMap[0] :
          "errors" in _shapeMap[0] ?
          { type: "FailureList", errors: _shapeMap } :
        { type: "SolutionList", solutions: _shapeMap };
      },

      // Add entries to results ShapeMap.
      merge: function (toAdd) {
        toAdd.forEach(ent => {
          var key = WorkerMarshalling.indexKey(ent.node, ent.shape);
          if (!(key in known)) {
            _shapeMap.push(ent);
            known[key] = ent;
          }
        });
        return this;
      },

      has: function (ent) {
        var key = WorkerMarshalling.indexKey(ent.node, ent.shape);
        return (key in known);
      },

      report: function () {
        log("<span class=\"results\">" + _shapeMap.map(elt => {
          return "<span class=\"" + elt.status + "\">" + elt.node + "@" + (elt.status === "fail" ? "!" : "") + elt.shape + "</span>";
        }).join("<br />\n") + "</span>");
      }
    };
  }

  static rdfjsTripleToJsonTriple (rdfjsTriple) {
    return ["subject", "predicate", "object"].reduce((acc, pos) => {
      const ret = WorkerMarshalling.rdfjsTermToJsonTerm(rdfjsTriple[pos]);
      acc[pos] = ret;
      return acc;
    }, {})
  }

  static rdfjsTermToJsonTerm (rdfjsTerm) {
    const ret = { termType: rdfjsTerm.termType, value: rdfjsTerm.value };
    if (ret.termType === "Literal") {
      if (["http://www.w3.org/2001/XMLSchema#string",
           "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
          ].indexOf(rdfjsTerm.datatypeString) === -1)
        ret.datatype = rdfjsTerm.datatypeString;
      else if (rdfjsTerm.language)
        ret.language = rdfjsTerm.language;
    };
    return ret;
  }

  // static jsonToDataSet (jsonTriples, dataSet, dataFactory) {
  //   dataSet.addQuads(jsonTriples.map(jsonTriple => WorkerMarshalling.jsonToTriple(jsonTriple, dataFactory)));
  //   return dataSet;
  // }

  static jsonTripleToRdfjsTriple (jsonTriple, dataFactory) {
    return dataFactory.quad(
      WorkerMarshalling.jsonTermToRdfjsTerm(jsonTriple.subject, dataFactory),
      WorkerMarshalling.jsonTermToRdfjsTerm(jsonTriple.predicate, dataFactory),
      WorkerMarshalling.jsonTermToRdfjsTerm(jsonTriple.object, dataFactory)
    );
  }

  static jsonTermToRdfjsTerm (jsonTerm, dataFactory) {
    switch (jsonTerm.termType) {
    case "NamedNode": return dataFactory.namedNode(jsonTerm.value);
    case "BlankNode": return dataFactory.blankNode(jsonTerm.value);
    case "Literal":
      if (jsonTerm.datatype)
        return dataFactory.literal(jsonTerm.value, dataFactory.namedNode(jsonTerm.datatype));
      if (jsonTerm.language)
        return dataFactory.literal(jsonTerm.value, jsonTerm.language);
      return dataFactory.literal(jsonTerm.value);
    }
  }
}

this.WorkerMarshalling = WorkerMarshalling; // testing hack to make class work in PseudoWorker
