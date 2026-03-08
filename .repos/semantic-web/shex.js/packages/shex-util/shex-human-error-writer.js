const ShExHumanErrorWriterCjsModule = (function () {
const ShExTerm = require("@shexjs/term");
const XSD = {}
XSD._namespace = "http://www.w3.org/2001/XMLSchema#";
["anyURI", "string"].forEach(p => {
  XSD[p] = XSD._namespace+p;
});

return class ShExHumanErrorWriter {
  write (val) {
    const _HumanErrorWriter = this;
    if (Array.isArray(val)) {
      return val.reduce((ret, e) => {
        const nested = _HumanErrorWriter.write(e).map(s => "  " + s);
        return ret.length ? ret.concat(["AND"]).concat(nested) : nested;
      }, []);
    }
    if (typeof val === "string")
      return [val];

    switch (val.type) {
    case "FailureList":
      return val.errors.reduce((ret, e) => {
        return ret.concat(_HumanErrorWriter.write(e));
      }, []);
    case "Failure":
      return ["validating " + val.node + " as " + val.shape + ":"].concat(errorList(val.errors).reduce((ret, e) => {
        const nested = _HumanErrorWriter.write(e).map(s => "  " + s);
        return ret.length > 0 ? ret.concat(["  OR"]).concat(nested) : nested.map(s => "  " + s);
      }, []));
    case "TypeMismatch": {
      const nested = Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _HumanErrorWriter.write(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _HumanErrorWriter.write(val.errors));
      return ["validating " + n3ify(val.triple.object) + ":"].concat(nested);
    }
    case "RestrictionError": {
      const nested = val.errors.constructor === Array ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _HumanErrorWriter.write(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _HumanErrorWriter.write(val.errors));
      return ["validating restrictions on " + n3ify(val.focus) + ":"].concat(nested);
    }
    case "ShapeAndFailure":
      return Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _HumanErrorWriter.write(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _HumanErrorWriter.write(val.errors));
    case "ShapeOrFailure":
      return Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat(" OR " + (typeof e === "string" ? [e] : _HumanErrorWriter.write(e)));
          }, []) :
          " OR " + (typeof e === "string" ? [val.errors] : _HumanErrorWriter.write(val.errors));
    case "ShapeNotFailure":
      return ["Node " + val.errors.node + " expected to NOT pass " + val.errors.shape];
    case "ExcessTripleViolation":
      return ["validating " + n3ify(val.triple.object) + ": exceeds cardinality"];
    case "ClosedShapeViolation":
      return ["Unexpected triple(s): {"].concat(
        val.unexpectedTriples.map(t => {
          return "  " + t.subject + " " + t.predicate + " " + n3ify(t.object) + " ."
        })
      ).concat(["}"]);
    case "NodeConstraintViolation":
      return ["NodeConstraintError: expected to " + this.nodeConstraintToSimple(val.shapeExpr).join(', ')];
    case "MissingProperty":
      return ["Missing property: " + val.property];
    case "NegatedProperty":
      return ["Unexpected property: " + val.property];
    case "AbstractShapeFailure":
      return ["Abstract Shape: " + val.shape];
    case "SemActFailure": {
      const nested = Array.isArray(val.errors) ?
          val.errors.reduce((ret, e) => {
            return ret.concat((typeof e === "string" ? [e] : _HumanErrorWriter.write(e)).map(s => "  " + s));
          }, []) :
          "  " + (typeof e === "string" ? [val.errors] : _HumanErrorWriter.write(val.errors));
      return ["rejected by semantic action:"].concat(nested);
    }
    case "SemActViolation":
      return [val.message];
    default:
      debugger; // console.log(val);
      throw Error("unknown shapeExpression type \"" + val.type + "\" in " + JSON.stringify(val));
    }
    function errorList (errors) {
      return errors.reduce(function (acc, e) {
        const attrs = Object.keys(e);
        return acc.concat(
          (attrs.length === 1 && attrs[0] === "errors")
            ? errorList(e.errors)
            : e);
      }, []);
    }
  }

  nodeConstraintToSimple (nc) {
    const elts = [];
    if ('nodeKind' in nc) elts.push(`be a ${nc.nodeKind.toUpperCase()}`);
    if ('datatype' in nc) elts.push(`have datatype ${nc.datatype}`);
    if ('length' in nc) elts.push(`have length ${nc.length}`);
    if ('minlength' in nc) elts.push(`have length at least ${nc.length}`);
    if ('maxlength' in nc) elts.push(`have length at most ${nc.length}`);
    if ('pattern' in nc) elts.push(`match regex /${nc.pattern}/${nc.flags ? nc.flags : ''}`);
    if ('mininclusive' in nc) elts.push(`have value at least ${nc.mininclusive}`);
    if ('minexclusive' in nc) elts.push(`have value more than ${nc.minexclusive}`);
    if ('maxinclusive' in nc) elts.push(`have value at most ${nc.maxinclusive}`);
    if ('maxexclusive' in nc) elts.push(`have value less than ${nc.maxexclusive}`);
    if ('totaldigits' in nc) elts.push(`have have ${nc.totaldigits} digits`);
    if ('fractiondigits' in nc) elts.push(`have have ${nc.fractiondigits} digits after the decimal`);
    if ('values' in nc) elts.push(`have a value in [${trim(this.valuesToSimple(nc.values).join(', '), 80, /[, ]^>/)}]`);
    return elts;
  }

  // static
  valuesToSimple (values) {
    return values.map(v => {
      // non stems
      /* IRIREF */ if (typeof v === 'string') return `<${v}>`;
      /* ObjectLiteral */ if ('value' in v) return this.objectLiteralToSimple(v);
      /* Language */ if (v.type === 'Language') return `literal with langauge tag ${v.languageTag}`;

      // stems and stem ranges
      const [undefined, type, range] = v.type.match(/^(Iri|Literal|Language)Stem(Range)?$/);
      let str = type.toLowerCase();

      if (typeof v.stem !== "object")
        str += ` starting with ${v.stem}`

      if ("exclusions" in v)
        str += ` excluding ${
v.exclusions.map(excl => typeof excl === "string"
 ? excl
 : "anything starting with " + excl.stem).join(' or ')
}`;

      return str;
    })
  }

  objectLiteralToSimple (v) {
    return `"${v}` +
      ('type' in v && v.type !== XSD.string ? `^^<${v.type}>` : '') +
      ('language' in v ? `@${v.language}` : '')
  }
}

function trim (str, desired, skip) {
  if (str.length <= desired)
    return str;
  --desired; // leave room for '…'
  while (desired > 0 && str[desired].match(skip))
    --desired;
  return str.slice(0, desired) + '…';
}

function n3ify (ldterm) {
  if (typeof ldterm !== "object")
    return ldterm;
  const ret = "\"" + ldterm.value + "\"";
  if ("language" in ldterm)
    return ret + "@" + ldterm.language;
  if ("type" in ldterm)
    return ret + "^^" + ldterm.type;
  return ret;
}

})()

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExHumanErrorWriterCjsModule; // node environment
