
class ShExVisitor {
  constructor (...ctor_args) {
    this.ctor_args = ctor_args;
  }

  static isTerm (t) {
    return typeof t !== "object" || "value" in t && Object.keys(t).reduce((r, k) => {
      return r === false ? r : ["value", "type", "language"].indexOf(k) !== -1;
    }, true);
  }

  static isShapeRef (expr) {
    return typeof expr === "string" // test for JSON-LD @ID
  }

  static visitMap (map, val) {
    const ret = {};
    Object.keys(map).forEach(function (item) {
      ret[item] = val(map[item]);
    });
    return ret;
  }

  runtimeError (e) {
    throw e;
  }

  visitSchema (schema, ...args) {
    const ret = { type: "Schema" };
    this._expect(schema, "type", "Schema");
    this._maybeSet(schema, ret, "Schema",
                   ["@context", "prefixes", "base", "imports", "startActs", "start", "shapes"],
                   ["_base", "_prefixes", "_index", "_sourceMap", "_locations"],
                   ...args
                  );
    return ret;
  }

  visitPrefixes (prefixes, ...args) {
    return prefixes === undefined ?
      undefined :
      ShExVisitor.visitMap(prefixes, function (val) {
        return val;
      });
  }

  visitIRI (i, ...args) {
    return i;
  }

  visitImports (imports, ...args) {
    return imports.map((imp) => {
      return this.visitIRI(imp, args);
    });
  }

  visitStartActs (startActs, ...args) {
    return startActs === undefined ?
      undefined :
      startActs.map((act) => {
        return this.visitSemAct(act, ...args);
      });
  }

  visitSemActs (semActs, ...args) {
    if (semActs === undefined)
      return undefined;
    const ret = []
    Object.keys(semActs).forEach((label) => {
      ret.push(this.visitSemAct(semActs[label], label, ...args));
    });
    return ret;
  }

  visitSemAct (semAct, label, ...args) {
    const ret = { type: "SemAct" };
    this._expect(semAct, "type", "SemAct");

    this._maybeSet(semAct, ret, "SemAct",
                   ["name", "code"], null, ...args);
    return ret;
  }

  visitShapes (shapes, ...args) {
    if (shapes === undefined)
      return undefined;
    return shapes.map(
      shapeExpr =>
      this.visitShapeDecl(shapeExpr, ...args)
    );
  }

  visitShapeDecl (decl, ...args) {
    return this._maybeSet(decl, { type: "ShapeDecl" }, "ShapeDecl",
                          ["id", "abstract", "restricts", "shapeExpr"], null, ...args);
  }

  visitShapeExpr (expr, ...args) {
    if (ShExVisitor.isShapeRef(expr))
      return this.visitShapeRef(expr, ...args)
    switch (expr.type) {
    case "Shape": return this.visitShape(expr, ...args);
    case "NodeConstraint": return this.visitNodeConstraint(expr, ...args);
    case "ShapeAnd": return this.visitShapeAnd(expr, ...args);
    case "ShapeOr": return this.visitShapeOr(expr, ...args);
    case "ShapeNot": return this.visitShapeNot(expr, ...args);
    case "ShapeExternal": return this.visitShapeExternal(expr, ...args);
    default:
      throw Error("unexpected shapeExpr type: " + expr.type + JSON.stringify(expr));
    }
  }

  visitValueExpr (expr, ...args) {
    return this.visitShapeExpr(expr, ...args); // call potentially overloaded visitShapeExpr
  }

  // _visitShapeGroup: visit a grouping expression (shapeAnd, shapeOr)
  _visitShapeGroup (expr, ...args) {
    this._testUnknownAttributes(expr, ["shapeExprs"], expr.type, this.visitShapeNot)
    const r = { type: expr.type };
    if ("id" in expr)
      r.id = expr.id;
    r.shapeExprs = expr.shapeExprs.map((nested) => {
      return this.visitShapeExpr(nested, ...args);
    });
    return r;
  }

  // _visitShapeNot: visit negated shape
  visitShapeNot (expr, ...args) {
    this._testUnknownAttributes(expr, ["shapeExpr"], "ShapeNot", this.visitShapeNot)
    const r = { type: expr.type };
    if ("id" in expr)
      r.id = expr.id;
    r.shapeExpr = this.visitShapeExpr(expr.shapeExpr, ...args);
    return r;
  }

  // ### `visitNodeConstraint` deep-copies the structure of a shape
  visitShape (shape, ...args) {
    const ret = { type: "Shape" };
    this._expect(shape, "type", "Shape");

    this._maybeSet(shape, ret, "Shape",
                   [ "abstract", "extends",
                     "closed",
                     "expression", "extra", "semActs", "annotations"], null, ...args);
    return ret;
  }

