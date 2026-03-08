/* ShExMaterializer - javascript module to validate a graph with respect to Shape Expressions
 *
 * Status: 1/2 tested, no known bugs.
 *
 * TODO:
 *   constraint violation reporting.
 */

const {rdfJsTerm2Ld} = require("@shexjs/term");

const ShExMapMaterializerCjsModule = function (config) {

const Start = config.Validator.Start;

// interface constants
const InterfaceOptions = {
  "or": {
    "oneOf": "exactly one disjunct must pass",
    "someOf": "one or more disjuncts must pass",
    "firstOf": "disjunct evaluation stops after one passes"
  },
  "partition": {
    "greedy": "each triple constraint consumes all triples matching predicate and object",
    "exhaustive": "search all mappings of triples to triple constriant"
  }
};

const VERBOSE = false; // "VERBOSE" in process.env;
// **ShExValidator** provides ShEx utility functions

const ProgramFlowError = { type: "ProgramFlowError", errors: { type: "UntrackedError" } };

const ShExTerm = require("@shexjs/term");
const ShExMap = require("../shex-extension-map");

const UNBOUNDED = -1;

const XSD = "http://www.w3.org/2001/XMLSchema#";
const integerDatatypes = [
  XSD + "integer",
  XSD + "nonPositiveInteger",
  XSD + "negativeInteger",
  XSD + "long",
  XSD + "int",
  XSD + "short",
  XSD + "byte",
  XSD + "nonNegativeInteger",
  XSD + "unsignedLong",
  XSD + "unsignedInt",
  XSD + "unsignedShort",
  XSD + "unsignedByte",
  XSD + "positiveInteger"
];

const decimalDatatypes = [
  XSD + "decimal",
].concat(integerDatatypes);

const numericDatatypes = [
  XSD + "float",
  XSD + "double"
].concat(decimalDatatypes);

const numericParsers = {};
numericParsers[XSD + "integer"] = function (label, parseError) {
  if (!(label.match(/^[+-]?[0-9]+$/))) {
    parseError("illegal integer value '" + label + "'");
  }
  return parseInt(label);
};
numericParsers[XSD + "decimal"] = function (label, parseError) {
  if (!(label.match(/^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)$/))) { // XSD has no pattern for decimal?
    parseError("illegal integer value '" + label + "'");
  }
  return parseFloat(label);
};
numericParsers[XSD + "float"  ] = function (label, parseError) {
  if (!(label.match(/^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)$/))) { // XSD has no pattern for float?
    parseError("illegal integer value '" + label + "'");
  }
  return parseFloat(label);
};
numericParsers[XSD + "double" ] = function (label, parseError) {
  if (!(label.match(/[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/))) {
    parseError("illegal integer value '" + label + "'");
  }
  return Number(label);
};

function testRange (value, datatype, parseError) {
  const ranges = {
    //    integer            -1 0 1 +1 | "" -1.0 +1.0 1e0 NaN INF
    //    decimal            -1 0 1 +1 -1.0 +1.0 | "" 1e0 NaN INF
    //    float              -1 0 1 +1 -1.0 +1.0 1e0 1E0 NaN INF -INF | "" +INF
    //    double             -1 0 1 +1 -1.0 +1.0 1e0 1E0 NaN INF -INF | "" +INF
    //    nonPositiveInteger -1 0 +0 -0 | 1 +1 1a a1
    //    negativeInteger    -1 | 0 +0 -0 1
    //    long               -1 0 1 +1 |
    //    int                -1 0 1 +1 |
    //    short              -32768 0 32767 | -32769 32768
    //    byte               -128 0 127 | "" -129 128
    //    nonNegativeInteger 0 -0 +0 1 +1 | -1
    //    unsignedLong       0 1 | -1
    //    unsignedInt        0 1 | -1
    //    unsignedShort      0 65535 | -1 65536
    //    unsignedByte       0 255 | -1 256
    //    positiveInteger    1 | -1 0
    //    string             "" "a" "0"
    //    boolean            true false 0 1 | "" TRUE FALSE tRuE fAlSe -1 2 10 01
    //    dateTime           "2012-01-02T12:34:56.78Z" | "" "2012-01-02T" "2012-01-02"
    integer:            { min: -Infinity           , max: Infinity },
    decimal:            { min: -Infinity           , max: Infinity },
    float:              { min: -Infinity           , max: Infinity },
    double:             { min: -Infinity           , max: Infinity },
    nonPositiveInteger: { min: -Infinity           , max: 0        },
    negativeInteger:    { min: -Infinity           , max: -1       },
    long:               { min: -9223372036854775808, max: 9223372036854775807 },
    int:                { min: -2147483648         , max: 2147483647 },
    short:              { min: -32768              , max: 32767    },
    byte:               { min: -128                , max: 127      },
    nonNegativeInteger: { min: 0                   , max: Infinity },
    unsignedLong:       { min: 0                   , max: 18446744073709551615 },
    unsignedInt:        { min: 0                   , max: 4294967295 },
    unsignedShort:      { min: 0                   , max: 65535    },
    unsignedByte:       { min: 0                   , max: 255      },
    positiveInteger:    { min: 1                   , max: Infinity }
  }
  const parms = ranges[datatype.substr(XSD.length)];
  if (!parms) throw Error("unexpected datatype: " + datatype);
  if (value < parms.min) {
    parseError("\"" + value + "\"^^<" + datatype + "> is less than the min:", parms.min);
  } else if (value > parms.max) {
    parseError("\"" + value + "\"^^<" + datatype + "> is greater than the max:", parms.min);
  }
};

/*
function intSubType (spec, label, parseError) {
  const ret = numericParsers[XSD + "integer"](label, parseError);
  if ("min" in spec && ret < spec.min)
    parseError("illegal " + XSD + spec.type + " value '" + label + "' should not be < " + spec.min);
  if ("max" in spec && ret > spec.max)
    parseError("illegal " + XSD + spec.type + " value '" + label + "' should not be > " + spec.max);
  return ret;
}
[{type: "nonPositiveInteger", max: 0},
 {type: "negativeInteger", max: -1},
 {type: "long", min: -9223372036854775808, max: 9223372036854775807}, // beyond IEEE double
 {type: "int", min: -2147483648, max: 2147483647},
 {type: "short", min: -32768, max: 32767},
 {type: "byte", min: -128, max: 127},
 {type: "nonNegativeInteger", min: 0},
 {type: "unsignedLong", min: 0, max: 18446744073709551615},
 {type: "unsignedInt", min: 0, max: 4294967295},
 {type: "unsignedShort", min: 0, max: 65535},
 {type: "unsignedByte", min: 0, max: 255},
 {type: "positiveInteger", min: 1}].forEach(function (i) {
   numericParsers[XSD + i.type ] = function (label, parseError) {
     return intSubType(i, label, parseError);
   };
 });
*/

const stringTests = {
  length   : function (v, l) { return v.length === l; },
  minlength: function (v, l) { return v.length  >= l; },
  maxlength: function (v, l) { return v.length  <= l; }
};

const numericValueTests = {
  mininclusive  : function (n, m) { return n >= m; },
  minexclusive  : function (n, m) { return n >  m; },
  maxinclusive  : function (n, m) { return n <= m; },
  maxexclusive  : function (n, m) { return n <  m; }
};

const decimalLexicalTests = {
  totaldigits   : function (v, d) {
    const m = v.match(/[0-9]/g);
    return m && m.length <= d;
  },
  fractiondigits: function (v, d) {
    const m = v.match(/^[+-]?[0-9]*\.?([0-9]*)$/);
    return m && m[1].length <= d;
  }
};

function makeCache () {
  const _keys = {}; // _keys[http://abcd] = [obj1, obj2]
  const _vals = {}; // _vals[http://abcd] = [res1, res2]
  return {
    cached: function (focus, shape) {
     const key = ShExTerm.rdfJsTerm2Turtle(focus);
      let cache = _keys[key];
      if (!cache) {
        _keys[key] = cache = [];
        _vals[key] = [];
        return undefined;
      }
      const idx = cache.indexOf(shape);
      return idx === -1 ? undefined : _vals[key][idx];
    },
    remember: function (focus, shape, res) {
     const key = ShExTerm.rdfJsTerm2Turtle(focus);
      const cache = _keys[key];
      if (!cache) {
        _keys[key] = [];
        _vals[key] = [];
      } else if (cache.indexOf(shape) !== -1) {
        // we're conservative in the use here.
        throw Error("not expecting duplicate key " + key);
      }
      _keys[key].push(shape);
      _vals[key].push(res);
    }
  };
}

/* ShExValidator - construct an object for validating a schema.
 *
 * schema: a structure produced by a ShEx parser or equivalent.
 * options: object with controls for
 *   lax(true): boolean: whine about missing types in schema.
 *   diagnose(false): boolean: makde validate return a structure with errors.
 */
function ShExMaterializer_constructor(schema, mapper, options) {
  if (!(this instanceof ShExMaterializer_constructor))
    return new ShExMaterializer_constructor(schema, mapper, options);
  this.type = "ShExValidator";
  options = options || {};
  this.options = options;
  this.options.or = this.options.or || "someOf";
  this.options.partition = this.options.partition || "exhaustive";
  if (!("noCache" in options && options.noCache))
    this.known = makeCache();

  const _ShExValidator = this;
  this.schema = schema;
  this._expect = this.options.lax ? noop : expect; // report errors on missing types.
  this._optimize = {}; // optimizations:
    // hasRepeatedGroups: whether there are patterns like (:p1 ., :p2 .)*
  this.reset = function () {  }; // included in case we need it later.
  // const regexModule = this.options.regexModule || require("@shexjs/eval-simple-1err");
  const regexModule = this.options.regexModule || require("./eval-simple-1err-materializer");

  let blankNodeCount = 0;
  const nextBNode = options.nextBNode || function () {
    return '_:b' + blankNodeCount++;
  };

  /* getAST - compile a traditional regular expression abstract syntax tree.
   * Tested but not used at present.
   */
  this.getAST = function () {
    return {
      type: "AST",
      shapes: Object.keys(this.schema._index.shapeExprs).reduce(function (ret, label) {
        ret[label] = {
          type: "ASTshape",
          expression: _compileShapeToAST(_ShExValidator.schema._index.shapeExprs[label].expression, [], _ShExValidator.schema)
        };
        return ret;
      }, {})
    };
  };

  /* indexTripleConstraints - compile regular expression and index triple constraints
   */
  this.indexTripleConstraints = function (expression) {
    // list of triple constraints from (:p1 ., (:p2 . | :p3 .))
    const tripleConstraints = [];

    if (expression)
      indexTripleConstraints_dive(expression);
    return tripleConstraints;

    function indexTripleConstraints_dive (expr) {
      if (expr.type === "TripleConstraint")
        tripleConstraints.push(expr)-1;

      else if (expr.type === "OneOf" || expr.type === "EachOf")
        expr.expressions.forEach(function (nested) {
          indexTripleConstraints_dive(nested);
        });

      else if (expr.type === "Inclusion")
        indexTripleConstraints_dive(schema.productions[expr.include]);

      else
        runtimeError("unexpected expr type: " + expr.type);
    };
  };

  this.validateShapeMap = function (db, shapeMap, depth, seen) {
    return shapeMap.map(pair => {
      let time = new Date();
      const res = this.validate(db, ShExTerm.ld2RdfJsTerm(pair.node), pair.shape, depth, seen); // really tracker and seen
      time = new Date() - time;
      return {
        node: pair.node,
        shape: pair.shape,
        status: "errors" in res ? "nonconformant" : "conformant",
        appinfo: res,
        elapsed: time
      };
    });
  }

  /* validate - test point in db against the schema for labelOrShape
   * depth: level of recurssion; for logging.
   */
  this.validate = function (db, point, labelOrShape, depth, seen) {
    // default to schema's start shape
    if (!labelOrShape || labelOrShape === config.Validator.Start) {
      if (!schema.start)
        runtimeError("start production not defined");
      labelOrShape = schema.start;
    }
    if (typeof labelOrShape !== "string")
      return this._validateShapeExpr(db, point, labelOrShape, "_: -start-", depth, seen);

    if (!(labelOrShape in this.schema._index.shapeExprs))
      runtimeError("shape " + labelOrShape + " not defined");

    const label = labelOrShape; // for clarity
    if (seen === undefined)
      seen = {};
    const seenKey = ShExTerm.rdfJsTerm2Turtle(point) + "@" + (label === Start ? "_: -start-" : label);
    if (seenKey in seen)
      return {
        type: "Recursion",
        node: rdfJsTerm2Ld(point),
        shape: label
      };
    seen[seenKey] = { point: point, shapeLabel: label };
    const ret = this._validateShapeDecl(db, point, schema._index.shapeExprs[label], label, depth, seen);
    delete seen[seenKey];
    return ret;
  }

  this._validateShapeDecl = function (db, point, shapeDecl, shapeLabel, depth, tracker, seen, subgraph) {
    return this._validateShapeExpr(db, point, shapeDecl.shapeExpr, shapeLabel, depth, tracker, seen, subgraph);
  }

  this._lookupShape = function (label) {
    if (!("shapes" in this.schema) || this.schema.shapes.length === 0) {
      runtimeError("shape " + label + " not found; no shapes in schema");
    } else if (label in index.shapeExprs) {
      return index.shapeExprs[label]
    } else {
      runtimeError("shape " + label + " not found in:\n" + Object.keys(index.shapeExprs || []).map(s => "  " + s).join("\n"));
    }
  }

  this._validateShapeExpr = function (db, point, shapeExpr, shapeLabel, depth, seen) {
    if ("known" in this && this.known.cached(point, shapeExpr))
      return this.known.cached(point, shapeExpr);
    let ret = null;
    if (point === "")
      throw Error("validation needs a valid focus node");
    if (typeof(shapeExpr) === "string") { // ShapeRef
      ret = this._validateShapeDecl(db, point, schema._index.shapeExprs[shapeExpr], shapeExpr, depth, seen);
    } else if (shapeExpr.type === "NodeConstraint") {
      const errors = this._errorsMatchingNodeConstraint(point, shapeExpr, null);
      ret = errors.length ? {
        type: "Failure",
        node: rdfJsTerm2Ld(point),
        shape: shapeLabel,
        errors: errors.map(function (miss) {
          return {
            type: "NodeConstraintViolation",
            shapeExpr: shapeExpr
          };
        })
      } : {
        type: "NodeConstraintTest",
        node: rdfJsTerm2Ld(point),
        shape: shapeLabel,
        shapeExpr: shapeExpr
      };
    } else if (shapeExpr.type === "Shape") {
      ret = this._validateShape(db, point, regexModule.compile(schema, shapeExpr),
                                 shapeExpr, shapeLabel, depth, seen);
    } else if (shapeExpr.type === "ShapeExternal") {
      ret = this.options.validateExtern(db, point, shapeLabel, depth, seen);
    } else if (shapeExpr.type === "ShapeOr") {
      const errors = [];
      ret = { type: "ShapeOrFailure", errors: errors };
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(db, point, nested, shapeLabel, depth, seen);
        if ("errors" in sub)
          errors.push(sub);
        else {
          ret = { type: "ShapeOrResults", solution: sub };
          break;
        }
      }
    } else if (shapeExpr.type === "ShapeNot") {
      const sub = this._validateShapeExpr(db, point, shapeExpr.shapeExpr, shapeLabel, depth, seen);
      if ("errors" in sub)
          ret = { type: "ShapeNotResults", solution: sub };
        else
          ret = { type: "ShapeNotFailure", errors: sub };
    } else if (shapeExpr.type === "ShapeAnd") {
      const passes = [];
      ret = { type: "ShapeAndResults", solutions: passes };
      for (let i = 0; i < shapeExpr.shapeExprs.length; ++i) {
        const nested = shapeExpr.shapeExprs[i];
        const sub = this._validateShapeExpr(db, point, nested, shapeLabel, depth, seen);
        if ("errors" in sub) {
          ret = { type: "ShapeAndFailure", errors: sub };
          break;
        } else
          passes.push(sub);
      }
    } else
      throw Error("expected one of Shape{Ref,And,Or} or NodeConstraint, got " + JSON.stringify(shapeExpr));
    if ("known" in this)
      this.known.remember(point, shapeExpr, ret);
    return ret;
  }

  this._validateShape = function (db, point, regexEngine, shape, shapeLabel, depth, seen) {
    const _ShExValidator = this;

    // logging stuff
    if (depth === undefined)
      depth = 0;
    const padding = (new Array(depth + 1)).join("  "); // AKA "  ".repeat(depth);
    function _log () {
      if (!VERBOSE) { return; }
      console.log(padding + Array.prototype.join.call(arguments, ""));
    }

    let ret = null;
    const startAcionStorage = {}; // !!! need test to see this write to results structure.
    if ("startActs" in schema && !this.semActHandler.dispatchAll(schema.startActs, null, startAcionStorage))
      return null; // some semAct aborted !! return real error
    _log("validating <" + point + "> as <" + shapeLabel + ">");

    // const outgoing = indexNeighborhood(db.findByIRI(point, null, null, null).sort(byObject));
    // const incoming = indexNeighborhood(db.findByIRI(null, null, point, null).sort(bySubject));
    const neighborhood = []; // outgoing.triples.concat(incoming.triples); // @@ make fancy array holder.

    const constraintList = this.indexTripleConstraints(shape.expression);
    // const tripleList = triple2constraintList.reduce(function (ret, constraint, ord) {

    //   // subject and object depend on direction of constraint.
    //   const searchSubject = constraint.inverse ? null : point;
    //   const searchObject = constraint.inverse ? point : null;
    //   const index = constraint.inverse ? incoming : outgoing;

    //   // get triples matching predciate
    //   const matchPredicate = index.byPredicate[constraint.predicate] ||
    //     []; // empty list when no triple matches that constraint

    //   function _errorsByShapeLabel (focus, shapeLabel) {
    //     const sub = _ShExValidator.validate(db, focus, shapeLabel, depth + 1, seen);
    //     return "errors" in sub ? sub.errors : [];
    //   }
    //   function _errorsByShapeExpr (focus, shapeExpr) {
    //     const sub = _ShExValidator._validateShapeExpr(db, focus, shapeExpr, shapeLabel, depth, seen);
    //     return "errors" in sub ? sub.errors : [];
    //   }
    //   // strip to triples matching value constraints (apart from @<someShape>)
    //   const matchConstraints = _ShExValidator._triplesMatchingShapeExpr(
    //     matchPredicate,
    //     constraint.valueExpr,
    //     constraint.inverse,
    //     /* _ShExValidator.options.partition === "exhaustive" ? undefined : */ _errorsByShapeLabel,
    //     /* _ShExValidator.options.partition === "exhaustive" ? undefined : */ _errorsByShapeExpr
    //   );

    //   matchConstraints.hits.forEach(function (t) {
    //     ret.triple2constraintList[neighborhood.indexOf(t)].push(ord);
    //   });
    //   matchConstraints.misses.forEach(function (t) {
    //     ret.misses[neighborhood.indexOf(t.triple)] = {constraintNo: ord, errors: t.errors};
    //   });
    //   return ret;
    // }, { misses: {}, triple2constraintList:_seq(neighborhood.length).map(function () { return []; }) }); // start with [[],[]...]

    // _log("constraints by triple: ", JSON.stringify(tripleList.triple2constraintList));

    // const misses = tripleList.triple2constraintList.reduce(function (ret, constraints, ord) {
    //   if (constraints.length === 0 &&                       // matches no constraints
    //       ord < outgoing.triples.length &&                  // not an incoming triple
    //       ord in tripleList.misses &&                       // predicate matched some constraint(s)
    //       (shape.extra === undefined ||                     // not declared extra
    //        shape.extra.indexOf(neighborhood[ord].predicate) === -1)) {
    //     ret.push({tripleNo: ord, constraintNo: tripleList.misses[ord].constraintNo, errors: tripleList.misses[ord].errors});
    //   }
    //   return ret;
    // }, []);

    // const xp = crossProduct(tripleList.triple2constraintList);
    const partitionErrors = [];
    // while (misses.length === 0 && xp.next() && ret === null) {
    //   // caution: early continues
    for (let __once = 0; __once < 1; ++__once) {
      // const usedTriples = []; // [{s1,p1,o1},{s2,p2,o2}] implicated triples -- used for messages
      // const constraintMatchCount = // [2,1,0,1] how many triples matched a constraint
      //   _seq(neighborhood.length).map(function () { return 0; });
      // const tripleToConstraintMapping = xp.get(); // [0,1,0,3] mapping from triple to constraint

      // // Triples not mapped to triple constraints are not allowed in closed shapes.
      // if (shape.closed) {
      //   const firstSkippedTriple = tripleToConstraintMapping.indexOf(undefined);
      //   if (firstSkippedTriple !== -1 && firstSkippedTriple < outgoing.triples.length) {
      //     partitionErrors.push({
      //       errors: [
      //         {
      //           type: "ClosedShapeViolation",
      //           unexpectedTriples: tripleToConstraintMapping.reduce((ret, c, idx) => {
      //             if (idx < outgoing.triples.length && c === undefined)
      //               ret.push(outgoing.triples[idx]);
      //             return ret;
      //           }, [])
      //         }
      //       ]
      //     });
      //     continue; // closed shape violation.
      //   }
      // }

      // // Set usedTriples and constraintMatchCount.
      // tripleToConstraintMapping.forEach(function (tpNumber, ord) {
      //   if (tpNumber !== undefined) {
      //     usedTriples.push(neighborhood[ord]);
      //     ++constraintMatchCount[tpNumber];
      //   }
      // });

      // // Pivot to triples by constraint.
      // function _constraintToTriples () {
      //   const cll = triple2constraintList.length;
      //   return tripleToConstraintMapping.slice().
      //     reduce(function (ret, c, ord) {
      //       if (c !== undefined)
      //         ret[c].push(ord);
      //       return ret;
      //     }, _seq(cll).map(function () { return []; }));
      // }

      // tripleToConstraintMapping.slice().sort(function (a,b) { return a-b; }).filter(function (i) { // sort constraint numbers
      //   return i !== undefined;
      // }).map(function (n) { return n + " "; }).join(""); // e.g. 0 0 1 3 

      function _recurse (point, shapeLabel) {
        return _ShExValidator.validate(db, point, shapeLabel, depth+1, seen);
      }
      function _direct (point, shapeExpr) {
        return _ShExValidator._validateShapeExpr(db, point, shapeExpr, shapeLabel, depth, seen);
      }
      function _testExpr (term, valueExpr, recurse, direct) {
        return _ShExValidator._errorsMatchingShapeExpr(term, valueExpr, recurse, direct)
      }
      const results = regexEngine.match(db, point, constraintList, _synthesize, /*_constraintToTriples(), tripleToConstraintMapping, */ neighborhood, _recurse, _direct, this.semActHandler, _testExpr, null);
      function _synthesize (constraintNo, min, max, neighborhood) {
        // console.log({"constraintNo": constraintNo, "min": min, "max": max, "triple2constraintList": triple2constraintList, "db": db, "point": point, "regexEngine": regexEngine, "shape": shape, "shapeLabel": shapeLabel, "depth": depth, "seen": seen});
        const tc = constraintList[constraintNo];
        const curSubjectx = {cs: point};
        const target = new config.rdfjs.Store();
        mapper.visitTripleConstraint(tc, curSubjectx, nextBNode, target, { _maybeSet: () => {} }, _ShExValidator.schema, db, _recurse, _direct, _testExpr);
        const oldLen = neighborhood.length;
        const created = [... target.match()];
        neighborhood.push.apply(neighborhood, created);
        if (false) console.log("adding: " + created.length + " triples: " + created.map(
          q => (['subject', 'predicate', 'object']).map(
            pos => ShExTerm.shExJsTerm2Turtle(q[pos], _ShExValidator.schema, true)
          ).join(' ')
        ));
        return Array.apply(null, {length: created.length}).map((_, idx)=>{ return idx+oldLen});
        // if ("semActs" in tc) {
        //   tc.semActs.forEach(function (semAct) {
        //     if (semAct.name === ShExMap.url) {
        //       const prefixes = _ShExValidator.schema.prefixes;
              
        //     }
        //   });
        // }
        // console.dir();
        return [];
      }
      function mapper_visitTripleConstraint (expr) {
        const mapExts = (expr.semActs || []).filter(function (ext) { return ext.name === ShExMap.url; });
        if (mapExts.length) {
          mapExts.forEach(function (ext) {
            const code = ext.code;
            const m = code.match(pattern);

            let tripleObject;
            if (m) { 
              const arg = m[1] ? m[1] : P(m[2] + ":" + m[3]); 
              if (!_.isUndefined(bindings[arg])) {
                tripleObject = bindings[arg];
              }
            }

            // Is the arg a function? Check if it has parentheses and ends with a closing one
            if (_.isUndefined(tripleObject)) {
              if (/[ a-zA-Z0-9]+\(/.test(code)) 
                  tripleObject = extensions.lower(code, bindings, schema.prefixes);
            }

            if (_.isUndefined(tripleObject)) console.warn('Not in bindings: ',code);
            add(curSubject, expr.predicate, tripleObject);
          });

        } else if ("values" in expr.valueExpr && expr.valueExpr.values.length === 1) {
          add(curSubject, expr.predicate, expr.valueExpr.values[0]);

        } else {
          const oldSubject = curSubject;
          curSubject = B();
          add(oldSubject, expr.predicate, curSubject);
          this._maybeSet(expr, { type: "TripleConstraint" }, "TripleConstraint",
                         ["inverse", "negated", "predicate", "valueExprRef", "valueExpr",
                          "min", "max", "annotations", "semActs"])
          curSubject = oldSubject;
        }
      };

      // {// testing parity between two engines
      //   const nfa = require("@shexjs/eval-simple-1err").compile(schema, shape);
      //   const fromNFA = nfa.match(db, point, triple2constraintList, _constraintToTriples(), tripleToConstraintMapping, neighborhood, _recurse, this.semActHandler, _testExpr, null);
      //   if ("errors" in fromNFA !== "errors" in results)
      //     { throw Error(JSON.stringify(results) + " vs " + JSON.stringify(fromNFA)); }
      // }
      if ("errors" in results) {
        partitionErrors.push({
          errors: results.errors
        });
        if (_ShExValidator.options.partition !== "exhaustive")
          break;
        else
          continue;
      }

      // _log("post-regexp " + usedTriples.join(" "));

      const possibleRet = { type: "ShapeTest", node: rdfJsTerm2Ld(point), shape: shapeLabel };
      if (Object.keys(results).length > 0) // only include .solution for non-empty pattern
        possibleRet.solution = results;
      if ("semActs" in shape &&
          !this.semActHandler.dispatchAll(shape.semActs, results, possibleRet)) {
        // some semAct aborted
        partitionErrors.push({
          errors: [ { type: "SemActFailure", errors: [{ type: "UntrackedSemActFailure" }] } ]
        });
        if (_ShExValidator.options.partition !== "exhaustive")
          break;
        else
          continue;
      }
      // _log("final " + usedTriples.join(" "));

      ret = possibleRet;
      // alts.push(tripleToConstraintMapping);
    }
    if (ret === null/* !! && this.options.diagnose */) {
      const missErrors = [];// misses.map(function (miss) {
      //   const t = neighborhood[miss.tripleNo];
      //   return {
      //     type: "TypeMismatch",
      //     triple: {subject: t.subject, predicate: t.predicate, object: rdfJsTerm2Ld(t.object)},
      //     constraint: triple2constraintList[miss.constraintNo],
      //     errors: miss.errors
      //   };
      // });
      ret = {
        type: "Failure",
        node: rdfJsTerm2Ld(point),
        shape: shapeLabel,
        errors: missErrors.concat(partitionErrors.length === 1 ? partitionErrors[0].errors : partitionErrors) 
      };
    }

    if (VERBOSE) { // remove N3jsTripleToString
      neighborhood.forEach(function (t) {
        delete t.toString;
      });
    }
    if ("startActs" in schema && depth === 0) {
      ret.startActs = schema.startActs;
    }
    _log("</" + shapeLabel + ">");
    return ret;
  };

  this._triplesMatchingShapeExpr = function (triples, valueExpr, inverse, recurse, direct) {
    const _ShExValidator = this;
    const misses = [];
    const hits = [];
    triples.forEach(function (triple) {
      const value = inverse ? triple.subject : triple.object;
      const errors = valueExpr === undefined ?
          [] :
          _ShExValidator._errorsMatchingShapeExpr(value, valueExpr, recurse, direct);
      if (errors.length === 0) {
        hits.push(triple);
      } else if (hits.indexOf(triple) === -1) {
        misses.push({triple: triple, errors: errors});
      }
    });
    return { hits: hits, misses: misses };
  }
  this._errorsMatchingShapeExpr = function (value, valueExpr, recurse, direct) {
    const _ShExValidator = this;
    if (typeof(valueExpr) === "string") { // ShapeRef
      return recurse ? recurse(value, valueExpr) : [];
    } else if (valueExpr.type === "NodeConstraint") {
      return this._errorsMatchingNodeConstraint(value, valueExpr, null);
    } else if (valueExpr.type === "Shape") {
      return direct === undefined ? [] : direct(value, valueExpr);
    } else if (valueExpr.type === "ShapeOr") {
      let ret = [];
      for (let i = 0; i < valueExpr.shapeExprs.length; ++i) {
        const nested = _ShExValidator._errorsMatchingShapeExpr(value, valueExpr.shapeExprs[i], recurse, direct);
        if (nested.length === 0)
          return nested;
        ret = ret.concat(nested);
      }
      return ret;
    } else if (valueExpr.type === "ShapeAnd") {
      return valueExpr.shapeExprs.reduce(function (ret, nested, iter) {
        return ret.concat(_ShExValidator._errorsMatchingShapeExpr(value, nested, recurse, direct, true));
      }, []);
    } else {
      throw Error("unknown value expression type '" + valueExpr.type + "'");
    }
  };

  /* _errorsMatchingNodeConstraint - return whether the value matches the value
   * expression without checking shape references.
   */
  this._errorsMatchingNodeConstraint = function (value, valueExpr, recurse) {
    const errors = [];
    const label = value.value;
    const dt = value.termType === "Literal" ? value.datatype.value : null;
    const numeric = integerDatatypes.indexOf(dt) !== -1 ? XSD + "integer" : numericDatatypes.indexOf(dt) !== -1 ? dt : undefined;

    function validationError () {
      const errorStr = Array.prototype.join.call(arguments, "");
      errors.push("Error validating " + ShExTerm.rdfJsTerm2Turtle(value) + " as " + JSON.stringify(valueExpr) + ": " + errorStr);
      return false;
    }
    // if (negated) ;
    if (false) {
      // wildcard -- ignore
    } else {
      if ("nodeKind" in valueExpr) {
        if (["iri", "bnode", "literal", "nonliteral"].indexOf(valueExpr.nodeKind) === -1) {
          validationError("unknown node kind '" + valueExpr.nodeKind + "'");
        }
        if (value.termType === "BlankNode") {
          if (valueExpr.nodeKind === "iri" || valueExpr.nodeKind === "literal") {
            validationError("blank node found when " + valueExpr.nodeKind + " expected");
          }
        } else if (value.termType === "Literal") {
          if (valueExpr.nodeKind !== "literal") {
            validationError("literal found when " + valueExpr.nodeKind + " expected");
          }
        } else if (valueExpr.nodeKind === "bnode" || valueExpr.nodeKind === "literal") {
          validationError("iri found when " + valueExpr.nodeKind + " expected");
        }
      }

      if (valueExpr.datatype  && valueExpr.values) validationError("found both datatype and values in " + valueExpr);

      if (valueExpr.datatype) {
        if (value.termType !== "Literal") {
          validationError("mismatched datatype: " + JSON.stringify(rdfJsTerm2Ld(value)) + " is not a literal with datatype " + valueExpr.datatype);
        }
        else if (value.datatype.value !== valueExpr.datatype) {
          validationError("mismatched datatype: " + value.datatype.value + " !== " + valueExpr.datatype);
        }
        else if (numeric) {
          testRange(numericParsers[numeric](label, validationError), valueExpr.datatype, validationError);
        }
        else if (valueExpr.datatype === XSD + "boolean") {
          if (label !== "true" && label !== "false" && label !== "1" && label !== "0")
            validationError("illegal boolean value: " + label);
        }
        else if (valueExpr.datatype === XSD + "dateTime") {
          if (!label.match(/^[+-]?\d{4}-[01]\d-[0-3]\dT[0-5]\d:[0-5]\d:[0-5]\d(\.\d+)?([+-][0-2]\d:[0-5]\d|Z)?$/))
            validationError("illegal dateTime value: " + label);
        }
      }

      if (valueExpr.values) {
        if (value.termType === "Literal" && valueExpr.values.reduce((ret, v) => {
          if (ret) return true;
          const ld = rdfJsTerm2Ld(value);
          if (v.type === "Language") {
            return v.languageTag === ld.language; // @@ use equals/normalizeTest
          }
          if (!(typeof v === "object" && "value" in v)) // don't check for equivalent term if not a simple literal
            return false;
          return v.value === label
            && (!("type" in v) || v.type === value.datatype.value)
            && (!("language" in v) || v.language === value.language);
        }, false)) {
          // literal match
        } else if (valueExpr.values.indexOf(label) !== -1) {
          // trivial match
        } else {
          if (!(valueExpr.values.some(function (valueConstraint) {
            if (typeof valueConstraint === "object" && !("value" in valueConstraint)) { // i.e. not a simple term
              if (!("type" in valueConstraint))
                runtimeError("expected "+JSON.stringify(valueConstraint)+" to have a 'type' attribute.");
              const ExpectedTypePattern = /(Iri|Literal|Language)(Stem)?(Range)?/;
              const matchType = valueConstraint.type.match(ExpectedTypePattern);
              if (!matchType)
                runtimeError("expected type attribute '" + valueConstraint.type + "' to match " + ExpectedTypePattern + ".");
              const [undefined, valType, isStem, isRange] = matchType;
              if (valType === 'Iri') {
                if (value.termType !== 'NamedNode')
                  return false;
              } else {
                if (value.termType !== 'Literal')
                  return false;
              }

              /* expect N3.js literals with {Literal,Language}StemRange
               *       or non-literals with IriStemRange
               */
              function normalizedTest (val, ref, func) {
                if (["Literal", "Language"].indexOf(valType) !== -1) { // val.termType === "Literal"
                  if (["LiteralStem", "LiteralStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(val.value, ref);
                  } else if (["LanguageStem", "LanguageStemRange"].indexOf(valueConstraint.type) !== -1) {
                    return func(val.language || null, ref);
                  } else {
                    return validationError("literal " + JSON.stringify(val) + " not comparable with non-literal " + ref);
                  }
                } else {
                  if (["IriStem", "IriStemRange"].indexOf(valueConstraint.type) === -1) {
                    return validationError("nonliteral " + JSON.stringify(val) + " not comparable with literal " + JSON.stringify(ref));
                  } else {
                    return func(val.value, ref);
                  }
                }
              }
              function startsWith (val, ref) {
                return normalizedTest(val, ref, (l, r) => {
                  return (valueConstraint.type === "LanguageStem" ||
                          valueConstraint.type === "LanguageStemRange") ?
                    // rfc4647 basic filtering
                    l !== null && (l === r || r === "" || l[r.length] === "-") :
                    // simple substring
                    l.startsWith(r);
                });
              }
              function equals (val, ref) {
                return normalizedTest(val, ref, (l, r) => { return l === r; });
              }

              if (!isTerm(valueConstraint.stem)) {
                expect(valueConstraint.stem, "type", "Wildcard");
                // match whatever but check exclusions below
              } else {
                if (!(startsWith(value, valueConstraint.stem))) {
                  return false;
                }
              }
              if (valueConstraint.exclusions) {
                return !valueConstraint.exclusions.some(function (c) {
                  if (!isTerm(c)) {
                    if (!("type" in c))
                      runtimeError("expected "+JSON.stringify(c)+" to have a 'type' attribute.");
                    const stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
                    if (stemTypes.indexOf(c.type) === -1)
                      runtimeError("expected type attribute '"+c.type+"' to be in '"+stemTypes+"'.");
                    return startsWith(value, c.stem);
                  } else {
                    return equals(value, c);
                  }
                });
              }
              return true;
            } else {
              // ignore -- would have caught it above
            }
          }))) {
            validationError("value " + label + " not found in set " + JSON.stringify(valueExpr.values));
          }
        }
      }
    }

    if ("pattern" in valueExpr) {
      const regexp = "flags" in valueExpr ?
	  new RegExp(valueExpr.pattern, valueExpr.flags) :
	  new RegExp(valueExpr.pattern);
      if (!(label.match(regexp)))
        validationError("value " + label + " did not match pattern " + valueExpr.pattern);
    }

    Object.keys(stringTests).forEach(function (test) {
      if (test in valueExpr && !stringTests[test](label, valueExpr[test])) {
        validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + label);
      }
    });

    Object.keys(numericValueTests).forEach(function (test) {
      if (test in valueExpr) {
        if (numeric) {
          if (!numericValueTests[test](numericParsers[numeric](label, validationError), valueExpr[test])) {
            validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + label);
          }
        } else {
          validationError("facet violation: numeric facet " + test + " can't apply to " + label);
        }
      }
    });

    Object.keys(decimalLexicalTests).forEach(function (test) {
      if (test in valueExpr) {
        if (numeric === XSD + "integer" || numeric === XSD + "decimal") {
          if (!decimalLexicalTests[test](""+numericParsers[numeric](label, validationError), valueExpr[test])) {
            validationError("facet violation: expected " + test + " of " + valueExpr[test] + " but got " + label);
          }
        } else {
          validationError("facet violation: numeric facet " + test + " can't apply to " + label);
        }
      }
    });
    const ret = {
      type: null,
      focus: rdfJsTerm2Ld(value),
      shapeExpr: valueExpr
    };
    if (errors.length) {
      ret.type = "NodeConstraintViolation";
      ret.errors = errors;
    } else {
      ret.type = "NodeConstraintTest";
    }
    return ret;
  };

  this.semActHandler = {
    handlers: { },
    results: { },
    /**
     * Store a semantic action handler.
     *
     * @param {string} name - semantic action's URL.
     * @param {object} handler - handler function.
     *
     * The handler object has a dispatch function is invoked with:
     * @param {string} code - text of the semantic action.
     * @param {object} ctx - matched triple or results subset.
     * @param {object} extensionStorage - place where the extension writes into the result structure.
     * @return {bool} false if the extension failed or did not accept the ctx object.
     */
    register: function (name, handler) {
      this.handlers[name] = handler;
    },
    /**
     * Calls all semantic actions, allowing each to write to resultsArtifact.
     *
     * @param {array} semActs - list of semantic actions to invoke.
     * @return {bool} false if any result was false.
     */
    dispatchAll: function (semActs, ctx, resultsArtifact) {
      const _semActHanlder = this;
      return semActs.reduce(function (ret, semAct) {
        if (ret && semAct.name in _semActHanlder.handlers) {
          const code = "code" in semAct ? semAct.code : _ShExValidator.options.semActs[semAct.name];
          const existing = "extensions" in resultsArtifact && semAct.name in resultsArtifact.extensions;
          const extensionStorage = existing ? resultsArtifact.extensions[semAct.name] : {};
          ret = ret && _semActHanlder.handlers[semAct.name].dispatch(code, ctx, extensionStorage);
          if (!existing && Object.keys(extensionStorage).length > 0) {
            if (!("extensions" in resultsArtifact))
              resultsArtifact.extensions = {};
            resultsArtifact.extensions[semAct.name] = extensionStorage;
          }
          return ret;
        }
        return ret;
      }, true);
    }
  };
}

/* _compileShapeToAST - compile a shape expression to an abstract syntax tree.
 *
 * currently tested but not used.
 */
function _compileShapeToAST (expression, tripleConstraints, schema) {

  function Epsilon () {
    this.type = "Epsilon";
  }

  function TripleConstraint (ordinal, predicate, inverse, negated, valueExpr) {
    this.type = "TripleConstraint";
    // this.ordinal = ordinal; @@ does 1card25
    this.inverse = !!inverse;
    this.negated = !!negated;
    this.predicate = predicate;
    if (valueExpr !== undefined)
      this.valueExpr = valueExpr;
  }

  function Choice (disjuncts) {
    this.type = "Choice";
    this.disjuncts = disjuncts;
  }

  function EachOf (conjuncts) {
    this.type = "EachOf";
    this.conjuncts = conjuncts;
  }

  function SemActs (expression, semActs) {
    this.type = "SemActs";
    this.expression = expression;
    this.semActs = semActs;
  }

  function KleeneStar (expression) {
    this.type = "KleeneStar";
    this.expression = expression;
  }

  function _compileExpression (expr, schema) {
    let repeated, container;

    /* _repeat: map expr with a min and max cardinality to a corresponding AST with Groups and Stars.
       expr 1 1 => expr
       expr 0 1 => Choice(expr, Eps)
       expr 0 3 => Choice(EachOf(expr, Choice(EachOf(expr, Choice(expr, EPS)), Eps)), Eps)
       expr 2 5 => EachOf(expr, expr, Choice(EachOf(expr, Choice(EachOf(expr, Choice(expr, EPS)), Eps)), Eps))
       expr 0 * => KleeneStar(expr)
       expr 1 * => EachOf(expr, KleeneStar(expr))
       expr 2 * => EachOf(expr, expr, KleeneStar(expr))

       @@TODO: favor Plus over Star if Epsilon not in expr.
    */
    function _repeat (expr, min, max) {
      if (min === undefined) { min = 1; }
      if (max === undefined) { max = 1; }

      if (min === 1 && max === 1) { return expr; }

      const opts = max === UNBOUNDED ?
        new KleeneStar(expr) :
        _seq(max - min).reduce(function (ret, elt, ord) {
          return ord === 0 ?
            new Choice([expr, new Epsilon]) :
            new Choice([new EachOf([expr, ret]), new Epsilon]);
        }, undefined);

      const reqd = min !== 0 ?
        new EachOf(_seq(min).map(function (ret) {
          return expr; // @@ something with ret
        }).concat(opts)) : opts;
      return reqd;
    }

    if (expr.type === "TripleConstraint") {
      // predicate, inverse, negated, valueExpr, annotations, semActs, min, max
      const valueExpr = "valueExprRef" in expr ?
        schema.valueExprDefns[expr.valueExprRef] :
        expr.valueExpr;
      const ordinal = tripleConstraints.push(expr)-1;
      const tp = new TripleConstraint(ordinal, expr.predicate, expr.inverse, expr.negated, valueExpr);
      repeated = _repeat(tp, expr.min, expr.max);
      return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
    }

    else if (expr.type === "OneOf") {
      container = new Choice(expr.expressions.map(function (e) {
        return _compileExpression(e, schema);
      }));
      repeated = _repeat(container, expr.min, expr.max);
      return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
    }

    else if (expr.type === "EachOf") {
      container = new EachOf(expr.expressions.map(function (e) {
        return _compileExpression(e, schema);
      }));
      repeated = _repeat(container, expr.min, expr.max);
      return expr.semActs ? new SemActs(repeated, expr.semActs) : repeated;
    }

    else if (expr.type === "Inclusion") {
      const included = schema._index.shapeExprs[expr.include].expression;
      return _compileExpression(included, schema);
    }

    else throw Error("unexpected expr type: " + expr.type);
  }

  return expression ? _compileExpression(expression, schema) : new Epsilon();
}

// http://stackoverflow.com/questions/9422386/lazy-cartesian-product-of-arrays-arbitrary-nested-loops
function crossProduct(sets) {
  const n = sets.length, carets = [], args = null;

  function init() {
    args = [];
    for (let i = 0; i < n; i++) {
      carets[i] = 0;
      args[i] = sets[i][0];
    }
  }

  function next() {

    // special case: crossProduct([]).next().next() returns false.
    if (args !== null && args.length === 0)
      return false;

    if (args === null) {
      init();
      return true;
    }
    const i = n - 1;
    carets[i]++;
    if (carets[i] < sets[i].length) {
      args[i] = sets[i][carets[i]];
      return true;
    }
    while (carets[i] >= sets[i].length) {
      if (i == 0) {
        return false;
      }
      carets[i] = 0;
      args[i] = sets[i][0];
      carets[--i]++;
    }
    args[i] = sets[i][carets[i]];
    return true;
  }

  return {
    next: next,
    do: function (block, _context) { // old API
      return block.apply(_context, args);
    },
    // new API because
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments#Description
    // cautions about functions over arguments.
    get: function () { return args; }
  };
}

/* N3jsTripleToString - simple toString function to make N3.js's triples
 * printable.
 */
const N3jsTripleToString = function () {
  function fmt (n) {
    return n.termType === "Literal" ?
      [ "http://www.w3.org/2001/XMLSchema#integer",
        "http://www.w3.org/2001/XMLSchema#float",
        "http://www.w3.org/2001/XMLSchema#double"
      ].indexOf(n.datatype.value) !== -1 ?
      parseInt(n.value) :
      n :
    n.termType === "BlankNode" ?
      n :
      "<" + n + ">";
  }
  return fmt(this.subject) + " " + fmt(this.predicate) + " " + fmt(this.object) + " .";
};

/* indexNeighborhood - index triples by predicate
 * returns: {
 *     byPredicate: Object: mapping from predicate to triples containing that
 *                  predicate.
 *
 *     candidates: [[1,3], [0,2]]: mapping from triple to the triple constraints
 *                 it matches.  It is initialized to []. Mappings that remain an
 *                 empty set indicate a triple which didn't matching anything in
 *                 the shape.
 *
 *     misses: list to recieve value constraint failures.
 *   }
 */
function indexNeighborhood (triples) {
  return {
    triples: triples,
    byPredicate: triples.reduce(function (ret, t) {
      const p = t.predicate;
      if (!(p in ret))
        ret[p] = [];
      ret[p].push(t);

      // If in VERBOSE mode, add a nice toString to N3.js's triple objects.
      if (VERBOSE)
        t.toString = N3jsTripleToString;

      return ret;
    }, {}),
    candidates: _seq(triples.length).map(function () {
      return [];
    }),
    misses: []
  };
}

/* bySubject - sort triples by subject following SPARQL partial ordering.
 */
function bySubject (t1, t2) {
  // if (t1.predicate !== t2.predicate) // sort predicate first for easier scanning of results
  //   return t1.predicate > t2.predicate;
  const l = t1.subject, r = t2.subject;
  const lprec = l.termType === "BlankNode" ? 1 : l.termType === "Literal" ? 2 : 3;
  const rprec = r.termType === "BlankNode" ? 1 : r.termType === "Literal" ? 2 : 3;
  return lprec === rprec ? l > r : lprec > rprec;
}

