"use strict";
/**
 * N3id - webapps and scripts that rely specifically on N3.js leverage the fact
 * that term.id is N-Triples for all terms except typed literals, which lack
 * <>s around data types. This is handy for testing.
 *   NamedNode: bare word, e.g. http://a.example/
 *   BlankNode: "_:" + label, e.g. _:b1
 *   Literal: quoted value plus ntriples lang or datatype, e.g:
 *     "I said \"Hello World\"."
 *     "I said \"Hello World\"."@en
 *     "1.1"^^http://www.w3.org/2001/XMLSchema#float
 */

const {DataFactory} = require("rdf-data-factory");
const RdfJsFactory = new DataFactory();

/**
 * Map an N3id quad to an RdfJs quad
 * @param {*} s subject
 * @param {*} p predicate
 * @param {*} o object
 * @param {*} g graph
 * @returns RdfJs quad
 */
function n3idQuad2RdfJs (s/*: string*/, p/*: string*/, o/*: string*/, g/*: string*/)/*: Quad*/ {
  const graph = g ? n3idTerm2RdfJs(g) : RdfJsFactory.defaultGraph();
  return RdfJsFactory.quad(
      // there probably some elegant way to do this without lots of casting
    n3idTerm2RdfJs(s)/* as NamedNode | BlankNode*/,
    n3idTerm2RdfJs(p)/* as NamedNode*/,
    n3idTerm2RdfJs(o)/* as NamedNode | BlankNode | Literal*/,
    graph/* as NamedNode | BlankNode*/,
  );
}

/**
 * Map an N3id term to an RdfJs Term.
 * @param {*} term N3Id term
 * @returns RdfJs Term
 */
function n3idTerm2RdfJs (term/*: string*/)/*: RdfJsTerm*/ {
  if (term[0] === "_" && term[1] === ":")
    return RdfJsFactory.blankNode(term.substr(2));

  if (term[0] === "\"" || term[0] === "'") {
    const closeQuote = term.lastIndexOf(term[0]);
    if (closeQuote === -1)
      throw new Error(`no close ${term[0]}: ${term}`);
    const value = term.substr(1, closeQuote - 1).replace(/\\"/g, '"');
    const langOrDt = term.length === closeQuote + 1
      ? undefined
      : term[closeQuote + 1] === "@"
      ? term.substr(closeQuote + 2)
      : parseDt(closeQuote + 1)
    return RdfJsFactory.literal(value, langOrDt);
  }

  return RdfJsFactory.namedNode(term);

  function parseDt (from/*: number*/)/*: NamedNode*/ {
    if (term[from] !== "^" || term[from + 1] !== "^")
      throw new Error(`garbage after closing \": ${term}`);
    return RdfJsFactory.namedNode(term.substr(from + 2));
  }
}

module.exports = {
  n3idQuad2RdfJs,
  n3idTerm2RdfJs,
}
