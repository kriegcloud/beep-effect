const ShExParserCjsModule = (function () {

const ShExJisonParser = require('./lib/ShExJison').ShExJisonParser;

const schemeAuthority = /^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i,
    dotSegments = /(?:^|\/)\.\.?(?:$|[\/#?])/;

class ShExCParserState {
  constructor () {
    this.blankId = 0;
    this._fileName = undefined; // for debugging
    this.EmptyObject = {  };
    this.EmptyShape = { type: "Shape" };
    this.skipped = { // space eaten by whitespace and comments
      first_line: 0,
      first_column: 0,
      last_line: 0,
      last_column: 0,
    };
    this.locations = {  };
  }

  reset () {
    this._prefixes = this._imports = this._sourceMap = this.shapes = this.productions = this.start = this.startActs = null; // Reset state.
    this._base = this._baseIRI = this._baseIRIPath = this._baseIRIRoot = null;
  }

  _setFileName (fn) { this._fileName = fn; }

  // Creates a new blank node identifier
  blank () {
    return '_:b' + this.blankId++;
  };
  _resetBlanks (value) { this.blankId = value === undefined ? 0 : value; }

  // N3.js:lib/N3Parser.js<0.4.5>:58 with
  //   s/this\./ShExJisonParser./g
  // ### `_setBase` sets the base IRI to resolve relative IRIs.
  _setBase (baseIRI) {
    if (!baseIRI)
      baseIRI = null;

    // baseIRI '#' check disabled to allow -x 'data:text/shex,...#'
    // else if (baseIRI.indexOf('#') >= 0)
    //   throw new Error('Invalid base IRI ' + baseIRI);

    // Set base IRI and its components
    if (this._base = baseIRI) {
      this._basePath   = baseIRI.replace(/[^\/?]*(?:\?.*)?$/, '');
      baseIRI = baseIRI.match(schemeAuthority);
      this._baseRoot   = baseIRI[0];
      this._baseScheme = baseIRI[1];
    }
  }

  // N3.js:lib/N3Parser.js<0.4.5>:576 with
  //   s/this\./ShExJisonParser./g
  //   s/token/iri/
  // ### `_resolveIRI` resolves a relative IRI token against the base path,
  // assuming that a base path has been set and that the IRI is indeed relative.
  _resolveIRI (iri) {
    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined: return this._base;
    // Resolve relative fragment IRIs against the base IRI
    case '#': return this._base + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?': return this._base.replace(/(?:\?.*)?$/, iri);
    // Resolve root-relative IRIs at the root of the base IRI
    case '/':
      // Resolve scheme-relative IRIs to the scheme
      return (iri[1] === '/' ? this._baseScheme : this._baseRoot) + this._removeDotSegments(iri);
    // Resolve all other IRIs at the base IRI's path
    default: {
      return this._removeDotSegments(this._basePath + iri);
    }
    }
  }

  // ### `_removeDotSegments` resolves './' and '../' path segments in an IRI as per RFC3986.
  _removeDotSegments (iri) {
    // Don't modify the IRI if it does not contain any dot segments
    if (!dotSegments.test(iri))
      return iri;

    // Start with an imaginary slash before the IRI in order to resolve trailing './' and '../'
    const length = iri.length;
    let result = '', i = -1, pathStart = -1, next = '/', segmentStart = 0;

    while (i < length) {
      switch (next) {
      // The path starts with the first slash after the authority
      case ':':
        if (pathStart < 0) {
          // Skip two slashes before the authority
          if (iri[++i] === '/' && iri[++i] === '/')
            // Skip to slash after the authority
            while ((pathStart = i + 1) < length && iri[pathStart] !== '/')
              i = pathStart;
        }
        break;
      // Don't modify a query string or fragment
      case '?':
      case '#':
        i = length;
        break;
      // Handle '/.' or '/..' path segments
      case '/':
        if (iri[i + 1] === '.') {
          next = iri[++i + 1];
          switch (next) {
          // Remove a '/.' segment
          case '/':
            result += iri.substring(segmentStart, i - 1);
            segmentStart = i + 1;
            break;
          // Remove a trailing '/.' segment
          case undefined:
          case '?':
          case '#':
            return result + iri.substring(segmentStart, i) + iri.substr(i + 1);
          // Remove a '/..' segment
          case '.':
            next = iri[++i + 1];
            if (next === undefined || next === '/' || next === '?' || next === '#') {
              result += iri.substring(segmentStart, i - 2);
              // Try to remove the parent path from result
              if ((segmentStart = result.lastIndexOf('/')) >= pathStart)
                result = result.substr(0, segmentStart);
              // Remove a trailing '/..' segment
              if (next !== '/')
                return result + '/' + iri.substr(i + 1);
              segmentStart = i + 1;
            }
          }
        }
      }
      next = iri[++i];
    }
    return result + iri.substring(segmentStart);
  }

  error (e) {
    const hash = {
      text: this.lexer.match,
      // token: this.terminals_[symbol] || symbol,
      line: this.lexer.yylineno,
      loc: this.lexer.yylloc,
      // expected: expected
      pos: this.lexer.showPosition()
    }
    e.hash = hash;
    if (this.recoverable) {
      this.recoverable(e)
    } else {
      throw e;
      this.reset();
    }
  }

  // Expand declared prefix or throw Error
  expandPrefix (prefix) {
    if (!(prefix in this._prefixes))
      this.error(new Error('Parse error; unknown prefix "' + prefix + ':"'));
    return this._prefixes[prefix];
  }

  // Add a shape to the list of shape(Expr)s
  addShape (label, shape, start, end) {
    if (shape === this.EmptyShape)
      shape = { type: "Shape" };
    if (this.productions && label in this.productions)
      this.error(new Error("Structural error: "+label+" is a triple expression"));
    if (!this.shapes)
      this.shapes = {};
    if (label in this.shapes) {
      if (this.options.duplicateShape === "replace")
        this.shapes[label] = shape;
      else if (this.options.duplicateShape !== "ignore")
        this.error(new Error("Parse error: "+label+" already defined"));
    } else {
      this.shapes[label] = Object.assign({id: label}, shape);
      this.locations[label] = this.makeLocation(start, end);
    }
  }

  makeLocation (start, end) {
    if (end.first_line === this.skipped.last_line && end.first_column === this.skipped.last_column)
      end = this.skipped
    return {
      filename: this._fileName,
      first_line: start.first_line,
      first_column: start.first_column,
      last_line: end.first_line,
      last_column: end.first_column,
    }
  }


  // Add a production to the map
  addProduction (label, production) {
    if (this.shapes && label in this.shapes)
      this.error(new Error("Structural error: "+label+" is a shape expression"));
    if (!this.productions)
      this.productions = {};
    if (label in this.productions) {
      if (this.options.duplicateShape === "replace")
        this.productions[label] = production;
      else if (this.options.duplicateShape !== "ignore")
        this.error(new Error("Parse error: "+label+" already defined"));
    } else
      this.productions[label] = production;
  }

  addSourceMap (obj) {
    if (!this._sourceMap)
      this._sourceMap = new Map();
    let list = this._sourceMap.get(obj)
    if (!list)
      this._sourceMap.set(obj, list = []);
    list.push(this.lexer.yylloc);
    return obj;
  }

}

// Creates a ShEx parser with the given pre-defined prefixes
const prepareParser = function (baseIRI, prefixes, schemaOptions) {
                                                                                schemaOptions = schemaOptions || {};
  // Create a copy of the prefixes
  const prefixesCopy = {};
  for (const prefix in prefixes || {})
    prefixesCopy[prefix] = prefixes[prefix];

  // Create a new parser with the given prefixes
  // (Workaround for https://github.com/zaach/jison/issues/241)
  const parser = new ShExJisonParser(ShExCParserState);
  const oldParse = parser.parse;

  function runParser (input, base = baseIRI, options = schemaOptions, filename = null) {
    const parserState = globalThis.PS = new ShExCParserState();
    parserState._prefixes = Object.create(prefixesCopy);
    parserState._imports = [];
    parserState._setBase(base);
    parserState._setFileName(baseIRI);
    parserState.options = schemaOptions;
    let errors = [];
    parserState.recoverable = e =>
      errors.push(e);
    let ret = null;
    try {
      ret = oldParse.call(parser, input, parserState);
    } catch (e) {
      errors.push(e);
    }
    if ("meta" in options) {
      options.meta.base = parserState._base;
      options.meta.prefixes = parserState._prefixes;
    }
    parserState.reset();
    errors.forEach(e => {
      if ("hash" in e) {
        const hash = e.hash;
        const location = hash.loc;
        delete hash.loc;
        Object.assign(e, hash, {location: location});
      }
      return e;
    })
    if (errors.length == 1) {
      errors[0].parsed = ret;
      throw errors[0];
    } else if (errors.length) {
      const all = new Error("" + errors.length  + " parser errors:\n" + errors.map(
        e => contextError(e, parser.yy.lexer)
      ).join("\n"));
      all.errors = errors;
      all.parsed = ret;
      throw all;
    } else {
      return ret;
    }
  }
  parser.parse = runParser;
  parser._setBase = function (base) {
    baseIRI = base;
  }
  return parser;

  function contextError (e, lexer) {
    // use the lexer's pretty-printing
    const line = e.location.first_line;
    const col  = e.location.first_column + 1;
    const posStr = "pos" in e.hash ? "\n" + e.hash.pos : ""
    return `${baseIRI}\n line: ${line}, column: ${col}: ${e.message}${posStr}`;
  }
}

return {
  construct: prepareParser
};
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShExParserCjsModule;