/* byObject - sort triples by object following SPARQL partial ordering.
 */
function byObject (t1, t2) {
  // if (t1.predicate !== t2.predicate) // sort predicate first for easier scanning of results
  //   return t1.predicate > t2.predicate;
  const l = t1.object, r = t2.object;
  const lprec = l.termType === "BlankNode" ? 1 : l.termType === "Literal" ? 2 : 3;
  const rprec = r.termType === "BlankNode" ? 1 : r.termType === "Literal" ? 2 : 3;
  return lprec === rprec ? l > r : lprec > rprec;
}

/* Return a list of n ""s.
 *
 * Note that Array(n) on its own returns a "sparse array" so Array(n).map(f)
 * never calls f.
 */
function _seq (n) {
  return n === 0 ?
    [] :
    Array(n).join(" ").split(/ /); // hahaha, javascript, you suck.
}

/* Expect property p with value v in object o
 */
function expect (o, p, v) {
  if (!(p in o))
    runtimeError("expected "+JSON.stringify(o)+" to have a '"+p+"' attribute.");
  if (arguments.length > 2 && o[p] !== v)
    runtimeError("expected "+p+" attribute '"+o[p]+"' to equal '"+v+"'.");
}

function noop () {  }

function runtimeError () {
  const errorStr = Array.prototype.join.call(arguments, "");
  const e = new Error("Runtime error: " + errorStr);
  Error.captureStackTrace(e, runtimeError);
  throw e;
}

  return { // node environment
    construct: ShExMaterializer_constructor,
    options: InterfaceOptions
  };
}


// ## Exports

// Export the `ShExMaterializer` class as a whole.
if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = ShExMapMaterializerCjsModule;