  _visitShapeExprList (ext, ...args) {
    return ext.map((t) => {
      return this.visitShapeExpr(t, ...args);
    });
  }

  // ### `visitNodeConstraint` deep-copies the structure of a shape
  visitNodeConstraint (shape, ...args) {
    const ret = { type: "NodeConstraint" };
    this._expect(shape, "type", "NodeConstraint");

    this._maybeSet(shape, ret, "NodeConstraint",
                   [ "nodeKind", "datatype", "pattern", "flags", "length",
                     "reference", "minlength", "maxlength",
                     "mininclusive", "minexclusive", "maxinclusive", "maxexclusive",
                     "totaldigits", "fractiondigits", "values", "annotations", "semActs"], null, ...args);
    return ret;
  }

  visitShapeRef (reference, ...args) {
    if (typeof reference !== "string") {
      let ex = Error("visitShapeRef expected a string, not " + JSON.stringify(reference));
      console.warn(ex);
      throw ex;
    }
    return reference;
  }

  visitShapeExternal (expr, ...args) {
    this._testUnknownAttributes(expr, ["id"], "ShapeExternal", this.visitShapeNot)
    return Object.assign("id" in expr ? { id: expr.id } : {}, { type: "ShapeExternal" });
  }

  // _visitGroup: visit a grouping expression (someOf or eachOf)
  _visitGroup (expr, ...args) {
    const r = Object.assign(
      // pre-declare an id so it sorts to the top
      "id" in expr ? { id: null } : { },
      { type: expr.type }
    );
    r.expressions = expr.expressions.map((nested) => {
      return this.visitExpression(nested, ...args);
    });
    return this._maybeSet(expr, r, "expr",
                          ["id", "min", "max", "annotations", "semActs"], ["expressions"], ...args);
  }

  visitTripleConstraint (expr, ...args) {
    return this._maybeSet(expr,
                          Object.assign(
                            // pre-declare an id so it sorts to the top
                            "id" in expr ? { id: null } : { },
                            { type: "TripleConstraint" }
                          ),
                          "TripleConstraint",
                          ["id", "inverse", "predicate", "valueExpr",
                           "min", "max", "annotations", "semActs"], null, ...args)
  }

  visitTripleExpr (expr, ...args) {
    if (typeof expr === "string")
      return this.visitInclusion(expr);
    switch (expr.type) {
    case "TripleConstraint": return this.visitTripleConstraint(expr, ...args);
    case "OneOf": return this.visitOneOf(expr, ...args);
    case "EachOf": return this.visitEachOf(expr, ...args);
    default:
      throw Error("unexpected expression type: " + expr.type);
    }
  }

  visitExpression (expr, ...args) {
    return this.visitTripleExpr(expr, ...args); // call potentially overloaded visitTripleExpr
  }

  visitValues (values, ...args) {
    return values.map((t) => {
      return ShExVisitor.isTerm(t) || t.type === "Language" ?
        t :
        this.visitStemRange(t, ...args);
    });
  }

  visitStemRange (t, ...args) {
    // this._expect(t, "type", "IriStemRange");
    if (!("type" in t))
      this.runtimeError(Error("expected "+JSON.stringify(t)+" to have a 'type' attribute."));
    const stemRangeTypes = ["IriStem", "LiteralStem", "LanguageStem", "IriStemRange", "LiteralStemRange", "LanguageStemRange"];
    if (stemRangeTypes.indexOf(t.type) === -1)
      this.runtimeError(Error("expected type attribute '"+t.type+"' to be in '"+stemRangeTypes+"'."));
    let stem;
    if (ShExVisitor.isTerm(t)) {
      this._expect(t.stem, "type", "Wildcard");
      stem = { type: t.type, stem: { type: "Wildcard" } };
    } else {
      stem = { type: t.type, stem: t.stem };
    }
    if (t.exclusions) {
      stem.exclusions = t.exclusions.map((c) => {
        return this.visitExclusion(c, ...args);
      });
    }
    return stem;
  }

  visitExclusion (c, ...args) {
    if (!ShExVisitor.isTerm(c)) {
      // this._expect(c, "type", "IriStem");
      if (!("type" in c))
        this.runtimeError(Error("expected "+JSON.stringify(c)+" to have a 'type' attribute."));
      const stemTypes = ["IriStem", "LiteralStem", "LanguageStem"];
      if (stemTypes.indexOf(c.type) === -1)
        this.runtimeError(Error("expected type attribute '"+c.type+"' to be in '"+stemTypes+"'."));
      return { type: c.type, stem: c.stem };
    } else {
      return c;
    }
  }

  visitInclusion (inclusion, ...args) {
    if (typeof inclusion !== "string") {
      let ex = Error("visitInclusion expected a string, not " + JSON.stringify(inclusion));
      console.warn(ex);
      throw ex;
    }
    return inclusion;
  }

  _maybeSet (obj, ret, context, members, ignore, ...args) {
    this._testUnknownAttributes(obj, ignore ? members.concat(ignore) : members, context, this._maybeSet)
    members.forEach((member) => {
      const methodName = "visit" + member.charAt(0).toUpperCase() + member.slice(1);
      if (member in obj) {
        const f = this[methodName];
        if (typeof f !== "function") {
          throw Error(methodName + " not found in Visitor");
        }
        const t = f.call(this, obj[member], ...args);
        if (t !== undefined) {
          ret[member] = t;
        }
      }
    });
    return ret;
  }

  _visitValue (v, ...args) {
    return v;
  }

  _visitList (l, ...args) {
    return l.slice();
  }

  _testUnknownAttributes (obj, expected, context, captureFrame) {
    const unknownMembers = Object.keys(obj).reduce(function (ret, k) {
      return k !== "type" && expected.indexOf(k) === -1 ? ret.concat(k) : ret;
    }, []);
    if (unknownMembers.length > 0) {
      const e = Error("unknown propert" + (unknownMembers.length > 1 ? "ies" : "y") + ": " +
                      unknownMembers.map(function (p) {
                        return "\"" + p + "\"";
                      }).join(",") +
                      " in " + context + ": " + JSON.stringify(obj));
      Error.captureStackTrace(e, captureFrame);
      throw e;
    }
  }

  _expect (o, p, v) {
    if (!(p in o))
      this.runtimeError(Error("expected "+JSON.stringify(o)+" to have a ."+p));
    if (arguments.length > 2 && o[p] !== v)
      this.runtimeError(Error("expected "+o[p]+" to equal "+v));
  }
}

// A lot of ShExVisitor's functions are the same. This creates them.
ShExVisitor.prototype.visitBase = ShExVisitor.prototype.visitStart = ShExVisitor.prototype.visitClosed = ShExVisitor.prototype["visit@context"] = ShExVisitor.prototype._visitValue;
ShExVisitor.prototype.visitRestricts = ShExVisitor.prototype.visitExtends = ShExVisitor.prototype._visitShapeExprList;
ShExVisitor.prototype.visitExtra = ShExVisitor.prototype.visitAnnotations = ShExVisitor.prototype._visitList;
ShExVisitor.prototype.visitAbstract = ShExVisitor.prototype.visitInverse = ShExVisitor.prototype.visitPredicate = ShExVisitor.prototype._visitValue;
ShExVisitor.prototype.visitName = ShExVisitor.prototype.visitId = ShExVisitor.prototype.visitCode = ShExVisitor.prototype.visitMin = ShExVisitor.prototype.visitMax = ShExVisitor.prototype._visitValue;

ShExVisitor.prototype.visitType = ShExVisitor.prototype.visitNodeKind = ShExVisitor.prototype.visitDatatype = ShExVisitor.prototype.visitPattern = ShExVisitor.prototype.visitFlags = ShExVisitor.prototype.visitLength = ShExVisitor.prototype.visitMinlength = ShExVisitor.prototype.visitMaxlength = ShExVisitor.prototype.visitMininclusive = ShExVisitor.prototype.visitMinexclusive = ShExVisitor.prototype.visitMaxinclusive = ShExVisitor.prototype.visitMaxexclusive = ShExVisitor.prototype.visitTotaldigits = ShExVisitor.prototype.visitFractiondigits = ShExVisitor.prototype._visitValue;
ShExVisitor.prototype.visitOneOf = ShExVisitor.prototype.visitEachOf = ShExVisitor.prototype._visitGroup;
ShExVisitor.prototype.visitShapeAnd = ShExVisitor.prototype.visitShapeOr = ShExVisitor.prototype._visitShapeGroup;
ShExVisitor.prototype.visitInclude = ShExVisitor.prototype._visitValue;


/** create indexes for schema
 */
class ShExIndexVisitor extends ShExVisitor {
  constructor () {
    super();
    this.myIndex = {
        shapeExprs: {},
        tripleExprs: {}
    };
  }

  visitTripleExpr (expression, ...args) {
    if (typeof expression === "object" && "id" in expression)
      this.myIndex.tripleExprs[expression.id] = expression;
    return super.visitTripleExpr(expression, ...args);
  };

  visitShapeDecl (shapeExpr, ...args) {
    if (typeof shapeExpr === "object" && "id" in shapeExpr)
      this.myIndex.shapeExprs[shapeExpr.id] = shapeExpr;
    return super.visitShapeDecl(shapeExpr, ...args);
  };

  static index (schema, ...args) {
    const v = new ShExIndexVisitor();
    v.visitSchema(schema, ...args);
    return v.myIndex;
  }
}


if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = {
    ShExVisitor,
    ShExIndexVisitor,
  };

