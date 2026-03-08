/*!
 * Copyright (c) 2016-2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

// eslint-disable-next-line no-unused-vars
const TERMS = ['subject', 'predicate', 'object', 'graph'];
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const RDF_LANGSTRING = RDF + 'langString';
const XSD_STRING = 'http://www.w3.org/2001/XMLSchema#string';

const TYPE_NAMED_NODE = 'NamedNode';
const TYPE_BLANK_NODE = 'BlankNode';
const TYPE_LITERAL = 'Literal';
const TYPE_DEFAULT_GRAPH = 'DefaultGraph';

// build regexes
const REGEX = {};
(() => {
  // https://www.w3.org/TR/n-quads/#sec-grammar
  // https://www.w3.org/TR/turtle/#grammar-production-BLANK_NODE_LABEL
  const PN_CHARS_BASE =
    'A-Z' + 'a-z' +
    '\u00C0-\u00D6' +
    '\u00D8-\u00F6' +
    '\u00F8-\u02FF' +
    '\u0370-\u037D' +
    '\u037F-\u1FFF' +
    '\u200C-\u200D' +
    '\u2070-\u218F' +
    '\u2C00-\u2FEF' +
    '\u3001-\uD7FF' +
    '\uF900-\uFDCF' +
    '\uFDF0-\uFFFD';
    // TODO:
    //'\u10000-\uEFFFF';
  const PN_CHARS_U =
    PN_CHARS_BASE +
    '_';
  const PN_CHARS =
    PN_CHARS_U +
    '0-9' +
    '-' +
    '\u00B7' +
    '\u0300-\u036F' +
    '\u203F-\u2040';
  const BLANK_NODE_LABEL =
    '_:(' +
      '(?:[' + PN_CHARS_U + '0-9])' +
      '(?:(?:[' + PN_CHARS + '.])*(?:[' + PN_CHARS + ']))?' +
    ')';
  // Older simple regex: const IRI = '(?:<([^:]+:[^>]*)>)';
  const UCHAR4 = '\\\\u[0-9A-Fa-f]{4}';
  const UCHAR8 = '\\\\U[0-9A-Fa-f]{8}';
  const IRI = '(?:<((?:' +
    '[^\u0000-\u0020<>"{}|^`\\\\]' + '|' +
    UCHAR4 + '|' +
    UCHAR8 +
    ')*)>)';
  const bnode = BLANK_NODE_LABEL;
  const plain = '"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"';
  const datatype = '(?:\\^\\^' + IRI + ')';
  const language = '(?:@([a-zA-Z]+(?:-[a-zA-Z0-9]+)*))';
  const literal = '(?:' + plain + '(?:' + datatype + '|' + language + ')?)';
  const ws = '[ \\t]+';
  const wso = '[ \\t]*';

  // define quad part regexes
  const subject = '(?:' + IRI + '|' + bnode + ')' + ws;
  const property = IRI + ws;
  const object = '(?:' + IRI + '|' + bnode + '|' + literal + ')' + wso;
  const graphName = '(?:\\.|(?:(?:' + IRI + '|' + bnode + ')' + wso + '\\.))';

  // end of line and empty regexes
  REGEX.eoln = /(?:\r\n)|(?:\n)|(?:\r)/g;
  REGEX.empty = new RegExp('^' + wso + '$');

  // full quad regex
  REGEX.quad = new RegExp(
    '^' + wso + subject + property + object + graphName + wso + '$');
})();

module.exports = class NQuads {
  /**
   * Parses RDF in the form of N-Quads.
   *
   * @param {string} input - The N-Quads input to parse.
   *
   * @returns {Array} - An RDF dataset (an array of quads per
   *   https://rdf.js.org/).
   */
  static parse(input) {
    // build RDF dataset
    const dataset = [];

    const graphs = {};

    // split N-Quad input into lines
    const lines = input.split(REGEX.eoln);
    let lineNumber = 0;
    for(const line of lines) {
      lineNumber++;

      // skip empty lines
      if(REGEX.empty.test(line)) {
        continue;
      }

      // parse quad
      const match = line.match(REGEX.quad);
      if(match === null) {
        throw new Error('N-Quads parse error on line ' + lineNumber + '.');
      }

      // create RDF quad
      const quad = {subject: null, predicate: null, object: null, graph: null};

      // get subject
      if(match[1] !== undefined) {
        quad.subject = {
          termType: TYPE_NAMED_NODE,
          value: _iriUnescape(match[1])
        };
      } else {
        quad.subject = {
          termType: TYPE_BLANK_NODE,
          value: match[2]
        };
      }

      // get predicate
      quad.predicate = {
        termType: TYPE_NAMED_NODE,
        value: _iriUnescape(match[3])
      };

      // get object
      if(match[4] !== undefined) {
        quad.object = {
          termType: TYPE_NAMED_NODE,
          value: _iriUnescape(match[4])
        };
      } else if(match[5] !== undefined) {
        quad.object = {
          termType: TYPE_BLANK_NODE,
          value: match[5]
        };
      } else {
        quad.object = {
          termType: TYPE_LITERAL,
          value: undefined,
          datatype: {
            termType: TYPE_NAMED_NODE
          }
        };
        if(match[7] !== undefined) {
          quad.object.datatype.value = _iriUnescape(match[7]);
        } else if(match[8] !== undefined) {
          quad.object.datatype.value = RDF_LANGSTRING;
          quad.object.language = match[8];
        } else {
          quad.object.datatype.value = XSD_STRING;
        }
        quad.object.value = _stringLiteralUnescape(match[6]);
      }

      // get graph
      if(match[9] !== undefined) {
        quad.graph = {
          termType: TYPE_NAMED_NODE,
          value: _iriUnescape(match[9])
        };
      } else if(match[10] !== undefined) {
        quad.graph = {
          termType: TYPE_BLANK_NODE,
          value: match[10]
        };
      } else {
        quad.graph = {
          termType: TYPE_DEFAULT_GRAPH,
          value: ''
        };
      }

      // only add quad if it is unique in its graph
      if(!(quad.graph.value in graphs)) {
        graphs[quad.graph.value] = [quad];
        dataset.push(quad);
      } else {
        let unique = true;
        const quads = graphs[quad.graph.value];
        for(const q of quads) {
          if(_compareTriples(q, quad)) {
            unique = false;
            break;
          }
        }
        if(unique) {
          quads.push(quad);
          dataset.push(quad);
        }
      }
    }

    return dataset;
  }

  /**
   * Converts an RDF dataset to N-Quads.
   *
   * @param {Array} dataset - The Array of quads RDF dataset to convert.
   *
   * @returns {string} - The N-Quads string.
   */
  static serialize(dataset) {
    const quads = [];
    for(const quad of dataset) {
      quads.push(NQuads.serializeQuad(quad));
    }
    return quads.sort().join('');
  }

  /**
   * Converts RDF quad components to an N-Quad string (a single quad).
   *
   * @param {object} s - N-Quad subject component.
   * @param {object} p - N-Quad predicate component.
   * @param {object} o - N-Quad object component.
   * @param {object} g - N-Quad graph component.
   *
   * @returns {string} - The N-Quad.
   */
  static serializeQuadComponents(s, p, o, g) {
    let nquad = '';

    // subject can only be NamedNode or BlankNode
    if(s.termType === TYPE_NAMED_NODE) {
      nquad += `<${_iriEscape(s.value)}>`;
    } else {
      nquad += `_:${s.value}`;
    }

    // predicate normally a NamedNode, can be a BlankNode in generalized RDF
    if(p.termType === TYPE_NAMED_NODE) {
      nquad += ` <${_iriEscape(p.value)}> `;
    } else {
      nquad += ` _:${p.value} `;
    }

    // object is NamedNode, BlankNode, or Literal
    if(o.termType === TYPE_NAMED_NODE) {
      nquad += `<${_iriEscape(o.value)}>`;
    } else if(o.termType === TYPE_BLANK_NODE) {
      nquad += `_:${o.value}`;
    } else {
      nquad += `"${_stringLiteralEscape(o.value)}"`;
      if(o.datatype.value === RDF_LANGSTRING) {
        if(o.language) {
          nquad += `@${o.language}`;
        }
      } else if(o.datatype.value !== XSD_STRING) {
        nquad += `^^<${_iriEscape(o.datatype.value)}>`;
      }
    }

    // graph can only be NamedNode or BlankNode (or DefaultGraph, but that
    // does not add to `nquad`)
    if(g.termType === TYPE_NAMED_NODE) {
      nquad += ` <${_iriEscape(g.value)}>`;
    } else if(g.termType === TYPE_BLANK_NODE) {
      nquad += ` _:${g.value}`;
    }

    nquad += ' .\n';
    return nquad;
  }

  /**
   * Converts an RDF quad to an N-Quad string (a single quad).
   *
   * @param {object} quad - The RDF quad convert.
   *
   * @returns {string} - The N-Quad string.
   */
  static serializeQuad(quad) {
    return NQuads.serializeQuadComponents(
      quad.subject, quad.predicate, quad.object, quad.graph);
  }
};

