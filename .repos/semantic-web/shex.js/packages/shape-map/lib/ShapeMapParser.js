const ShapeMapParser = (function () {

// stolen as much as possible from SPARQL.js
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
  ShapeMapJison = require('./ShapeMapJison').ShapeMapJisonParser; // node environment
} else {
  ShapeMapJison = ShapeMapJison.ShapeMapJisonParser; // browser environment
}

const schemeAuthority = /^(?:([a-z][a-z0-9+.-]*:))?(?:\/\/[^\/]*)?/i,
    dotSegments = /(?:^|\/)\.\.?(?:$|[\/#?])/;

class ResourceMetadata {
  constructor () {
  }

  reset () {
    this.prefixes = null; // Reset state.
    this.base = this._baseIRI = this._baseIRIPath = this._baseIRIRoot = null;
  }

  // N3.js:lib/N3Parser.js<0.4.5>:58 with
  //   s/this\./ShapeMapJisonParser./g
  // ### `_setBase` sets the base IRI to resolve relative IRIs.
  _setBase (baseIRI) {
    if (!baseIRI)
      baseIRI = null;

    // baseIRI '#' check disabled to allow -x 'data:text/shex,...#'
    // else if (baseIRI.indexOf('#') >= 0)
    //   throw new Error('Invalid base IRI ' + baseIRI);

    // Set base IRI and its components
    if (this.base = baseIRI) {
      this._basePath   = baseIRI.replace(/[^\/?]*(?:\?.*)?$/, '');
      baseIRI = baseIRI.match(schemeAuthority);
      this._baseRoot   = baseIRI[0];
      this._baseScheme = baseIRI[1];
    }
  }

  // N3.js:lib/N3Parser.js<0.4.5>:576 with
  //   s/this\./ShapeMapJisonParser./g
  //   s/token/iri/
  // ### `_resolveIRI` resolves a relative IRI token against the base path,
  // assuming that a base path has been set and that the IRI is indeed relative.
  _resolveIRI (iri) {
    switch (iri[0]) {
    // An empty relative IRI indicates the base IRI
    case undefined: return this.base;
    // Resolve relative fragment IRIs against the base IRI
    case '#': return this.base + iri;
    // Resolve relative query string IRIs by replacing the query string
    case '?': return this.base.replace(/(?:\?.*)?$/, iri);
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

  // Expand declared prefix or throw Error
  expandPrefix (prefix, parserState) {
    if (!(prefix in this.prefixes))
      parserState.error(new Error('Parse error; unknown prefix "' + prefix + ':"'));
    return this.prefixes[prefix];
  }

}

class ShapeMapParserState {
  constructor () {
    this.schemaMeta = new ResourceMetadata();
    this.dataMeta = new ResourceMetadata();
    this._fileName = undefined; // for debugging
  }

  reset () {
    this.schemaMeta.reset();
    this.dataMeta.reset();
  }

  _setFileName (fn) { this._fileName = fn; }

  error (e) {debugger; // !!
    const hash = {
      text: this.lexer.match,
      // token: this.terminals_[symbol] || symbol,
      line: this.lexer.thislineno,
      loc: this.lexer.thislloc,
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

}

// Creates a ShEx parser with the given pre-defined prefixes
const prepareParser = function (baseIRI, schemaMeta, dataMeta) {
  // Create a copy of the prefixes
  const schemaBase = schemaMeta.base;
  const schemaPrefixesCopy = {};
  for (const prefix in schemaMeta.prefixes || {})
    schemaPrefixesCopy[prefix] = schemaMeta.prefixes[prefix];
  const dataBase = dataMeta.base;
  const dataPrefixesCopy = {};
  for (const prefix in dataMeta.prefixes || {})
    dataPrefixesCopy[prefix] = dataMeta.prefixes[prefix];

  // Create a new parser with the given prefixes
  // (Workaround for https://github.com/zaach/jison/issues/241)
  const parser = new ShapeMapJison();
  const oldParse = parser.parse;

  function runParser (input, filename = null) {
    const parserState = globalThis.PS = new ShapeMapParserState();
    parserState.schemaMeta.prefixes = Object.create(schemaPrefixesCopy);
    parserState.schemaMeta._setBase(schemaBase);
    parserState.dataMeta.prefixes = Object.create(dataPrefixesCopy);
    parserState.dataMeta._setBase(dataBase);
    parserState._setFileName(baseIRI);
    parserState._fileName = filename;
    try {
      return oldParse.call(parser, input, parserState);
    } catch (e) {
      // use the lexer's pretty-printing
      const lineNo = "lexer" in parser.yy ? parser.yy.lexer.yylineno + 1 : 1;
      const pos = "lexer" in parser.yy ? parser.yy.lexer.showPosition() : "";
      const t = Error(`${baseIRI}(${lineNo}): ${e.message}\n${pos}`);
      Error.captureStackTrace(t, runParser);
      parserState.reset();
      throw t;
    }
  }
  parser.parse = runParser;
  return parser;
}

return {
  construct: prepareParser
};
})();

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShapeMapParser;