/**
 * Compares two RDF triples for equality.
 *
 * @param {object} t1 - The first triple.
 * @param {object} t2 - The second triple.
 *
 * @returns {boolean} - True if the triples are the same, false if not.
 */
function _compareTriples(t1, t2) {
  // compare subject and object types first as it is the quickest check
  if(!(t1.subject.termType === t2.subject.termType &&
    t1.object.termType === t2.object.termType)) {
    return false;
  }
  // compare values
  if(!(t1.subject.value === t2.subject.value &&
    t1.predicate.value === t2.predicate.value &&
    t1.object.value === t2.object.value)) {
    return false;
  }
  if(t1.object.termType !== TYPE_LITERAL) {
    // no `datatype` or `language` to check
    return true;
  }
  return (
    (t1.object.datatype.termType === t2.object.datatype.termType) &&
    (t1.object.language === t2.object.language) &&
    (t1.object.datatype.value === t2.object.datatype.value)
  );
}

const _stringLiteralEscapeRegex = /[\u0000-\u001F\u007F"\\]/g;
const _stringLiteralEscapeMap = [];
for(let n = 0; n <= 0x7f; ++n) {
  if(_stringLiteralEscapeRegex.test(String.fromCharCode(n))) {
    // default UCHAR mapping
    _stringLiteralEscapeMap[n] =
      '\\u' + n.toString(16).toUpperCase().padStart(4, '0');
    // reset regex
    _stringLiteralEscapeRegex.lastIndex = 0;
  }
}
// special ECHAR mappings
_stringLiteralEscapeMap['\b'.codePointAt(0)] = '\\b';
_stringLiteralEscapeMap['\t'.codePointAt(0)] = '\\t';
_stringLiteralEscapeMap['\n'.codePointAt(0)] = '\\n';
_stringLiteralEscapeMap['\f'.codePointAt(0)] = '\\f';
_stringLiteralEscapeMap['\r'.codePointAt(0)] = '\\r';
_stringLiteralEscapeMap['"' .codePointAt(0)] = '\\"';
_stringLiteralEscapeMap['\\'.codePointAt(0)] = '\\\\';

/**
 * Escape string to N-Quads literal.
 *
 * @param {string} s - String to escape.
 *
 * @returns {string} - Escaped N-Quads literal.
 */
function _stringLiteralEscape(s) {
  if(!_stringLiteralEscapeRegex.test(s)) {
    return s;
  }
  return s.replace(_stringLiteralEscapeRegex, function(match) {
    return _stringLiteralEscapeMap[match.codePointAt(0)];
  });
}

const _stringLiteralUnescapeRegex =
  /(?:\\([btnfr"'\\]))|(?:\\u([0-9A-Fa-f]{4}))|(?:\\U([0-9A-Fa-f]{8}))/g;

/**
 * Unescape N-Quads literal to string.
 *
 * @param {string} s - String to unescape.
 *
 * @returns {string} - Unescaped N-Quads literal.
 */
function _stringLiteralUnescape(s) {
  if(!_stringLiteralUnescapeRegex.test(s)) {
    return s;
  }
  return s.replace(_stringLiteralUnescapeRegex, function(match, code, u, U) {
    if(code) {
      switch(code) {
        case 'b': return '\b';
        case 't': return '\t';
        case 'n': return '\n';
        case 'f': return '\f';
        case 'r': return '\r';
        case '"': return '"';
        case '\'': return '\'';
        case '\\': return '\\';
      }
    }
    if(u) {
      return String.fromCharCode(parseInt(u, 16));
    }
    if(U) {
      return String.fromCodePoint(parseInt(U, 16));
    }
  });
}

const _iriEscapeRegex = /[\u0000-\u0020<>"{}|^`\\]/g;
const _iriEscapeRegexMap = [];
for(let n = 0; n <= 0x7f; ++n) {
  if(_iriEscapeRegex.test(String.fromCharCode(n))) {
    // UCHAR mapping
    _iriEscapeRegexMap[n] =
      '\\u' + n.toString(16).toUpperCase().padStart(4, '0');
    // reset regex
    _iriEscapeRegex.lastIndex = 0;
  }
}

/**
 * Escape IRI to N-Quads IRI.
 *
 * @param {string} s - IRI to escape.
 *
 * @returns {string} - Escaped N-Quads IRI.
 */
function _iriEscape(s) {
  if(!_iriEscapeRegex.test(s)) {
    return s;
  }
  return s.replace(_iriEscapeRegex, function(match) {
    return _iriEscapeRegexMap[match.codePointAt(0)];
  });
}

const _iriUnescapeRegex =
  /(?:\\u([0-9A-Fa-f]{4}))|(?:\\U([0-9A-Fa-f]{8}))/g;

/**
 * Unescape N-Quads IRI to IRI.
 *
 * @param {string} s - IRI to unescape.
 *
 * @returns {string} - Unescaped N-Quads IRI.
 */
function _iriUnescape(s) {
  if(!_iriUnescapeRegex.test(s)) {
    return s;
  }
  return s.replace(_iriUnescapeRegex, function(match, u, U) {
    if(u) {
      return String.fromCharCode(parseInt(u, 16));
    }
    if(U) {
      return String.fromCodePoint(parseInt(U, 16));
    }
  });
}
